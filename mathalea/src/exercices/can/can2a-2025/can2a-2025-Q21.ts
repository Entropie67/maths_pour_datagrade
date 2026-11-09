import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une moyenne'
export const interactifReady = true

export const uuid = 'f0e17'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class MoyenneCalcul extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    let a = this.canOfficielle ? 12 : randint(2, 19)
    let b = this.canOfficielle ? 18 : randint(2, 19)
    let c = this.canOfficielle ? 15 : randint(2, 19)
    let coeff1 = 1
    let coeff2 = this.canOfficielle ? 2 : randint(2, 3)
    do {
      a = this.canOfficielle ? 12 : randint(2, 19)
      b = this.canOfficielle ? 18 : randint(5, 19)
      c = this.canOfficielle ? 15 : randint(3, 19)
      coeff1 = 1
      coeff2 = this.canOfficielle ? 2 : randint(2, 3)
    } while ((a + b + coeff2 * c) % 20 !== 0)
    this.reponse = (a + b + coeff2 * c) / (coeff1 + coeff1 + coeff2)
    this.question = `Sylvie a eu deux notes ($${a}$ et $${b}$) coefficient $${coeff1}$ et une note de $${c}$ coefficient $${coeff2}$.<br>
Quelle est sa moyenne ?`
    if (this.interactif) {
      this.question += '<br>'
    }
    this.correction = `On calcule la moyenne $m$ en faisant le quotient de la somme des notes coefficientées par la somme des coefficients. <br>
        $m=\\dfrac{${a}+${b}+${coeff2}\\times ${c}}{1+1+${coeff2}}=\\dfrac{${a + b + coeff2 * c}}{${coeff2 + 2}}=${miseEnEvidence(this.reponse)}$`
  }
}
