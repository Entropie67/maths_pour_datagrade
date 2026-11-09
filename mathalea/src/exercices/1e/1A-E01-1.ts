import TauxCoeff from '../can/2e/can2I2-01'
export const titre = 'Passer du taux d’évolution au coefficient multiplicateur'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can5P1-06 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '30/10/2026'

export const uuid = 'df833'

export const refs = {
  'fr-fr': ['1A-E01-1', '2A-E1-1'],
  'fr-ch': ['10CTFA1E-15', '10LCFA1E-15', '10LSFA1E-15'],
}
export default class Auto1AE1 extends TauxCoeff {
  constructor() {
    super()
    this.versionQcm = false
  }
}
