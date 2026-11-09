import RepresentationParametrique from '../can/TSpe/canTSpeE03'
export const titre = "Déterminer une représentation paramétrique d'une droite"
export const dateDePublication = '05/10/2024'
export const interactifReady = true

/**
 * Clone de CanTspeE03 pour les auto 1er
 * @author Stéphane Guyon
 */

export const uuid = '8633a'

export const refs = {
  'fr-fr': ['TSG2-30'],
  'fr-ch': [],
}
// On ré-exporte la classe du can en lui donnant un nom adapté à la série TSG2-30
export default class RepresentationParametriqueDroite extends RepresentationParametrique {}
