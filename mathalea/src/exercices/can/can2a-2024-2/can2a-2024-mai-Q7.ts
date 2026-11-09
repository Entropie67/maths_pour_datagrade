import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  "Déterminer le coefficient multiplicateur d'une augmentation"
export const interactifReady = true

export const uuid = 'y9n0l'
/**
 * Question 7 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ7 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    this.reponse = '1.17'
    this.question =
      'Augmenter une quantité de $17~\\%$ revient à la multiplier par '
    this.correction = `$1 + 17~\\% = \\dfrac{117}{100} = 1,17$ <br>  Augmenter une quantité de $17~\\%$ revient à la multiplier par $${miseEnEvidence('1,17')}$.`
  }
}
