import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Déterminer le coefficient directeur d'une droite"
export const interactifReady = true

export const uuid = 'hg86c'
/**
 * Question 24 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ24 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    this.reponse = '\\dfrac{5}{2}'
    this.question =
      'Soient $A(4\\;;\\;9)$ et $B(2\\;;\\;4)$.<br>Déterminer le coefficient directeur de la droite $(AB)$.'
    this.correction = `$m=\\dfrac{y_B - y_A}{x_B - x_A} = \\dfrac{4 - 9}{2 - 4} = ${miseEnEvidence('\\dfrac{5}{2}')}$`
  }
}
