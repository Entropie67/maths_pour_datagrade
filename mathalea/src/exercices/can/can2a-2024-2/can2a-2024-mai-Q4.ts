import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Additionner deux fractions'
export const interactifReady = true

export const uuid = 'pdtko'
/**
 * Question 4 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ4 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  nouvelleVersion() {
    this.reponse = '\\dfrac{12}{35}'
    this.question = '$\\dfrac{1}{5} + \\dfrac{1}{7}$'
    this.correction = `$\\dfrac{1}{5} + \\dfrac{1}{7} = ${miseEnEvidence('\\dfrac{12}{35}')}$`
  }
}
