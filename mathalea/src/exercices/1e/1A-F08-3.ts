import TrouverCoeffDir from '../can/2e/can2F20-06'

export const titre =
  "Déterminer le coefficient directeur d'une fonction affine à partir de deux images"
export const dateDePublication = '01/09/2026'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2F20-06 pour les auto 1er avec énoncé différent par A.Meistermann

 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = '4fd31'

export const refs = {
  'fr-fr': ['1A-F08-3'],
  'fr-ch': ['11LCQCMFA2C-7', '11LSQCMFA2C-7', '1mQCM-68'],
}
export default class Auto1AF6d extends TrouverCoeffDir {
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
