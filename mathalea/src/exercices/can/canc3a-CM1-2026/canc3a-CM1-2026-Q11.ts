import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Compléter une égalité'
export const interactifReady = true

export const uuid = '450b6'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CM1Q11 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      do {
        a = randint(3, 5)
        b = randint(6, 7)
        c = b - randint(2, 4)
      } while (c === a)
    }
    const result = a + b - c

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.formatInteractif = 'fillInTheBlank'
    this.consigne = 'Complète.'

    this.reponse = {
      champ1: { value: result },
    }

    this.question = `${a}+ ${b} = %{champ1} +${c}`

    this.correction = `$\\begin{aligned}
    ${a}+ ${b} &= \\ldots + ${c}\\\\
   ${a + b} &=${miseEnEvidence(texNombre(result, 0))}+ ${c}
    \\end{aligned}$`

    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$${a}+ ${b} = \\ldots +${c}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(4, 6, 8)
    else this.enonce()
  }
}
