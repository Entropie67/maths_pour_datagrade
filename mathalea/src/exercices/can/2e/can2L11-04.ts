import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Développer des égalités remarquables avec des racines carrées'
export const interactifReady = true

export const dateDePublication = '30/03/2023'

/**
 * utilisation des égalités remarquables pour développer
 * @author Gilles Mora

*/
export const uuid = '9883e'

export const refs = {
  'fr-fr': ['can2L11-04'],
  'fr-ch': [],
}
export default class DevelopperEgalitesRemarquablesRC extends ExerciceSimple {
  constructor() {
    super()
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.optionsDeComparaison = { texteSansCasse: true }
  }

  nouvelleVersion() {
    switch (
      this.quotaChoice('cas', [1, 2, 3, 4, 5, 6]) //, 2, 3, 4, 5, 6
    ) {
      case 1:
        {
          const inconnue = choice([2, 3, 5, 7])
          const a = randint(1, 9)
          this.question = ` Développer et réduire $(\\sqrt{${inconnue}}+${a})^2$.` // (x+a)²
          this.correction = `On utilise l'égalité remarquable $(a+b)^2=a^2+2ab+b^2$ avec $a=\\sqrt{${inconnue}}$ et $b=${a}$.<br>
$\\begin{aligned}
(\\sqrt{${inconnue}}+${a})^2&=(\\sqrt{${inconnue}})^2+2 \\times ${a} \\times \\sqrt{${inconnue}}+${a}^2\\\\
&=${inconnue}+${2 * a}\\sqrt{${inconnue}}+${a * a}\\\\
&=${miseEnEvidence(`${inconnue + a * a}+${2 * a}\\sqrt{${inconnue}}`)}
\\end{aligned}$`
          this.reponse = [
            `${inconnue + a * a}+${2 * a}\\sqrt${inconnue}`,
            `${2 * a}\\sqrt${inconnue}+${inconnue + a * a}`,
            `${2 * a}\\times\\sqrt${inconnue}+${inconnue + a * a}`,
            `${inconnue + a * a}+${2 * a}\\times\\sqrt${inconnue}`,
            `${inconnue + a * a}+\\sqrt${inconnue}\\times${2 * a}`,
          ]
        }
        break
      case 2:
        {
          const inconnue = choice([2, 3, 5, 7])
          const a = randint(1, 9)
          this.question = ` Développer et réduire $(\\sqrt{${inconnue}}-${a})^2$.` // (x-a)²
          this.correction = `On utilise l'égalité remarquable $(a-b)^2=a^2-2ab+b^2$ avec $a=\\sqrt{${inconnue}}$ et $b=${a}$.<br>
      $\\begin{aligned}
      (\\sqrt{${inconnue}}-${a})^2&=(\\sqrt{${inconnue}})^2-2 \\times ${a} \\times \\sqrt{${inconnue}}+${a}^2\\\\
      &=${inconnue}-${2 * a}\\sqrt{${inconnue}}+${a * a}\\\\
      &=${miseEnEvidence(`${inconnue + a * a}-${2 * a}\\sqrt{${inconnue}}`)}
      \\end{aligned}$`
          this.reponse = [
            `${inconnue + a * a}-${2 * a}\\sqrt${inconnue}`,
            `${inconnue + a * a}-${2 * a}\\times\\sqrt${inconnue}`,
            `${-2 * a}\\sqrt${inconnue}+${inconnue + a * a}`,
            `${-2 * a}\\times\\sqrt${inconnue}+${inconnue + a * a}`,
            `${inconnue + a * a}+${-2 * a}\\times\\sqrt${inconnue}`,
            `${inconnue + a * a}+\\sqrt${inconnue}\\times${-2 * a}`,
          ]
        }
        break
      case 3:
        {
          const inconnue = choice([2, 3, 5, 7])
          const a = randint(1, 9)
          this.question = `Développer et réduire $(\\sqrt{${inconnue}}-${a})(\\sqrt{${inconnue}}+${a})$.` // (x-a)(x+a)
          this.correction = `On utilise l'égalité remarquable $(a+b)(a-b)=a^2-b^2$ avec $a=\\sqrt{${inconnue}}$ et $b=${a}$.<br>
          $\\begin{aligned}
          (\\sqrt{${inconnue}}-${a})(\\sqrt${inconnue}+${a})&=(\\sqrt${inconnue})^2-${a}^2=${inconnue}-${a * a}\\\\
          &=${miseEnEvidence(`${inconnue - a * a}`)}
          \\end{aligned}$`
          this.reponse = [`${inconnue - a * a}`]
        }
        break
      case 4:
        {
          const inconnue = choice([2, 3])
          const a = randint(1, 5)
          this.question = `Développer et réduire $(2\\sqrt{${inconnue}}+${a})^2$.` // (2x+a)²
          this.correction = `On utilise l'égalité remarquable $(a+b)^2=a^2+2ab+b^2$ avec $a=2\\sqrt{${inconnue}}$ et $b=${a}$.<br>
      $\\begin{aligned}
      (2\\sqrt{${inconnue}}+${a})^2&=(2\\sqrt{${inconnue}})^2+2 \\times 2\\sqrt{${inconnue}} \\times ${a} + ${a}^2\\\\
      &=4\\times${inconnue}+${4 * a}\\sqrt{${inconnue}}+${a * a}\\\\
      &=${miseEnEvidence(`${4 * inconnue + a * a}+${4 * a}\\sqrt${inconnue}`)}
      \\end{aligned}$`
          this.reponse = [
            `${4 * inconnue + a * a}+${4 * a}\\sqrt${inconnue}`,
            `${4 * inconnue + a * a}+${4 * a}\\times\\sqrt${inconnue}`,
            `${4 * a}\\sqrt${inconnue}+${4 * inconnue + a * a}`,
            `${4 * a}\\times\\sqrt${inconnue}+${4 * inconnue + a * a}`,
          ]
        }
        break
      case 5:
        {
          const inconnue = choice([2, 3])
          const a = randint(1, 5)
          this.question = `Développer et réduire $(2\\sqrt{${inconnue}}-${a})^2$.` // (2x-a)²
          this.correction = `On utilise l'égalité remarquable $(a-b)^2=a^2-2ab+b^2$ avec $a=2\\sqrt{${inconnue}}$ et $b=${a}$.<br>
              $\\begin{aligned}
              (2\\sqrt{${inconnue}}-${a})^2&=(2\\sqrt{${inconnue}})^2-2 \\times 2\\sqrt{${inconnue}} \\times ${a} + ${a}^2\\\\
              &=4\\times${inconnue}-${4 * a}\\sqrt{${inconnue}}+${a * a}\\\\
              &=${miseEnEvidence(`${4 * inconnue + a * a}-${4 * a}\\sqrt{${inconnue}}`)}
              \\end{aligned}$`
          this.reponse = [
            `${4 * inconnue + a * a}-${4 * a}\\sqrt${inconnue}`,
            `${4 * inconnue + a * a}-${4 * a}\\times\\sqrt${inconnue}`,
            `-${4 * a}\\sqrt${inconnue}+${4 * inconnue + a * a}`,
            `-${4 * a}\\times\\sqrt${inconnue}+${4 * inconnue + a * a}`,
          ]
        }
        break
      case 6:
        {
          const inconnue = choice([2, 3, 5])
          const a = randint(1, 6)
          this.question = `Développer et réduire $(2\\sqrt{${inconnue}}-${a})(2\\sqrt{${inconnue}}+${a})$.` // (2x-a)(2x+a)
          this.correction = `On utilise l'égalité remarquable $(a+b)(a-b)=a^2-b^2$ avec $a=2\\sqrt{${inconnue}}$ et $b=${a}$.<br>
                $\\begin{aligned}
                (2\\sqrt{${inconnue}}-${a})(2\\sqrt{${inconnue}}+${a})&=(2\\sqrt{${inconnue}})^2-${a}^2\\\\
                &=4\\times${inconnue}-${a * a}\\\\
                &=${miseEnEvidence(`${4 * inconnue - a * a}`)}
                \\end{aligned}$`
          this.reponse = [`${4 * inconnue - a * a}`]
        }
        break
    }
  }
}
