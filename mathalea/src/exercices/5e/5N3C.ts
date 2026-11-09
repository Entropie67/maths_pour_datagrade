import ProblemesAdditifsFractionsBis from '../4e/4C25-0'
export const titre =
  'Résoudre des problèmes additifs et de comparaison sur les fractions'
export const dateDePublication = '21/05/2025'
export const interactifReady = true

/**
 * Résoudre des problèmes additifs et de comparaison sur les fractions
 * @author Éric Elter
 * Créé par Éric Elter après changements effectués dans 4C25-0
 */

export const uuid = 'a3914'

export const refs = {
  'fr-fr': ['5N3C'],
  'fr-2016': ['5N22-1'],
  'fr-ch': ['NR'],
}
export default class ProblemesAdditifsFractions5eBis extends ProblemesAdditifsFractionsBis {
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup = '1-2'
    this.sup2 = true
  }
}
