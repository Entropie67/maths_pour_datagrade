import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Factoriser avec une identité remarquable'
export const interactifReady = true

export const uuid = 'n06k7'
/**
 * Question 27 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ27 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.optionsDeComparaison = { factorisation: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    this.reponse = '(x+5)(x-5)'
    this.question = 'Factoriser $x^2-25$.'
    this.correction = `On utilise l'identité remarquable $a^2-b^2=(a+b)(a-b)$ pour obtenir : $x^2 - 25 = x^2 - 5^2 = ${miseEnEvidence('(x+5)(x-5)')}$`
  }
}
