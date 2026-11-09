import RelationDeThales from './_RelationDeThales'
export const titre = 'Écrire une relation de Thalès'

export const interactifReady = true
export const dateDePublication = '05/01/2023'
export const dateDeModifImportante = '08/11/2025'
export const uuid = 'ff410'
export const refs = {
  'fr-fr': ['4G30-1', 'BP2AutoR10', 'BP2G11', '3AutoG12-1'],
  'fr-ch': ['NR'],
}
export default class RelationDeThales4e extends RelationDeThales {
  constructor() {
    super()
    this.level = 4
    this.besoinFormulaireNumerique = false
  }
}
