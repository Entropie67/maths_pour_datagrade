import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const titre = "Calculer l'intégrale d'une fonction affine"
export const interactifReady = true

export const dateDePublication = '05/04/2025'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Stéphane Guyon

 *
*/
export const uuid = 'd5828'

export const refs = {
  'fr-fr': ['TSA8-20', 'TCA6-11'],
  'fr-ch': [],
}
export default class IntegraleAffine extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'

    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.optionsChampTexte = { texteAvant: '<br>$I=$ ' }
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = randint(-5, 5)
    const b = randint(a, a + 5, a)
    const c = randint(-5, 5, 0)
    const d = randint(-5, 5, 0)
    const fraction = new FractionEtendue(c, 2)
    const fraction2 = new FractionEtendue(c * b * b, 2)
    const fraction3 = new FractionEtendue(c * a * a, 2)
    this.question = `Calculer $I=\\displaystyle\\int_{${a}}^{${b}} \\left(${reduireAxPlusB(c, d)}\\right)\\mathrm{d}x$<br>`

    this.reponse = (b ** 2 * c) / 2 + b * d - (a ** 2 * c) / 2 - a * d
    this.correction = `$\\begin{aligned}\\displaystyle\\int_{${a}}^{${b}} \\left(${reduireAxPlusB(c, d)}\\right)\\ \\mathrm{d}x&=\\Bigl[${rienSi1(fraction.simplifie())}x^2 ${ecritureAlgebriqueSauf1(d)}x\\Bigr]_{${a}}^{${b}}\\\\
    &=\\left(${c === 2 ? '' : c === -2 ? '-' : `${fraction.texFractionSimplifiee}\\times`}${ecritureParentheseSiNegatif(b)}^2 ${d === 1 ? '+' : d === -1 ? '-' : `${ecritureAlgebrique(d)}\\times`} ${ecritureParentheseSiNegatif(b)}\\right)-
    \\left( ${c === 2 ? '' : c === -2 ? '-' : `${fraction.texFractionSimplifiee}\\times`}${ecritureParentheseSiNegatif(a)}^2 ${d === 1 ? '+' : d === -1 ? '-' : `${ecritureAlgebrique(d)}\\times`} ${ecritureParentheseSiNegatif(a)}\\right)\\\\
    &=${fraction2.texFractionSimplifiee}${ecritureAlgebrique(d * b)}-\\left(${fraction3.texFractionSimplifiee}${ecritureAlgebrique(d * a)}\\right)\\\\
    &=${miseEnEvidence(texNombre(this.reponse))}\\end{aligned}$`
  }
}
