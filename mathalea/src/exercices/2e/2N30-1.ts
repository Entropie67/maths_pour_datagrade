import ExerciceFractionsDecomposer from '../5e/5N3autoG'
export const titre =
  "Décomposer une fraction (partie entière + fraction inférieure à $1$) puis donner l'écriture décimale"
export const interactifReady = true

export const dateDeModifImportante = '05/09/2026' // Vérification personnalisée : toute décomposition égale est acceptée (2 + 2/8, 2 + 25/100…)
/**
 * Clone de 6N20-2 pour les 2nde
 */
export const uuid = '45726'

export const refs = {
  'fr-fr': ['2N30-1'],
  'fr-ch': ['NR'],
}

export default class ExerciceFractionsDifferentesEcritures extends ExerciceFractionsDecomposer {
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup3 = false
  }
}
