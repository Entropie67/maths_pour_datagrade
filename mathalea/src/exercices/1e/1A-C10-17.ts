import seuilFctAff from '../can/2e/can2F3-02'
export const titre = 'Déterminer un seuil avec une fonction affine'
export const dateDePublication = '27/08/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2F3-02 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = 'a0b81'

export const refs = {
  'fr-fr': ['1A-C10-17'],
  'fr-ch': ['1mQCM-25', '2mQCM-5'],
}
export default class Auto1AC12a extends seuilFctAff {
  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcm = false
  }
}
