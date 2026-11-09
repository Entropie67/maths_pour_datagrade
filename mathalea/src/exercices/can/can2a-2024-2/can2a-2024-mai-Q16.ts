import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Déterminer les coordonnées d'un vecteur"
export const interactifReady = true

export const uuid = 'mhml9'
/**
 * Question 16 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ16 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'fillInTheBlank'
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    this.reponse = {
      bareme: toutPourUnPoint,
      champ1: { value: '2' },
      champ2: { value: '-6' },
    }
    this.consigne =
      'Soient $A(5\\;;\\;9)$ et $B(7\\;;\\;3)$ dans un repère orthonormé.<br>Déterminer les coordonnées du vecteur $\\overrightarrow{AB}$.'
    this.question =
      '\\overrightarrow{AB}\\Big(%{champ1} \\;;\\; %{champ2}\\Big)'
    this.correction = `$\\overrightarrow{AB}(x_B - x_A \\;;\\; y_B - y_A) \\iff \\overrightarrow{AB}(7-5 \\;;\\; 3-9)  \\iff\\overrightarrow{AB}${miseEnEvidence('(2 \\;;\\; -6 )')}$`
  }
}
