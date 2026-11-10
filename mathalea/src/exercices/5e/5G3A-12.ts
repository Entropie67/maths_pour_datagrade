import TrouverLaTransformation from '../4e/4G12-1'
export const titre = 'Identifier une transformation'
export const interactifReady = true

export const dateDePublication = '4/12/2021'
export const dateDeModifImportante = '25/11/2025'
export const uuid = '2d343'
export const refs = {
  'fr-fr': ['5G3A-12'],
  'fr-2016': ['5G12-3'],
  'fr-ch': ['NR'],
}
export default class TrouverLaTransformation5e extends TrouverLaTransformation {
  constructor() {
    super()
    this.sup = 1
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = false
  }
}
