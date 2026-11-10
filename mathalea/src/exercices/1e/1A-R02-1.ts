import CalculPartieAvecTout from '../can/5e/can5P1-06'
export const titre = 'Déterminer un pourcentage de proportion'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can5P1-06 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = 'c71ce'

export const refs = {
  'fr-fr': ['1A-R02-1', '2A-R2-1'],
  'fr-ch': ['10CTFA1D-9', '10LCFA1D-9', '10LSFA1D-9'],
}
export default class Auto1AR4 extends CalculPartieAvecTout {
  constructor() {
    super()
    this.versionQcm = false
  }
}
