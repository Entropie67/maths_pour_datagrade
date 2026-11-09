import ArrondirUneValeur6e from '../6e/6N1K'
export const titre = 'Arrondir un nombre réel'
export const interactifReady = true

export const dateDeModifImportante = '27/10/2021'
export const uuid = 'bba9b'
export const refs = {
  'fr-fr': ['BP2AutoS1', '2N14-1'],
  'fr-ch': ['10CTNO6B-5', '10LCNO6B-5', '10LSNO6B-5'],
}
export default class ArrondirUneValeur2nde extends ArrondirUneValeur6e {
  constructor() {
    super()
    this.version = 2
    this.sup = 5
    this.besoinFormulaireNumerique = false
  }
}
