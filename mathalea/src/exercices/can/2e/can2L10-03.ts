import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { arrondi } from '../../../lib/outils/nombres'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Simplifier un quotient'
export const interactifReady = true

export const dateDePublication = '04/01/2023'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/

export const uuid = '0bb5f'

export const refs = {
  'fr-fr': ['can2L10-03', '2L13-flash2'],
  'fr-ch': ['NR'],
}
export default class SimplifierQuotient extends ExerciceSimple {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.optionsChampTexte = { texteAvant: '<br> ' }
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    switch (this.quotaChoice('cas', [1, 2])) {
      case 1: // ax/b
        {
          const a = randint(2, 9)
          const k = randint(-9, 9, [0, 1])
          const maFraction1 = new FractionEtendue(a, k * a)
          if (choice([true, false])) {
            this.question = ` Simplifier l'écriture fractionnaire : $\\dfrac{${a}x}{${k * a}}$.`
            this.correction = `$\\dfrac{${a}x}{${k * a}}=\\dfrac{${a}x}{${k}\\times ${a}}=\\dfrac{x}{${k}}=${miseEnEvidence(`${maFraction1.texFractionSimplifiee}x`)}$`
            this.reponse = [`\\dfrac{x}{${k}}`, `${arrondi(1 / k, 2)}x`]
          } else {
            this.question = ` Simplifier l'écriture fractionnaire : $\\dfrac{${k * a}x}{${a}}$.`
            this.correction = `$\\dfrac{${k * a}x}{${a}}=\\dfrac{${a}\\times ${ecritureParentheseSiNegatif(k)}x}{${a}}=${miseEnEvidence(`${rienSi1(k)}x`)}$`
            this.reponse = [`${k}x`]
          }
        }
        break
      case 2:
        {
          const a = randint(1, 9)
          const k = randint(-9, 9, [-1, 0, 1])
          const b = randint(-9, 9, 0)
          if (choice([true, false])) {
            this.question = ` Simplifier l'écriture fractionnaire : $\\dfrac{${k * a}x${ecritureAlgebrique(k * b)}}{${k}}$.`
            this.correction = `$\\dfrac{${k * a}x${ecritureAlgebrique(k * b)}}{${k}}=\\dfrac{${k}(${rienSi1(a)}x${ecritureAlgebrique(b)})}{${k}}=${miseEnEvidence(`${rienSi1(a)}x${ecritureAlgebrique(b)}`)}$.`
            this.reponse = [`${a}x+${b}`]
          } else {
            this.question = ` Simplifier l'écriture fractionnaire : $\\dfrac{${k}x${ecritureAlgebrique(k * b)}}{${k}}$.`
            this.correction = `$\\dfrac{${k}x${ecritureAlgebrique(k * b)}}{${k}}=\\dfrac{${k}(x${ecritureAlgebrique(b)})}{${k}}=${miseEnEvidence(`x${ecritureAlgebrique(b)}`)}$.`
            this.reponse = [`x+${b}`]
          }
        }
        break
    }
  }
}
