import ExerciceDecomposerEnFacteursPremiers from '../5e/5N1L-4'
export const titre = 'Décomposer en facteurs premiers'
export const dateDeModifImportante = '2/11/2021'
export const interactifReady = true

export const uuid = 'c14e8'

export const refs = {
  'fr-fr': ['2N20-5'],
  'fr-ch': ['10CTNO1A-14', '9R2NO1G-4', '9R3NO1G-4'],
}
export default class ExerciceDecomposerEnFacteursPremiers2nde extends ExerciceDecomposerEnFacteursPremiers {
  constructor() {
    super()
    this.sup3 = true
    this.sup = 3
    this.sup2 = true
  }
}
