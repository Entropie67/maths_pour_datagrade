import Transformations from '../../6e/_Transformations'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const titre = 'Trouver le symétrique d’un point'

/**
 * @author Jean-claude Lhote
 */

export const uuid = '6314c'

export const refs = {
  'fr-fr': ['can5G-01', '5G3autoA-1'],
  'fr-ch': ['NR'],
}
export default class SymetriqueD1Point5eme extends Transformations {
  constructor() {
    super()
    this.sup = '1-2-3-4'
    this.can = true
  }
}
