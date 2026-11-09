import { tableauColonneLigne } from '../../../lib/2d/tableau'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une probabilité dans un tableau'
export const interactifReady = true

export const uuid = '155bb'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['4mProbStat-9'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N5Q23 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.canOfficielle = true
  }

  nouvelleVersion() {
    const listeFrac = this.canOfficielle
      ? [[1, 2, 1, 7]]
      : [
          [1, 2, 2, 7],
          [2, 2, 2, 9],
          [1, 2, 2, 9],
          [2, 2, 2, 7],
          [3, 2, 1, 7],
          [4, 1, 2, 9],
          [2, 4, 1, 9],
        ]

    const frac = choice(listeFrac)
    const num1 = frac[0]
    const num2 = frac[1]
    const num3 = frac[2]
    const den = frac[3]
    const frac1 = new FractionEtendue(num1, den)
    const frac2 = new FractionEtendue(num2, den)
    const frac3 = new FractionEtendue(num3, den)
    this.reponse = new FractionEtendue(
      den - num1 - num2 - num3,
      den,
    ).texFraction
    this.canEnonce = tableauColonneLigne(
      ['x_i', '-1', '0', '1', '2'],
      ['P(X=x_i)'],
      [
        `${frac1.texFraction}`,
        `${frac2.texFraction}`,
        `${frac3.texFraction}`,
        '\\ldots',
      ],
      2.5,
    )
    this.question = this.canEnonce + '<br>'
    this.question += '<br> $P(X=2)=$'
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.correction = ` La somme des probabilités doit être égale à $1$.<br>
    Ainsi, $P(X=2)=1-${frac1.texFraction}-${frac2.texFraction}-${frac3.texFraction}=${miseEnEvidence(this.reponse)}$.`

    this.canReponseACompleter = '$P(X=2)=\\ldots$'
  }
}
