import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Soustraire $19$, $29$, …, $99$ à un entier'
export const interactifReady = true

export const uuid = 'bc9a6'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class AdditionnerEntier extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 123 : randint(121, 128)
    const b = this.canOfficielle ? 99 : randint(1, 9) * 10 + 9
    this.reponse = a - b
    this.question = `$${a}-${b}$ `
    this.correction = `$${a}-${b}=${a}-${b + 1}+1=${miseEnEvidence(a - b)}$`

    if (this.interactif) {
      this.question += ' $=$'
    }
  }
}
