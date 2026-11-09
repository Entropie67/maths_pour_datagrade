import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calcculer un antécédent par une fonction homographique'
export const interactifReady = true

export const uuid = '6ps0p'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ19 extends ExerciceCan {
  enonce(a?: number, b?: number, y0?: number): void {
    if (a == null || b == null || y0 == null) {
      // y0 - b doit être non nul, on choisit parmi ±1, ±2, ±3, ±5
      const denominateurs = [-5, -3, -2, -1, 1, 2, 3, 5]
      const den = choice(denominateurs)
      a = randint(-5, 5, [0])
      b = randint(-5, 5, [0, -den])
      y0 = b + den
    }

    // f(x) = a/x + b, on cherche x tel que f(x) = y0
    // a/x + b = y0 => a/x = y0 - b => x = a/(y0-b)
    const resultat = new FractionEtendue(a, y0 - b).simplifie()

    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.reponse = resultat.texFraction

    this.question = `Soit la fonction $f$ définie par $f(x)=\\dfrac{${a}}{x}${ecritureAlgebrique(b)}$.<br>
    Quel est l'antécédent de $${y0}$ par $f$ ?<br>`

    this.correction = `On cherche $x$ tel que $f(x)=${y0}$.<br>
    $\\begin{aligned}
    \\dfrac{${a}}{x}${ecritureAlgebrique(b)}&=${y0}\\\\
    \\dfrac{${a}}{x}&=${y0 - b}\\\\
    x&=${miseEnEvidence(resultat.texFSD)}
    \\end{aligned}$`

    this.canEnonce = `Soit la fonction $f$ définie par $f(x)=\\dfrac{${a}}{x}${ecritureAlgebrique(b)}$.<br>
    Quel est l'antécédent de $${y0}$ par $f$ ?`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(-3, 2, -4)
    else this.enonce()
  }
}
