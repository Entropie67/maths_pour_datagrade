// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid ae5f6 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import CoeffTaux from '../can/2e/can2I2-02'
export const titre = 'Passer du coefficient multiplicateur au taux d’évolution'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can5P1-06 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = 'ae5f6'

export const refs = {
  'fr-fr': ['BP1CF02'],
  'fr-ch': ['NR'],
}
export default class Auto1AE1aOld extends CoeffTaux {
  constructor() {
    super()
    this.versionQcm = true
  }
}
