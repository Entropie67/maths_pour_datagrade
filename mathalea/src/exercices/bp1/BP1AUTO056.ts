import LireCaracteristiquesDroite from '../3e/3F21-3'
export const titre =
  "Lire graphiquement les caractéristiques de la courbe représentative d'une fonction linéaire"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '30/07/2026'

/**
 * Clone de 3F21-3 pour le Bac Pro Première.
 * Se limiter aux fonctions linéaires.
 */

export const uuid = '78bf3'

export const refs = {
  'fr-fr': ['BP1AUTO056'],
  'fr-ch': ['NR'],
}
export default class ExerciceBP1AUTO056 extends LireCaracteristiquesDroite {
  constructor() {
    super()
    this.besoinFormulaire4Numerique = false
    this.sup4 = 1
  }
}
