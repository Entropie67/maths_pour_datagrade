import CalculDeVolumes3eOld from '../3e/3G43Old'
export const titre = 'Calculer des volumes'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDePublication = '30/07/2026'

/**
 * Clone de 3G43 pour le Bac Pro Première.
 * Seulement volume d'un cube, d'un pavé droit et d'un cylindre.
 */

export const uuid = 'c188c'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class ExerciceBP1AUTO094Old extends CalculDeVolumes3eOld {
  constructor() {
    super()
    this.besoinFormulaire4Texte = false
    this.sup4 = 2
  }
}
