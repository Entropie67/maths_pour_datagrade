import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Simplifier le carré d'un produit avec une racine carrée"
export const interactifReady = true

export const uuid = 'ehwa1'
/**
 * Question 12 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ12 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  nouvelleVersion() {
    this.reponse = '12'
    this.question = 'Simplifier.<br> $\\Big(2\\sqrt{3}\\Big)^2$'
    this.correction = `$\\Big(2\\sqrt{3}\\Big)^2 = 4 \\times 3 = ${miseEnEvidence('12')}$`
  }
}
