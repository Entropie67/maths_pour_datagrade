import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureParentheseSiNegatif,
  reduirePolynomeDegre3,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un nombre dérivé'
export const interactifReady = true

export const uuid = '88bc2'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class nombreDerive extends ExerciceSimple {
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
    let nbre: number
    if (this.canOfficielle) {
      a = 3
      b = -2
      nbre = 1
    } else {
      a = randint(-9, 9, 0)
      b = randint(-9, 9, 0)
      nbre = randint(1, 5)
    }
    this.reponse = (2 * a * nbre).toFixed(0)
    this.question = `$f(x)=${reduirePolynomeDegre3(0, a, 0, b)}$<br>
    $f'(${nbre})=$`
    this.correction = ` On détermine d'abord la fonction dérivée :<br>
    $f'(x)=${2 * a}x$ et donc : <br>
    $\\begin{aligned}
  f'(${nbre})&=${2 * a}\\times ${ecritureParentheseSiNegatif(nbre)}\\\\
  &=${miseEnEvidence(this.reponse)}
  \\end{aligned}$`
    this.canEnonce = `$f(x)=${reduirePolynomeDegre3(0, a, 0, b)}$`
    this.canReponseACompleter = `$f'(${nbre})=\\ldots$`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
  }
}
