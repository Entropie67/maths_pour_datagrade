import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Somme facilitée'
export const interactifReady = true

export const uuid = 'cdff0'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025CE2Q20 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      a = choice([25, 75])
      c = 100 - a
      b = choice([10, 20, 30, 40, 50, 60, 70, 80, 90])
      ;[a, c] = shuffle([a, c])
    }
    this.reponse = a + b + c
    this.question = 'Calcule : '
    this.correction = `$${a} + ${b} + ${c} = (${a} +${c}) + ${b} = 100 + ${b} = ${miseEnEvidence(a + b + c)}$`

    this.question += `$${a} + ${b} + ${c}$`
    if (this.interactif) {
      this.question += ' $ = $'
    }
    this.canEnonce = 'Calcule.'
    this.canReponseACompleter = `$${a} + ${b} + ${c} = \\ldots$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(75, 30, 25)
    else this.enonce()
  }
}
