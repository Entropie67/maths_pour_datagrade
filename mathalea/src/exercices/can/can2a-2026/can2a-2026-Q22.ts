import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer la probabilité d'un événement contraire"
export const interactifReady = true

export const uuid = 'e59ik'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q22 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    }
  }

  enonce(n?: number, d?: number): void {
    if (n == null || d == null) {
      const listeFractions: [number, number][] = [
        [1, 2],
        [1, 3],
        [2, 3],
        [1, 4],
        [3, 4],
        [1, 5],
        [2, 5],
        [3, 5],
        [4, 5],
        [1, 6],
        [5, 6],
        [1, 7],
        [2, 7],
        [3, 7],
        [4, 7],
        [5, 7],
        [6, 7],
        [1, 8],
        [3, 8],
        [5, 8],
        [7, 8],
        [1, 9],
        [2, 9],
        [4, 9],
        [5, 9],
        [7, 9],
        [8, 9],
        [1, 10],
        [3, 10],
        [7, 10],
        [9, 10],
      ]
      const fraction = choice(listeFractions)
      n = fraction[0]
      d = fraction[1]
    }

    const nSurD = new FractionEtendue(n, d)
    const dMoinsNSurD = new FractionEtendue(d - n, d)

    this.reponse = new FractionEtendue(d - n, d).toLatex()

    this.question = `Un événement $B$ a pour probabilité $P(B)=${nSurD.texFraction}$.`

    this.correction = `La relation entre la probabilité d'un événement $B$ et celle de son contraire $\\overline{B}$ est : $P(\\overline{B})=1-P(B)$.<br>
    Ainsi : $P(\\overline{B})=1-\\dfrac{${n}}{${d}}=${miseEnEvidence(dMoinsNSurD.texFraction)}$.`

    this.canEnonce = `Un événement $B$ a pour probabilité $P(B)=${nSurD.texFraction}$.`
    this.canReponseACompleter = '$P(\\overline{B})=\\ldots$'

    if (this.interactif) {
      this.question += '<br>$P(\\overline{B})=$'
    } else {
      this.question += '<br>$P(\\overline{B})=\\ldots$'
    }
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(3, 5)
    else this.enonce()
  }
}
