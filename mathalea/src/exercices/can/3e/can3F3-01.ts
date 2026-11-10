import { texFractionReduite } from '../../../lib/outils/deprecatedFractions'
import {
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { abs } from '../../../lib/outils/nombres'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer le coefficient d’une fonction affine'
export const interactifReady = true

export const dateDePublication = '25/10/2021'
export const dateDeModifImportante = '29/03/2026'

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/

export const uuid = '17987'

export const refs = {
  'fr-fr': ['can3F3-01'],
  'fr-ch': ['1mF2-1b'],
}
export default class CoefficientFonctionAffine extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const b = this.quotaRandint('b', -3, 3, [0])
    const c = this.quotaRandint('c', 1, 5)
    const n = this.quotaChoice('n', [-4, -3, -2, 2, 3, 4])
    const d = b + n * c
    if (b > 0) {
      this.question = `$f$ est une fonction affine telle que $f(x)=ax+${b}$ et $f(${c})=${d}$.<br>

    Donner la valeur de $a$.
    `
      this.correction = `Comme $f(${c})=${d}$, on a $a\\times ${c}+${ecritureParentheseSiNegatif(b)}=${d}$, soit $${reduireAxPlusB(c, b, 'a')}=${d}$.<br>
    On en déduit `
      this.correction +=
        c === 1
          ? `$a=${d}-${ecritureParentheseSiNegatif(b)}=${miseEnEvidence(texFractionReduite(d - b, c))}$.`
          : `$${c}a=${d}-${ecritureParentheseSiNegatif(b)}=${d - b}$, d'où $a=\\dfrac{${d - b}}{${c}}=${miseEnEvidence(texFractionReduite(d - b, c))}$.`

      this.reponse = (d - b) / c
    } else {
      this.question = `$f$ est une fonction affine telle que $f(x)=ax-${abs(b)}$ et $f(${c})=${d}$.<br>

      Donner la valeur de $a$.
    `
      this.correction = `Comme $f(${c})=${d}$, on a $a\\times ${c}${b}=${d}$, soit $${reduireAxPlusB(c, b, 'a')}=${d}$.<br>
    On en déduit `
      this.correction +=
        c === 1
          ? `$a=${d}+${-b}=${miseEnEvidence(texFractionReduite(d - b, c))}$.`
          : `$${c}a=${d}+${-b}=${d - b}$, d'où $a=\\dfrac{${d - b}}{${c}}=${miseEnEvidence(texFractionReduite(d - b, c))}$.`

      this.reponse = (d - b) / c
    }

    this.canReponseACompleter = '$a=\\ldots$'
  }
}
