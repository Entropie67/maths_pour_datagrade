import CalculDeVolumes3e from '../3e/3G43'
export const titre = 'Calculer des volumes'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDeModifImportante = '14/10/2026'

/**
 * Clone de 3G43 pour le Bac Pro Première.
 * Seulement volume d'un cube, d'un pavé droit et d'un cylindre.
 */

export const uuid = 'c188e'

export const refs = {
  'fr-fr': ['BP1AUTO094'],
  'fr-ch': ['NR'],
}
export default class ExerciceBP1AUTO094 extends CalculDeVolumes3e {
  constructor() {
    super()
    this.besoinFormulaire4Texte = false
    this.sup4 = 2
  }
}
