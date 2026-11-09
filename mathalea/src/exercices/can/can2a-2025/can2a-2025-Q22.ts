import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer la probabilité d'un événement contraire"
export const interactifReady = true

export const uuid = '71ddc'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class ProbaEvenementContraire extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionEgale: true }
  }

  nouvelleVersion() {
    const listeFractions = this.canOfficielle
      ? [[2, 3]]
      : [
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
        ] // Couples de nombres premiers entre eux
    const fraction = choice(listeFractions)
    const n = fraction[0]
    const d = fraction[1]
    const nSurD = new FractionEtendue(n, d)
    const dMoinsNSurD = new FractionEtendue(d - n, d)
    this.question = `Un événement $A$ a pour probabilité $P(A)=${nSurD.texFraction}$.`
    if (this.interactif) {
      this.question += '<br> $P(\\overline{A})=$'
    } else {
      this.question += '<br> $P(\\overline{A})=\\ldots$'
    }

    this.correction = `La relation entre la probabilité d'un événement $A$ et celle de son contraire $\\overline{A}$ est :  $P(\\overline{A})=1-P(A)$.<br>
          Ainsi : $P(\\overline{A})=1-\\dfrac{${n}}{${d}}=${miseEnEvidence(dMoinsNSurD.texFraction)}$.`
    this.reponse = new FractionEtendue(d - n, d)
    this.canEnonce = `Un événement $A$ a pour probabilité $P(A)=${nSurD.texFraction}$.`
    this.canReponseACompleter = '$P(\\overline{A})=\\ldots$'
  }
}
