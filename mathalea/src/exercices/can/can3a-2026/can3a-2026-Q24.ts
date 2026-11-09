import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Résoudre une équation'
export const interactifReady = true

export const uuid = 's68jh'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q24 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecX
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '<br> $x=$' }
  }

  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      // Version aléatoire : ax+b = (a-1)x+c avec b ≠ c et a > 0
      a = randint(2, 5)

      // Générer b et c différents
      b = randint(-9, 9, [0])
      do {
        c = randint(-9, 9, [0, b])
      } while (b === c)
    }

    // Résolution : ax + b = (a-1)x + c
    // ax - (a-1)x = c - b
    // x = c - b
    const reponse = c - b

    this.reponse = reponse

    this.question = `Résous $${reduireAxPlusB(a, b)}=${reduireAxPlusB(a - 1, c)}$.`

    this.correction = `On procède par étapes successives.<br>
  On commence par regrouper les termes en $x$ dans le membre de gauche :<br>
  $\\begin{aligned}
  ${reduireAxPlusB(a, b)}&=${reduireAxPlusB(a - 1, c)}\\\\
  ${a}x${ecritureAlgebriqueSauf1(-a + 1)}x${ecritureAlgebrique(b)}&=${c}\\\\
  ${rienSi1(a - (a - 1))}x${ecritureAlgebrique(b)}&=${c}\\\\
  x&=${c}${ecritureAlgebrique(-b)}\\\\
  x&=${miseEnEvidence(reponse)}
  \\end{aligned}$<br>
  La solution de l'équation est : $${miseEnEvidence(reponse)}$.`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2, -2, 3)
    else this.enonce()
  }
}
