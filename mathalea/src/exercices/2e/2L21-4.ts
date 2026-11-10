import ExerciceEquation1 from '../4e/4L20'
export const titre = 'Résoudre une équation du premier degré'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '04/10/2026'
export const uuid = '14c8b'
export const refs = {
  'fr-fr': ['2L21-4', 'BP2RES29'],
  'fr-ch': ['NR'],
}
export default class ExerciceEquation12nde extends ExerciceEquation1 {
  constructor() {
    super()
    this.sup = true
    this.sup2 = '5-6-7'
    this.sup3 = false
  }
}
