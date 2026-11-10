import Transformations from '../../6e/_Transformations'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const titre = 'Trouver l’image d’un point par une transformation 3e'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021

 */
export const uuid = '8e651'

export const refs = {
  'fr-fr': ['can3G1-02'],
  'fr-ch': ['NR'],
}
export default class ImageD1Point extends Transformations {
  constructor() {
    super()
    this.can = true
    this.sup = 4
  }
}
