import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer la racine carrée d'un décimal"
export const interactifReady = true

export const uuid = 'c5bxx'
/**
 * Question 9 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ9 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  nouvelleVersion() {
    this.reponse = '0.6'
    this.question = '$\\sqrt{0,36}$'
    this.correction = `$\\sqrt{0,36} = ${miseEnEvidence('0,6')}$`
  }
}
