import MilieuSegment from '../can/TSpe/canTSpeE01'
export const titre = "Déterminer le milieu d'un segment dans l'espace"
export const dateDePublication = '04/08/2025'
export const interactifReady = true

/**
 * Clone de CanTspeE01 pour les auto 1er
 * @author Stéphane Guyon
 */

export const uuid = 'a85e7'

export const refs = {
  'fr-fr': ['TSG2-11'],
  'fr-ch': ['3G90-9'],
}
export default class EspaceMilieu extends MilieuSegment {}
