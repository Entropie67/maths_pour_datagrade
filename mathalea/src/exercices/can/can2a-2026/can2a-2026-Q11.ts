import { fromOptions, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer les coordonnées du milieu d’un segment'
export const interactifReady = true

export const uuid = 'atlft'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q11 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'fillInTheBlank'
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  enonce(xa?: number, ya?: number, xb?: number, yb?: number): void {
    if (xa == null || ya == null || xb == null || yb == null) {
      xa = randint(1, 5) * choice([-2, 2])
      ya = randint(1, 3) * 2 + 1
      xb = randint(1, 5) * choice([-2, 2])
      yb = randint(4, 5) * 2 + 1
    }

    const xm = (xa + xb) / 2
    const ym = (ya + yb) / 2

    const compare = seq([fromOptions({ nombreDecimalSeulement: true })])
    this.reponse = {
      bareme: toutPourUnPoint,
      champ1: { value: xm, compare },
      champ2: { value: ym, compare },
    }
    this.consigne = `Coordonnées du milieu $M$ de $[AB]$ avec $A(${xa}\\,;\\,${ya})$ et $B(${xb}\\,;\\,${yb})$.<br>`
    this.question = 'M(%{champ1};%{champ2})'

    this.correction = `Les coordonnées du milieu $M$ sont données par la moyenne des abscisses et la moyenne des ordonnées :<br>
$x_M=\\dfrac{${xa}${ecritureAlgebrique(xb)}}{2}=${miseEnEvidence(xm)}$ et $y_M=\\dfrac{${ya}${ecritureAlgebrique(yb)}}{2}=${miseEnEvidence(ym)}$.<br>
Ainsi, $M(${miseEnEvidence(`${xm}`)}\\,;\\,${miseEnEvidence(`${ym}`)})$.`

    this.canEnonce = `Coordonnées du milieu $M$ de $[AB]$ avec $A(${xa}\\,;\\,${ya})$ et $B(${xb}\\,;\\,${yb})$`
    this.canReponseACompleter = '$M(\\ldots\\,;\\,\\ldots)$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(3, -2, -5, 4)
    else this.enonce()
  }
}
