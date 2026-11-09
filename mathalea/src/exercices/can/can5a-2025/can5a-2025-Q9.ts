import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Dix pour cent'
export const interactifReady = true

export const uuid = 'a343o'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q9 extends ExerciceCan {
  enonce(b?: number) {
    const a = 10
    if (b == null) {
      b =
        this.quotaRandint('b1', 2, 9) * 10 +
        this.quotaRandint('b2', 1, 9) +
        choice([0, 0, randint(1, 9)]) * 100
    }
    this.reponse = (a * b) / 100
    this.question = `$${a}\\,\\%$ de $${b}$`
    this.correction = `$${a}\\,\\%$ de $${b}$, c'est $\\dfrac{${a}}{100} \\times ${texNombre(b, 0)} = \\dfrac{${a}\\times ${texNombre(b, 0)}}{100}=  \\dfrac{${texNombre(a * b, 0)}}{100}=${miseEnEvidence(texNombre((a * b) / 100, 2))}$.`

    if (this.interactif) {
      this.question += ' est égal à '
    }
    this.optionsChampTexte = { texteApres: '.' }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(28)
    else this.enonce()
  }
}
