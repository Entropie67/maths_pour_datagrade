import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Compléter une égalité'
export const interactifReady = true

export const uuid = '257d0'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CM2Q11 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      a = randint(3, 5)
      b = randint(4, 7)
      c = a * b - randint(2, 5)
    }
    const result = a * b - c

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.formatInteractif = 'fillInTheBlank'
    this.consigne = 'Complète.'

    this.reponse = {
      champ1: { value: result },
    }

    this.question = `${a}\\times ${b} = %{champ1} +${c}`

    this.correction = `$\\begin{aligned}
    ${a}\\times ${b} &= \\ldots + ${c}\\\\
   ${a * b} &=${miseEnEvidence(texNombre(result, 0))}+ ${c}
    \\end{aligned}$`

    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$${a}\\times ${b} = \\ldots + ${c}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3, 5, 12)
    else this.enonce()
  }
}
