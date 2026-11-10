import ConversionEnTousSens from '../can/6e/can6M4-03'
export const titre = 'Convertir une unité de longueur, masse ou capacité'
export const dateDePublication = '25/08/2026'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can6M4-03 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = '72786'

export const refs = {
  'fr-fr': ['1A-C07-7', '2A-N7-7'],
  'fr-ch': ['9R1GM4B-5', '9R2GM4B-5', '9R3GM4B-5'],
}
export default class Auto1AC077 extends ConversionEnTousSens {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcm = false
  }
}
