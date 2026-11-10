import SensDeVariationSuite from '../1e/1AL12-1'
export const titre = "Déterminer le sens de variation d'une suite arithmétique"
export const interactifReady = true

export const dateDePublication = '30/07/2026'

/**
 * Clone de 1AL12-1 pour le Bac Pro Première.
 * Limiter le champ aux suites arithmétiques et définies par récurrence.
 */

export const uuid = '2fcc7'

export const refs = {
  'fr-fr': ['BP1AA07'],
  'fr-ch': [],
}
export default class ExerciceBP1AA07 extends SensDeVariationSuite {
  constructor() {
    super()
    this.besoinFormulaire2Numerique = false
    this.sup2 = 1
  }
}
