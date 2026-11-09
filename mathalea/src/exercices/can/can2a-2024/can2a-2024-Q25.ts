/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/viewcan.2024.2e.test.ts ⚠️
 */

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Développer avec une identité remarquable'
export const interactifReady = true

export const uuid = '7e2a2'
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

    this.optionsDeComparaison = { developpementEgal: true }
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 'x^2-8x+16'
      this.question = ' Développer $(x-4)^2$.<br>' // (x+a)²
      this.correction = `On utilise l'égalité remarquable $(a-b)^2=a^2-2ab+b^2$ avec $a=x$ et $b=4$.<br>
      $\\begin{aligned}
      (x-4)^2&=x^2-2 \\times x \\times 4+4^2\\\\
      &=${miseEnEvidence(this.reponse)}\\end{aligned}$`
    } else {
      const a = randint(1, 9)
      switch (choice([1, 2])) {
        case 1:
          this.reponse = `x^2+${2 * a}x+${a * a}`
          this.question = ` Développer $(x+${a})^2$.` // (x+a)²
          this.correction = `On utilise l'égalité remarquable $(a+b)^2=a^2+2ab+b^2$ avec $a=x$ et $b=${a}$.<br>
      $\\begin{aligned}
      (x+${a})^2&=x^2+2 \\times ${a} \\times x+${a}^2\\\\
      &=${miseEnEvidence(this.reponse)}
      \\end{aligned}$`
          break
        case 2:
          this.reponse = `x^2-${2 * a}x+${a * a}`
          this.question = ` Développer $(x-${a})^2$.` // (x-a)²
          this.correction = `On utilise l'égalité remarquable $(a-b)^2=a^2-2ab+b^2$ avec $a=x$ et $b=${a}$.<br>
      $\\begin{aligned}
      (x-${a})^2&=x^2-2 \\times ${a} \\times x+${a}^2\\\\
      &=${miseEnEvidence(this.reponse)}
      \\end{aligned}$`
          break
      }
    }
  }
}
