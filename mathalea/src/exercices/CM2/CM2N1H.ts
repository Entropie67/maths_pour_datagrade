import ExerciceLabyrintheMultiples from '../6e/6N3autoD-2'
export const titre = 'Parcourir un labyrinthe de multiples'
export const amcReady = true
export const amcType = 'AMCOpen'
export const interactifReady = true

export const dateDeModifImportante = '30/03/2023'
export const uuid = '40ae0'
export const refs = {
  'fr-fr': ['CM2N1H'],
  'fr-2016': ['c3C10-2'],
  'fr-ch': ['9R1NO1A-9', '9R2NO1A-9', '9R3NO1A-9'],
}
export default class LabyrintheDeMultiplesCM extends ExerciceLabyrintheMultiples {
  constructor() {
    super()
    this.niveau = 'CM'
    this.sup = 4
    this.sup2 = 3
    this.sup3 = 1
    this.sup4 = 1
  }
}
