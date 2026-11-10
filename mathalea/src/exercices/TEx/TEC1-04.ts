import CalculsComplexes from '../HP/HPC106'
export const interactifReady = true

export const titre = 'Sommes algébriques complexes'
export const dateDePublication = '25/06/2026'
export const uuid = '9e83f'
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
    this.nbQuestions = 2
    this.sup = '4'
    this.besoinFormulaireTexte = false
  }
}
