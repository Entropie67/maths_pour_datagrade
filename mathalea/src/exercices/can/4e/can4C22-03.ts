import { pgcd } from '../../../lib/outils/primalite'
import { orangeMathalea } from '../../../lib/colors'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { simplificationDeFractionAvecEtapes } from '../../../lib/outils/deprecatedFractions'
import {
  fraction,
  obtenirListeFractionsIrreductibles,
} from '../../../modules/fractions'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Calculer la différence de fractions à dénominateurs compatibles'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021

 */
export const uuid = 'da898'

export const refs = {
  'fr-fr': ['can4C22-03'],
  'fr-ch': ['11LCNO2C-7'],
}
export default class DifferenceFractionsCompatibles extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    const a = this.quotaChoice('a', obtenirListeFractionsIrreductibles())
    const c = this.quotaChoice('c', [2, 3])
    const b = fraction(1, a.d * c)
    this.question = `Calculer $${a.texFraction} - ${b.texFraction}$.`
    this.correction = `Pour soustraire des fractions, on les met au même dénominateur.<br>
    <br>
    Pour écrire $${a.texFraction}$ avec le même dénominateur que $${b.texFraction}$,
    on multiplie son numérateur et son dénominateur par $${c}$.<br><br>
    Ainsi,
    $${a.texFraction} - ${b.texFraction}=
   \\dfrac{${a.n}\\times ${c}}{${a.d}\\times ${c}}- ${b.texFraction}
    =${a.reduire(c).texFraction} - ${b.texFraction}=\\dfrac{${a.n * c}-${b.n}}{${b.d}}${pgcd(a.n * c - b.n, b.d) === 1 && (a.n * c - b.n) * (b.d) > 0 ? `=${miseEnEvidence(`\\dfrac{${a.n * c - b.n}}{${b.d}}`)}` : `=\\dfrac{${a.n * c - b.n}}{${b.d}}${simplificationDeFractionAvecEtapes(a.n * c - b.n, b.d, { couleur2: orangeMathalea })}`}$`
    this.reponse = a.differenceFraction(b).simplifie()
  }
}
