import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer une somme algébrique'
export const interactifReady = true

export const uuid = '26v5m'
/**
 * Question 2 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ2 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  nouvelleVersion() {
    this.reponse = '-8'
    this.question = '$42 - 55 + 5$'
    this.correction = `$42 - 55 + 5 = ${miseEnEvidence('-8')}$`
  }
}
