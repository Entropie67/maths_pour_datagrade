import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Multiplier deux décimaux'
export const interactifReady = true

export const uuid = 'p2ssn'
/**
 * Question 6 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ6 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  nouvelleVersion() {
    this.reponse = '0.08'
    this.question = '$0,2 \\times 0,4$'
    this.correction = `$0,2 \\times 0,4 = ${miseEnEvidence('0,08')}$`
  }
}
