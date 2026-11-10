import CalculDeVolumesOld from './5M20-1Old'
export const titre = 'Calculer des volumes de solides (polyèdres notamment)'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDePublication = '27/06/2026'
export const uuid = '98a08'
export const refs = {
  'fr-fr': [],
  'fr-2016': ['5M20-2'],
  'fr-ch': [],
}
export default class CalculDeVolumes5ePolyedresOld extends CalculDeVolumesOld {
  constructor() {
    super()
    this.sup = 1
    this.sup4 = '1-2-4'
    this.nbQuestions = 3
    this.classe = 5
    this.besoinFormulaire4Texte = [
      'Type de solides',
      'Nombres séparés par des tirets :\n1  : Cubes\n2 : Pavés droits\n3 : Cylindres\n4 : Prismes droits\n5 : Mélange',
    ]
  }
}
