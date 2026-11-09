import VecteurNormalPlan from '../can/TSpe/canTSpeE05'
export const titre =
  'Déterminer un vecteur normal à un plan donné par une équation cartésienne'
export const dateDePublication = '05/10/2024'
export const interactifReady = true

/**
 * Clone de CanTspeE03 pour les auto 1er
 * @author Stéphane Guyon
 */

export const uuid = '8633b'

export const refs = {
  'fr-fr': ['TSG2-42'],
  'fr-ch': ['3G99-4'],
}
// On ré-exporte la classe du can en lui donnant un nom adapté à la série TSG2-30
export default class VecteurNormalPlanEquuation extends VecteurNormalPlan {}
