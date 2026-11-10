import EqResolvantesThales from '../3e/3L13-2'
export const titre =
  'Résoudre des équations du type $\\dfrac{x}{a}=\\dfrac{b}{c}$'
export const interactifReady = true

export const dateDeModifImportante = '04/10/2026'
export const uuid = '6463b'
export const refs = {
  'fr-fr': ['4L15-1', 'BP2RES7'],
  'fr-ch': ['10LCFA5C-5', '10LSFA5C-5', '11CTFA4C-5', '11LCFA4C-5', '11LSFA4C-5', 'PRQAL05C-1'],
}
export default class EquationsFractions extends EqResolvantesThales {
  constructor() {
    super()
    this.exo = '4L15-1'
    this.sup = 1
  }
}
