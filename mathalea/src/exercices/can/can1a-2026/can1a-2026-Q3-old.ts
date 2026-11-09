import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Développer et réduire un produit'
export const interactifReady = true

export const uuid = 'r30r1'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q3 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number, d?: number) {
    if (a == null || b == null || c == null || d == null) {
      a = 1
      b = randint(-9, 9, 0)
      c = randint(2, 5)
      d = randint(-5, 5, [0, b])
    }

    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.reponse = {
      reponse: {
        value: reduirePolynomeDegre3(0, a * c, b * c + a * d, b * d, 'x'),
      },
    }
    this.question = `Forme développée et réduite de $(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})$`
    this.correction = `$\\begin{aligned}
      (${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})&=${rienSi1(a * c)}x^2${ecritureAlgebriqueSauf1(a * d)}x${ecritureAlgebriqueSauf1(b * c)}x${ecritureAlgebrique(b * d)}\\\\
      &=${miseEnEvidence(reduirePolynomeDegre3(0, a * c, b * c + a * d, b * d))}
      \\end{aligned}$`
    this.correction += `<br>Le terme en $x^2$ vient de $${rienSi1(a)}x\\times ${rienSi1(c)}x=${rienSi1(a * c)}x^2$.`
    this.correction += `<br>Le terme en $x$ vient de la somme de $${rienSi1(a)}x \\times ${ecritureParentheseSiNegatif(d)}$ et de $${b} \\times ${rienSi1(c)}x$.`
    this.correction += `<br>Le terme constant vient de $${b}\\times ${ecritureParentheseSiNegatif(d)}=${b * d}$.`

    if (this.interactif) {
      this.question += `<br>$(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})=$`
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(1, 4, 2, -1)
    else this.enonce()
  }
}
