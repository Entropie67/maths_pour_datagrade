import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Numération simple'
export const interactifReady = true

export const uuid = '0473f'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['PR-9'],
}

const classes = {
  100: 'centaines',
  1000: 'milliers',
  10: 'dizaines',
}
/**
 * @author Jean-claude Lhote

*/
export default class Can2025CE2Q7 extends ExerciceCan {
  enonce(a?: number, b?: 1000 | 100 | 10, c?: number) {
    if (a == null || b == null || c == null) {
      a = randint(2, 7)
      b = choice([100, 1000, 10]) as 100 | 1000 | 10
      c =
        b === 100
          ? randint(1, 9 - a) * 100 + randint(1, 7) * 10 + randint(1, 7)
          : b === 1000
            ? randint(1, 9 - a) * 1000 +
              randint(1, 7) * 100 +
              randint(1, 7) * 10 +
              randint(1, 7)
            : randint(1, 9 - a) * 10 + randint(1, 7) * 100 + randint(1, 7)
    }
    this.reponse = c + b * a
    this.question = `Si j'ajoute $${a}$ ${classes[b]} à $${texNombre(c, 0)}$, combien est-ce que j'obtiens ?`
    this.correction = `J'obtiens : $${texNombre(c, 0)}+${texNombre(a * b, 0)}=${miseEnEvidence(texNombre(c + b * a))}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3, 100, 471)
    else this.enonce()
  }
}
