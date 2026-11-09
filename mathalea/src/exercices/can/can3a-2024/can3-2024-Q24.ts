import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une expression pour une valeur particulière'
export const interactifReady = true

export const uuid = 'eaa47'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = -6
      this.question = 'Calculer $2+8x$ pour $x=-1$.<br> '
      this.correction = `On remplace $x$ par $-1$ dans l'expression  : <br>
       $\\begin{aligned}
       2+8\\times (-1)&=2-8\\\\
      &=${miseEnEvidence(this.reponse)}
      \\end{aligned}$
     `
    } else {
      const a = randint(-5, 5, [0, 1])
      const b = randint(-10, 10, 0)
      const c = randint(-5, 3, 0)
      this.reponse = a * c + b
      this.question = `Calculer $${reduireAxPlusB(a, b)}$ pour $x=${c}$.<br>`
      this.correction = `Pour $x=${c}$, on a : <br>
      $\\begin{aligned}
      ${reduireAxPlusB(a, b)}&=${a}\\times ${ecritureParentheseSiNegatif(c)}${ecritureAlgebrique(b)}\\\\
      &=${a * c}${ecritureAlgebrique(b)}\\\\
      &=${miseEnEvidence(this.reponse)}
     \\end{aligned}$
      `
    }
  }
}
