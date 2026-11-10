import Thales2D from '../4e/_Thales2D'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const titre = 'Calculer des longueurs avec le théorème de Thalès'
export const uuid = '74eac'
export const refs = {
  'fr-fr': ['3G20', 'BP2AutoR6', 'BP2G13'],
  'fr-ch': ['11LCGM3B-2', '11LSGM3B-2', 'PRQMG03C-5'],
}
export default class Thales2D3e extends Thales2D {
  declare level: number
  declare sup: number

  constructor() {
    super()
    this.level = 3
    this.sup = 2
    this.video = 'j_zZOpLLl9k'
    this.pointsParQuestions = 2
  }
}
