import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Utiliser la priorité de la multiplication'
export const interactifReady = true

export const uuid = '764b2'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class PrioriteMultiplication extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.canOfficielle = true
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = -46
      this.question = ' $10-7\\times 8$'
      this.correction = `$10-7\\times 8=${miseEnEvidence(-46)}$`
    } else {
      const a = randint(8, 15)
      const b = randint(6, 9)
      const c = randint(5, 9)
      this.reponse = a - b * c
      this.question = ` $${a}-${b}\\times${c}$`
      this.correction = `$${a}-${b}\\times${c}=${miseEnEvidence(texNombre(this.reponse, 0))}$`
    }
  }
}
