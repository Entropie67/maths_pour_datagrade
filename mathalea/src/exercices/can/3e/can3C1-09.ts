import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { pgcd } from '../../../lib/outils/primalite'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Compléter une égalité avec l'inverse"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '18/10/2026'

/**
 * @author Gilles Mora
 */

export const uuid = '2dfe9'

export const refs = {
  'fr-fr': ['can3C1-09'],
  'fr-ch': ['11LCNO2C-3'],
}
export default class CompleterInverseFraction extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    // fraction : a/b quelconque, entier : n, unitaire : 1/n
    const cas = this.quotaChoice('cas', [
      'fraction',
      'fraction',
      'entier',
      'unitaire',
    ])
    let num: number
    let den: number
    if (cas === 'fraction') {
      do {
        num = randint(2, 11)
        den = randint(2, 11, num)
      } while (pgcd(num, den) !== 1)
    } else if (cas === 'entier') {
      num = randint(2, 12)
      den = 1
    } else {
      num = 1
      den = randint(2, 12)
    }
    const f = new FractionEtendue(num, den)
    const inverse = new FractionEtendue(den, num)
    const texF = f.texFraction
    const texInverse = inverse.texFraction

    this.reponse = inverse
    this.optionsChampTexte = {
      texteAvant: `<br>$${texF}\\times$`,
      texteApres: '$=1$',
    }
    this.question = this.interactif
      ? "Compléter l'égalité."
      : `Compléter : $${texF}\\times \\ldots=1$.`

    let correction =
      "Deux nombres dont le produit est égal à $1$ sont inverses l'un de l'autre.<br>"
    if (cas === 'fraction') {
      correction += `L'inverse de $${texF}$ est $${texInverse}$.<br>`
    } else if (cas === 'entier') {
      correction += `L'inverse de $${num}$ est $${texInverse}$.<br>`
    } else {
      correction += `L'inverse de $${texF}$ est $\\dfrac{${den}}{1}=${texInverse}$.<br>`
    }
    correction += `Ainsi, $${texF}\\times ${miseEnEvidence(texInverse)}=1$.`
    this.correction = correction

    this.canEnonce = 'Compléter.'
    this.canReponseACompleter = `$${texF}\\times \\ldots=1$`
  }
}
