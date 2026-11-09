import CalculDeVolumes2ndeOld from '../2e/2G11-4Old'
export const titre = 'Calculer des volumes'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDePublication = '30/07/2026'

/**
 * Clone de 2G11-4 pour le Bac Pro Première.
 * Seulement volume d'un cube, d'un pavé droit et d'un cylindre.
 */

export const uuid = 'aeca7'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class ExerciceBP1AUTO091Old extends CalculDeVolumes2ndeOld {
  constructor() {
    super()
    this.besoinFormulaire4Texte = false
    this.sup4 = '1-2-3'
  }
}
