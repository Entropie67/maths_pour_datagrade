import { orangeMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Rendre une fraction irréductible'
export const interactifReady = true

export const uuid = '84545'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * @author Gilles Mora
 */
export default class MultiplicationFractions extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionIrreductible: true }
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.question =
        "Écrire sous forme d'une fraction irréductible $\\dfrac{-5}{7}\\times \\dfrac{3}{5}$."
      this.reponse = new FractionEtendue(-3, 7).simplifie().texFraction
      this.correction = `$\\begin{aligned}
     \\dfrac{-5}{7}\\times \\dfrac{3}{5}&=\\dfrac{-\\cancel{5}\\times 3}{7\\times \\cancel{5}}\\\\
      &=${miseEnEvidence('-\\dfrac{3}{7}')}
      \\end{aligned}$`
      this.canEnonce =
        "Écrire sous forme d'une fraction irréductible <br> \\vspace{0.2cm} $\\dfrac{-5}{7}\\times \\dfrac{3}{5}$."
    } else {
      const listeFractions1 = [
        [1, 3, -3, 5],
        [1, 5, -5, 7],
        [-8, 3, -5, 8],
        [-9, 7, -7, 8],
        [4, 5, -5, 7],
        [-7, 4, -4, 9],
        [-6, 5, 5, 7],
        [3, 7, -7, 9],
        [9, 4, -7, 9],
        [5, 6, -7, 5],
      ]

      const fraction1 = choice(listeFractions1)

      const n1 = fraction1[0]
      const d1 = fraction1[1]
      const n2 = fraction1[2]
      const d2 = fraction1[3]
      const f1 = new FractionEtendue(n1, d1)
      const f2 = new FractionEtendue(n2, d2)
      const frac = new FractionEtendue(n1 * n2, d1 * d2)
      this.reponse = f1.produitFraction(f2).simplifie().texFraction
      this.question = `Écrire sous forme d'une fraction irréductible $${f1.texFraction}\\times ${f2.texFraction}$.`

      this.correction = `$${f1.texFraction}\\times ${f2.texFraction}${frac.texSimplificationAvecEtapes(false, orangeMathalea)}$`
      this.canEnonce = `Écrire sous forme d'une fraction irréductible <br> \\vspace{0.2cm} $${f1.texFraction}\\times ${f2.texFraction}$.`
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
