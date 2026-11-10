import CalculsComplexes from '../HP/HPC106'

export const interactifReady = true

export const titre = 'Produits complexes'
export const dateDePublication = '25/06/2026'
export const uuid = '9f83f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * @author Jean-Claude Lhote
 * Exercice proposant des calculs avec la forme algébrique des nombres complexes
 */
export default class CalculProduitsComplexes extends CalculsComplexes {
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup = '5'
    this.besoinFormulaireTexte = false
  }
}
