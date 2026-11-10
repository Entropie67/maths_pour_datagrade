import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Résoudre une équation'
export const interactifReady = true

export const uuid = '41aff'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class ResoudreEquation extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
    this.optionsChampTexte = { texteAvant: '<br> $x=$' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 5 : randint(3, 7)
    const reponse = this.canOfficielle ? 5 : randint(-7, 7, [-1, 0, 1])
    const c = this.canOfficielle ? 22 : randint(-9, 9, [0, a * reponse])
    const b = c - a * reponse
    this.reponse = reponse
    this.question = `Résous $${a}x${ecritureAlgebrique(b)}=${c}$.`
    this.correction = `On procède par étapes successives :<br>
         On commence par isoler $${a}x$ dans le membre de gauche en ajoutant
         $${ecritureAlgebrique(-b)}$ dans chacun des membres, puis on divise
         par $${a}$ pour obtenir la solution : <br>
          $\\begin{aligned}
          ${a}x${ecritureAlgebrique(b)}&=${c}\\\\
         ${a}x&=${c}${ecritureAlgebrique(-b)}\\\\
         ${a}x&=${c - b}\\\\
         x&=\\dfrac{${c - b}}{${a}}\\\\
         x&=${this.reponse}
         \\end{aligned}$<br>
         La solution de l'équation est : $${miseEnEvidence(reponse)}$.
         `

    this.canReponseACompleter = '$x=\\ldots$'
  }
}
