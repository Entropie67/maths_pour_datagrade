import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Résoudre une équation'
export const interactifReady = true

export const uuid = '6bb1f'
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
      this.reponse = 4
      this.question = '$3x-5=7$'
      this.correction = `On procède par étapes successives.<br>
      On commence par isoler $3x$ dans le membre de gauche en ajoutant
      $5$ dans chacun des membres, puis on divise
      par $3$ pour obtenir la solution : <br>
       $\\begin{aligned}
       3x-5&=7\\\\
      3x&=7+5\\\\
      3x&=12\\\\
      x&=\\dfrac{12}{3}\\\\
      x&=${this.reponse}
      \\end{aligned}$<br>
      La solution de l'équation est : $${miseEnEvidence(this.reponse)}$.`
    } else {
      let a = randint(2, 6)
      this.reponse = randint(-5, 5, [-1, 0, 1])
      let c = randint(-7, 7, [0])
      let b = c - a * this.reponse
      do {
        a = randint(2, 6)
        this.reponse = randint(-5, 5, [-1, 0, 1])
        c = randint(-7, 7, [0])
        b = c - a * this.reponse
      } while (b === 0)
      this.question = `$${a}x${ecritureAlgebrique(b)}=${c}$`
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
      La solution de l'équation est : $${miseEnEvidence(this.reponse)}$.
      `
    }

    this.canReponseACompleter = '$x=\\ldots$'
    if (!this.interactif) {
      this.question += '<br> $x=\\ldots$'
    } else {
      this.question += '<br> $x=$'
    }
  }
}
