import NombreFois4Ou8 from '../can/6e/can6C1-09'
export const dateDePublication = '01/02/2026'
export const titre = 'Multiplier un nombre par $4$ ou $8$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Éric Elter
 */

export const uuid = 'mr56c'

export const refs = {
  'fr-fr': ['CM1N4J'],
  'fr-ch': ['9R1NO6C-1', '9R2NO6C-1', '9R3NO6C-1'],
}
export default class NombreFois4Ou8CM1 extends NombreFois4Ou8 {
  constructor() {
    super()
    this.nbQuestions = 3
  }
}
