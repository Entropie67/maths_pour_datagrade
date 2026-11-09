// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 1b3f9 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import ValeursDefPourcentage from '../can/4e/can4P2-01'
export const titre = 'Déterminer une valeur définie avec un pourcentage'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can5P1-06 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = '1b3f9'

export const refs = {
  'fr-fr': ['BP1SP08'],
  'fr-ch': ['NR'],
}
export default class Auto1AR5Old extends ValeursDefPourcentage {
  constructor() {
    super()
    this.versionQcm = true
  }
}
