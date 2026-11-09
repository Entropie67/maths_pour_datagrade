import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Numération compliquée'
export const interactifReady = true

export const uuid = '9194d'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025CE2Q18 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      a = randint(2, 8)
      b = choice([10, 100])
      const nbDizainesOuCentaines = randint(a + 1, 9) + choice([10, 20, 30])
      c = nbDizainesOuCentaines * b + randint(1, b - 1)
    }
    this.reponse = c - a * b
    this.question = `Quel nombre j'obtiens si j'enlève $${a}$ ${b === 10 ? 'dizaines' : 'centaines'} au nombre $${texNombre(c, 0)}$ ?`
    this.correction = `$${texNombre(c)} - (${a} \\times ${b}) = ${texNombre(c)} - ${a * b} =${miseEnEvidence(texNombre(c - a * b))}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(8, 10, 283)
    else this.enonce()
  }
}
