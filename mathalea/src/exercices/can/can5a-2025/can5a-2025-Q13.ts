import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Produit de $3$ facteurs'
export const interactifReady = true

export const uuid = 'a343s'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q13 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      ;[a, c] = choice([
        [2, 5],
        [2, 50],
        [4, 25],
        [5, 20],
        [4, 250],
        [5, 200],
        [8, 125],
        [2, 500],
      ])
      b = randint(2, 9) * 10 + randint(1, 9)
    }
    this.reponse = a * b * c
    this.question = `$${a}\\times ${b}\\times ${c}$`
    this.correction = `$\\begin{aligned}${a}\\times ${b}\\times ${c} &= (${a}\\times ${c})\\times ${b}\\\\
    &= ${texNombre(a * c, 0)}\\times ${b}\\\\
    &= ${miseEnEvidence(texNombre(a * b * c, 0))}
    \\end{aligned}$`

    if (this.interactif) {
      this.question += ' $=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2, 97, 5)
    else this.enonce()
  }
}
