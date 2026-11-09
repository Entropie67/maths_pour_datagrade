import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Développer et réduire une identité remarquable'
export const interactifReady = true

export const uuid = 'v9dc8'
/**
 * Question 3 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ3 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  nouvelleVersion() {
    this.reponse = '4x^2 - 20x + 25'
    this.question =
      "Développer et réduire l'expression suivante.<br><br>$(2x-5)^2$"
    this.correction = `$(2x-5)^2 = ${miseEnEvidence('4x^2 - 20x + 25')}$`
  }
}
