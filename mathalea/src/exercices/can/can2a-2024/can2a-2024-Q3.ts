/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/viewcan.2024.2e.test.ts ⚠️
 */

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
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Développer une expression'
export const interactifReady = true

export const uuid = 'e5de9'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.question = 'Forme développée réduite de  $(x+7)(x+4)$<br>'
      this.correction = `$\\begin{aligned}
      (x+7)(x+4)&=x^2+7x+4x+28\\\\
      &=${miseEnEvidence('x^2+11x+28')}
      \\end{aligned}$`
      this.correction += '<br>Le terme en $x^2$ vient de $x\\times x=x^2$.'
      this.correction +=
        '<br>Le terme en $x$ vient de la somme de $7 \\times x$ et de $4 \\times x$.'
      this.correction += '<br>Le terme constant vient de $7\\times 4=28$.'
      this.reponse = {
        reponse: { value: reduirePolynomeDegre3(0, 1, 11, 28, 'x') },
      }
    } else {
      const a = randint(1, 2)
      const b = randint(-3, 3, 0)
      const c = randint(1, 2)
      const d = randint(-5, 5, [0, b])
      this.question = `Développer et réduire l'expression $(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})$.<br>`
      this.correction = `$\\begin{aligned}
      (${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})&=${rienSi1(a * c)}x^2${ecritureAlgebriqueSauf1(a * d)}x${ecritureAlgebriqueSauf1(b * c)}x${ecritureAlgebrique(b * d)}\\\\
      &=${miseEnEvidence(reduirePolynomeDegre3(0, a * c, b * c + a * d, b * d))}
      \\end{aligned}$`
      this.correction += `<br>Le terme en $x^2$ vient de $${rienSi1(a)}x\\times ${ecritureParentheseSiNegatif(c)}x=${rienSi1(a * c)}x^2$.`
      this.correction += `<br>Le terme en $x$ vient de la somme de $${rienSi1(a)}x \\times ${ecritureParentheseSiNegatif(d)}$ et de $${b} \\times ${ecritureParentheseSiNegatif(c)}x$.`
      this.correction += `<br>Le terme constant vient de $${b}\\times ${ecritureParentheseSiNegatif(d)}= ${b * d}$.`
      this.reponse = {
        reponse: {
          value: reduirePolynomeDegre3(0, a * c, b * c + a * d, b * d, 'x'),
        },
      }
    }
  }
}
