import ProduitScalaireCoordonnees from '../can/TSpe/canTSpeE04'
export const titre =
  'Calculer le produit scalaire de deux vecteurs avec leurs coordonnées'
export const dateDePublication = '05/10/2024'
export const amcReady = true
export const amcType = 'AMCNum'
export const interactifReady = true

/**
 * Clone de CanTspeE04 pour les auto 1er
 * @author Stéphane Guyon
 */

export const uuid = '15404'

export const refs = {
  'fr-fr': ['TSG2-20'],
  'fr-ch': ['3G95-14'],
}
// On ré-exporte la classe du can en lui donnant un nom adapté à la série TSG2-20
export default class ProduitScalaireCoord extends ProduitScalaireCoordonnees {}
