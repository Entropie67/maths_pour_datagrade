import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'

import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre =
  'Déterminer le terme manquant dans une égalité de fractions'
export const interactifReady = true

export const uuid = '81r9y'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can52026Q14 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(a?: number, b?: number, c?: number) {
    let question = 'num'
    let coeff = 5

    if (a == null || b == null || c == null) {
      question = choice(['num', 'den'])
      a = randint(2, 6)
      b = choice([a + 1, a - 1])
      coeff = randint(2, 7)
      c = question === 'num' ? b * coeff : a * coeff
    }

    this.reponse = question === 'num' ? (c * a) / b : (c * b) / a
    this.question = `$\\dfrac{${a}}{${b}}=${question === 'num' ? `\\dfrac{?}{${c}}` : `\\dfrac{${c}}{?}`}$`
    this.correction =
      question === 'num'
        ? `On remarque que $${c}=${coeff}\\times ${b}$, donc $?=${coeff}\\times ${a}=${coeff * a}$.<br>`
        : `On remarque que $${c}=${coeff}\\times ${a}$, donc $?=${coeff}\\times ${b}=${coeff * b}$.<br>`

    this.correction += `Ainsi, $\\dfrac{${a}}{${b}}=${question === 'num' ? `\\dfrac{${miseEnEvidence(coeff * a)}}{${c}}` : `\\dfrac{${c}}{${miseEnEvidence(coeff * b)}}`}$.`

    this.canReponseACompleter = '$\\text{? }=\\ldots$'

    if (this.interactif) {
      this.question += '<br><br>$\\text{? }=$' // Double saut de ligne volontaire
    } else {
      this.question += '<br>$\\text{? }=\\ldots$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3, 4, 20)
    else this.enonce()
  }
}
