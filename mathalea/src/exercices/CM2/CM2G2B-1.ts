import ParalleleEtPerpendiculaires from './CM2G2B-2'
export const titre = 'Tracer des parallèles'
export const interactifReady = false
export const amcReady = true
export const amcType = 'AMCOpen'

/**
 * @author Jean-claude Lhote (AMC par Éric Elter en septembre 2021)

 */
export const uuid = '46429'

export const refs = {
  'fr-fr': ['CM2G2B-1'],
  'fr-2016': ['6G12'],
  'fr-ch': ['9R1ES1B-4', '9R2ES1B-4', '9R3ES1B-4', 'PRQES01A-3', 'PRQES04A-1'],
}
export default class TracerDesParalleles extends ParalleleEtPerpendiculaires {
  constructor() {
    super()

    this.sup = 1
    this.type = 2
  }
}
