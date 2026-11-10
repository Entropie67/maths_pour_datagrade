import OperationsSurDecimaux from '../5e/5N2autoA'
export const titre = 'Multiplier des nombres décimaux à une ou deux décimales'
export const dateDePublication = '20/07/2026'
export const dateDeModifImportante = '22/09/2026'
export const interactifReady = true

/**
 * @author Éric Elter
 */

export const uuid = 'c043e'

export const refs = {
  'fr-fr': ['6N2E-6'],
  'fr-ch': ['NR'],
}
export default class OperationsSurDecimaux6eMult extends OperationsSurDecimaux {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = false
    this.sup = '3'
    this.besoinFormulaire4CaseACocher = false
    this.comment = ''
  }
}
