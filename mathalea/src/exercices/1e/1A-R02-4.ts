import PoucentageP2 from '../can/4e/can4P2-04'
export const titre = 'Calculer avec un pourcentage de proportion'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can5P1-06 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = '24f7d'

export const refs = {
  'fr-fr': ['1A-R02-4', '2A-R2-4'],
  'fr-ch': ['10CTFA1C-12', '10LCFA1C-12', '10LSFA1C-12'],
}
export default class Auto1AR5b extends PoucentageP2 {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcm = false
  }
}
