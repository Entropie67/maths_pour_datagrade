import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  'Calculer une somme ou une différence de nombre entier et de fraction'
export const interactifReady = true

export const uuid = 'asqfy'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q2 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionEgale: true }
  }

  enonce(a?: number, num?: number, den?: number, addition?: boolean) {
    const listeFractions = [
      [1, 3],
      [2, 3],
      [3, 7],
      [2, 7],
      [4, 3],
      [3, 5],
      [4, 7],
      [1, 5],
      [3, 5],
      [3, 4],
      [2, 9],
      [1, 9],
      [7, 9],
      [1, 8],
      [5, 8],
    ]

    if (a == null || num == null || den == null || addition == null) {
      a = randint(1, 9)
      const b = choice(listeFractions)
      num = b[0]
      den = b[1]
      addition = choice([true, false])
    }

    const f = new FractionEtendue(num, den)

    if (addition) {
      const reponse = new FractionEtendue(a * den + num, den)
      this.question = `$${a}+${f.texFraction}$`
      this.correction = `$${a}+${f.texFraction}= \\dfrac{${a * den}}{${den}}+${f.texFraction}=${miseEnEvidence(reponse.texFraction)}${reponse.texSimplificationAvecEtapes()}$`
      this.reponse = reponse
    } else {
      const reponse = new FractionEtendue(a * den - num, den)
      this.question = `$${a}-${f.texFraction}$`
      this.correction = `$${a}-${f.texFraction}= \\dfrac{${a * den}}{${den}}-${f.texFraction}=${miseEnEvidence(reponse.texFraction)}${reponse.texSimplificationAvecEtapes()}$`
      this.reponse = reponse
    }
    if (this.interactif) {
      this.question += '$=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(2, 1, 3, false)
    else this.enonce()
  }
}
