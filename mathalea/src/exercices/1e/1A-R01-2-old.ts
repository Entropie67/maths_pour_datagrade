// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid cd464 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import PourcentageARetrouver from '../can/4e/can4P2-02'
export const titre = 'Retrouver un pourcentage'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can4P2-02 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = 'cd464'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Auto1AR1aOld extends PourcentageARetrouver {
  constructor() {
    super()
    this.versionQcm = true
  }
}
