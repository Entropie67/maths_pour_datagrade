import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une fonction dérivée'
export const interactifReady = true

export const uuid = '4f56c'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class deriveeSecondDegre extends ExerciceSimple {
  constructor() {
    super()
    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
    this.optionsDeComparaison = { calculFormel: true }
  }

  nouvelleVersion() {
    let a: number
    let b: number
    if (this.canOfficielle) {
      a = -3
      b = 4
    } else {
      a = randint(-9, 9, 0)
      b = randint(-9, 9, 0)
    }
    this.reponse = `x${ecritureAlgebrique(a)}`
    this.question = `$f(x)=\\dfrac{1}{2}x^2${ecritureAlgebriqueSauf1(a)}x${ecritureAlgebrique(b)}$<br>
    $f'(x)=$`
    this.correction = ` On détermine la fonction dérivée :<br>
      $\\begin{aligned}
      f'(x)&=\\dfrac{1}{2}\\times 2x ${ecritureAlgebrique(b)}\\\\
      &=${miseEnEvidence(`x${ecritureAlgebrique(a)}`)}     
      \\end{aligned}$`
    this.canEnonce = `$f(x)=\\dfrac{1}{2}x^2${ecritureAlgebriqueSauf1(a)}${ecritureAlgebrique(b)}$`
    this.canReponseACompleter = "$f'(x)=\\ldots$"
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
  }
}
