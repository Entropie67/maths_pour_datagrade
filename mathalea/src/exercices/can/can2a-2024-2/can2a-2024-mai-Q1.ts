import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Multiplier un entier par un décimal'
export const interactifReady = true

export const uuid = 'h6xlh'
/**
 * Question 1 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ1 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  nouvelleVersion() {
    this.reponse = '10'
    this.question = '$8 \\times 1,25$'
    this.correction = `$8 \\times 1,25 = ${miseEnEvidence('10')}$`
  }
}
