import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer une somme'
export const interactifReady = true

export const uuid = 'ebf31'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can2026CE2Q19 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      a = randint(101, 109)
      b = randint(11, 15) * 10
      c = randint(101, 109, a)
    }

    this.reponse = a + b + c

    // Décomposition
    const unites1 = a % 10
    const unites2 = c % 10
    const centaines1 = Math.floor(b / 100) * 100
    const dizaines = b % 100
    const sommeCentaines = 200 + centaines1
    const sommeDizaines = dizaines + unites1 + unites2

    this.question = `Calcule.<br>`

    this.correction = `$\\begin{aligned}
${a}+${b}+${c}&=(100+${unites1})+(${centaines1 > 0 ? centaines1 + '+' + dizaines : dizaines})+(100+${unites2})\\\\
&=100+100${centaines1 > 0 ? '+' + centaines1 : ''}+${dizaines}+${unites1}+${unites2}\\\\
&=${sommeCentaines}+${sommeDizaines}\\\\
&=${miseEnEvidence(texNombre(this.reponse, 0))}
\\end{aligned}$`

    this.canEnonce = 'Calcule.'
    this.canReponseACompleter = `$${a}+${b}+${c}=\\ldots$`

    if (this.interactif) {
      this.optionsChampTexte = { texteAvant: `$${a}+${b}+${c}=$` }
    } else {
      this.question += `$${a}+${b}+${c}=\\ldots$`
    }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(103, 120, 101)
    else this.enonce()
  }
}
