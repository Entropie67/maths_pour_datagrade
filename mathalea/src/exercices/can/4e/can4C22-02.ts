import { pgcd } from '../../../lib/outils/primalite'
import { orangeMathalea } from '../../../lib/colors'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { simplificationDeFractionAvecEtapes } from '../../../lib/outils/deprecatedFractions'
import {
  fraction,
  obtenirListeFractionsIrreductibles,
} from '../../../modules/fractions'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Déterminer la somme de fractions à dénominateurs compatibles'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021

 */
export const uuid = '1b4fe'

export const refs = {
  'fr-fr': ['can4C22-02'],
  'fr-ch': ['11LCNO2C-6'],
}
export default class SommeFractionsCompatibles extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = this.quotaChoice('a', obtenirListeFractionsIrreductibles())
    const c = this.quotaChoice('c', [2, 4])
    const b = fraction(1, a.d * c)
    if (this.quotaChoice('booleen', [true, false])) {
      this.question = `Calculer $${a.texFraction} + ${b.texFraction}$.`
      this.correction = `Pour additionner des fractions, on les met au même dénominateur.<br>
     <br>
     Pour écrire $${a.texFraction}$ avec le même dénominateur que $${b.texFraction}$,
     on multiplie son numérateur et son dénominateur par $${c}$.<br><br>
     Ainsi, $${a.texFraction} + ${b.texFraction}
     =\\dfrac{${a.n}\\times ${c}}{${a.d}\\times ${c}}+ ${b.texFraction}
    =${a.reduire(c).texFraction} + ${b.texFraction}
    =\\dfrac{${a.n * c}+${b.n}}{${b.d}}
    ${pgcd(a.n * c + b.n, b.d) === 1 && (a.n * c + b.n) * (b.d) > 0 ? `=${miseEnEvidence(`\\dfrac{${a.n * c + b.n}}{${b.d}}`)}` : `=\\dfrac{${a.n * c + b.n}}{${b.d}}${simplificationDeFractionAvecEtapes(a.n * c + b.n, b.d, { couleur2: orangeMathalea })}`}$`
    } else {
      this.question = `Calculer $ ${b.texFraction}+${a.texFraction}$.`
      this.correction = `Pour additionner des fractions, on les met au même dénominateur.<br>
     <br>
     Pour écrire $${a.texFraction}$ avec le même dénominateur que $${b.texFraction}$,
     on multiplie son numérateur et son dénominateur par $${c}$.<br><br>
     Ainsi, $ ${b.texFraction}+${a.texFraction}
     = ${b.texFraction}+\\dfrac{${a.n}\\times ${c}}{${a.d}\\times ${c}}
    =${b.texFraction}+${a.reduire(c).texFraction}
    =\\dfrac{${b.n}+${a.n * c}}{${b.d}}
    ${pgcd(a.n * c + b.n, b.d) === 1 && (a.n * c + b.n) * (b.d) > 0 ? `=${miseEnEvidence(`\\dfrac{${b.n + a.n * c}}{${b.d}}`)}` : `=\\dfrac{${b.n + a.n * c}}{${b.d}}${simplificationDeFractionAvecEtapes(a.n * c + b.n, b.d, { couleur2: orangeMathalea })}`}$`
    }

    this.reponse = a.sommeFraction(b).simplifie()
  }
}
