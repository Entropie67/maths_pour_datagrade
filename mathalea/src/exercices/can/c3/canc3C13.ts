import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Trouver un nombre dans un produit de trois facteurs'
export const interactifReady = true

export const dateDePublication = '17/11/2022'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/

export const uuid = '8afe0'

export const refs = {
  'fr-fr': ['canc3C13'],
  'fr-ch': [],
}
export default class TableMultiplicationTrous3 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 2, 4)
    const b = this.quotaRandint('b', 2, 5)
    const c = this.quotaRandint('c', 4, 10)
    const d = a * b * c
    if (this.quotaChoice('ordre', [true, false])) {
      this.question = `Compléter : <br>$${a}\\times \\ldots \\times ${b} =${d}$`
      this.correction = `$${a}\\times ${miseEnEvidence(c)} \\times ${b} =${d}$`
      this.canEnonce = 'Compléter.'
      this.canReponseACompleter = `$${a}\\times \\ldots \\times ${b} =${d}$`
    } else {
      this.question = `Compléter :<br> $${a}\\times ${b} \\times \\ldots =${d}$`
      this.correction = `$${a}\\times ${b} \\times ${miseEnEvidence(c)} =${d}$`
      this.canEnonce = 'Compléter.'
      this.canReponseACompleter = `$${a}\\times ${b} \\times \\ldots =${d}$`
    }
    this.reponse = c
  }
}
