import {
  detectUsedFeatures,
  MATHALEA_ANCHOR_HELPER,
  MATHALEA_INLINE_FORMULA_RULE,
  MATHALEA_WRITING_LINES_HELPER,
  type HeaderStyle,
} from '../../components/setup/typst/buildTypstDocument'
import {
  CETZ_IMPORT,
  CETZ_PLOT_CHART_IMPORT,
  CTZ_EUCLIDE_IMPORT,
  MATHALEA_FIGURE_BLOCK_HELPER,
  MATHALEA_FIGURE_HELPERS,
  MATHALEA_FIT_HELPER,
  MATHALEA_SCHEMA_HELPER,
  MATHALEA_TASKS_HELPER,
  TASKIZE_IMPORT,
  VARTABLE_IMPORT,
  applyDocumentFontsToFigure,
} from '../../components/setup/typst/latexToTypst'
import { OMR_PREAMBULE, reperesRelatifs, typstString } from './omrTypstTemplate'

/**
 * Construction du document Typst d'une évaluation à lecture optique.
 *
 * Le générateur ne connaît rien au moteur d'exercices : il reçoit des
 * questions déjà normalisées et déjà converties en Typst. C'est ce qui le rend
 * testable sans charger MathALÉA, et ce qui permettra de brancher plus tard la
 * couche `normalize` d'AMC (`src/lib/amc/amcNormalize.ts`) sans le retoucher.
 *
 * Le code produit se sépare en deux :
 *
 * - le **gabarit**, commun à toute la classe — préambule, réglages de page,
 *   variables de mise en page et insertions. C'est ce que le professeur voit
 *   dans l'éditeur, et ce que la palette de l'aperçu modifie ;
 * - le **corps** de chaque copie, qui ne porte que les énoncés et leurs cases.
 *
 * Une retouche du gabarit vaut donc pour toutes les copies sans avoir à être
 * rejouée, et les positions des cases restent interrogées à la compilation
 * finale : rien ne peut désynchroniser le corrigé du sujet imprimé.
 */

/** Format de papier pris en charge, avec ses dimensions en millimètres. */
export const PAPIERS = {
  a4: { typst: 'a4', largeurMm: 210, hauteurMm: 297 },
} as const

export type PapierName = keyof typeof PAPIERS

/** Une proposition de QCM. */
export interface OmrProposition {
  /** Contenu Typst déjà converti */
  texte: string
  correct: boolean
}

/** Une colonne de chiffres d'une réponse numérique. */
export interface OmrColonneNumerique {
  /** Intitulé au-dessus de la colonne (unités, dixièmes…) */
  label?: string
  /** Chiffre attendu, ou `-` / `+` pour une colonne de signe */
  attendu: string
  /** Valeurs proposées, de haut en bas */
  valeurs: string[]
  /**
   * Signe imprimé juste avant la colonne, sans case : la virgule d'un décimal,
   * la barre d'une fraction. Sans lui, `12,5` et `125` s'écriraient pareil.
   */
  separateurAvant?: string
}

/** Une question, dans une forme indépendante du moteur d'exercices. */
export type OmrQuestionSource =
  | {
      qid: string
      type: 'qcmMono' | 'qcmMult'
      /** Contenu Typst déjà converti */
      enonce: string
      /** Correction, pour le corrigé du professeur (jamais sur la copie) */
      correction?: string
      /** La même, réduite à la réponse mise en évidence */
      correctionMinimale?: string
      points: number
      propositions: OmrProposition[]
      /** Ancienne préférence de disposition ; les propositions sont horizontales. */
      horizontal?: boolean
    }
  | {
      qid: string
      type: 'AMCNum'
      enonce: string
      correction?: string
      correctionMinimale?: string
      points: number
      colonnes: OmrColonneNumerique[]
    }
  | {
      qid: string
      type: 'AMCOpen'
      enonce: string
      correction?: string
      correctionMinimale?: string
      points: number
      /** Hauteur laissée à l'élève pour rédiger, en millimètres */
      hauteurReponseMm?: number
    }

/**
 * Un exercice et ses questions.
 *
 * Le groupement n'est pas décoratif : c'est l'unité que règle la palette de
 * l'aperçu (nombre de colonnes, espacement des questions, insertion après
 * l'exercice), exactement comme dans la vue « Impression ».
 */
