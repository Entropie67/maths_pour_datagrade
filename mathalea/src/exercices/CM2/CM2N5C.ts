import MultiplierDecimauxParametres from '../6e/6N2E'
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

export const titre =
  'Poser des multiplications entre un nombre décimal et un entier'

export const dateDePublication = '01/02/2026'

/**
 * @author Éric Elter
 */

export const uuid = 'azk4s'

export const refs = {
  'fr-fr': ['CM2N5C'],
  'fr-ch': ['NR'],
}
export default class MultiplierDecimauxParametresCM2 extends MultiplierDecimauxParametres {
  constructor() {
    super()
    this.besoinFormulaire4Numerique = false
    this.sup2 = 2
    this.sup4 = 1
  }
}
