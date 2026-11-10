import FactoriserParNombreOux from '../3e/3L11-4'
export const titre = 'Factoriser une expression littérale (Niveau $2$)'
export const dateDeModifImportante = '20/04/2025'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const uuid = 'dd1c9'
export const refs = {
  'fr-fr': ['4L11', 'BP2AutoI26'],
  'fr-ch': ['NR'],
}
export default class Factoriser4e extends FactoriserParNombreOux {
  constructor() {
    super()
    this.sup3 = true
    this.nbQuestions = 8
  }
}
