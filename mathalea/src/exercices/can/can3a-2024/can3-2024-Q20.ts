import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une image'
export const interactifReady = true

export const uuid = '9727d'
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
      this.reponse = -2
      this.question = ` $f$ est la fonction définie par : $f(x)=4-2x$ pour tout nombre $x$.<br>
      Quelle est l'image de $3$ par la fonction $f$ ? `
      this.correction = `On remplace $x$ par $3$ dans l'expression de $f$ : <br>
       $\\begin{aligned}
       f(3)&=4-2\\times 3\\\\
    &=4-6\\\\
      &=${miseEnEvidence(this.reponse)}
      \\end{aligned}$<br>
     `
    } else {
      const a = randint(-5, 5, [-1, 0, 1])
      const b = randint(-5, 5, [-1, 0, 1])
      const choix = choice([true, false])
      const val = randint(-5, 5, [-1, 0, 1])
      this.reponse = a * val + b
      this.question = `$f$ est la fonction définie par : $f(x)=${choix ? `${reduireAxPlusB(a, b)}` : `${b}${ecritureAlgebrique(a)}x`}$ pour tout nombre $x$.<br>
      Quelle est l'image de $${val}$ par la fonction $f$ ? `
      this.correction = `On remplace $x$ par $${val}$ dans l'expression de $f$ : <br>
      $\\begin{aligned}
      f(${val})&=${choix ? `${a}\\times ${ecritureParentheseSiNegatif(val)}${ecritureAlgebrique(b)}` : `${b}${ecritureAlgebrique(a)}\\times ${ecritureParentheseSiNegatif(val)}`}\\\\
   &=${choix ? `${a * val}${ecritureAlgebrique(b)}` : `${b}${ecritureAlgebrique(a * val)}`}\\\\
     &=${miseEnEvidence(this.reponse)}
     \\end{aligned}$<br>
    `
    }
  }
}
