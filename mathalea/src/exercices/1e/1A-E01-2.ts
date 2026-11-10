import CoeffTaux from '../can/2e/can2I2-02'
export const titre = 'Passer du coefficient multiplicateur au taux d’évolution'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can5P1-06 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '30/10/2026'

export const uuid = '1320f'

export const refs = {
  'fr-fr': ['1A-E01-2', '2A-E1-2'],
  'fr-ch': ['10CTFA1E-16', '10LCFA1E-16', '10LSFA1E-16'],
}
export default class Auto1AE1a extends CoeffTaux {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcm = false
  }
}
