import CalculDeVolumes2nde from '../2e/2G11-4'
export const titre = 'Calculer des volumes'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDeModifImportante = '14/10/2026'

/**
 * Clone de 2G11-4 pour le Bac Pro Première.
 * Seulement volume d'un cube, d'un pavé droit et d'un cylindre.
 */

export const uuid = 'aecae'

export const refs = {
  'fr-fr': ['BP1AUTO091'],
  'fr-ch': ['NR'],
}
export default class ExerciceBP1AUTO091 extends CalculDeVolumes2nde {
  constructor() {
    super()
    this.besoinFormulaire4Texte = false
    this.sup4 = '1-2-3'
  }
}
