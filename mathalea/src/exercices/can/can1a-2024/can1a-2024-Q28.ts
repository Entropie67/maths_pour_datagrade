import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une probabilité'
export const interactifReady = true

export const uuid = '5c582'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class calculProba extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.canOfficielle = false
  }

  nouvelleVersion() {
    let a: number
    if (this.canOfficielle) {
      a = 9
    } else {
      a = choice([2, 3, 4, 5, 9, 10, 11, 15, 20, 21, 22, 23, 24, 25])
    }
    this.reponse = new FractionEtendue(Math.floor(100 / a), 100)
    this.question = `Parmi $100$ jetons numérotés de $1$ à $100$, quelle est la probabilité de tirer
    un jeton portant un multiple de $${a}$ ?`

    this.correction = `Comme $${a}\\times ${Math.floor(100 / a)}=${a * Math.floor(100 / a)}\\leqslant 100$ 
    et  $${a}\\times ${Math.floor(100 / a) + 1}=${a * (Math.floor(100 / a) + 1)} > 100$,
    il y a $${Math.floor(100 / a)}$ multiples de $${a}$ inférieurs à $100$.<br>
    Ainsi, la probabilité d'obtenir 
    un multiple de $${a}$ est  $${new FractionEtendue(Math.floor(100 / a), 100).texFraction}=${miseEnEvidence(texNombre(Math.floor(100 / a) / 100, 2))}$.
    
      `

    if (!this.interactif) {
      this.question += ''
    }
  }
}
