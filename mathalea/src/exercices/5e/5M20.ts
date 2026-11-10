import CalculDeVolumes from './5M20-1Old'
export const titre = 'Calculer des volumes de solides'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDeModifImportante = '10/06/2024'
export const uuid = 'e26ca'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['PRQMG02A-2', 'PRQMG02B-1'],
}
export default class CalculDeVolumes5eOld extends CalculDeVolumes {
  constructor() {
    super()
    this.sup = 1
    this.sup4 = 5
    this.classe = 5
    this.besoinFormulaire4Texte = [
      'Type de solides',
      'Nombres séparés par des tirets :\n1  : Cubes\n2 : Pavés droits\n3 : Cylindres\n4 : Prismes droits\n5 : Mélange',
    ]
  }
}
