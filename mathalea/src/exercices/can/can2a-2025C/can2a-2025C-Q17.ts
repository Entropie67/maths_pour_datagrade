import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer le coefficient directeur d’une droite'
export const interactifReady = true

export const uuid = '43ye2'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ17 extends ExerciceCan {
  enonce(xa?: number, ya?: number, xb?: number, yb?: number): void {
    if (xa == null || ya == null || xb == null || yb == null) {
      xa = randint(-5, 5, 0)
      ya = randint(-5, 5)
      do {
        xb = randint(-5, 5)
      } while (xb === xa)
      yb = randint(-5, 5, [ya, 0])
    }

    const resultat = new FractionEtendue(yb - ya, xb - xa).simplifie()
    const nomA = choice(['A', 'M', 'P'])
    const nomB = nomA === 'A' ? 'B' : nomA === 'M' ? 'N' : 'Q'

    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.reponse = resultat.texFraction

    this.question = `Dans un repère orthonormé, on donne $${nomA}(${xa}\\,;\\,${ya})$ et $${nomB}(${xb}\\,;\\,${yb})$.<br>
    Quel est le coefficient directeur de $(${nomA}${nomB})$ ?<br>`

    this.correction = `Le coefficient directeur de $(${nomA}${nomB})$ est $m=\\dfrac{y_{${nomB}}-y_{${nomA}}}{x_{${nomB}}-x_{${nomA}}}=\\dfrac{${yb}-${ecritureParentheseSiNegatif(ya)}}{${xb}-${ecritureParentheseSiNegatif(xa)}}=\\dfrac{${yb - ya}}{${xb - xa}}=${miseEnEvidence(resultat.texFSD)}$.`

    this.canEnonce = `Dans un repère orthonormé, on donne $${nomA}(${xa}\\,;\\,${ya})$ et $${nomB}(${xb}\\,;\\,${yb})$.<br>
    Quel est le coefficient directeur de $(${nomA}${nomB})$ ?`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(5, -1, 2, 5)
    else this.enonce()
  }
}
