// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 08208 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import CoordonneesPointIntersectionAxeAbscissesDroite from '../can/2e/can2G30-08'
export const titre =
  'Calculer les coordonnées du point d’intersection entre l’axe des abscisses et une droite'
export const dateDePublication = '26/07/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can2L03 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = '08208'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Auto1AF2aOld extends CoordonneesPointIntersectionAxeAbscissesDroite {
  constructor() {
    super()
    this.versionQcm = true
  }
}
