import { renderSheetMarkup } from '../customElements/MySpreadSheet'
import { context } from '../../modules/context'
import type { IExercice } from '../types'
import { refCellule, texteAffiche, type Cellules } from './tableurFormules'

export type OptionsRenduTableur = {
  /** Exercice et question : définissent l'identifiant du tableur interactif. */
  exercice?: IExercice
  question?: number
  cellules: Cellules
  nbColonnes: number
  /** Nombre de lignes de la feuille (une ligne vide est ajoutée en dessous). */
  nbLignes: number
  largeurs?: number[]
  /** Les cellules de `cellulesModifiables` peuvent être modifiées par l'élève. */
  interactif?: boolean
  cellulesModifiables?: string[]
  /** Affiche la barre de formule au-dessus du tableur (HTML). */
  barreFormule?: boolean
  /** Formule affichée dans la barre de formule des sorties LaTeX. */
  formuleImprimee?: { cellule: string; formule: string }
  /** Numéros des lignes d'en-tête, mises en gras (par défaut la première). */
  lignesEntete?: number[]
  /** Couleurs de fond (`'#ffe08a'`) de certaines cellules. */
  couleurs?: Record<string, string>
}

function protegeLatex(texte: string): string {
  return texte
    .replaceAll('%', '\\%')
    .replaceAll('&', '\\&')
    .replaceAll('#', '\\#')
    .replaceAll('_', '\\_')
}

function formuleLatex(formule: string): string {
  return protegeLatex(formule)
    .replaceAll('$', '\\$')
    .replaceAll('^', '\\textasciicircum{}')
}

/**
 * Tableur (interactif ou non) construit à partir du contenu des cellules.
 * Les formules sont calculées par le tableur en HTML et par
 * `tableurFormules.ts` pour les sorties papier.
 */
export function rendTableur({
  exercice,
  question,
  cellules,
  nbColonnes,
  nbLignes,
  largeurs,
  interactif = false,
  cellulesModifiables = [],
  barreFormule = true,
  formuleImprimee,
  lignesEntete = [1],
  couleurs = {},
}: OptionsRenduTableur): string {
  const nbLignesAffichees = nbLignes + 1
  const data: (string | number)[][] = []
  const latexData: Record<
    number,
    Record<number, { t: number; v: string; s?: string }>
  > = {}
  const style: Record<string, string> = {}
  const latexStyles: Record<string, { bg: string }> = {}
  const toutesLesCellules: string[] = []

  for (let ligne = 0; ligne < nbLignesAffichees; ligne++) {
    data.push([])
    latexData[ligne] = {}
    for (let colonne = 0; colonne < nbColonnes; colonne++) {
      const ref = refCellule(colonne, ligne)
      toutesLesCellules.push(ref)
      const brut = cellules[ref]
      data[ligne].push(brut ?? '')
      const affiche = texteAffiche(cellules, ref)
      const estNombre = typeof affiche === 'number'
      const cle = couleurs[ref] ? `fond${ref}` : undefined
      if (cle) latexStyles[cle] = { bg: couleurs[ref] }
      latexData[ligne][colonne] = {
        t: estNombre ? 2 : 1,
        v: estNombre
          ? String(affiche).replace('.', ',')
          : protegeLatex(String(affiche)),
        ...(cle ? { s: cle } : {}),
      }
      const css: string[] = []
      if (lignesEntete.includes(ligne + 1)) css.push('font-weight:bold')
      // seuls les textes saisis sont alignés à gauche : une cellule vide ou à
      // formule peut recevoir un nombre plus tard
      const estTexte =
        typeof brut === 'string' &&
        brut !== '' &&
        !brut.startsWith('=') &&
        !cellulesModifiables.includes(ref)
      if (estTexte) css.push('text-align:left')
      if (couleurs[ref]) css.push(`background-color:${couleurs[ref]}`)
      if (css.length > 0) style[ref] = `${css.join(';')};color:black`
    }
  }

  const modifiables = new Set(cellulesModifiables.map((c) => c.toUpperCase()))
  // un tableur non interactif reste en lecture seule même dans un exercice interactif
  const lectureSeule = toutesLesCellules.filter(
    (ref) => !interactif || !modifiables.has(ref),
  )

  // marge au-dessus du tableur pour le séparer de la phrase qui précède
  const marge =
    context.isHtml && !context.isTypst
      ? '<div style="height:0.75rem"></div>'
      : ''
  return (
    marge +
    renderSheetMarkup({
      numeroExercice: exercice?.numeroExercice,
      questionIndex: question,
      data,
      minDimensions: [nbColonnes, nbLignesAffichees],
      style,
      columns: (largeurs ?? Array(nbColonnes).fill(100)).map((width) => ({
        width,
      })),
      interactif,
      showVerifyButton: false,
      readOnlyCells: lectureSeule,
      barreFormule,
      arrondiAffichage: true,
      latexData,
      latexStyles,
      latexOptions: formuleImprimee
        ? {
            formule: true,
            formuleCellule: formuleImprimee.cellule,
            formuleTexte: formuleLatex(formuleImprimee.formule),
          }
        : undefined,
      appendFeedbackBlocks: interactif && exercice != null,
    })
  )
}
