import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
import { sp } from '../../../lib/outils/outilString'

export const titre = 'Combien de fois ?'
export const interactifReady = true

export const uuid = 'e6bf9'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025CE2Q8 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a = choice([4, 6, 7, 8])
      b = randint(4, 9) * a
    }
    this.reponse = Math.round(b / a)
    this.question = `Dans $${b}$, combien de fois $${a}$${sp()}?`
    this.correction = `$${b}=${miseEnEvidence(Math.round(b / a))}\\times ${a}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(6, 36)
    else this.enonce()
  }
}
