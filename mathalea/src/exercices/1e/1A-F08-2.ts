import TrouverpDroite from '../can/2e/can2G30-05'
export const titre =
  'Déterminer un coefficient directeur à partir des coordonnées'
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2G30-05 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '30/10/2026'

export const uuid = '9e61b'

export const refs = {
  'fr-fr': ['1A-F08-2'],
  'fr-ch': ['11LCQCMFA2C-6', '11LSQCMFA2C-6', '1mQCM-8'],
}
export default class Auto1AF6d extends TrouverpDroite {
  constructor() {
    super()
    // Réponse fraction ou nombre selon le tirage
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    }
    this.versionQcm = false
  }
}
