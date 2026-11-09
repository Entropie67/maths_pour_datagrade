import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Somme de nombres relatifs'
export const interactifReady = true

export const uuid = '3422g'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N4Q22 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      b = randint(8, 12)
      a = randint(11, 15) * 3 - 2 * b
    }
    this.question = `$${a}$ ; $${b}$ ; $${b}$<br>La moyenne de ces trois nombres est : `
    this.correction = `On calcule la moyenne en divisant la somme des $3$ nombres par $3$ :<br>$\\dfrac{${a}+${b}+${b}}{3}=${miseEnEvidence((a + b * 2) / 3)}$`

    this.reponse = Math.round((a + b * 2) / 3)
    this.question += this.interactif ? '' : ' $\\ldots$'
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(10, 13)
    else this.enonce()
  }
}
