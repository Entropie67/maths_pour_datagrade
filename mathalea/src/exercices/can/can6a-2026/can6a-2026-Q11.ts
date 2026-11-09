import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Compléter une égalité'
export const interactifReady = true

export const uuid = 'pb769'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20266Q11 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      b = choice([5, 50, 25])
      c = b === 5 ? 10 : b === 50 ? 100 : 50
      a = randint(12, 18) * (c / b)
    }
    const result = (a * b) / c

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.formatInteractif = 'fillInTheBlank'
    this.consigne = 'Complète.'

    this.reponse = {
      champ1: { value: result },
    }

    this.question = `${a}\\times ${b} = %{champ1} \\times ${c}`

    const facteur = c / b
    this.correction = `$\\begin{aligned}
    ${a}\\times ${b} &= \\ldots \\times ${c}\\\\
    &= \\underbrace{\\ldots \\times ${facteur}}_{${a}}\\times ${b}\\\\
    &=${miseEnEvidence(texNombre(result, 0))}\\times ${facteur}\\times ${b}
    \\end{aligned}$`

    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `$${a}\\times ${b} = \\ldots \\times ${c}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(12, 5, 10)
    else this.enonce()
  }
}