export interface OmrExerciceSource {
  /** Titre affiché au-dessus des questions ; à défaut « Exercice N » */
  titre?: string
  questions: OmrQuestionSource[]
}

/** Une copie nominative. */
export interface OmrCopieSource {
  copieId: string
  eleve: { id: string; nom: string }
  exercices: OmrExerciceSource[]
  /**
   * Figures SVG rencontrées en convertissant les énoncés de cette copie, dans
   * l'ordre où `htmlToTypst` les a numérotées (`fig-1`, `fig-2`…).
   *
   * Elles sont déclarées **dans** le bloc de contenu de la copie, où le `#let`
   * reste local : deux copies numérotent chacune ses figures à partir de 1, et
   * une graine par élève ne fait donc pas collisionner leurs déclarations.
   */
  figures?: string[]
}

/** Description complète du document à produire. */
export interface OmrDocumentSource {
  titre: string
  /** Identifiant court du sujet, encodé dans chaque QR-code */
  sujetId: string
  papier?: PapierName
  /** Consigne libre affichée en tête de chaque copie */
  consigne?: string
  copies: OmrCopieSource[]
}

/**
 * Réglages de document, volet « Réglages » de la vue.
 *
 * Le format et les marges n'en font pas partie, et n'en feront pas partie :
 * les quatre repères de calage sont posés à 10 mm des bords et l'en-tête porte
 * un QR-code de 18 mm. Ces dimensions sont ce que `reperesRelatifs` promet au
 * moteur de lecture ; les rendre réglables reviendrait à laisser le professeur
 * casser silencieusement le recalage de ses propres copies.
 */
export interface OmrDocumentOptions {
  /** Habillage de l'en-tête nominatif, imprimé sur chaque page (il porte le QR) */
  headerStyle: HeaderStyle
  /** Sous-titre imprimé sous le titre du document. */
  subtitle: string
  /** Ligne libre de l’en-tête, au-dessus du nom de l’élève. */
  headerLine: string
  /** Police du texte (police libre embarquée dans le compilateur) */
  font: string
  /** Police des formules */
  mathFont: string
  /** Taille du texte, en points */
  fontSize: number
  /** Interligne des paragraphes, en em */
  lineSpacing: number
  /** Espacement entre les mots, en % de sa valeur normale */
  wordSpacing: number
  /** Espace au-dessus du titre de chaque exercice, en em */
  exerciseSpacing: number
  /** Numéros de questions en gras */
  boldQuestionNumbers: boolean
  /** Affiche un titre « Exercice N » au-dessus de chaque groupe de questions */
  showExerciseTitles: boolean
  /** Fusionne les exercices en une liste de questions à numérotation continue. */
  mergeExercises: boolean
  /** Affiche le nombre de points à droite de chaque énoncé */
  showQuestionPoints: boolean
  /** Affiche le pied de page (crédit MathALÉA et pagination) */
  showFooter: boolean
  /** Texte à gauche du pied de page */
  footerText: string
  /** Style du titre de chaque exercice. */
  exerciseStyle:
    'simple' | 'underline' | 'border-accent' | 'rounded-box' | 'header-card'
  /** Couleur des titres d'exercice (hexadécimal) */
  titleColor: string
  /**
   * Corrigé du professeur, groupé à la fin du document — jamais sur la copie
   * de l'élève. `minimal` ne garde que la réponse mise en évidence, comme la
   * vue « Impression ».
   */
  corrige: 'aucun' | 'complet' | 'minimal'
}

export const defaultOmrDocumentOptions: OmrDocumentOptions = {
  headerStyle: 'epure',
  subtitle: '',
  headerLine: '',
  // même police que la vue « Impression » : c'est l'une des rares livrées avec
  // une graisse grasse (voir `POLICES_SANS_GRAISSE_GRASSE` côté vue), sans quoi
  // ni les titres d'exercice ni les numéros de questions ne peuvent l'être
  font: 'Libertinus Serif',
  mathFont: 'Libertinus Math',
  fontSize: 10,
  lineSpacing: 0.65,
  wordSpacing: 100,
  exerciseSpacing: 1.2,
  boldQuestionNumbers: true,
  showExerciseTitles: true,
  mergeExercises: false,
  showQuestionPoints: true,
  showFooter: true,
  footerText: 'MathALÉA — coopmaths.fr',
  titleColor: '#1d4ed8',
  exerciseStyle: 'simple',
  corrige: 'aucun',
}

