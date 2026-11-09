import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Multiplication par $100$ de nombres décimaux'
export const interactifReady = true

export const uuid = 'a343n'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q8 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a =
        this.quotaRandint('a1', 2, 9) +
        this.quotaRandint('a2', 1, 9) / 10 +
        choice([0, 0, randint(1, 9)]) / 1000
      b = this.quotaChoice('b', [100, 1000])
    }
    this.reponse = (a * b).toFixed(1)
    this.question = `$${texNombre(a, 3)}\\times ${texNombre(b, 0)}$`
    this.correction = `Le nombre d'unités est rendu ${b === 100 ? 'cent fois' : 'mille fois'} plus grand, donc :<br>
    $${texNombre(a, 4)}\\times ${texNombre(b, 0)} = ${miseEnEvidence(texNombre(a * b, 2))}$`

    if (this.interactif) {
      this.question += ' $=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3.4, 100)
    else this.enonce()
  }
}
