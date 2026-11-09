import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint, texteParPosition } from '../../../lib/2d/textes'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { context } from '../../../modules/context'
import ExerciceSimple from '../../ExerciceSimple'

import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { stringNombre } from '../../../lib/outils/texNombre'

import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'

export const titre =
  'Calculer une longueur dans un triangle à partir de son aire'
export const interactifReady = true

export const dateDePublication = '09/12/2025'
/**
 * @author Gilles Mora

 * 
*/
export const uuid = 'e401a'

export const refs = {
  'fr-fr': ['can4G3-07', '2G11-flash4'],
  'fr-ch': [],
}
export default class QuestionsAiresEtPerimetres6 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: 'm' }
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 2, 10) //
    const b = this.quotaRandint('bMultiplicateur', 1, 5) * a
    const A = pointAbstrait(0, 0, 'A', 'below')
    const B = pointAbstrait(8, 0, 'B', 'below')
    const C = pointAbstrait(6, 3.46, 'C')
    const objets = []
    objets.push(
      segment(A, B),
      segment(B, C),
      segment(C, A),
      labelPoint(A, B, C),
      tracePoint(A, B, C),
      codageAngleDroit(A, C, B),
    )
    objets.push(
      texteParPosition(
        `${stringNombre(a)} m`,
        milieu(B, C).x + 0.5,
        milieu(B, C).y + 0.5,
      ),
    )
    this.question = ` L'aire du triangle $ABC$ est $${b}\\text{ m}^2$. <br>
        Donner la longueur $AC$.<br>`
    this.question += mathalea2d(
      {
        xmin: -1,
        ymin: -1,
        xmax: 9,
        ymax: 4.5,
        pixelsParCm: 20,
        mainlevee: true,
        amplitude: 0.5,
        scale: 0.7,
        center: !context.isHtml,
      },
      objets,
    )
    this.correction = ` L'aire de ce triangle rectangle est donnée par : $\\dfrac{BC\\times AC}{2}$.<br>
          On cherche $AC$ telle que $\\dfrac{${a}\\times AC}{2}=${b}$. <br>
          $AC=\\dfrac{2\\times ${b}}{${a}}=${miseEnEvidence(new FractionEtendue(2 * b, a).simplifie().texFraction)}\\text{ m}$.
      <br>`
    this.reponse = (2 * b) / a

    this.canReponseACompleter = '$\\ldots\\text{ m}$'
    this.listeCanReponsesACompleter.push(this.canReponseACompleter)
  }
}
