import CalculDeVolumesOld from '../5e/5M20-1Old'
export const titre = 'Calculer des volumes'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDeModifImportante = '17/04/2025'
export const uuid = 'acb80'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class CalculDeVolumes3eOld extends CalculDeVolumesOld {
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
