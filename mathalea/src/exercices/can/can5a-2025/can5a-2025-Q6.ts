import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Priorité des opérations'
export const interactifReady = true

export const uuid = 'a343l'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q6 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      a = this.quotaRandint('a', 2, 4)
      b = randint(2, 9 - a)
      c = this.quotaRandint('c', 2, 5)
    }
    this.reponse = a + b * c
    this.question = `$${a} + ${b}\\times ${c}$`
    this.correction = `La multiplication est prioritaire sur l'addition, donc :<br> $${a} + ${b}\\times ${c}=${a} + ${b * c} = ${miseEnEvidence(texNombre(a + b * c, 0))}$.`

    if (this.interactif) {
      this.question += ' $=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2, 7, 3)
    else this.enonce()
  }
}
