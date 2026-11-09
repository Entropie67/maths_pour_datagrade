import { tableauColonneLigne } from '../../../lib/2d/tableau'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une espérance'
export const interactifReady = true

export const uuid = '01965'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['4mProbStat-4'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025TQ17 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.canOfficielle = true
  }

  nouvelleVersion() {
    const listeFrac = this.canOfficielle
      ? [[1, 2, 1, 3, 7]]
      : [
          [1, 2, 2, 3, 7],
          [2, 2, 2, 3, 9],
          [1, 2, 2, 4, 9],
          [2, 2, 2, 1, 7],
          [3, 2, 1, 1, 7],
          [4, 1, 2, 1, 9],
          [2, 4, 1, 2, 9],
          [3, 1, 1, 3, 8],
        ]

    const frac = choice(listeFrac)
    const num1 = frac[0]
    const num2 = frac[1]
    const num3 = frac[2]
    const num4 = frac[3]
    const den = frac[4]
    const v1 = this.canOfficielle ? 1 : randint(1, 2)
    const v2 = v1 + 1
    const frac1 = new FractionEtendue(num1, den)
    const frac2 = new FractionEtendue(num2, den)
    const frac3 = new FractionEtendue(num3, den)
    const frac4 = new FractionEtendue(num4, den)
    const fractionReponse = new FractionEtendue(
      num1 * -1 + num3 * v1 + num4 * v2,
      den,
    )
    this.reponse = fractionReponse.texFraction
    this.question =
      tableauColonneLigne(
        ['x_i', '-1', '0', `${v1}`, `${v2}`],
        ['P(X=x_i)'],
        [
          `${frac1.texFraction}`,
          `${frac2.texFraction}`,
          `${frac3.texFraction}`,
          `${frac4.texFraction}`,
        ],
      ) + '<br>'
    this.question += '<br> $E(X)=$'

    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.correction = ` On calcule l'espérance :<br>
    $\\begin{aligned}
    E(X)&=-1\\times ${frac1.texFraction}+0\\times ${frac2.texFraction}+${v1}\\times ${frac3.texFraction}+${v2}\\times ${frac4.texFraction}\\\\
    &=  ${(fractionReponse.estEntiere || !fractionReponse.estIrreductible) && fractionReponse.num !== 0 ? this.reponse : miseEnEvidence(this.reponse)}`
    if (
      (fractionReponse.estEntiere || !fractionReponse.estIrreductible) &&
      fractionReponse.num !== 0
    )
      this.correction += `\\\\&=${miseEnEvidence(fractionReponse.texFractionSimplifiee)}`
    this.correction += '\\end{aligned}$'

    this.canEnonce = tableauColonneLigne(
      ['x_i', '-1', '0', `${v1}`, `${v2}`],
      ['P(X=x_i)'],
      [
        `${frac1.texFraction}`,
        `${frac2.texFraction}`,
        `${frac3.texFraction}`,
        `${frac4.texFraction}`,
      ],
    )
    this.canReponseACompleter = '$E(X)=\\ldots$'
  }
}
