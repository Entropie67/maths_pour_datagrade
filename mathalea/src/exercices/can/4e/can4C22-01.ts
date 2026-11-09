import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { obtenirListeFractionsIrreductibles } from '../../../modules/fractions'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Effectuer une division avec une fraction'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModifImportante = '17/05/2025'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021

 */
export const uuid = '22c4c'

export const refs = {
  'fr-fr': ['can4C22-01', '2N31-flash5'],
  'fr-ch': ['11LCNO2C-5'],
}
export default class QuotientEntierQuiVaBienParFraction extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionEgale: true }
  }

  nouvelleVersion() {
    const a = this.quotaChoice('a', obtenirListeFractionsIrreductibles())
    const c = this.quotaChoice('c', [2, 3, 4, 5, 6])
    const b = a.n * c
    this.question = `Calculer $${b}\\div ${a.texFraction}$.<br>`
    this.reponse = new FractionEtendue(b * a.d, a.n)
    if (a.n === 1) {
      this.correction = `Diviser par un nombre revient à multiplier par son inverse. <br>
    Ici, on divise par $${a.texFraction}$, donc cela revient à multiplier par son inverse : $${a.inverse().texFraction}$.<br>
    $${b}\\div ${a.texFraction}=${b}\\times ${a.inverse().texFraction}=
        ${miseEnEvidence(c * a.d)}$`
    } else {
      this.correction = `Diviser par un nombre revient à multiplier par son inverse. <br>
    Ici, on divise par $${a.texFraction}$, donc cela revient à multiplier par son inverse :  $${a.inverse().texFraction}$.<br>
    $${b}\\div ${a.texFraction}=${b}\\times ${a.inverse().texFraction}=
    \\dfrac{${b}\\times ${a.d}}{${a.n}}=
    ${c}\\times ${a.d}=${miseEnEvidence(c * a.d)}$`
      this.correction += texteEnCouleur(`<br> Mentalement : <br>
    Pour multiplier $${b}$ par $${a.inverse().texFraction}$,
    on commence par diviser $${b}$ par $${a.n}$, ce qui donne $${b / a.n}$,
     puis on multiplie par $${a.d}$, ce qui donne $${b / a.n}\\times ${a.d}=${c * a.d}$.      `)
    }
  }
}
