import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureParentheseSiNegatif,
  reduirePolynomeDegre3,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer l'abscisse du sommet d'une parabole"
export const interactifReady = true

export const uuid = 'e88e8'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class SommetParabole extends ExerciceSimple {
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
      a = 1
      b = -2
      c = -3
    } else {
      a = choice([-1, 1])
      b = randint(-5, 5, 0) * 2
      c = randint(-6, 6, 0)
    }
    this.reponse = (-b / (2 * a)).toFixed(0)
    this.question = `Soit $f(x)=${reduirePolynomeDegre3(0, a, b, c)}$<br>
    L'abscisse du sommet de la parabole qui représente $f$ est :`
    this.correction = `Pour un polynôme de degré $2$ du type $ax^2+bx+c$, l'abscisse du sommet 
    de la parabole $x_S$ est donnée par $-\\dfrac{b}{2a}$.<br>
     L'abscisse du sommet est donnée  par $x_S=-\\dfrac{${b}}{2\\times ${ecritureParentheseSiNegatif(a)}}=${miseEnEvidence(this.reponse)}$.<br>`

    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
  }
}
