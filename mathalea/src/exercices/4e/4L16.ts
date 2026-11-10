import DeterminerDerniereOperationExpressionLitterale from '../5e/5N5D-1'
export const titre =
  'Déterminer si ces expressions sont des sommes, des différences, des produits ou des quotients'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const dateDeModifImportante = '23/03/2026'
export const dateDePublication = '14/08/2021'

/**

 * Déterminer le type d'une expression littérale
 * @author 
 *
 * Interactivite : Olivier Mimeau 23/03/2026
 */

export const uuid = '68cda'
export const refs = {
  'fr-fr': ['4L16'],
  'fr-ch': ['NR'],
}
export default class DeterminerStructureExpressionLitterale extends DeterminerDerniereOperationExpressionLitterale {
  constructor() {
    super()
    this.consigne =
      'Déterminer si ces expressions sont des sommes, des différences, des produits ou des quotients.'
  }
}
