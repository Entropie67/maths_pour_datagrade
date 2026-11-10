import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  'Trouver une valeur à partir de la colinéarité de deux vecteurs'
export const interactifReady = true

export const uuid = 'fbylh'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ29 extends ExerciceCan {
  enonce(yu?: number, xv?: number, yvCoeff?: number): void {
    if (yu == null || xv == null || yvCoeff == null) {
      // On construit à l'envers : on choisit x négatif, puis on calcule les coefficients
      const xVal = randint(-3, -1)
      const xCarre = xVal * xVal

      xv = randint(2, 6)
      yvCoeff = randint(1, 3) * 2 // yv = yvCoeff × x, pour que le déterminant donne un x² exploitable

      // yvCoeff × x² = yu × xv => on calcule yu en fonction du reste
      yu = (yvCoeff * xCarre) / xv

      if (!Number.isInteger(yu) || yu <= 0) {
        // Fallback si yu ne tombe pas juste ou est négatif
        yu = 2
        xv = 4
        yvCoeff = 2
        // x² = 2×4/2 = 4, x = -2
      }
    }

    // Calculs valables à la fois pour la version aléatoire et la version officielle
    const xCarreCalc = (yu * xv) / yvCoeff
    const xNegatif = -Math.sqrt(xCarreCalc)

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = String(xNegatif)

    this.question = `Dans une base $(\\vec{\\imath},\\vec{\\jmath})$ du plan, on donne $\\vec{u}(x\\,;\\,${yu})$ et $\\vec{v}(${xv}\\,;\\,${yvCoeff}x)$.<br>
    On sait que $x$ est un nombre réel négatif.<br>
    Déterminer sa valeur sachant que les vecteurs $\\vec{u}$ et $\\vec{v}$ sont colinéaires.<br>`

    if (this.interactif) {
      this.question += '$x=$'
    } else {
      this.question += '$x=\\ldots$'
    }

    this.correction = `$\\vec{u}$ et $\\vec{v}$ sont colinéaires si et seulement si $\\det(\\vec{u},\\vec{v})=0$.<br>
    $\\det(\\vec{u},\\vec{v})=x\\times ${yvCoeff}x-${yu}\\times ${xv}=${yvCoeff}x^2-${yu * xv}$.<br>
    On cherche donc $x$ tel que $${yvCoeff}x^2-${yu * xv}=0$,  soit $x^2=${xCarreCalc}$.<br>
    Comme $x<0$, on obtient $x=${miseEnEvidence(String(xNegatif))}$.`

    this.canEnonce = `Dans une base $(\\vec{\\imath},\\vec{\\jmath})$ du plan, on donne $\\vec{u}(x\\,;\\,${yu})$ et $\\vec{v}(${xv}\\,;\\,${yvCoeff}x)$. On sait que $x$ est un nombre réel négatif. Déterminer sa valeur sachant que $\\vec{u}$ et $\\vec{v}$ sont colinéaires.`
    this.canReponseACompleter = '$x=\\ldots$'
  }

  nouvelleVersion(): void {
    // Version officielle : u(x;2), v(4;2x) → 2x²=8 → x²=4 → x=-2
    if (this.canOfficielle) this.enonce(2, 4, 2)
    else this.enonce()
  }
}
