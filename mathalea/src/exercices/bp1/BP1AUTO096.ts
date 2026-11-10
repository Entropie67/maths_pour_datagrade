import CalculDeVolumes5e from '../5e/5M20'
export const titre = 'Calculs de volumes'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDeModifImportante = '14/10/2026'

/**
 * Clone de 5M20 pour le Bac Pro Première.
 * Seulement volume d'un cube, d'un pavé droit et d'un cylindre.
 */

export const uuid = 'd8c2e'

export const refs = {
  'fr-fr': ['BP1AUTO096'],
  'fr-ch': ['NR'],
}
export default class ExerciceBP1AUTO096 extends CalculDeVolumes5e {
  constructor() {
    super()
    this.besoinFormulaire4Texte = false
    this.sup4 = '1-2-3'
  }
}
