import CalculsComplexes from '../HP/HPC106'
export const interactifReady = true

export const titre = 'Sommes algébriques de nombres complexes'
export const dateDePublication = '25/06/2026'
export const uuid = '9e72f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Jean-Claude Lhote
 * Exercice proposant des calculs avec la forme algébrique des nombres complexes
 */
export default class CalculSommeComplexes extends CalculsComplexes {
  constructor() {
    super()
    this.nbQuestions = 5
    this.sup = '1'
    this.besoinFormulaireTexte = false
  }
}
