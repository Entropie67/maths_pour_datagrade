import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Division euclidienne'
export const interactifReady = true

export const uuid = 'a343a'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q20 extends ExerciceCan {
  enonce(a?: number, b?: number) {
    let q: number
    let r: number
    if (a == null || b == null) {
      b = randint(7, 9)
      q = randint(3, 7)
      r = randint(1, b - 1)
      a = b * q + r
    }
    q = Math.floor(a / b)
    r = a - b * q
    this.reponse = r
    this.question = `Détermine le reste de la division euclidienne de $${a}$ par $${b}$.`
    this.correction = `$${a} = ${b}\\times${q}+${r}=${b * q}+${r}$, donc le reste est $${miseEnEvidence(texNombre(r, 0))}$.`

    if (this.interactif) {
      this.question += '<br>'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(20, 7)
    else this.enonce()
  }
}
