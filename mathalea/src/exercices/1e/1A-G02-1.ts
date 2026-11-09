import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { labelPoint } from '../../lib/2d/textes'
import { texteSurSegment } from '../../lib/2d/texteSurSegment'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  compareGrandeur,
  optionsClavierGrandeur,
  reponseGrandeur,
} from '../../lib/interactif/saisieGrandeur'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const titre = "Calculer le périmètre d'un quadrilatère"
export const dateDePublication = '19/06/2026'

export const dateDeModifImportante = '30/10/2026'

export const uuid = '7c2e1'

export const refs = {
  'fr-fr': ['1A-G02-1', '2A-G3-1'],
  'fr-ch': ['9R1QCMGM-1', '9R2QCMGM-1', '9R3QCMGM-1'],
}

export const interactifReady = true

export const amcReady = true

/**
 * Calculer le périmètre d'un quadrilatère représenté à main levée.
 * @author Stéphane Guyon
 */
export default class PerimetreQuadrilatereQcm extends ExerciceQcmACourt {
  // En saisie libre, la question est portée par la phrase placée avant le champ
  private enonceFigure = ''
  private reponseSaisie = ''
  clavierReponseCourte = KeyboardType.clavierEntierementPersonnalisable
  texteAvantReponseCourte = 'Le périmètre du quadrilatère $ABCD$ vaut '
  texteApresReponseCourte = ". (Préciser l'unité.)"
  enonceCourt = () =>
    this.enonceFigure +
    (this.interactif ? '' : '<br>Calculer le périmètre du quadrilatère $ABCD$.')
  reponseCourte = () => this.reponseSaisie
  compareReponseCourte = compareGrandeur

  private appliquerLesValeurs(
    longueurs: [abEnCm: number, bcEnMm: number, cdEnCm: number, daEnMm: number],
  ) {
    const [abEnCm, bcEnMm, cdEnCm, daEnMm] = longueurs
    const bcEnCm = bcEnMm / 10
    const daEnCm = daEnMm / 10
    const perimetreEnCm = abEnCm + bcEnCm + cdEnCm + daEnCm
    const perimetreAvecVirguleDecaleeADroite = perimetreEnCm * 10
    const perimetreAvecErreurDePuissance = perimetreEnCm / 10
    const sommeDesValeursSansUnites = abEnCm + bcEnMm + cdEnCm + daEnMm

    const A = pointAbstrait(0, 0, 'A', 'below left')
    const B = pointAbstrait(5, 0.5, 'B', 'below right')
    const C = pointAbstrait(4.2, 3.5, 'C', 'above right')
    const D = pointAbstrait(-0.8, 2.6, 'D', 'above left')
    const quadrilatere = polygone([A, B, C, D])
    quadrilatere.epaisseur = 2

    const objets = [
      quadrilatere,
      labelPoint(A, B, C, D),
      texteSurSegment(`$${abEnCm}\\text{ cm}$`, B, A, 'black', 0.7),
      texteSurSegment(`$${bcEnMm}\\text{ mm}$`, C, B, 'black', 0.7),
      texteSurSegment(`$${cdEnCm}\\text{ cm}$`, D, C, 'black', 0.7),
      texteSurSegment(`$${daEnMm}\\text{ mm}$`, A, D, 'black', 0.7),
    ]

    this.enonceFigure = `Le quadrilatère $ABCD$ ci-dessous n'est pas représenté à l'échelle.<br>

${mathalea2d(
  Object.assign(
    { pixelsParCm: 25, scale: 0.8, center: !context.isHtml },
    fixeBordures(objets, {
      rxmin: -0.6,
      rxmax: 0.6,
      rymin: -0.15,
      rymax: 0.45,
    }),
  ),
  objets,
)}`
    this.enonce = `${this.enonceFigure}
Son périmètre est égal à :`
    this.reponseSaisie = reponseGrandeur(perimetreEnCm, 'cm')
    this.optionsChampReponseCourte = optionsClavierGrandeur({
      unitesEnonce: ['mm', 'cm'],
      dimension: 1,
      unitePrincipale: 'cm',
    })

    this.reponses = [
      `$${perimetreEnCm}\\text{ cm}$`,
      `$${perimetreAvecVirguleDecaleeADroite}\\text{ cm}$`,
      `$${sommeDesValeursSansUnites}\\text{ cm}$`,
      `$${texNombre(perimetreAvecErreurDePuissance, 1)}\\text{ cm}$`,
    ]

    this.correction = `Pour additionner les longueurs, il faut d'abord les exprimer dans la même unité :<br>
$${bcEnMm}\\text{ mm}=${bcEnCm}\\text{ cm}$ et $${daEnMm}\\text{ mm}=${daEnCm}\\text{ cm}$.<br>
Le périmètre d'un quadrilatère est la somme des longueurs de ses quatre côtés.<br>
$\\begin{aligned}
P_{ABCD}&=AB+BC+CD+DA\\\\
&=${abEnCm}\\text{ cm}+${bcEnCm}\\text{ cm}+${cdEnCm}\\text{ cm}+${daEnCm}\\text{ cm}
\\end{aligned}$<br>
Donc $P_{ABCD}=${miseEnEvidence(perimetreEnCm)}$ ${texteEnCouleurEtGras('cm')}.`
  }

  versionOriginale = () => {
    this.appliquerLesValeurs([3, 40, 5, 20])
  }

  versionAleatoire = () => {
    this.appliquerLesValeurs([
      randint(2, 9),
      10 * randint(2, 9),
      randint(2, 9),
      10 * randint(2, 9),
    ])
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.versionAleatoire()
  }
}
