import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureParentheseSiNegatif,
  reduirePolynomeDegre3,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un discriminant'
export const interactifReady = true

export const uuid = '17868'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class DeltaSecondDegre extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    let a: number
    let b: number
    let c: number
    if (this.canOfficielle) {
      this.reponse = -7
      a = 2
      b = -1
      c = 1
    } else {
      a = randint(1, 2)
      b = randint(-6, 6, 0)
      c = randint(-2, 2, 0)

      this.reponse = b ** 2 - 4 * a * c
    }
    this.question = `Le discriminant du trinôme $${reduirePolynomeDegre3(0, a, b, c)}$ est `

    this.correction = ` $\\Delta=b^2-4ac$ avec $a=${a}$, $b=${b}$ et $c=${c}$.<br>
      $\\begin{aligned}
      \\Delta&=${ecritureParentheseSiNegatif(b)}^2-4\\times ${ecritureParentheseSiNegatif(a)}\\times ${ecritureParentheseSiNegatif(c)} \\\\
      &=${miseEnEvidence(this.reponse)} 
      \\end{aligned}$`

    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
  }
}
