import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Numération et ordre'
export const interactifReady = true

export const uuid = '76efb'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025CE2Q10 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      a = randint(4, 9)
      b = randint(2, a - 1)
      c = randint(0, b - 1)
    }
    const nombres = [
      a * 100 + b * 10 + c,
      a * 100 + c * 10 + b,
      b * 100 + a * 10 + c,
      b * 100 + c * 10 + a,
      c * 100 + a * 10 + b,
      c * 100 + b * 10 + a,
    ]
    this.reponse = Math.max(...nombres)
    const nombresOrd = [a, b, c].sort((x, y) => y - x)
    this.question = `Quel est le plus grand nombre que je peux former avec les chiffres : $${shuffle([a, b, c]).join(' ; ')}$ en ne les utilisant qu'une fois ?`
    this.correction = `Pour former le plus grand nombre de trois chiffres avec tous ces chiffres, il faut placer le chiffre le plus grand en premier, puis le deuxième plus grand, et enfin le plus petit.<br>
    Soit : $${miseEnEvidence(nombresOrd.join(''))}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(0, 1, 9)
    else this.enonce()
  }
}
