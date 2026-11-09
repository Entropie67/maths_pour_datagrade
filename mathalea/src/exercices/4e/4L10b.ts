import SimpleDistributivite from '../3e/3L11-0'
export const dateDePublication = '03/02/2025'

export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCHybride'
export const uuid = 'b87a5'
export const refs = {
  'fr-fr': ['4L10b'],
  'fr-ch': ['NR'],
}

/**
 * Développer des expressions de la forme (ax+b)c ou (ax+b)c ou (ax+b)cx ou cx(ax+b) avec a, b, c relatifs et paramétrables ainsi que x
 * @author Éric Elter
 */

export const titre = 'Effectuer la simple distributivité'
export default class SimpleDistributivite4e extends SimpleDistributivite {
  constructor() {
    super()
    this.sup = '1-2'
    this.sup2 = 1
    this.sup3 = 3
    this.sup4 = 1
  }
}
