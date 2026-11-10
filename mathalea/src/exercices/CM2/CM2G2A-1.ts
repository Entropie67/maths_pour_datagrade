import ParalleleEtPerpendiculaires from './CM2G2B-2'

export const dateDeModifImportante = '17/02/2025'
export const titre = 'Tracer des perpendiculaires'
export const interactifReady = false
export const amcReady = true
export const amcType = 'AMCOpen'

/**
 * @author Jean-claude Lhote  (AMC par Éric Elter en septembre 2021)
 * @ Loïc Geeraerts (Refactoring (ES6))
 */
export const uuid = '7ff97'

export const refs = {
  'fr-fr': ['CM2G2A-1'],
  'fr-2016': ['6G11'],
  'fr-ch': ['9R1ES1B-2', '9R2ES1B-2', '9R3ES1B-2', 'PRQES01A-6', 'PRQES04A-3'],
}
export default class TracerDesPerpendiculaires extends ParalleleEtPerpendiculaires {
  constructor() {
    super()
    this.sup = 1
    this.type = 1
  }
}
