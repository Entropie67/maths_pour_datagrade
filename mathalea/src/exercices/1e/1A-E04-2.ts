import EvolSuccessives from '../can/2e/can2I2-05'
export const titre =
  'Déterminer une évolution globale après deux évolutions successives'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can5P01 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = '0f10c'

export const refs = {
  'fr-fr': ['1A-E04-2'],
  'fr-ch': ['10CTQCMFA1-13', '10LCQCMFA1-13', '10LSQCMFA1-13', '11CTQCMFA1-7', '11LCQCMFA1-7', '11LSQCMFA1-7'],
}
export default class Auto1AE4a extends EvolSuccessives {
  constructor() {
    super()
    this.versionQcm = false
  }
}
