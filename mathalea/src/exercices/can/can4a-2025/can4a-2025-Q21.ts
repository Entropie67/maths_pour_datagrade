import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Somme de nombres relatifs'
export const interactifReady = true

export const uuid = 'f0cad'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N4Q21 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a = -randint(11, 25)
      b = randint(3, -a - 3)
    }
    this.question = `$${a} + ${b}$`
    this.correction = `$${a} + ${b}=${miseEnEvidence(a + b)}$`

    this.reponse = String(a + b)
    this.question += this.interactif ? ' $=$' : ''
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(-17, 3)
    else this.enonce()
  }
}
