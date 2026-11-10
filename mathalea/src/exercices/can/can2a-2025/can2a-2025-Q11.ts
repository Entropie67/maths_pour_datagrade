import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer les coordonnées d'un milieu"
export const interactifReady = true

export const dateDeModifImportante = '31/10/2026'
export const uuid = '50ee5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class CoordonneesMilieu extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.formatInteractif = 'fillInTheBlank'
  }

  nouvelleVersion() {
    const xa = this.canOfficielle ? 2 : randint(1, 5) * choice([-2, 2])
    const ya = this.canOfficielle ? 1 : randint(1, 3) * 2 + 1
    const xb = this.canOfficielle ? -4 : randint(1, 5) * choice([-2, 2])
    const yb = this.canOfficielle ? 9 : randint(4, 5) * 2 + 1
    const xm = (xa + xb) / 2
    const ym = (ya + yb) / 2

    this.reponse = {
      bareme: toutPourUnPoint,
      champ1: { value: xm },
      champ2: { value: ym },
    }
    this.consigne = `Coordonnées du milieu de $[AB]$ avec $A(${xa}\\,;\\,${ya})$ et $B(${xb}\\,;\\,${yb})$<br>`
    this.question = '(%{champ1};%{champ2})'

    this.correction = `Les coordonnées du milieu $M$ sont données par la moyenne des abscisses et la moyenne des ordonnées : <br>
      $x_M=\\dfrac{${xa}+${ecritureParentheseSiNegatif(xb)}}{2}=${miseEnEvidence(xm)}$ et $y_M=\\dfrac{${ya}+${ecritureParentheseSiNegatif(yb)}}{2}=${miseEnEvidence(ym)}$.<br>
      Ainsi, $M(${miseEnEvidence(`${xm}\\,;\\,${ym}`)})$.`

    this.canEnonce = `Coordonnées du milieu de $[AB]$ avec $A(${xa}\\,;\\,${ya})$ et $B(${xb}\\,;\\,${yb})$`
  }
}
