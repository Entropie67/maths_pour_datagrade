import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import type { Figure2D } from '../../lib/2d/Figures2D'
import {
  listeFigures2d,
  type Forme,
} from '../../lib/2d/figures2d/listeFigures2d'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { Segment, segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../lib/2d/textes'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre = 'Reconnaitre des figures symétriques'
export const interactifReady = true

// Gestion de la date de publication initiale
export const dateDePublication = '08/05/2025'
export const dateDeModifImportante = '11/10/2026'

/**
 * Donner le nombre d'axes de symétrie d'une figure.
 * @author Jean-claude Lhote
 */
export const uuid = '328b2'

export const refs = {
  'fr-fr': ['6G1autoC', '6AutoG3'],
  'fr-2016': ['6G25-4'],
  'fr-ch': ['9R1ES4C-7', '9R2ES4C-7', '9R3ES4C-7', 'PRQES02D-1'],
}

export default class NbAxesDeSymetrie extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Type de figures',
      'Nombres séparés par des tirets :\n1 : Panneaux\n2 : Formes géométriques\n3 : Legos\n4 : Lettres\n5 : Chiffres et nombres\n6 : Mélange',
    ]
    this.sup = '6'
    this.besoinFormulaire2Numerique = ['Nombre de figures par question', 3]
    this.sup2 = 3
    // this.besoinFormulaire3CaseACocher = ['Avec des rotations aléatoires', false]
    this.sup3 = false
    this.besoinFormulaire4CaseACocher = ['Grandes figures', true]
    this.sup4 = true
  }

  nouvelleVersion(): void {
    let nbFigures = this.sup2
    const factor = this.sup4 ? 1.5 : 0.75
    const typeDeFigures = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 5,
      defaut: 1,
      melange: 6,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    const numerosChoisis: number[] = []
    for (let i = 0; i < this.nbQuestions;) {
      let texte = ''
      let texteCorr = ''
      const objets: NestedObjetMathalea2dArray = []
      const objetsCorr: NestedObjetMathalea2dArray = []

      const typeDeFigureChoisie = [
        'panneau',
        'geometrique',
        'lego',
        'lettre',
        'chiffre',
      ][typeDeFigures[i] - 1]
      const listeFigs = listeFigures2d
        .filter((el) => el.type === typeDeFigureChoisie)
        .filter((el) => !numerosChoisis.includes(el.numero))
        .filter((el, index, self) => {
          // Si on ne parle pas d'un panneau, on ne filtre pas par style
          if (typeDeFigureChoisie !== 'panneau') return true

          // On garde seulement le premier élément pour chaque style défini
          return (
            index ===
            self.findIndex((autre) => (autre.style ?? '') === (el.style ?? ''))
          )
        })
      if (listeFigs.length === 0) {
        this.listeQuestions.push('Aucune figure disponible')
        this.listeCorrections.push('Aucune figure disponible')
        break
      }
      const nbFigs = listeFigs.length
      if (nbFigs < nbFigures) {
        nbFigures = nbFigs
      }
      const figures = []
      for (let j = 0; j < nbFigures; j++) {
        const choix = listeFigs.filter(
          (el) => !numerosChoisis.includes(el.numero),
        )
        if (choix.length === 0) {
          nbFigures = j
          break
        }
        const figure: Forme = choice(choix)
        numerosChoisis.push(figure.numero)
        figures.push(figure)
      }
      texte += this.interactif
        ? `Combien d'axes de symétrie ${nbFigures > 1 ? 'possèdent les figures suivantes' : 'possède la figure suivante'} ?<br>`
        : `Tracer le ou les axes de symétrie d${nbFigures > 1 ? 'es ' : 'e la'} figure${nbFigures > 1 ? 's' : ''} suivante${nbFigures > 1 ? 's' : ''} lorsqu'il y en a.<br>`
      const formes: Figure2D[] = []
      const scale = nbFigures === 1 ? 1 : nbFigures === 2 ? 0.9 : 0.8
      const ecart = 6.5 * factor * scale
      for (let j = 0; j < nbFigures; j++) {
        const alpha = randint(-30, 30, 0)
        const figure = figures[j]
        const options = figure.options ?? {}
        const forme = figure
          .figure2d(options)
          .dilate(factor)
          .translate(j * ecart, 0)
        forme.name = figure.name.replace(/ /g, '_')
        if (this.sup3) forme.rotate(alpha)
        formes.push(forme)

        const formeTexte = texteParPosition(
          `figure ${j + 1}`,
          j * ecart,
          2.8 * factor,
        )
        objets.push(forme, formeTexte)
        if (j > 0) {
          // Séparateur entre deux figures consécutives
          const separateur = segment(
            (j - 0.5) * ecart,
            -2.8 * factor,
            (j - 0.5) * ecart,
            3.4 * factor,
            'gray',
          )
          separateur.pointilles = 2
          separateur.epaisseur = 1
          objets.push(separateur)
          objetsCorr.push(separateur)
        }
        let axes: Segment[] = []
        if (forme.nbAxes !== 0) {
          const formeBis = forme.copy(forme.name + 'Bis')
          formeBis.opacite = 0.3
          const formeCorr = forme.autoReflectionAnimee(
            `${forme.name}Corr_${i * this.sup2 + j}`,
            forme.x,
            forme.y,
          )
          // Les axes ont déjà suivi la dilatation et la translation de la figure
          axes = forme.Axes
          objetsCorr.push(formeBis, formeCorr, formeTexte)
        } else {
          if (forme.nonAxe) {
            const formeBis = forme.copy(forme.name + 'Bis')
            formeBis.opacite = 0.3
            const formeCorr = forme.autoReflectionAnimee(
              `${forme.name}Corr_${i * this.sup2 + j}`,
              forme.x,
              forme.y,
            )
            // Droite testée, pointillée pour ne pas la confondre avec un axe
            const axe = formeCorr.nonAxe
            if (axe) {
              axe.epaisseur = 1
              axe.pointilles = 2
              axe.color = colorToLatexOrHTML(bleuMathalea)
              objetsCorr.push(formeBis, formeCorr, formeTexte, axe)
            } else {
              objetsCorr.push(forme, formeTexte)
            }
          } else {
            objetsCorr.push(forme, formeTexte)
          }
        }
        if (axes.length > 0) {
          for (let k = 0; k < axes.length; k++) {
            const seg = axes[k]
            seg.epaisseur = 1.5
            seg.color = colorToLatexOrHTML(orangeMathalea)
            objetsCorr.push(seg)
          }
        }
      }
      texte += mathalea2d(
        Object.assign(
          { pixelsParCm: 20, scale: factor === 0.75 ? scale : 0.7 * scale },
          fixeBordures(objets),
        ),
        objets,
      )
      if (this.interactif) {
        // Une seule question (donc une seule correction) pour toutes les figures
        const choix = [
          { label: 'aucun', value: 'aucun' },
          ...[1, 2, 3, 4, 5, 6].map((n) => ({
            label: String(n),
            value: String(n),
          })),
          { label: 'une infinité', value: 'infini' },
        ]
        const dataOptions: Record<string, { qcm: typeof choix }> = {}
        const reponses: Record<string, { value: string }> = {}
        const lignes: string[] = []
        for (let j = 0; j < nbFigures; j++) {
          const nbAxes = formes[j].nbAxes
          dataOptions[`champ${j + 1}`] = { qcm: choix }
          reponses[`champ${j + 1}`] = {
            value: !Number.isFinite(nbAxes)
              ? 'infini'
              : nbAxes === 0
                ? 'aucun'
                : String(nbAxes),
          }
          lignes.push(`figure ${j + 1} : %{champ${j + 1}}`)
        }
        texte += addMultiMathfield(this, i, {
          dataTemplate: lignes.join('\n'),
          dataOptions,
        })
        handleAnswers(this, i, reponses, {
          formatInteractif: 'multi-mathfield',
        })
      }

      texteCorr += mathalea2d(
        Object.assign(
          { pixelsParCm: 20, scale: factor === 0.75 ? scale : 0.7 * scale },
          fixeBordures(objetsCorr),
        ),
        objetsCorr,
      )
      texteCorr += `${formes
        .map((el, j) =>
          Number.isFinite(el.nbAxes)
            ? `${j === 0 ? 'L' : 'l'}a figure $${j + 1}$ possède ${el.nbAxes === 0 ? texteEnCouleurEtGras('aucun') : `$${miseEnEvidence(el.nbAxes)}$`} axe${el.nbAxes > 1 ? 's' : ''} de symétrie`
            : `${j === 0 ? 'L' : 'l'}a figure $${j + 1}$ possède ${texteEnCouleurEtGras('une infinité')} d'axes de symétrie`,
        )
        .join(', ')}.`
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
      i++
    }
  }
}
