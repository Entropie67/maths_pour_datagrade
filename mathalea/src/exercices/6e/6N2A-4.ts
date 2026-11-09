import OperationsSurDecimaux from '../5e/5N2autoA'
export const titre =
  'Additionner, soustraire des nombres décimaux à une ou deux décimales'
export const dateDePublication = '20/07/2026'
export const dateDeModifImportante = '22/09/2026'
export const interactifReady = true

/**
 * @author Éric Elter
 */

export const uuid = 'dc09e'

export const refs = {
  'fr-fr': ['6N2A-4'],
  'fr-ch': ['NR'],
}
export default class OperationsSurDecimaux6eAddSoust extends OperationsSurDecimaux {
  constructor() {
    super()
    this.nbQuestions = 4
    this.version = '6eAdditionSoustraction'
    this.besoinFormulaireTexte = [
      'Choix des opérations',
      'Nombres séparés par des tirets  :\n1 : Addition\n2 : Soustraction\n3 : Mélange',
    ]
    this.sup = '1-2'
    this.besoinFormulaire4CaseACocher = ['Sans retenue']
  }
}
