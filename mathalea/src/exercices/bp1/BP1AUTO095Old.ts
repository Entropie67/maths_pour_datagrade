import CalculDeVolumes4eOld from '../4e/4G53Old'
export const titre = 'Calculs de volumes'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDePublication = '30/07/2026'

/**
 * Clone de 4G53 pour le Bac Pro Première.
 * Seulement volume d'un cube, d'un pavé droit et d'un cylindre.
 */

export const uuid = '6cc79'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class ExerciceBP1AUTO095Old extends CalculDeVolumes4eOld {
  constructor() {
    super()
    this.besoinFormulaire4Texte = false
    this.sup4 = '1-2-3'
  }
}
