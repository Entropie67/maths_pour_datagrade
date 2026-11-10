import OperationsSurDecimauxOld from '../5e/5N2autoAOld'
export const titre = 'Multiplier des nombres décimaux à une ou deux décimales'
export const dateDePublication = '20/07/2026'
export const interactifReady = true

/**
 * @author Éric Elter
 */

export const uuid = 'c0436'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class OperationsSurDecimaux6eMultOld extends OperationsSurDecimauxOld {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = false
    this.besoinFormulaire3CaseACocher = false
    this.besoinFormulaire4CaseACocher = [
      "Nombre différent de décimales dans les deux facteurs de l'opération",
    ]
    this.sup = '3'
    this.comment =
      "Si le paramètre indique 2 décimales maximum, ce ne sera appliqué qu'à seul des deux facteurs pour permettre un calcul de tête."
  }
}
