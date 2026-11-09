import CalculToutAvecPartie from '../can/2e/can2I1-02'
export const titre = 'Calculer le tout connaissant une partie'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can5P1-06 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = 'ffa1c'

export const refs = {
  'fr-fr': ['1A-R02-3', '2A-R2-3'],
  'fr-ch': ['10CTFA1D-5', '10LCFA1D-5', '10LSFA1D-5'],
}
export default class Auto1AR5a extends CalculToutAvecPartie {
  constructor() {
    super()
    this.versionQcm = false
  }
}
