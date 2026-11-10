import CalculDeVolumesOld from './5M20-1Old'
export const titre = 'Calculer des volumes de solides (cylindres notamment)'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDePublication = '27/06/2026'
export const uuid = 'dc629'
export const refs = {
  'fr-fr': [],
  'fr-2016': ['5M20-3'],
  'fr-ch': [],
}
export default class CalculDeVolumes5eCylindreOld extends CalculDeVolumesOld {
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
