import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureParentheseSiNegatif,
  reduirePolynomeDegre3,
} from '../../../lib/outils/ecritures'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un discriminant'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '26/10/2021'

/**
 * @author Jean-claude Lhote
 */
export const uuid = 'd0042'

export const refs = {
  'fr-fr': ['can1SD21-01'],
  'fr-ch': [],
}
export default class Discriminant extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 1, 5) * choice([-1, 1, 1, 1])
    const b = this.quotaRandint('b', -5, 5)
    const c = this.quotaRandint('c', -5, 5)
    const d = b * b - 4 * a * c
    this.question = `Calculer le discriminant de cette expression : $${reduirePolynomeDegre3(0, a, b, c)}$.<br>
    $\\Delta=$`
    this.correction = `$\\Delta =b^2-4ac=${ecritureParentheseSiNegatif(b)}^2 - 4 \\times ${ecritureParentheseSiNegatif(a)} \\times ${ecritureParentheseSiNegatif(c)}=${miseEnEvidence(d)}$`
    this.reponse = d
    this.canEnonce = `Calculer le discriminant de cette expression : $${reduirePolynomeDegre3(0, a, b, c)}$.`
    this.canReponseACompleter = '$\\Delta=\\ldots$'
  }
}
