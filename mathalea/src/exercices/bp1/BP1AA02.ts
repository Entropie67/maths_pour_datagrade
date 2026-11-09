import TermeDUneSuiteDefinieParRecurrence from '../1e/1AL10-3'
export const titre =
  "Déterminer les termes d'une suite arithmétique définie par récurrence"
export const interactifReady = true

export const dateDePublication = '30/07/2026'

/**
 * Clone de 1AL10-3 pour le Bac Pro Première.
 * Limiter le champ aux suites arithmétiques.
 */

export const uuid = '5851c'

export const refs = {
  'fr-fr': ['BP1AA02'],
  'fr-ch': [],
}
export default class ExerciceBP1AA02 extends TermeDUneSuiteDefinieParRecurrence {
  constructor() {
    super()
    this.besoinFormulaireTexte = false
    this.sup = '1'
  }
}
