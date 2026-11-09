import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer avec les tables de multiplication'
export const interactifReady = true

export const uuid = '107a3'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2024Q1 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 45
      this.question = '$5\\times 9$ '
      this.correction = `$5\\times 9=${miseEnEvidence(45)}$`
    } else {
      const a = this.quotaRandint('a', 5, 9)
      const b = this.quotaRandint('b', 5, 9)
      this.reponse = a * b
      this.question = `$${a} \\times ${b}$ `
      this.correction = `$${a} \\times ${b}=${miseEnEvidence(texNombre(this.reponse, 0))}$`
    }

    if (this.interactif) {
      this.question += '$=$'
    }
  }
}
