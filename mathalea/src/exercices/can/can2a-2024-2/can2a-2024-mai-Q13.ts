import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Comparer un nombre et son carré'
export const interactifReady = true

export const uuid = 'ta7zb'
/**
 * Question 13 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ13 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierCompare
    this.optionsDeComparaison = { texteSansCasse: true }
    this.optionsChampTexte = { texteApres: ' $0,7^2$' }
  }

  nouvelleVersion() {
    this.reponse = '>'
    this.question = 'Comparer $0,7$ et $0,7^2$.<br>$0,7$ '
    this.correction = `$0,7 < 1$ donc $0,7~${miseEnEvidence('>')}~0,7^2$`
  }
}
