import CalculerRaisonSuite from '../1e/1AL11-4'
export const titre = "Calculer la raison d'une suite arithmétique"
export const interactifReady = true

export const dateDePublication = '30/07/2026'

/**
 * Clone de 1AL11-4 pour le Bac Pro Première.
 * Ne proposer que des termes consécutifs.
 */

export const uuid = '279b6'

export const refs = {
  'fr-fr': ['BP1AA04'],
  'fr-ch': [],
}
export default class ExerciceBP1AA04 extends CalculerRaisonSuite {
  constructor() {
    super()
    this.besoinFormulaireTexte = false
    this.sup = '1'
  }
}
