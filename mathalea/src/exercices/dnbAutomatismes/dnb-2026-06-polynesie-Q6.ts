import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'dbc01'
export const refs = {
  'fr-fr': ['3AutoL03'],
  'fr-ch': ['10LCFA4E-9', '10LSFA4E-9', 'PRQAL03C-6'],
}
export const interactifReady = true
export const titre =
  'Développer et réduire une expression (simple distributivité)'
export const dateDePublication = '12/08/2026'

/**
 * DNB Polynésie juin 2026 - Question 6
 * @author Jean-Claude Lhote
 */
export default class AutoQ6PolynesieBrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.optionsDeComparaison = { expressionsForcementReduites: true }
  }

  enonce(a?: number, b?: number, c?: number, y?: string) {
    if (a == null || b == null || c == null || y == null) {
      a = randint(2, 6) * randint(-1, 1, 0)
      b = randint(2, 5, Math.abs(a))
      c = randint(1, 6, [Math.abs(a), b]) * randint(-1, 1, 0)
      y = ['a', 'b', 'c', 'x', 'y', 'z'][randint(0, 5)]
    }

    this.question = `Développer et réduire l'expression $${a}(${b}${y}${ecritureAlgebrique(c)})$.`
    this.reponse = `${a * b}${y}${ecritureAlgebrique(a * c)}`
    this.correction = `$\\begin{aligned}${a}(${b}${y}${ecritureAlgebrique(c)})&=${a}\\times ${b}${y}${ecritureAlgebrique(a)}\\times ${ecritureParentheseSiNegatif(c)}\\\\
    &=${miseEnEvidence(`${a * b}${y}${ecritureAlgebrique(a * c)}`)}
    \\end{aligned}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) {
      this.enonce(4, 3, -1, 'y')
    } else {
      this.enonce()
    }
  }
}
