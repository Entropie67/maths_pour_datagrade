import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer facilement avec la distributivité'
export const interactifReady = true

export const uuid = 'a343f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q21 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a = choice([101, 1001])
      const c = randint(1, 8)
      b = c * 10 + randint(1, 8, c)
    }
    this.reponse = a * b
    this.question = `$${texNombre(a, 0)} \\times ${b}$ `
    this.correction = `On décompose le calcul : <br>
    $\\begin{aligned}
    ${texNombre(a, 0)}\\times${b}&=${texNombre(a - 1, 0)}\\times${b}+1\\times${b}\\\\
    &=${texNombre((a - 1) * b, 0)}+${b}\\\\
    &=${miseEnEvidence(texNombre(this.reponse, 0))}
    \\end{aligned}$`

    if (this.interactif) {
      this.question += '$=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(101, 13)
    else this.enonce()
  }
}
