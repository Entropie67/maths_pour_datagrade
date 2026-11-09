/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/viewcan.2024.2e.test.ts ⚠️
 */

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer les coordonnées d'un milieu"
export const interactifReady = true

export const uuid = '24396'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
    this.optionsChampTexte = { texteAvant: '$M($', texteApres: '$)$' }
    this.optionsDeComparaison = { texteSansCasse: true }
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = '5;15'
      this.question =
        'Coordonnées du point $M$ milieu du segment $[AB]$ où $A(2\\,;\\,20)$ et $B(8\\,;\\,10)$<br>'
      this.correction = `Les coordonnées du milieu sont données par la moyenne des abscisses et la moyenne des ordonnées : <br>
    $x_M=\\dfrac{2+8}{2}=${miseEnEvidence(texNombre(5))}$ et $y_M=\\dfrac{20+10}{2}=${miseEnEvidence(texNombre(15))}$.<br>
    Ainsi,  $M(${miseEnEvidence('5\\,;\\,15')})$.`
    } else {
      const xa = randint(1, 5) * 2
      const ya = randint(1, 3) * 2
      const xb = randint(1, 5) * 2
      const yb = randint(4, 5) * 2
      const xm = (xa + xb) / 2
      const ym = (ya + yb) / 2
      this.reponse = `${xm};${ym}`
      this.question = `Coordonnées du point $M$ milieu du segment $[AB]$ où $A(${xa}\\,;\\,${ya})$ et $B(${xb}\\,;\\,${yb})$<br>`

      this.correction = `Les coordonnées du milieu sont données par la moyenne des abscisses et la moyenne des ordonnées : <br>
      $x_M=\\dfrac{${xa}+${xb}}{2}=${miseEnEvidence(texNombre(xm, 0))}$ et $y_M=\\dfrac{${ya}+${yb}}{2}=${miseEnEvidence(texNombre(ym, 0))}$.<br>
      Ainsi,  $M(${miseEnEvidence(`${xm}\\,;\\,${ym}`)})$.`
    }
  }
}
