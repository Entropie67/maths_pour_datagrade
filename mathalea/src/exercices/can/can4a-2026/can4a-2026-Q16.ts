import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Compléter une égalité du type $a\\times ?-b=c$'
export const interactifReady = true

export const uuid = 'se7mc'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20264emeQ16 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(a?: number, b?: number, x?: number) {
    if (a == null || b == null || x == null) {
      a = randint(2, 3)
      b = 1
      x = randint(2, 10) * 10 // Multiple de 10
    }

    const c = a * x - b

    this.question = `$${a}\\times ?-${b}=${c}$`

    this.correction = `$\\begin{aligned}
    ${a}\\times ?-${b}&=${c}\\\\
    ${a}\\times ?&=${c}+${b}\\\\
    ${a}\\times ?&=${c + b}\\\\
    ?&=\\dfrac{${c + b}}{${a}}\\\\
    ?&=${miseEnEvidence(x)}
    \\end{aligned}$`

    this.canReponseACompleter = '$?=\\ldots$'
    this.reponse = x

    if (this.interactif) {
      this.question += '<br>$?=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2, 1, 50)
    else this.enonce()
  }
}
