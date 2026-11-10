import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer un pourcentage d'une quantité"
export const interactifReady = true

export const uuid = 'nabcc'
/**
 * Question 5 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ5 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  nouvelleVersion() {
    this.reponse = '6'
    this.question = '$30~\\%~\\text{de}~20$'
    this.correction = `$\\dfrac{30}{100} \\times 20 = 0,3 \\times 20 = ${miseEnEvidence('6')}$`
  }
}
