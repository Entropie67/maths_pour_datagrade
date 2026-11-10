import DistributiviteSimpleDoubleReduction from '../3e/3L11-3'
export const titre = 'Utiliser la distributivité (simple ou double) et réduire'
export const interactifReady = true

export const amcType = 'AMCHybride'
export const amcReady = true
export const uuid = '60cc5'
export const refs = {
  'fr-fr': ['2L11-3'],
  'fr-ch': ['NR'],
}
export default class DistributiviteSimpleDoubleReduction2e extends DistributiviteSimpleDoubleReduction {
  constructor() {
    super()
    this.sup = '1-2-3-4-5-6-7'
  }
}
