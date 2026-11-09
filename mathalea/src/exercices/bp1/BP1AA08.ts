import SensDeVariationSuiteRecurrence from '../1e/1AL12-3'
export const titre =
  "Étudier le sens de variation d'une suite arithmétique définie par récurrence"

export const dateDePublication = '30/07/2026'

/**
 * Clone de 1AL12-3 pour le Bac Pro Première.
 * Limiter le champ aux suites arithmétiques.
 */

export const uuid = 'dcfe1'

export const refs = {
  'fr-fr': ['BP1AA08'],
  'fr-ch': [],
}
export default class ExerciceBP1AA08 extends SensDeVariationSuiteRecurrence {
  constructor() {
    super()
    this.besoinFormulaireTexte = false
    this.sup = '1'
  }
}
