import CalculProbaSimple from '../can/3e/can3S2-01'

export const titre = 'Calculer une probabilité dans un cas simple'
export const dateDePublication = '06/01/2026'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can3S2-01 pour les auto 1er
 * @author Gilles Mora
 */
export const dateDeModifImportante = '29/09/2026'

export const uuid = 'cfd64'

export const refs = {
  'fr-fr': ['1A-P03-4', '2A-P3-4'],
  'fr-ch': ['11LSNO4C-9'],
}

export default class Auto1AP03d extends CalculProbaSimple {
  constructor() {
    super()
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    }
    this.versionQcm = false
  }
}
