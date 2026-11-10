import { cercle } from '../../lib/2d/cercle'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { texteSurSegment } from '../../lib/2d/texteSurSegment'
import { tracePoint } from '../../lib/2d/TracePoint'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  compareGrandeurAvecPi,
  optionsClavierGrandeur,
  reponseGrandeurAvecPi,
} from '../../lib/interactif/saisieGrandeur'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const titre = "Calculer l'aire d'un disque"
export const dateDePublication = '19/06/2026'

export const dateDeModifImportante = '22/10/2026'

export const uuid = 'f19d3'

export const refs = {
  'fr-fr': ['1A-G02-5', '2A-G3-5'],
  'fr-ch': ['10CTGM1A-8', '10LCGM1A-8', '10LSGM1A-8'],
}

export const interactifReady = true

export const amcReady = true

/**
 * Calculer l'aire d'un disque à partir de son diamètre.
 * @author Stéphane Guyon
 */
export default class AireDisqueQcm extends ExerciceQcmACourt {
  // En saisie libre, la question est portée par la phrase placée avant le champ
  private enonceFigure = ''
  private reponseSaisie = ''
  clavierReponseCourte = KeyboardType.clavierEntierementPersonnalisable
  texteAvantReponseCourte = "La valeur exacte de l'aire de ce disque vaut "
  texteApresReponseCourte = ". (Préciser l'unité.)"
  enonceCourt = () =>
    this.enonceFigure +
    (this.interactif
      ? ''
      : "<br>Donner la valeur exacte de l'aire de ce disque.")
  reponseCourte = () => this.reponseSaisie
  compareReponseCourte = compareGrandeurAvecPi

  private appliquerLesValeurs(diametre: number) {
    const rayon = diametre / 2
    const coefficientAire = rayon ** 2

    const O = pointAbstrait(0, 0, 'O', 'below')
    const A = pointAbstrait(-2.5, 0)
    const B = pointAbstrait(2.5, 0)
    const cercleC = cercle(O, 2.5)
    cercleC.epaisseur = 2

    const segmentMesure = segment(A, B)
    segmentMesure.epaisseur = 1.5
    segmentMesure.pointilles = 5
    const objets = [
      cercleC,
      segmentMesure,
      tracePoint(O),
      labelPoint(O),
      texteSurSegment(`$${diametre}\\text{ cm}$`, A, B, 'black', 0.6),
    ]

    this.enonceFigure = `Le disque ci-dessous n'est pas représenté à l'échelle.<br>
${mathalea2d(
  Object.assign(
    { pixelsParCm: 25, scale: 0.8, center: !context.isHtml },
    fixeBordures(objets),
  ),
  objets,
)}`
    this.enonce = `${this.enonceFigure}
Quelle est la valeur exacte de son aire ?`
    this.reponseSaisie = reponseGrandeurAvecPi(`${coefficientAire}\\pi`, 'cm^2')
    this.optionsChampReponseCourte = optionsClavierGrandeur({
      unitesEnonce: ['cm'],
      dimension: 2,
      unitePrincipale: 'cm',
      avecPi: true,
    })

    this.reponses = [
      `$${coefficientAire}\\pi\\text{ cm}^2$`,
      `$${diametre}\\pi\\text{ cm}^2$`,
      `$${diametre ** 2}\\pi\\text{ cm}^2$`,
      `$${2 * coefficientAire}\\pi\\text{ cm}^2$`,
    ]

    this.correction = `Le rayon est la moitié du diamètre : $r=${diametre}\\div 2=${rayon}\\text{ cm}$.<br>
L'aire d'un disque de rayon $r$ est $\\mathcal{A}=\\pi\\times r^2$.<br>
Ainsi, $\\mathcal{A}=\\pi\\times ${rayon}^2=${miseEnEvidence(`${coefficientAire}\\pi\\text{ cm}^2`)}$.`
  }

  versionOriginale = () => {
    this.appliquerLesValeurs(8)
  }

  versionAleatoire = () => {
    this.appliquerLesValeurs(2 * randint(3, 9))
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.versionAleatoire()
  }
}
