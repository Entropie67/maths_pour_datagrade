import ProbaEvenementContraire from '../can/3e/can3S2-02'
export const titre = 'Calculer la probabilité d’un événement contraire'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can3S2-02 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = 'db194'

export const refs = {
  'fr-fr': ['1A-P02-1', '2A-P2-1'],
  'fr-ch': ['11LCNO4B-8', '11LSNO4B-8'],
}
export default class Auto1AP2 extends ProbaEvenementContraire {
  constructor() {
    super()
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    }
    this.versionQcm = false
  }
}