/** Colonnes par défaut d'un exercice : les questions à cases sont larges. */
export const OMR_COLONNES_DEFAUT = '1'
/** Espacement vertical par défaut entre deux questions. */
export const OMR_GUTTER_DEFAUT = '1.2em'

/**
 * Réglages faits depuis l'aperçu, relus dans le gabarit pour survivre à sa
 * régénération (voir `harvestOmrCarryOver`).
 */
export interface OmrCarryOver {
  /** Colonnes et espacement par numéro d'exercice (à partir de 1) */
  layout?: Record<number, { colonnes?: string; gutter?: string }>
  /**
   * Fragments Typst insérés après l'exercice `num` (`0` : avant le premier),
   * dans l'ordre. Sauts de page et textes libres ajoutés depuis la palette.
   */
  insertions?: Record<number, string[]>
}

/** Identifiant d'une case, unique dans une copie. */
export function idCase(qid: string, suffixe: string | number): string {
  return `${qid}.${suffixe}`
}

/** Toutes les questions d'une copie, exercices confondus, dans l'ordre. */
export function questionsDeLaCopie(copie: OmrCopieSource): OmrQuestionSource[] {
  return copie.exercices.flatMap((exercice) => exercice.questions)
}

/** Une case à cocher, éventuellement suivie d'un libellé. */
function caseTypst(copieId: string, id: string): string {
  return `omr-box(${typstString(copieId)}, ${typstString(id)})`
}

/** Rend un QCM : une case par proposition, empilées ou côte à côte. */
function rendreQcm(
  copieId: string,
  question: Extract<OmrQuestionSource, { type: 'qcmMono' | 'qcmMult' }>,
): string {
  const cellules = question.propositions.map((proposition, index) => {
    const id = idCase(question.qid, index)
    return `  [#${caseTypst(copieId, id)} #h(1.5mm) ${proposition.texte}],`
  })
  // Les colonnes se partagent la largeur disponible : une proposition longue
  // revient à la ligne dans sa cellule sans déborder sur la colonne voisine.
  const colonnes = `(1fr,) * ${question.propositions.length}`
  return `#grid(
  columns: ${colonnes},
  column-gutter: 6mm,
  row-gutter: 2mm,
${cellules.join('\n')}
)`
}

/**
 * Rend une réponse numérique : une colonne de cases par chiffre, chaque
 * colonne surmontée de son intitulé. L'élève noircit un chiffre par colonne.
 *
 * Un séparateur — virgule, barre de fraction — s'intercale sans case entre
 * deux colonnes : il ne se lit pas, il se lit *sur* la copie.
 */
function rendreNum(
  copieId: string,
  question: Extract<OmrQuestionSource, { type: 'AMCNum' }>,
): string {
  const cellules: string[] = []
  for (const [indexColonne, colonne] of question.colonnes.entries()) {
    if (colonne.separateurAvant != null && indexColonne > 0) {
      cellules.push(
        `  grid.cell(align: horizon, text(size: 11pt, ${typstString(colonne.separateurAvant)})),`,
      )
    }
    const cases = colonne.valeurs.map((valeur, indexValeur) => {
      const id = idCase(question.qid, `${indexColonne}_${indexValeur}`)
      return `      stack(dir: ltr, spacing: 1mm, ${caseTypst(copieId, id)}, text(size: 8pt)[${valeur}]),`
    })
    const entete =
      colonne.label != null
        ? `text(size: 7pt, ${typstString(colonne.label)})`
        : '[]'
    cellules.push(`  stack(
    spacing: 1.5mm,
    ${entete},
${cases.join('\n')}
  ),`)
  }
  return `#grid(
  columns: (auto,) * ${cellules.length},
  column-gutter: 5mm,
  align: top,
${cellules.join('\n')}
)`
}

/**
 * Rend une question ouverte : un cadre de rédaction, puis la rangée de cases
 * de barème que le professeur noircira lui-même en corrigeant. Le même moteur
 * de lecture relit donc sa notation, sans saisie au clavier.
 */
