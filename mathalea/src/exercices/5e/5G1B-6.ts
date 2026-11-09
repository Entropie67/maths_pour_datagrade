import TransformationsDuPlanEtCoordonnees from '../3e/3G10-1'
export const titre =
  "Trouver les coordonnées de l'image d'un point par une symétrie axiale ou centrale"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '28/10/2021'
export const dateDeModifImportante = '06/11/2026'
export const uuid = '2d2bb'
export const refs = {
  'fr-fr': ['5G1B-6'],
  'fr-2016': ['5G11-5'],
  'fr-ch': ['NR'],
}
export default class SymetriesEtCoordonnees5e extends TransformationsDuPlanEtCoordonnees {
  constructor() {
    super()
    this.sup = '1-2'
    this.besoinFormulaireTexte = false
  }
}
