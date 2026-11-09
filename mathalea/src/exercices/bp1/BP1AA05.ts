import FormeExpliciteSuite from '../1e/1AL11-6'
export const titre = "Donner la forme explicite d'une suite arithmétique"
export const interactifReady = true

export const dateDePublication = '30/07/2026'

/**
 * Clone de 1AL11-6 pour le Bac Pro Première.
 * Limiter le champ aux suites arithmétiques.
 */

export const uuid = '7c872'

export const refs = {
  'fr-fr': ['BP1AA05'],
  'fr-ch': [],
}
export default class ExerciceBP1AA05 extends FormeExpliciteSuite {
  constructor() {
    super()
    this.besoinFormulaireTexte = false
    this.sup = '1-2'
  }
}
