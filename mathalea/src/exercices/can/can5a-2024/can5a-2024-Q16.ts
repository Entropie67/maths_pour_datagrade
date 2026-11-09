import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Effectuer un calcul'
export const interactifReady = true

export const uuid = 'f5d12'
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
      this.reponse = 30
      this.question = '$2+4\\times 7$ '
      this.correction = `La multiplication est prioritaire :<br> $2+4\\times 7=2+28=${miseEnEvidence(30)}$`
    } else {
      const a = randint(2, 9)
      const b = randint(1, 9)
      const c = randint(2, 6)
      this.reponse = a + b * c
      this.question = `$${a} +${b}\\times ${c}$ `
      this.correction = `La multiplication est prioritaire :<br> 
      $${a} +${b}\\times ${c}=${a}+${b * c}=${miseEnEvidence(texNombre(this.reponse, 0))}$`
    }

    if (this.interactif) {
      this.question += '$=$'
    }
  }
}
