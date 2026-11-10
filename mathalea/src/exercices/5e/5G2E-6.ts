import CalculDeVolumes from './5M20-1Old'
export const titre = 'Calculer des volumes de solides (cylindres notamment)'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDeModifImportante = '14/10/2026'
export const uuid = 'dc62e'
export const refs = {
  'fr-fr': ['5G2E-6'],
  'fr-ch': ['10LCGM2B-1', '10LSGM2B-1', '11CTGM1A-1', 'PRQMG02B-5'],
}
export default class CalculDeVolumes5eCylindre extends CalculDeVolumes {
  constructor() {
    super()
    this.sup = 1
    this.sup4 = '3'
    this.classe = 5
    this.nbQuestions = 2
    this.besoinFormulaire4Texte = [
      'Type de solides',
      'Nombres séparés par des tirets :\n1  : Cubes\n2 : Pavés droits\n3 : Cylindres\n4 : Prismes droits\n5 : Mélange',
    ]
  }
}
