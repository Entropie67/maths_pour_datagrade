import LireElementsCarac from '../1e/1AL24-2'
export const titre =
  "Utiliser la représentation graphique d'un polynôme du second degré"
export const interactifReady = true

export const dateDePublication = '30/07/2026'

/**
 * Clone de 1AL24-2 pour le Bac Pro Première.
 * Remplacer « coefficient dominant » par « coefficient a ».
 */

export const uuid = '08e83'

export const refs = {
  'fr-fr': ['BP1F2D06'],
  'fr-ch': [],
}
export default class ExerciceBP1F2D06 extends LireElementsCarac {
  constructor() {
    super()
    this.nomDuCoefficientDominant = 'coefficient $a$'
  }
}
