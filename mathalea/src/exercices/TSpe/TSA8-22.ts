import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const titre = 'Calculer une intégrale $2$'
export const interactifReady = true

export const dateDePublication = '05/04/2025'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Stéphane Guyon

 *
*/
export const uuid = '0f7aa'

export const refs = {
  'fr-fr': ['TSA8-22', 'TCA6-13'],
  'fr-ch': ['4mExpLog-1'],
}
export default class IntegraleAffine extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierFonctionsTerminales
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const c = randint(-5, 5, 0)
    const d = randint(-5, 5, 0)
    let a = 0
    let b = 0
    const racine = Math.floor(-d / c) + 1
    if (c > 0) {
      a = randint(racine, racine + 5)
      b = randint(a, a + 5, a)
    }
    if (c < 0) {
      b = randint(racine - 6, racine - 2, a)
      a = randint(b - 6, b - 1)
    }
    const resultat = new FractionEtendue(c * b + d, c * a + d)

    this.question = `Calculer $I=\\displaystyle\\int_{${a}}^{${b}} \\left(\\dfrac{${c}}{${reduireAxPlusB(c, d)}}\\right)\\mathrm{d}x$<br>`

    if (this.interactif) {
      this.question += '<br>$I=$ '
    }
    this.correction = `Soit $x\\in [${a} ; ${b}]$. Posons $u(x)=${reduireAxPlusB(c, d)}$. On a alors $u'(x)=${c}$. <br>On observe que  $\\dfrac{u'(x)}{u(x)}=\\dfrac{${c}}{${reduireAxPlusB(c, d)}}$.<br>`
    this.correction += `Comme pour tout $x\\in [${a} ; ${b}]$, $u(x)>0$, on en déduit qu'une primitive de $\\dfrac{u'(x)}{u(x)}$ est $\\ln(u)$.<br>`
    this.correction += ` $\\begin{aligned}\\displaystyle\\int_{${a}}^{${b}} \\left(\\dfrac{${c}}{${reduireAxPlusB(c, d)}}\\right)\\mathrm{d}x
    &=\\displaystyle\\int_{${a}}^{${b}} \\left(\\dfrac{u'(x)}{u(x)}\\right) \\mathrm{d}x\\\\
    &=\\Bigl[\\ln(u(x))\\Bigr]_{${a}}^{${b}}\\\\
    &=\\Bigl[\\ln\\left(${reduireAxPlusB(c, d)}\\right)\\Bigr]_{${a}}^{${b}}\\\\
   &=\\ln\\left(${c}\\times${ecritureParentheseSiNegatif(b)}${ecritureAlgebrique(d)}\\right)-\\ln\\left(${c}\\times${ecritureParentheseSiNegatif(a)}${ecritureAlgebrique(d)}\\right)\\\\
    &=\\ln\\left(${c * b + d}\\right)-\\ln\\left(${c * a + d}\\right)\\\\
    &=\\ln\\left(\\dfrac{${c * b + d}}{${c * a + d}}\\right)
    \\end{aligned}$<br>`
    if (resultat.estIrreductible === false) {
      this.correction += `En simplifiant, on obtient $I=\\ln\\left(${resultat.texFractionSimplifiee}\\right)$<br>`
    }
    this.correction += `On a donc $I=${miseEnEvidence(`\\ln\\left(${resultat.texFractionSimplifiee}\\right)`)}.$`
    this.reponse = `\\ln(${resultat.texFractionSimplifiee})`
  }
}
