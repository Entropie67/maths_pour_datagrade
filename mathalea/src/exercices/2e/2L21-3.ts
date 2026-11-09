import EqResolvantesThales from '../3e/3L13-2'
export const titre =
  'Résoudre une équation $\\dfrac{x}{a}=b$ ou $ \\dfrac{a}{x}=b$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModifImportante = '04/10/2026'

export const uuid = '2e46e'
export const refs = {
  'fr-fr': ['2L21-3', 'BP2RES27'],
  'fr-ch': ['NR'],
}
export default class EqResolvantesThales2nde extends EqResolvantesThales {
  constructor() {
    super()
    this.exo = '4L15-1'
    this.sup = 1
  }
}