function rendreOpen(
  copieId: string,
  question: Extract<OmrQuestionSource, { type: 'AMCOpen' }>,
): string {
  const hauteur = question.hauteurReponseMm ?? 25
  const cases = []
  for (let point = 0; point <= question.points; point++) {
    const id = idCase(question.qid, point)
    cases.push(
      `  stack(dir: ltr, spacing: 1mm, ${caseTypst(copieId, id)}, text(size: 8pt)[${point}]),`,
    )
  }
  return `#block(width: 100%, height: ${hauteur}mm, stroke: 0.4pt + gray, radius: 1mm)
#v(1mm)
#grid(
  columns: (auto,) * ${question.points + 1},
  column-gutter: 3mm,
  align: horizon,
${cases.join('\n')}
)
#text(size: 8pt, style: "italic")[réservé au correcteur]`
}

/**
 * Rend une question, énoncé compris, comme un item de la liste `#tasks` de son
 * exercice : c'est `#tasks` qui la numérote, comme dans la vue « Impression ».
 */
function rendreQuestion(
  copieId: string,
  question: OmrQuestionSource,
  options: OmrDocumentOptions,
): string {
  const points = question.points > 1 ? 'points' : 'point'
  const bareme = options.showQuestionPoints
    ? ` #h(1fr) #text(size: 8pt, fill: gray)[${question.points} ${points}]`
    : ''
  let corps: string
  if (question.type === 'AMCNum') corps = rendreNum(copieId, question)
  else if (question.type === 'AMCOpen') corps = rendreOpen(copieId, question)
  else corps = rendreQcm(copieId, question)
  const contenu = `${question.enonce}${bareme}\n\n${corps}`
  // item de liste `+` : tout ce qui suit la première ligne est indenté, sans
  // quoi Typst refermerait l'item au premier retour à la ligne
  return `  + ${contenu.split('\n').join('\n    ')}`
}

/**
 * Graisse du numéro d'une question.
 *
 * C'est `label-weight` qui décide, pas un `strong` autour du libellé :
 * l'enrobage `tasks` de MathALÉA passe `label` à `format-label`, qui attend un
 * *motif* de numérotation. Une fonction y arrive bien, mais sa graisse est
 * ensuite écrasée par le `text(weight: label-weight, …)` qui l'enveloppe — le
 * réglage semblait alors sans effet.
 */
function graisseNumeros(bold: boolean): string {
  return bold ? '"bold"' : '"regular"'
}

/** Préfixe des variables de mise en page d'un exercice (`ex1-colonnes`…) */
function prefixeExercice(numero: number): string {
  return `ex${numero}`
}

/** Rend un exercice : repère, titre, liste de questions, repère d'insertion. */
function rendreExercice(
  copieId: string,
  exercice: OmrExerciceSource,
  numero: number,
  premiereQuestion: number,
  options: OmrDocumentOptions,
): string {
  const prefixe = prefixeExercice(numero)
  const items = exercice.questions.map((question) =>
    rendreQuestion(copieId, question, options),
  )
  const lignes: string[] = []
  // repère des réglages de l'exercice, posé au bord droit de la colonne de
  // texte : un bloc de hauteur nulle ne déplace rien, et `place` y devient
  // relatif à la largeur du texte plutôt qu'à la page entière
  lignes.push(
    `#block(width: 100%, height: 0pt, place(top + right, mathalea-anchor("exo", ${numero})))`,
  )
  if (options.showExerciseTitles && !options.mergeExercises) {
    const titre = exercice.titre ?? `Exercice ${numero}`
    const texte = `text(weight: "bold", fill: couleur-titre, ${typstString(titre)})`
    const contenu = (() => {
      switch (options.exerciseStyle) {
        case 'underline':
          return `block(width: 100%, stroke: (bottom: 0.8pt + couleur-titre), inset: (bottom: 4pt), ${texte})`
        case 'border-accent':
          return `block(width: 100%, fill: couleur-titre.transparentize(90%), stroke: (left: 3pt + couleur-titre), inset: 6pt, ${texte})`
        case 'rounded-box':
          return `block(width: 100%, stroke: 0.8pt + couleur-titre, radius: 4pt, inset: 6pt, ${texte})`
        case 'header-card':
          return `block(width: 100%, fill: couleur-titre.transparentize(90%), radius: 4pt, inset: 6pt, ${texte})`
        default:
          return texte
      }
    })()
    lignes.push(
      `#block(above: ${options.exerciseSpacing}em, below: 0.6em, ${contenu})`,
    )
  } else if (numero > 1) {
    lignes.push(`#v(${options.exerciseSpacing}em)`)
  }
  lignes.push(
    `#tasks(columns: ${prefixe}-colonnes, label: "1.", label-weight: ${graisseNumeros(
      options.boldQuestionNumbers,
    )}, row-gutter: ${prefixe}-gutter, above: 1.2em, below: 0.8em, start: ${premiereQuestion})[`,
    items.join('\n'),
    ']',
  )
  // repère de la palette et point d'insertion : le contenu inséré vit dans le
  // gabarit (`omr-insertions`), le corps ne fait que l'appeler à sa place
  lignes.push(`#mathalea-anchor("gap", ${numero})`)
  lignes.push(`#omr-insertions.at("${numero}", default: [])`)
  return lignes.join('\n')
}

