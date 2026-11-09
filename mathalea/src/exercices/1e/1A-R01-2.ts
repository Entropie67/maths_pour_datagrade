import PourcentageARetrouver from '../can/4e/can4P2-02'
export const titre = 'Retrouver un pourcentage'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can4P2-02 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '30/10/2026'

export const uuid = 'c1ae7'

export const refs = {
  'fr-fr': ['1A-R01-2', '2A-R1-2'],
  'fr-ch': ['10CTFA1D-8', '10LCFA1D-8', '10LSFA1D-8'],
}
export default class Auto1AR1a extends PourcentageARetrouver {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcm = false
  }
}
