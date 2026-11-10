import CalculDeVolumes from '../5e/5M20-1'
export const titre = 'Calculer des volumes'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDeModifImportante = '14/10/2026'
export const uuid = 'acb8e'
export const refs = {
  'fr-fr': ['3G43', 'BP2G20', '3AutoM07-1'],
  'fr-ch': ['11LCGM1B-2', '11LSGM1B-2', '11LCGM1C-4', '11LSGM1C-4', '11LSGM1D-3', 'PRQMG02C-3', 'PRQMG02D-1'],
}
export default class CalculDeVolumes3e extends CalculDeVolumes {
  declare sup: number
  declare sup4: number
  declare classe: number

  constructor() {
    super()
    this.sup = 1
    this.sup4 = 8
    this.classe = 3
    this.besoinFormulaire4Texte = [
      'Type de solides',
      'Nombres séparés par des tirets :\n1 : Cubes\n2 : Pavés droits\n3 : Cylindres\n4 : Prismes droits\n5 : Cônes\n6 : Pyramides à base carrée\n7 : Pyramides à base triangulaire rectangle\n8 : Pyramides à base triangulaire quelconque\n9 : Boules\n10 : Mélange',
    ]
  }
}