/** Markup Typst des exercices d'une copie, hors cadre (en-tête, consigne). */
function corpsDeCopie(
  copie: OmrCopieSource,
  options: OmrDocumentOptions,
): string {
  const blocs: string[] = []
  // les figures de la copie, déclarées en tête de son bloc de contenu : le
  // `#let` y est local, deux copies peuvent donc avoir chacune leur `fig-1`.
  // Chaque figure vient avec son zoom et son alignement, que le code produit
  // par `htmlToTypst` lit à côté d'elle (`mathalea-figure-block`)
  if (copie.figures != null && copie.figures.length > 0) {
    blocs.push(
      copie.figures
        .flatMap((figure, index) => [
          `#let fig-${index + 1} = ${applyDocumentFontsToFigure(figure, options)}`,
          `#let fig-${index + 1}-zoom = 1`,
          `#let fig-${index + 1}-align = center`,
        ])
        .join('\n'),
    )
  }
  // repère 0 : permet une insertion avant le premier exercice
  blocs.push('#mathalea-anchor("gap", 0)\n#omr-insertions.at("0", default: [])')
  let premiereQuestion = 1
  for (const [index, exercice] of copie.exercices.entries()) {
    blocs.push(
      rendreExercice(
        copie.copieId,
        exercice,
        index + 1,
        options.mergeExercises ? premiereQuestion : 1,
        options,
      ),
    )
    premiereQuestion += exercice.questions.length
  }
  return blocs.join('\n\n')
}

/**
 * Appel du gabarit `omr-copie` pour une copie : c'est le seul endroit où
 * passent les données propres à l'élève — nom, identifiants, corps de ses
 * questions. Tout le reste vit dans le gabarit, retouchable une fois pour
 * toute la classe.
 */
export function appelCopie(
  source: OmrDocumentSource,
  copie: OmrCopieSource,
  options: OmrDocumentOptions,
): string {
  return `#omr-copie(
  ${typstString(source.titre)},
  ${typstString(copie.eleve.nom)},
  ${typstString(source.sujetId)},
  ${typstString(copie.copieId)},
  ${typstString(source.consigne ?? '')},
  [
${corpsDeCopie(copie, options)}
  ],
)`
}

/**
 * Signature du corrigé d'une copie : ce qui distingue deux corrigés.
 *
 * Quand toute la classe compose le même sujet, les corrigés sont identiques et
 * un seul est imprimé. Avec une graine par élève, il en faut un par copie.
 * C'est le contenu qui tranche, pas le réglage de graine : deux exercices
 * peuvent très bien tomber sur la même version.
 */
function signatureCorrige(copie: OmrCopieSource): string {
  return questionsDeLaCopie(copie)
    .map((question) =>
      JSON.stringify([question.enonce, question.correction ?? '']),
    )
    .join('|')
}

/**
 * Corrigé du professeur, groupé à la fin du document.
 *
 * Il ne figure jamais sur la copie de l'élève : les corrigés sont rassemblés
 * après toutes les copies, sur des pages que le professeur garde. Une copie
 * est nommée seulement s'il y a plusieurs corrigés distincts — sinon le
 * corrigé unique vaut pour la classe entière.
 */
