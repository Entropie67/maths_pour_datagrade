import MoyenneStat from '../can/3e/can3S1-02'
export const titre = 'Calculer une moyenne'
export const dateDePublication = '23/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can3S1-02 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = 'b147f'

export const refs = {
  'fr-fr': ['1A-S02-8', '2A-S2-8'],
  'fr-ch': [],
}
export default class Auto1AS4 extends MoyenneStat {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcm = false
  }
}
