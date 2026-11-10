import CalculDeVolumes4e from '../4e/4G53'
export const titre = 'Calculs de volumes'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDeModifImportante = '14/10/2026'

/**
 * Clone de 4G53 pour le Bac Pro Première.
 * Seulement volume d'un cube, d'un pavé droit et d'un cylindre.
 */

export const uuid = '6cc7e'

export const refs = {
  'fr-fr': ['BP1AUTO095'],
  'fr-ch': ['NR'],
}
export default class ExerciceBP1AUTO095 extends CalculDeVolumes4e {
  constructor() {
    super()
    this.besoinFormulaire4Texte = false
    this.sup4 = '1-2-3'
  }
}
