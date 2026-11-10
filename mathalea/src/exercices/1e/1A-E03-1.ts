import PoucentageE2 from '../can/4e/can4P2-05'
export const titre = 'Calculer une évolution en pourcentage'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can5P01 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = '1ac07'

export const refs = {
  'fr-fr': ['1A-E03-1', '2A-E3-1'],
  'fr-ch': ['10CTFA1E-11', '10LCFA1E-11', '10LSFA1E-11'],
}
export default class Auto1AE3 extends PoucentageE2 {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcm = false
  }
}
