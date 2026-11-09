// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 0ed0f continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import SolutionsEquationProduit from '../can/3e/can3L1-05'
export const titre =
  'Calculer le produit des solutions d’une équation produit nul'
export const dateDePublication = '27/07/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can3L1-05 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = '0ed0f'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Auto1AC15aOld extends SolutionsEquationProduit {
  constructor() {
    super()
    this.versionQcm = true
  }
}
