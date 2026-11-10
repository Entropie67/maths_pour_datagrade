import ValeursDefPourcentage from '../can/4e/can4P2-01'
export const titre = 'Déterminer une valeur définie avec un pourcentage'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can5P1-06 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '30/10/2026'

export const uuid = '2de5d'

export const refs = {
  'fr-fr': ['1A-R02-2', '2A-R2-2'],
  'fr-ch': ['10CTFA1C-8', '10LCFA1C-8', '10LSFA1C-8'],
}
export default class Auto1AR5 extends ValeursDefPourcentage {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcm = false
  }
}
