import { afficheMesureAngle } from '../../lib/2d/AfficheMesureAngle'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre =
  "Calculer l'angle complémentaire dans un triangle rectangle"

export const interactifReady = true

export const dateDePublication = '06/12/2025'

export const uuid = '6aa87'

export const refs = {
  'fr-fr': ['3AutoG03'],
  'fr-ch': ['9R1ES2A-8', '9R2ES2A-8', '9R3ES2A-8', 'PRQES01C-5'],
}
/**
 * @author Jean-claude Lhote
 */
export default class AngleComplémentaireTriangleRectangle extends ExerciceSimple {
  can: boolean
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = [
      'Sujet original (2e paramètre inutile si coché)',
      false,
    ]
    this.besoinFormulaire2Numerique = [
      'Modulo 10 pour angle en A',
      10,
      '0 à 9 : modulo choisi\n10 : aléatoire',
    ]
    this.sup = false
    this.sup2 = 10
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.optionsChampTexte = {
      texteAvant: '<br>$\\widehat{C} =$',
      texteApres: '$^\\circ$',
    }
    this.can = false
  }

  nouvelleVersion() {
    const modulo = this.sup2 >= 0 && this.sup2 <= 9 ? this.sup2 : randint(0, 9)
    const positionAngleDroit = this.sup
      ? 'droite'
      : choice(['gauche', 'droite'])

    const alpha = this.sup ? 35 : randint(1, 3) * 10 + modulo
    const B =
      positionAngleDroit === 'gauche'
        ? pointAbstrait(0, 0, 'B', 'below left')
        : pointAbstrait(6, 0, 'B', 'below right')
    const A =
      positionAngleDroit === 'gauche'
        ? pointAbstrait(6, 0, 'A', 'below right')
        : pointAbstrait(0, 0, 'A', 'below left')
    const C =
      positionAngleDroit === 'gauche'
        ? pointAbstrait(
            0,
            6 * Math.tan((alpha * Math.PI) / 180),
            'C',
            'above left',
          )
        : pointAbstrait(
            6,
            6 * Math.tan((alpha * Math.PI) / 180),
            'C',
            'above right',
          )

    const coteAB = segment(A, B)
    const coteBC = segment(B, C)
    const coteCA = segment(C, A)
    const labels = labelPoint(A, B, C)
    const angleDroit = codageAngleDroit(A, B, C)
    const angleA = afficheMesureAngle(B, A, C)

    const objets = [coteAB, coteBC, coteCA, labels, angleDroit, angleA]
    const figure = mathalea2d(
      Object.assign({ pixelsParCm: 30 }, fixeBordures(objets)),
      objets,
    )

    this.reponse = 90 - alpha
    this.question =
      figure +
      `Dans le triangle $ABC$ rectangle en $B$, on sait que $\\widehat{A} = ${alpha}^\\circ$. <br>
      Calculer $\\widehat{C}$.`

    this.correction = `On sait que la somme des angles d'un triangle est égale à $180^\\circ$. <br>
    Donc, dans le triangle $ABC$, on a : <br>
    $\\widehat{A} + \\widehat{B} + \\widehat{C} = 180^\\circ$. <br>
    Or, comme le triangle est rectangle en $B$, on a $\\widehat{B} = 90^\\circ$. <br>
    Donc, $${alpha}^\\circ + 90^\\circ + \\widehat{C} = 180^\\circ$. <br>
    D'où $\\widehat{C} = 180^\\circ - 90^\\circ - ${alpha}^\\circ = 90^\\circ - ${alpha}^\\circ = ${miseEnEvidence(
      `${90 - alpha}`,
    )}^\\circ$.`

    this.canEnonce = figure + 'Calculer $\\widehat{C}$'
    this.canReponseACompleter = '$\\widehat{C} =\\ldots ^\\circ$ '
  }
}
