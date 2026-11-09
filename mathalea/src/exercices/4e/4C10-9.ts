import ExoRose from '../6e/_Roses'
export const titre = 'Résoudre une Rose multiplicative avec des relatifs'
export const interactifReady = true
export const dateDePublication = '12/08/2022'
export const amcReady = true
export const amcType = 'AMCOpen'

/**
 * Travailler les tables de multiplication autrement
 * @author Jean-claude Lhote
 */

export const uuid = '9e862'

export const refs = {
  'fr-fr': ['4C10-9'],
  'fr-ch': ['10LCNO2C-7', '10LSNO2C-7', '11CTNO1B-7'],
}
export default class RoseAdditive4R extends ExoRose {
  // c'est l'ExoRose zéro contenu dans _Roses.js
  constructor() {
    super()
    this.operation = 'multiplication'
    this.typeDonnees = 'entiers relatifs'
  }
}
