import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'e4c7d'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['10LCFA5C-13', '10LSFA5C-13', '11CTFA4C-13', '11LCFA4C-13', '11LSFA4C-13', 'PRQAL05B-8'],
}
export const interactifReady = true

export const titre = 'Résoudre une équation du premier degré'
export const dateDePublication = '06/06/2026'

/**
 * DNB Amérique du Nord juin 2026 - Question 4
 * @author Rémi Angot
 */
export default class AutoQ4ANbrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: ' $x=$' }
  }

  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      a = choice([2, 3, 4, 5, 6])
      const solution = randint(3, 9)
      b = a * randint(1, 2)
      c = a * solution - b
    }
    // a x − b = c
    const solution = (c + b) / a

    this.reponse = solution
    this.question = `Résoudre l'équation $${a}x-${b}=${c}$.`
    if (this.interactif) this.question += '<br>'

    this.correction = `$\\begin{aligned}
${a}x-${b}&=${c}\\\\
${a}x&=${c}+${b}\\\\
${a}x&=${c + b}\\\\
x&=\\dfrac{${c + b}}{${a}}\\\\
x&=${miseEnEvidence(`${texNombre(solution)}`)}
\\end{aligned}$`
  }

  nouvelleVersion() {
    // 5x − 15 = 20 → x = 7
    if (this.canOfficielle) {
      this.enonce(5, 15, 20)
    } else {
      this.enonce()
    }
  }
}
