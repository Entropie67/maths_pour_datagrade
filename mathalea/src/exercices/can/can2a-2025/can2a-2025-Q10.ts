import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer avec des fractions'
export const interactifReady = true

export const uuid = '9e8a8'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class SommeEntierFraction extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = new FractionEtendue(2, 5).texFraction
      this.question = '$1-\\dfrac{3}{5}$ '
      this.correction = `On a : <br>
      $\\begin{aligned}
      1-\\dfrac{3}{5} &= \\dfrac{5}{5} - \\dfrac{3}{5}\\\\
      &  =${miseEnEvidence('\\dfrac{2}{5}')}
      \\end{aligned}$`
    } else {
      const listeFractions2 = [
        [1, 3],
        [2, 3],
        [3, 7],
        [2, 7],
        [4, 3],
        [5, 3],
        [4, 7],
        [1, 5],
        [3, 5],
        [1, 7],
        [2, 9],
        [1, 9],
        [7, 9],
        [1, 8],
        [5, 8],
      ]
      const frac = choice(listeFractions2)
      const a = randint(1, 2)
      const b = frac[0]
      const c = frac[1]
      const bSurC = new FractionEtendue(b, c)
      const d = new FractionEtendue(a * c - b, c).texFraction
      this.reponse = d
      this.question = `$${a}-${bSurC.texFraction}$ `
      this.correction = `On a : <br>$\\begin{aligned}
      ${a}+${bSurC.texFraction} &= \\dfrac{${a} \\times ${c}}{${c}} - ${bSurC.texFraction} \\\\
      &= \\dfrac{${a * c}}{${c}} - ${bSurC.texFraction}\\\\
      &  =${miseEnEvidence(d)}
      \\end{aligned}$`
    }
  }
}
