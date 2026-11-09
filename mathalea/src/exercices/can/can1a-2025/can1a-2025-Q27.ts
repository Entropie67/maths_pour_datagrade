import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer les coordonnées d'un milieu"
export const interactifReady = true

export const uuid = '89612'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N5Q27 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
    this.formatInteractif = 'fillInTheBlank'
  }

  nouvelleVersion() {
    const a = this.canOfficielle
      ? 4050
      : randint(1, 4) * 1000 + randint(1, 6) * 10
    const b = this.canOfficielle ? 10 : randint(1, 3) * 10
    const xa = a - b
    const ya = -b
    const xb = b
    const yb = a + b
    const xm = (xa + xb) / 2
    const ym = (ya + yb) / 2
    this.reponse = {
      bareme: toutPourUnPoint,
      champ1: { value: xm },
      champ2: { value: ym },
    }
    this.consigne = `$A(${texNombre(xa, 0)}\\,;\\,${texNombre(ya, 0)})$ et $B(${texNombre(xb, 0)}\\,;\\,${texNombre(yb, 0)})$<br>
         Déterminer les coordonnées de $M$, milieu de $[AB]$.`
    this.question = 'M(%{champ1};%{champ2})'

    this.correction = `Les coordonnées du milieu sont données par la moyenne des abscisses et la moyenne des ordonnées : <br>
         $x_M=\\dfrac{${texNombre(xa, 0)}+${texNombre(xb, 0)}}{2}=${miseEnEvidence(texNombre(xm, 0))}$ et $y_M=\\dfrac{${texNombre(ya, 0)}+${texNombre(yb, 0)}}{2}=${miseEnEvidence(texNombre(ym, 0))}$.<br>
         Ainsi,  $M(${miseEnEvidence(`${texNombre(xm, 0)}\\,;\\,${texNombre(ym, 0)}`)})$.`

    this.canEnonce = `$A(${texNombre(xa, 0)}\\,;\\,${texNombre(ya, 0)})$ et $B(${texNombre(xb, 0)}\\,;\\,${texNombre(yb, 0)})$<br>
         Déterminer les coordonnées de $M$,<br> milieu de $[AB]$.`
    this.canReponseACompleter = '$M(\\ldots\\,;\\,\\ldots)$'
  }
}
