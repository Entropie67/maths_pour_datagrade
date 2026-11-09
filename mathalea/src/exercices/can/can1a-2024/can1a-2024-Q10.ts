import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Résoudre une équation'
export const interactifReady = true

export const uuid = 'a9e45'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Equation1degre extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = new FractionEtendue(2, 7)
      this.question = "Solution de  l'équation $7x+3=5$<br>"
      this.correction = `On procède par étapes successives :<br>
    On commence par isoler $7x$ dans le membre de gauche en retranchant
    $3$ dans chacun des membres, puis on divise
    par $7$ pour obtenir la solution : <br>
     $\\begin{aligned}
     7x+3&=5\\\\
    7x&=5-3\\\\
    7x&=2\\\\
    x&=\\dfrac{2}{7}   
    \\end{aligned}$<br>
    La solution de l'équation est : $${miseEnEvidence('\\dfrac{2}{7}')}$.
    `
    } else {
      const listevaleurs = [
        [3, 1, 5],
        [3, 1, 8],
        [3, 2, 9],
        [3, 2, -9],
        [7, 4, -2],
        [7, 4, 8],
        [7, 3, 2],
        [7, 3, -5],
        [6, 3, -2],
        [6, 3, 10],
        [6, 4, 3],
        [6, 4, -3],
        [3, 4, 14],
        [7, 4, 14],
      ]
      const val = choice(listevaleurs)
      const a = val[0]
      const b = val[1]
      const c = val[2]
      this.reponse = new FractionEtendue(c - b, a)

      this.question = `Solution de l'équation $${a}x${ecritureAlgebrique(b)}=${c}$<br>`
      this.correction = `On procède par étapes successives :<br>
      On commence par isoler $${a}x$ dans le membre de gauche en retranchant
      $${b}$ dans chacun des membres, puis on divise
      par $${a}$ pour obtenir la solution : <br>
       $\\begin{aligned}
       ${a}x${ecritureAlgebrique(b)}&=${c}\\\\
      ${a}x&=${c}${ecritureAlgebrique(-b)}\\\\
      ${a}x&=${c - b}\\\\
      x&=\\dfrac{${c - b}}{${a}}    
      \\end{aligned}$<br>
      La solution de l'équation est : $${miseEnEvidence(this.reponse)}$.
      `
    }
  }
}
