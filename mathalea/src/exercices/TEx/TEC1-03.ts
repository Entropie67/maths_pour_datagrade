import CalculsComplexes from '../HP/HPC106'
export const interactifReady = true

export const titre = 'Quotients de nombres complexes'
export const dateDePublication = '25/06/2026'
export const uuid = '9e82f'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * @author Jean-Claude Lhote
 * Exercice proposant des calculs avec la forme algébrique des nombres complexes
 */
export default class CalculQuotientComplexes extends CalculsComplexes {
  constructor() {
    super()
    this.nbQuestions = 3
    this.sup = '3'
    this.besoinFormulaireTexte = false
  }
}
