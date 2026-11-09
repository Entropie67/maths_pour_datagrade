import NombreFois5 from '../can/6e/can6C2-01'
export const dateDePublication = '01/02/2026'
export const titre = 'Multiplier un nombre par $5$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Éric Elter
 */

export const uuid = 'mr45c'

export const refs = {
  'fr-fr': ['CM1N4K'],
  'fr-ch': ['9R1NO6C-2', '9R2NO6C-2', '9R3NO6C-2'],
}
export default class NombreFois5CM1 extends NombreFois5 {
  constructor() {
    super()
    this.version = 'PairOuImpair'
    this.nbQuestions = 3
  }
}
