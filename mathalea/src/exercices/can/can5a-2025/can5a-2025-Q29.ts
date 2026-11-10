import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer un produit astucieusement'
export const interactifReady = true

export const uuid = 'a3w3b'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q29 extends ExerciceCan {
  enonce(n?: number, a?: number, b?: number, c?: number) {
    if (n == null || a == null || b == null || c == null) {
      n = randint(3, 6)
      a = randint(3, 6)
      b = randint(3, 6)
      c = randint(5, 9)
    }
    this.reponse = 0
    this.question = `$(${n}\\times${a}+${b})\\times(${c}-${c})$`
    this.correction = `Étant donné que $${c}-${c}=0$, le résultat est $${miseEnEvidence(0)}$ quelle que soit la valeur du premier facteur.`

    if (this.interactif) this.question += ' $=$'
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(5, 3, 1, 7)
    else this.enonce()
  }
}
