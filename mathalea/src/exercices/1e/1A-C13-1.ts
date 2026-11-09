import SolutionsEquationProduit from '../can/3e/can3L1-05'
export const titre =
  'Calculer le produit des solutions d’une équation produit nul'
export const dateDePublication = '27/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can3L1-05 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '30/10/2026'

export const uuid = '5b90f'

export const refs = {
  'fr-fr': ['1A-C13-1'],
  'fr-ch': ['1mQCM-6', '2mQCM-4'],
}
export default class Auto1AC15a extends SolutionsEquationProduit {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcm = false
  }
}
