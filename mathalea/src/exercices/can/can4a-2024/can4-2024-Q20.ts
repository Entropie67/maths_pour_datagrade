import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une somme avec des relatifs'
export const interactifReady = true

export const uuid = 'ef726'
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
    this.optionsChampTexte = { texteAvant: ' $=$ ' }

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = -1
      this.question = '$7-14+6$'
      this.correction = `$\\underbrace{7-14}_{=-7}+6=-7+6=${miseEnEvidence(this.reponse)}$`
    } else {
      const a = randint(2, 10)
      const b = a + randint(4, 10)
      const c = randint(2, 10)
      this.reponse = a - b + c
      this.question = `$${a}-${b}+${c}$`
      this.correction = `$\\underbrace{${a}-${b}}_{=${a - b}}+${c}=${a - b}+${c}=${miseEnEvidence(this.reponse)}$`
    }
  }
}
