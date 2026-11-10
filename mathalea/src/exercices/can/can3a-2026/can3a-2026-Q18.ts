import { fromOptions, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Développer et réduire une expression'
export const interactifReady = true

export const uuid = 'x7ftc'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q18 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecX
  }

  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      // Version aléatoire avec valeurs négatives
      a = randint(-9, -2)
      b = randint(-9, -2, [a])
    }

    // Expression : a(x+b)
    const expression = `${a}(x${ecritureAlgebrique(b)})`

    this.question = `Développe et réduis $${expression}$.<br>`

    this.correction = `$\\begin{aligned}
${expression}&=${a}\\times x${ecritureAlgebrique(a)}\\times(${b})\\\\
&=${a}x${ecritureAlgebrique(a * b)}\\\\
&=${miseEnEvidence(reduireAxPlusB(a, a * b))}
\\end{aligned}$`

    this.reponse = {
      reponse: {
        value: reduireAxPlusB(a, a * b),
        compare: seq([fromOptions({ expressionsForcementReduites: true })]),
      },
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(-2, -3)
    else this.enonce()
  }
}
