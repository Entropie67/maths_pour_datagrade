import CalculerTermesSuiteArithmetiqueGeometrique from '../1e/1AL11-2'
export const titre = "Calculer les termes d'une suite arithmétique"
export const interactifReady = true

export const dateDePublication = '30/07/2026'

/**
 * Clone de 1AL11-2 pour le Bac Pro Première.
 * Limiter le champ aux suites arithmétiques.
 */

export const uuid = '15aeb'

export const refs = {
  'fr-fr': ['BP1AA03'],
  'fr-ch': [],
}
export default class ExerciceBP1AA03 extends CalculerTermesSuiteArithmetiqueGeometrique {
  constructor() {
    super()
    this.besoinFormulaireTexte = false
    this.sup = '1-2-3'
  }
}
