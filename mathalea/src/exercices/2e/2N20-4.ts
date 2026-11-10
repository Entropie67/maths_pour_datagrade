import PremierOuPas from '../3e/3A10-1'
export const titre = "Justifier qu'un nombre est premier ou pas"
export const dateDeModifImportante = '29/10/2021'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const uuid = 'c04cc'

export const refs = {
  'fr-fr': ['2N20-4'],
  'fr-ch': ['NR'],
}
export default class PremierOuPas2nde extends PremierOuPas {
  constructor() {
    super()
    this.sup = 1
    this.sup2 = false
  }
}
