import ExerciceConversionsLongueurs from './_ExerciceConversionsLongueurs'
export const titre = 'Convertir des longueurs ou des masses'
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'AMCNum'
export const dateDeModifImportante = '10/04/2026'
/**
 *
 */

export const uuid = 'ab9ff'

export const refs = {
  'fr-fr': ['6M1autoC-1', 'CM1M1B'],
  'fr-2016': ['6M12'],
  'fr-ch': ['9R1GM4B-2', '9R2GM4B-2', '9R3GM4B-2', 'PRQMG04B-1'],
}

export default class auto6M1C1 extends ExerciceConversionsLongueurs {
  constructor() {
    super()
    this.sup = 3
    this.nbQuestions = 8
  }
}
