/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/viewcan.2024.2e.test.ts ⚠️
 */

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Factoriser avec une identité remarquable'
export const interactifReady = true

export const uuid = '2f071'
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
      this.reponse = '(x-5)(x+5)'
      this.question = ' Factoriser  $x^2-25$.<br>'
      this.correction = `On utilise l'égalité remarquable $a^2-b^2=(a+b)(a-b)$ avec $a=x$ et $b=5$.<br>
    $\\begin{aligned}x^2-25&=x^2-5^2\\\\
    &=${miseEnEvidence('(x-5)(x+5)')}\\end{aligned}$`
    } else {
      const a = randint(1, 10)
      this.reponse = `(x-${a})(x+${a})`
      this.question = ` Factoriser  $x^2-${a * a}$.<br>`
      this.correction = `On utilise l'égalité remarquable $a^2-b^2=(a+b)(a-b)$ avec $a=x$ et $b=${a}$.<br>
      $\\begin{aligned}x^2-${a * a}&=x^2-${a}^2\\\\
      &=${miseEnEvidence(`(x-${a})(x+${a})`)}\\end{aligned}$`
    }
  }
}
