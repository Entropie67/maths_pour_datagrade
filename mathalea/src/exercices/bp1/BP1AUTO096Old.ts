import CalculDeVolumes5eOld from '../5e/5M20'
export const titre = 'Calculs de volumes'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDePublication = '30/07/2026'

/**
 * Clone de 5M20 pour le Bac Pro Première.
 * Seulement volume d'un cube, d'un pavé droit et d'un cylindre.
 */

export const uuid = 'd8c24'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class ExerciceBP1AUTO096Old extends CalculDeVolumes5eOld {
  constructor() {
    super()
    this.besoinFormulaire4Texte = false
    this.sup4 = '1-2-3'
  }
}