export function rendreCorriges(
  source: OmrDocumentSource,
  options: OmrDocumentOptions,
): string {
  if (options.corrige === 'aucun') return ''
  const distincts: { copie: OmrCopieSource; signature: string }[] = []
  for (const copie of source.copies) {
    const signature = signatureCorrige(copie)
    if (!distincts.some((autre) => autre.signature === signature)) {
      distincts.push({ copie, signature })
    }
  }
  if (distincts.length === 0) return ''
  const nommer = distincts.length > 1

  const blocs = distincts.map(({ copie }) => {
    const lignes: string[] = []
    lignes.push(
      `#text(size: 1.1em, weight: "bold", fill: couleur-titre)[Corrigé${
        nommer ? ` — ${copie.eleve.nom}` : ''
      }]`,
      '#v(2mm)',
    )
    let numero = 1
    for (const [index, exercice] of copie.exercices.entries()) {
      if (!options.mergeExercises) numero = 1
      if (options.showExerciseTitles && !options.mergeExercises) {
        lignes.push(
          `#block(above: 1em, below: 0.4em, text(weight: "bold", ${typstString(
            exercice.titre ?? `Exercice ${index + 1}`,
          )}))`,
        )
      }
      for (const question of exercice.questions) {
        lignes.push(`*${numero}.* ${corrigeDeLaQuestion(question, options)}`)
        lignes.push('')
        numero += 1
      }
    }
    return lignes.join('\n')
  })

  // le corrigé commence sur une feuille neuve, et sans les repères de calage
  // ni le QR-code : ce n'est pas une copie, rien n'y sera lu optiquement
  return `#pagebreak()
#set page(header: none, background: none, margin: (x: 20mm, y: 20mm))
${blocs.join('\n\n#pagebreak()\n\n')}`
}

/**
 * Corrigé d'une question : la correction de l'exercice, ou à défaut la bonne
 * réponse déduite du corrigé des cases — un QCM sans correction rédigée reste
 * ainsi exploitable.
 */
function corrigeDeLaQuestion(
  question: OmrQuestionSource,
  options: OmrDocumentOptions,
): string {
  const redigee =
    options.corrige === 'minimal'
      ? (question.correctionMinimale ?? question.correction)
      : question.correction
  if (redigee != null && redigee.trim() !== '') return redigee
  if (question.type === 'AMCNum') {
    const valeur = question.colonnes
      .map((colonne, index) =>
        index > 0 && colonne.separateurAvant != null
          ? `${colonne.separateurAvant}${colonne.attendu}`
          : colonne.attendu,
      )
      .join('')
    return `#text(fill: couleur-titre, weight: "bold")[${valeur}]`
  }
  if (question.type === 'AMCOpen') return '_(question ouverte)_'
  const bonnes = question.propositions
    .filter((proposition) => proposition.correct)
    .map((proposition) => proposition.texte)
  if (bonnes.length === 0) return '—'
  return `#text(fill: couleur-titre, weight: "bold")[${bonnes.join(' ; ')}]`
}

/** Le gabarit d'une évaluation, et le corps des questions de chaque copie. */
export interface OmrGabarit {
  /**
   * Code Typst commun à toutes les copies : préambule, réglages de page,
   * variables de mise en page, insertions et cadre nominatif. C'est ce que le
   * professeur retouche dans l'aperçu ; la retouche vaut pour toute la classe.
   */
  gabarit: string
  /** Markup Typst des exercices, par identifiant de copie. */
  corpsParCopie: Map<string, string>
}

/** Bloc `#let omr-insertions = (...)`, une entrée par point d'insertion. */
function blocInsertions(
  nbExercices: number,
  carryOver: OmrCarryOver,
): string[] {
  const lignes = [
    '// Insertions faites depuis l’aperçu (saut de page, texte libre), par',
    '// numéro d’exercice — « 0 » précède le premier. Une entrée par ligne :',
    '// c’est ce que la palette relit et réécrit.',
    '#let omr-insertions = (',
  ]
  for (let numero = 0; numero <= nbExercices; numero++) {
    const contenu = carryOver.insertions?.[numero] ?? []
    lignes.push(`  "${numero}": [${contenu.join(' ')}],`)
  }
  lignes.push(')')
  return lignes
}

/**
 * Sépare ce qui est commun à toute la classe — le gabarit — de ce qui est
 * propre à chaque copie — le corps de ses exercices.
 *
 * L'aperçu compile le gabarit avec le corps d'une seule copie ; la génération
 * finale le compile avec tous les corps.
 */
