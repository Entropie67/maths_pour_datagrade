import EffectifProportion from '../can/5e/can5P1-07'
export const titre = "Calculer un effectif à partir d'une proportion"
export const dateDePublication = '31/01/2026'
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

/**
 * Clone de can5P1-07 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '06/10/2026'

export const uuid = 'ea326'

export const refs = {
  'fr-fr': ['1A-R01-6', '2A-R1-6'],
  'fr-ch': ['10CTFA1D-11', '10LCFA1D-11', '10LSFA1D-11'],
}
export default class Auto1AR6 extends EffectifProportion {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcm = false
  }
}
