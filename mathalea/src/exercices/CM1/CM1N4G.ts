import DiviserDecimauxPar101001000 from '../6e/6N2autoD'

export const dateDePublication = '01/02/2026'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const titre = 'Diviser un nombre décimal par $10$'

/**
 * @author Éric Elter
 */

export const uuid = 'nd45c'

export const refs = {
  'fr-fr': ['CM1N4G'],
  'fr-ch': ['9R1NO6F-1', '9R2NO6F-1', '9R3NO6F-1'],
}
export default class DiviserDecimauxPar10 extends DiviserDecimauxPar101001000 {
  constructor() {
    super()
    this.sup = 1
    this.sup2 = '2'
    this.sup3 = '3'
    this.nbQuestions = 3
    this.version = 'CM1'
  }
}
