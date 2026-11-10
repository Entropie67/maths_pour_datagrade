import CalculsComplexes from '../HP/HPC106'
export const interactifReady = true

export const titre = 'Produits de nombres complexes'
export const dateDePublication = '25/06/2026'
export const uuid = '9f72f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-Claude Lhote
 * Exercice proposant des calculs avec la forme algébrique des nombres complexes
 */
export default class CalculProduitComplexes extends CalculsComplexes {
  constructor() {
    super()
    this.nbQuestions = 3
    this.sup = '2'
    this.besoinFormulaireTexte = false
  }
}
