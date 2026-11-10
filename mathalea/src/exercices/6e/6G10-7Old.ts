/**
 * Clone de 6G10-4 pour rien (juste pour définir l'uuid 35282 qui a été diffusée et utilisée par Myriade)
 */

import VocabulaireDuCercle from './6G2A'

// export { titre } from './6G10-4'
export const titre = 'Connaitre le vocabulaire du cercle'
export const interactifReady = true

export const uuid = '35282'
// Ne pas référencer cet exo, il ferait doublon avec 6G10-4
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class LeCercle extends VocabulaireDuCercle {
  constructor() {
    super()
    this.nbQuestions = 1
  }
}
