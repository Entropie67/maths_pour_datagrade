import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Trouver le nombre dans une table de multiplication'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/
export const uuid = 'bdb11'

export const refs = {
  'fr-fr': ['canc3C03'],
  'fr-ch': [],
}
export default class TableMultiplicationTrous extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatInteractif = 'fillInTheBlank'
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 2, 9)
    const b = this.quotaRandint('b', 4, 10)
    const c = a * b
    this.consigne = 'Compléter.'
    this.canEnonce = this.consigne
    if (this.quotaChoice('ordre', [true, false])) {
      this.question = `${a}\\times %{champ1} =${c}`
      this.correction = `$${a}\\times ${miseEnEvidence(b)} =${c}$`
      this.canReponseACompleter = `$${a}\\times \\ldots =${c}$`
    } else {
      this.question = ` %{champ1} \\times ${a}=${c}`
      this.correction = `$ ${miseEnEvidence(b)} \\times ${a}=${c}$`
      this.canReponseACompleter = `$ \\ldots \\times ${a}=${c}$`
    }
    this.reponse = b
  }
}
