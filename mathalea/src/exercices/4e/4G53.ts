import CalculDeVolumes from '../5e/5M20-1'
export const titre = 'Calculer des volumes de solides'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDeModifImportante = '14/10/2026'
export const uuid = 'b6cee'
export const refs = {
  'fr-fr': ['4G53', 'BP2G12'],
  'fr-ch': ['11CTGM1E-4', '11LCGM1E-4', '11LSGM1E-4', 'PRQMG02B-2', 'PRQMG02C-2', 'PRQMG02D-2'],
}
export default class CalculDeVolumes4e extends CalculDeVolumes {
  constructor() {
    super()
    this.sup = 1
    this.classe = 4
    this.sup4 = 7
    this.besoinFormulaire4Texte = [
      'Type de solides',
      'Nombres séparés par des tirets :\n1 : Cubes\n2 : Pavés droits\n3 : Cylindres\n4 : Prismes droits\n5 : Cônes\n6 : Pyramides à base carrée\n7 : Pyramides à base triangulaire rectangle\n8 : Pyramides à base triangulaire quelconque\n9 : Mélange',
    ]
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Sans conversion\n2 : Avec des conversions\n3 : Sans conversion avec ​π≃3',
    ]
  }
}
