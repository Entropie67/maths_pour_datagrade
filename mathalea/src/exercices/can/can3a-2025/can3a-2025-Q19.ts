import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer avec une puissance'
export const interactifReady = true

export const uuid = '4650c'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class CalculPuissance extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? -7 : randint(-10, -1)
    const reponse = a ** 2
    this.reponse = reponse
    this.question = `$(${a})^2$`
    this.correction = `$(${a})^2=(${a})\\times (${a})=${miseEnEvidence(reponse)}$`
  }
}
