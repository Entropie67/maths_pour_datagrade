import EquationPlusMoinsX2PlusAEgalB from '../can/2e/can2L2-04'
export const titre =
  'Déterminer le nombre de solutions d’une équation se ramenant à $x^2=a$'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2L01 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = '3af9a'

export const refs = {
  'fr-fr': ['1A-C10-7', '2A-C3-3'],
  'fr-ch': ['11LSQCMFA5-3', '10LCFA5E-3', '10LCQCMFA5-3', '10LSFA5E-3', '10LSQCMFA5-3', '11CTFA4H-3', '11CTQCMFA5-6', '11LCFA4H-3', '11LCQCMFA5-6', '1mQCM-28'],
}
export default class Auto1AC10 extends EquationPlusMoinsX2PlusAEgalB {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcm = false
  }
}
