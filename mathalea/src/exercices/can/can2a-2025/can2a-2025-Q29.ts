import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { reduirePolynomeDegre3 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Développer avec une identité remarquable'
export const interactifReady = true

export const uuid = 'e6edd'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
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
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.optionsDeComparaison = { developpementEgal: true }
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.question = 'Développer $(2-3x)^2$'
      if (this.interactif) {
        this.question += '<br>$(2-3x)^2=$'
      }
      this.correction =
        "On utilise l'égalité remarquable $(a-b)^2=a^2-2ab+b^2$ avec $a=2$ et $b=3x$.<br>"
      this.correction += `$\\begin{aligned}
      (2-3x)^2&=2^2-2\\times 2\\times 3x+ (3x)^2\\\\
       &=${miseEnEvidence('9x^2-12x+4')}
       \\end{aligned}$`

      this.reponse = reduirePolynomeDegre3(0, 9, -12, 4, 'x')
    } else {
      const a = randint(2, 5)
      const b = randint(2, 6, a)

      this.question = `Développer  $(${a}-${b}x)^2$.<br>`
      if (this.interactif) {
        this.question += `<br>$(${a}-${b}x)^2=$`
      }
      this.correction = `On utilise l'égalité remarquable $(a-b)^2=a^2-2ab+b^2$ avec $a=${a}$ et $b=${b}x$.<br>`
      this.correction += `$\\begin{aligned}
       (${a}-${b}x)^2&=${a}^2-2\\times ${a}\\times ${b}x+ (${b}x)^2\\\\
       &=${miseEnEvidence(reduirePolynomeDegre3(0, b ** 2, -2 * a * b, a ** 2))}
       \\end{aligned}$`

      this.reponse = reduirePolynomeDegre3(0, b ** 2, -2 * a * b, a ** 2, 'x')
    }
  }
}
