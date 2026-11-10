import ExerciceComparerQuatreFractions from '../5e/5N3A'
export const titre =
  'Comparer quatre fractions (dénominateurs multiples) et un nombre entier'
export const interactifReady = true

export const dateDePublication = '14/08/2021'
export const dateDeModifImportante = '02/03/2024'
export const uuid = '7e31e'
export const refs = {
  'fr-fr': ['4C20-1', 'BP2AutoG2'],
  'fr-ch': ['NR'],
}
export default class ExerciceComparerQuatreFractions4e extends ExerciceComparerQuatreFractions {
  constructor() {
    super()
    this.sup = true
  }
}
