import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Égalité de fractions'
export const interactifReady = true

export const uuid = 'a3y3b'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q26 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    let question = 'num'
    let coeff = 4
    if (a == null || b == null || c == null) {
      question = choice(['num', 'den'])
      a = randint(2, 6)
      b = randint(2, 7, [a, 2 * a, 3 * a])
      coeff = randint(2, 7)
      c = question === 'num' ? b * coeff : a * coeff
    }
    this.reponse = question === 'num' ? (c * a) / b : (c * b) / a
    this.question = `$\\dfrac{${a}}{${b}}=${question === 'num' ? `\\dfrac{?}{${c}}$` : `\\dfrac{${c}}{?}$`}`
    this.correction =
      question === 'num'
        ? `On remarque que $${c}=${coeff}\\times ${b}$, donc $?=${coeff}\\times ${a}=${coeff * a}$.<br>`
        : `On remarque que $${c}=${coeff}\\times ${a}$, donc $?=${coeff}\\times ${b}=${coeff * b}$.<br>`

    this.correction += `Ainsi, $\\dfrac{${a}}{${b}}=${question === 'num' ? `\\dfrac{${miseEnEvidence(coeff * a)}}{${c}}$` : `\\dfrac{${c}}{${miseEnEvidence(coeff * b)}}$`}`

    this.canReponseACompleter = '$\\text{? }=\\ldots$'
    if (this.interactif) {
      this.question += '<br>$\\text{? }=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3, 5, 20)
    else this.enonce()
  }
}
