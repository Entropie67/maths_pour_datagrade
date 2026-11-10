import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Somme de deux nombres décimaux'
export const interactifReady = true

export const uuid = 'a343h'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q2 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      a =
        this.quotaRandint('a1', 2, 5) * 0.1 +
        this.quotaRandint('a2', 1, 9) * 0.01
      b = this.quotaRandint('b', 1, 4) * 0.1
    }
    this.reponse = (a + b).toFixed(2)
    this.question = `$${texNombre(a, 2)} + ${texNombre(b, 2)}$ `
    this.correction = `$${texNombre(a, 2)} + ${texNombre(b, 2)}=${miseEnEvidence(texNombre(a + b, 2))}$`

    if (this.interactif) {
      this.question += '$=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(0.24, 0.4)
    else this.enonce()
  }
}