export function assemblerGabarit(
  source: OmrDocumentSource,
  options: OmrDocumentOptions = defaultOmrDocumentOptions,
  carryOver: OmrCarryOver = {},
): OmrGabarit {
  const papier = PAPIERS[source.papier ?? 'a4']
  const corpsParCopie = new Map<string, string>()
  for (const copie of source.copies) {
    corpsParCopie.set(copie.copieId, corpsDeCopie(copie, options))
  }
  const nbExercices = Math.max(
    0,
    ...source.copies.map((copie) => copie.exercices.length),
  )

  // Ce que le HTML converti par `htmlToTypst` peut référencer : `#txt(...)`,
  // une figure, un tableau de variations, un schéma… La conversion produit du
  // code qui suppose le préambule de la vue « Impression » ; le gabarit doit
  // donc déclarer les mêmes aides, sous peine d'un « unknown variable » à la
  // compilation. On détecte ce qui sert réellement, comme le fait
  // `buildTypstDocument`, plutôt que de tout déclarer d'office.
  const corps = [...corpsParCopie.values(), rendreCorriges(source, options)]
  const utilise = detectUsedFeatures(corps.flatMap((bloc) => bloc.split('\n')))
  const aDesFigures = source.copies.some(
    (copie) => (copie.figures?.length ?? 0) > 0,
  )

  // `MATHALEA_TASKS_HELPER` enrobe `tasks` : sans lui, une question dont
  // l'énoncé contient un bloc — c'est le cas de toutes celles à cases —
  // voit son numéro aligné en haut plutôt que sur sa première ligne
  const lignes: string[] = [
    MATHALEA_ANCHOR_HELPER,
    OMR_PREAMBULE,
    TASKIZE_IMPORT,
  ]
  if (utilise.usesVarTable) lignes.push(VARTABLE_IMPORT)
  if (utilise.usesCtz) lignes.push(CTZ_EUCLIDE_IMPORT)
  else if (utilise.usesCetz) lignes.push(CETZ_IMPORT)
  if (utilise.usesCetzPlotChart) lignes.push(CETZ_PLOT_CHART_IMPORT)
  lignes.push('')
  lignes.push(MATHALEA_TASKS_HELPER, '')
  lignes.push(
    '#tasks-setup(columns: "auto-fit", auto-fit-mode: "uniform", max-columns: 4)',
    '',
  )
  if (utilise.usesSchema) lignes.push(MATHALEA_SCHEMA_HELPER, '')
  if (aDesFigures) {
    lignes.push(MATHALEA_FIT_HELPER, '', MATHALEA_FIGURE_BLOCK_HELPER, '')
  }
  if (utilise.usesMathaleaFigure) lignes.push(MATHALEA_FIGURE_HELPERS, '')
  if (utilise.usesWritingLines) lignes.push(MATHALEA_WRITING_LINES_HELPER, '')

  // variables du préambule « Impression » auxquelles le HTML converti se
  // réfère : `#txt(...)` (le `\\text{}` de LaTeX) passe par `police-texte`
  lignes.push(`#let police-texte = ${typstString(options.font)}`)
  lignes.push(`#let police-maths = ${typstString(options.mathFont)}`)
  lignes.push(`#let taille-texte = ${options.fontSize}pt`)
  lignes.push(
    `#let couleur = ${options.titleColor === '' ? 'black' : `rgb("${options.titleColor}")`}`,
  )
  if (utilise.usesQcm) {
    lignes.push('#let qcm-colonnes = 2 // colonnes des propositions de QCM')
  }
  lignes.push('')

  lignes.push(
    '// Mise en page des questions, exercice par exercice : c’est ce que règlent',
    '// les pastilles de l’aperçu.',
  )
  for (let numero = 1; numero <= nbExercices; numero++) {
    const prefixe = prefixeExercice(numero)
    const regle = carryOver.layout?.[numero]
    lignes.push(
      `#let ${prefixe}-colonnes = ${regle?.colonnes ?? OMR_COLONNES_DEFAUT}`,
    )
    lignes.push(
      `#let ${prefixe}-gutter = ${regle?.gutter ?? OMR_GUTTER_DEFAUT}`,
    )
  }
  lignes.push('')
  lignes.push(...blocInsertions(nbExercices, carryOver))
  lignes.push('')

  lignes.push(
    `#let couleur-titre = ${options.titleColor === '' ? 'black' : `rgb("${options.titleColor}")`}`,
  )
  lignes.push('')
  lignes.push(
    '// Cadre d’une copie : en-tête nominatif, consigne, puis les exercices.',
    '// Le `set page` est porté par le bloc de la copie, si bien que chaque copie',
    '// a son en-tête sans qu’aucun état n’ait à traverser les pages.',
    '#let omr-copie(titre, eleve-nom, sujet-id, copie-id, consigne, corps) = [',
    `  #set page(header: omr-entete(titre, eleve-nom, sujet-id, copie-id, style: "${options.headerStyle}", subtitle: ${typstString(options.subtitle)}, header-line: ${typstString(options.headerLine)}))`,
    '  #omr-consigne',
    '  #if consigne != "" [',
    '    #block(width: 100%, inset: 2mm)[#consigne]',
    '  ]',
    '  #v(3mm)',
    '',
    '  #corps',
    ']',
    '',
  )

  lignes.push(
    '#set page(',
    `  paper: "${papier.typst}",`,
    '  // les marges tiennent les marqueurs de calage à l’écart du contenu : ils',
    '  // occupent 10 à 15 mm depuis chaque bord, et une seule lettre qui les',
    '  // toucherait suffirait à les fondre dans une composante connexe trop',
    '  // grande, donc à faire échouer le recalage de la page entière',
    '  margin: (top: 42mm, bottom: 22mm, left: 20mm, right: 20mm),',
    '  header-ascent: 6mm,',
    '  background: omr-calage,',
    ...piedDePage(options),
    ')',
    '#set text(font: police-texte, size: taille-texte, lang: "fr", ' +
      `spacing: ${options.wordSpacing}%)`,
    `#set par(justify: false, leading: ${options.lineSpacing}em)`,
    '#set enum(numbering: "1.", spacing: 1.2em)',
    '#show math.equation: set text(font: police-maths)',
    // `#txt(...)` : du texte glissé dans une formule mais rendu avec la police
    // du texte (unités, mots) — ce que produit la conversion de `\\text{}`
    '#let txt(corps) = text(font: police-texte, corps)',
    MATHALEA_INLINE_FORMULA_RULE,
    // `\\dfrac` plutôt que `\\frac` : les fractions gardent leur taille normale
    // au milieu d'une phrase, comme dans la vue « Impression »
    '#show math.frac: it => math.display(it)',
    '',
  )

  return { gabarit: lignes.join('\n'), corpsParCopie }
}

