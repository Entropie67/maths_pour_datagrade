import CoeffMul from '../can/2e/can2I2-03'
export const titre = 'Calculer un coefficient multiplicateur'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can5P1-06 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = '5c0d8'

export const refs = {
  'fr-fr': ['1A-E01-3', '2A-E1-3'],
  'fr-ch': [],
}
export default class Auto1AE1b extends CoeffMul {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcm = false
  }
}
