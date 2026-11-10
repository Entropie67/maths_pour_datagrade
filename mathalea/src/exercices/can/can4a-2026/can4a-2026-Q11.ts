import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Soustraire une fraction à $1$'
export const interactifReady = true

export const uuid = '4732e'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20264emeQ11 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionEgale: true }
  }

  enonce(n?: number, a?: number, b?: number) {
    if (n == null || a == null || b == null) {
      b = choice([2, 3, 4, 5, 6, 7, 8, 9, 10])
      a = 1
      n = 1
    }
    const entier = new FractionEtendue(n, 1)
    const fraction = new FractionEtendue(a, b)
    const reponse = entier.differenceFraction(fraction)

    this.question = `$${n}-${fraction.texFraction}$`
    this.correction = `$\\begin{aligned}${n}-${fraction.texFraction}&=\\dfrac{${n * b}}{${b}}-${fraction.texFraction}\\\\
    &=\\dfrac{${n * b}-${a}}{${b}}\\\\
    &=${miseEnEvidence(`\\dfrac{${n * b - a}}{${b}}`)}${!reponse.estIrreductible ? `\\\\&=${miseEnEvidence(reponse.texFSD)}` : ''}\\end{aligned}$`

    this.reponse = reponse.texFraction
    if (this.interactif) {
      this.question += '$~=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(1, 7, 6)
    else this.enonce()
  }
}
