import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Déterminer les coordonnées du milieu d'un segment"
export const interactifReady = true

export const uuid = 'bspex'
/**
 * Question 25 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ25 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'fillInTheBlank'
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    this.reponse = {
      bareme: toutPourUnPoint,
      champ1: { value: '0' },
      champ2: { value: '5' },
    }
    this.consigne =
      'Coordonnées du point $M$, milieu du segment $[AB]$ où : $A(-2\\;;\\;3)$ et $B(2\\;;\\;7)$ :'
    this.question = 'M\\Big(%{champ1} \\;;\\; %{champ2}\\Big)\\text{.}'
    this.correction = `$M\\Big( \\dfrac{x_A + x_B}{2}  \\;;\\;  \\dfrac{y_A + y_B}{2}\\Big) \\iff M\\Big( \\dfrac{-2 + 2}{2}  \\;;\\;  \\dfrac{3 + 7}{2}\\Big) \\iff M\\Big(${miseEnEvidence('0\\;;\\;5')}\\Big)$`
  }
}
