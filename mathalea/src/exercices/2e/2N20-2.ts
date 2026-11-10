import TableauCriteresDeDivisibilite from '../5e/5N1J-3'
export const titre =
  'Utiliser les critères de divisibilité (plusieurs possibles)'
export const interactifReady = true

export const dateDeModifImportante = '29/10/2021'
export const uuid = 'd5a6d'
export const refs = {
  'fr-fr': ['2N20-2'],
  'fr-ch': ['NR'],
}
export default class TableauCritereDeDivisibilite2nde extends TableauCriteresDeDivisibilite {
  constructor() {
    super()
    this.sup = true
    this.besoinFormulaireCaseACocher = false
  }
}