/**
 * Argument `footer:` du `#set page(...)`.
 *
 * Le pied de page reste à l'écart des marqueurs du bas : `footer-descent` les
 * laisse respirer, sinon le texte du pied s'en approche assez pour être happé
 * par la même composante connexe à la détection.
 */
function piedDePage(options: OmrDocumentOptions): string[] {
  if (!options.showFooter) return ['  footer: none,']
  return [
    '  footer-descent: 6mm,',
    '  footer: context [',
    '    #mathalea-anchor("footer", 0)',
    '    #set text(size: 8pt, fill: gray)',
    '    #grid(columns: (1fr, auto),',
    `      align(left, ${typstString(options.footerText)}),`,
    '      align(right)[#counter(page).display("1 / 1", both: true)],',
    '    )',
    '  ],',
  ]
}

/**
 * Construit le code Typst complet du document.
 *
 * Toutes les copies vivent dans un seul document : une seule compilation
 * produit le PDF à imprimer *et*, par `query`, les positions de toutes les
 * cases de toutes les copies.
 */
export function buildOmrDocument(
  source: OmrDocumentSource,
  options: OmrDocumentOptions = defaultOmrDocumentOptions,
  carryOver: OmrCarryOver = {},
): string {
  const { gabarit } = assemblerGabarit(source, options, carryOver)
  const appels = source.copies.map((copie) =>
    appelCopie(source, copie, options),
  )
  return `${gabarit}
${appels.join(SEPARATEUR_DE_COPIE)}
${rendreCorriges(source, options)}
`
}

/**
 * Ce qui sépare deux copies : chacune commence sur une feuille neuve.
 *
 * Aucun compteur de page n'est remis à zéro. Le QR-code et les cases publient
 * le rang *physique* de la feuille dans le document ; c'est MathALÉA qui
 * ramène ensuite ce rang au rang dans la copie (voir `buildEvaluation`).
 */
export const SEPARATEUR_DE_COPIE = '\n\n#pagebreak()\n\n'

/** Repères de calage du document, pour le fichier d'accompagnement. */
export function reperesDuDocument(source: OmrDocumentSource) {
  const papier = PAPIERS[source.papier ?? 'a4']
  return reperesRelatifs(papier.largeurMm, papier.hauteurMm)
}
