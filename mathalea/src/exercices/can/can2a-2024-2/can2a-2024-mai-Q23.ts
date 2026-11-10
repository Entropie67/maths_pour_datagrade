import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Décomposer un nombre en produit de facteurs premiers'
export const interactifReady = true

export const uuid = '5phh0'
/**
 * Question 23 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ23 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { exclusifFactorisation: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    this.reponse = '2\\times3\\times5'
    this.question =
      'La décomposition en produit de facteurs premiers de 30 est :'
    this.correction = `$30 = ${miseEnEvidence('2\\times3\\times5')}$`
  }
}
