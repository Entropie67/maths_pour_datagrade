// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid c40dc continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import PoucentageP2 from '../can/4e/can4P2-04'
export const titre = 'Calculer avec un pourcentage de proportion'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can5P1-06 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = 'c40dc'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Auto1AR5bOld extends PoucentageP2 {
  constructor() {
    super()
    this.versionQcm = true
  }
}
