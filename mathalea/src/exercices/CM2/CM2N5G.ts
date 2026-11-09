import DivisionsEuclidiennes from '../6e/6N2J'
export const titre = 'Poser des divisions euclidiennes'
export const amcReady = true
export const amcType = 'AMCOpen'
export const interactifReady = true

export const dateDeModifImportante = '01/11/2014'
/**
 * @author Jean-claude Lhote
 */
export const uuid = 'b259a'

export const refs = {
  'fr-fr': ['CM2N5G'],
  'fr-2016': ['c3C11'],
  'fr-ch': ['NR'],
}
export default class DivisionCycle3 extends DivisionsEuclidiennes {
  constructor() {
    super()
    this.sup = 1
  }
}
