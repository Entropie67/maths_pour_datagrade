import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'b1f2a'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['9R3NO4J-4', '10CTNO3A-4', '10LCNO3A-4', '10LSNO3A-4', 'PRQNO12A-5'],
}
export const interactifReady = true

export const titre = 'Additionner deux fractions'
export const dateDePublication = '06/06/2026'

/**
 * DNB Amérique du Nord juin 2026 - Question 1
 * @author Rémi Angot
 */
export default class AutoQ1ANbrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionEgale: true }
    this.optionsChampTexte = { texteAvant: '$A=$' }
  }

  enonce(num1?: number, den1?: number, num2?: number, den2?: number) {
    if (num1 == null || den1 == null || num2 == null || den2 == null) {
      ;[num1, den1, num2, den2] = choice([
        [2, 3, 3, 4],
        [1, 2, 2, 3],
        [3, 4, 1, 6],
        [1, 3, 2, 5],
        [3, 5, 1, 4],
        [2, 5, 1, 2],
      ])
    }
    const f1 = new FractionEtendue(num1, den1)
    const f2 = new FractionEtendue(num2, den2)
    const denCommun = den1 * den2
    const num1Etendu = num1 * den2
    const num2Etendu = num2 * den1
    const resultat = f1.sommeFraction(f2)

    this.reponse = resultat
    this.question = `Calculer $A=${f1.texFraction}+${f2.texFraction}$.`
    if (this.interactif) this.question += '<br>'

    this.correction = `On réduit au même dénominateur, puis on additionne les numérateurs :<br><br>
$\\begin{aligned}
A&=${f1.texFraction}+${f2.texFraction}\\\\
&=\\dfrac{${num1Etendu}}{${denCommun}}+\\dfrac{${num2Etendu}}{${denCommun}}\\\\
&=${miseEnEvidence(`\\dfrac{${num1Etendu + num2Etendu}}{${denCommun}}`)}${
      pgcd(num1Etendu + num2Etendu, denCommun) !== 1
        ? ` = ${miseEnEvidence(resultat.texFractionSimplifiee)}`
        : ''
    }
\\end{aligned}$`
  }

  nouvelleVersion() {
    // 2/3 + 3/4 = 17/12
    if (this.canOfficielle) {
      this.enonce(2, 3, 3, 4)
    } else {
      this.enonce()
    }
  }
}
