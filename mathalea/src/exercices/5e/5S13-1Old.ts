import calculEffectifFrequence from '../3e/3S12'
export const titre = 'Calculer des effectifs et des fréquences'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const uuid = '7d429'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class CalculEffectifFrequence5e extends calculEffectifFrequence {
  constructor() {
    super()
    this.sup = 1
  }
}
