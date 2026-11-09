import PoucentageProportion from '../can/6e/can6P2-04'
export const titre = 'Déterminer un pourcentage de proportion'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can6P2-04 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '30/10/2026'

export const uuid = '7bf3d'

export const refs = {
  'fr-fr': ['1A-R01-1', '2A-R1-1'],
  'fr-ch': ['10CTFA1D-7', '10LCFA1D-7', '10LSFA1D-7'],
}
export default class Auto1AR1 extends PoucentageProportion {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcm = false
  }
}
