import OperationsSurDecimauxOld from '../5e/5N2autoAOld'
export const titre =
  'Additionner, soustraire des nombres décimaux à une ou deux décimales'
export const dateDePublication = '20/07/2026'
export const interactifReady = true

/**
 * @author Éric Elter
 */

export const uuid = 'dc090'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class OperationsSurDecimaux6eAddSoustOld extends OperationsSurDecimauxOld {
  constructor() {
    super()
    this.nbQuestions = 4
    this.version = '6eAdditionSoustraction'
    this.besoinFormulaireTexte = [
      'Choix des opérations',
      'Nombres séparés par des tirets  :\n1 : Addition\n2 : Soustraction\n3 : Mélange',
    ]
    this.sup = '3'
    this.besoinFormulaire3CaseACocher = ['Sans retenue']
    this.comment =
      "Le paramètre, sur le nombre différent de décimales dans les deux nombres de l'opération, ne fonctionne que si le paramètre 2 indique 2 décimales maximum.<br><br>"
  }
}
