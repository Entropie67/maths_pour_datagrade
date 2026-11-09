import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Résoudre une équation avec un quotient'
export const interactifReady = true

export const uuid = 'ybt28'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ23 extends ExerciceCan {
  enonce(k?: number, den?: number, p?: number, q?: number): void {
    if (k == null || den == null || p == null || q == null) {
      // (a+k)/den = p/q avec a entier
      // a + k = den × p / q, donc den × p doit être divisible par q

      p = choice([2, 3, 4, 5])
      q = p + 1
      // den doit être multiple de q pour que a soit entier
      den = q * randint(2, 9)
      k = randint(1, 10) * choice([-1, 1])
    }

    const a = (den * p) / q - k

    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.reponse = String(a)

    this.question = `Calculer la valeur du nombre $a$ sachant que : $\\dfrac{a${ecritureAlgebrique(k)}}{${den}}=\\dfrac{${p}}{${q}}$.<br>`
    if (this.interactif) {
      this.question += '$a=$'
    } else {
      this.question += '$a=\\ldots$'
    }

    this.correction = `On résout l'équation en commençant par multiplier les deux membres de l'équation par $${den}$ :<br>
    $\\begin{aligned}
    a${ecritureAlgebrique(k)}&=\\dfrac{${p}}{${q}}\\times ${den}\\\\
      a${ecritureAlgebrique(k)}&=${(p * den) / q}\\\\
      a&=${(p * den) / q}${k >= 0 ? '-' : '+'}${Math.abs(k)}\\\\
      a&=${miseEnEvidence(String(a))}
    \\end{aligned}$<br> 
   `

    this.canEnonce = `Calculer la valeur du nombre $a$ sachant que : $\\dfrac{a${k >= 0 ? '+' : ''}${k}}{${den}}=\\dfrac{${p}}{${q}}$.`
    this.canReponseACompleter = '$a=\\ldots$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(4, 27, 2, 3)
    else this.enonce()
  }
}
