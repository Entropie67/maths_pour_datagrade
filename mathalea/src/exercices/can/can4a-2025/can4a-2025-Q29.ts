import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Multiplier astucieusement'
export const interactifReady = true

export const uuid = '3422z'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N4Q29 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      ;[a, c] = choice([
        [2.5, 4],
        [0.4, 25],
        [0.5, 20],
        [0.2, 50],
      ])
      b = randint(3, 9) / 10 + randint(1, 7) / 100
    }
    this.question = `$${texNombre(a, 1)}\\times ${texNombre(b, 2)}\\times ${texNombre(c, 0)}$`
    this.correction = `$\\begin{aligned}${texNombre(a, 1)}\\times ${texNombre(b, 2)}\\times ${texNombre(c, 0)}&=${texNombre(b, 2)}\\times ${texNombre(c, 0)}\\times ${texNombre(a, 1)}\\\\
    &=${texNombre(b, 2)}\\times 10\\\\
    &=${miseEnEvidence(texNombre(10 * b, 1))}
    \\end{aligned}$`

    this.reponse = (10 * b).toFixed(1)
    this.question += this.interactif ? '$=$' : ''
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2.5, 0.31, 4)
    else this.enonce()
  }
}
