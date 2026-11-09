import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Majoration de fraction'
export const interactifReady = true

export const uuid = 'b343g'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q23 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      b = randint(4, 8)
      a = randint(2, 6) * b + randint(1, b - 1)
    }
    const ent = Math.floor(a / b)
    const f = a % b
    this.reponse = ent + 1
    this.question = `Le plus petit entier supérieur à $\\dfrac{${a}}{${b}}$`
    this.correction = `$\\dfrac{${a}}{${b}}=\\dfrac{${ent * b}}{${b}}+\\dfrac{${f}}{${b}}=${ent}+\\dfrac{${f}}{${b}}$<br>
    Étant donné que $\\dfrac{${f}}{${b}}<1$, le plus petit entier supérieur à $\\dfrac{${a}}{${b}}$ est $${ent}+1=${miseEnEvidence(ent + 1)}$.`

    if (this.interactif) {
      this.question += ' est '
    }
    this.optionsChampTexte = { texteApres: '.' }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(17, 5)
    else this.enonce()
  }
}
