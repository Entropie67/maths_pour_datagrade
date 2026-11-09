import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer la moitié d’une fraction'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '13/09/2022'

/**
 * @author Gilles Mora
 *
 */

export const uuid = '68ea0'

export const refs = {
  'fr-fr': ['can4C22-05', '2N30-flash4'],
  'fr-ch': ['11LCNO2C-8'],
}
export default class CalculMoitieFraction extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionIrreductible: true }
    this.spacingCorr = 2.5
  }

  nouvelleVersion() {
    const listeFractions = [
      [2, 3],
      [2, 5],
      [2, 7],
      [2, 9],
      [2, 11],
      [2, 13],
      [2, 15],
      [4, 3],
      [4, 7],
      [4, 9],
      [4, 11],
      [4, 13],
      [4, 15],
      [6, 5],
      [6, 7],
      [6, 11],
      [6, 13],
      [8, 3],
      [8, 7],
      [8, 9],
      [10, 3],
      [10, 7],
      [10, 9],
      [1, 2],
      [1, 3],
      [1, 4],
      [1, 5],
      [1, 7],
      [1, 9],
      [1, 11],
      [1, 13],
      [1, 15],
      [3, 4],
      [3, 5],
      [3, 7],
      [3, 11],
      [3, 13],
      [5, 3],
      [5, 4],
      [5, 6],
      [5, 7],
      [5, 9],
      [7, 3],
      [7, 4],
      [7, 5],
      [7, 6],
      [7, 8],
      [7, 9],
      [7, 10],
      [9, 4],
      [9, 5],
      [9, 7],
      [9, 10],
    ]

    const a = this.quotaChoice('a', listeFractions)
    const f = new FractionEtendue(a[0], a[1])
    const reponse = new FractionEtendue(a[0], a[1] * 2)
    this.reponse = reponse.simplifie()
    this.question = `Calculer la moitié de $${f.texFraction}$ et écrire le résultat sous la forme d'une fraction simplifiée.<br>`
    this.correction = `Prendre la moitié revient à diviser par $2$ et cela revient à multiplier par $\\dfrac{1}{2}$.<br>
    $${f.texFraction}\\div 2=${f.texFraction}\\times \\dfrac{1}{2}=${reponse.texFraction}${reponse.texSimplificationAvecEtapes()}$<br>
    La moitié de $${f.texFraction}$ est $${miseEnEvidence(this.reponse.texFraction)}$.`
  }
}
