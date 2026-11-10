import AiresCalculMental from '../5e/5G5D-2'

export const titre =
  "Calculer l'aire de carrés et de rectangles (calcul mental)"
export const dateDePublication = '30/07/2025'
export const interactifReady = true

/**
 * Calculer l'aire de carré, rectangle ou triangle rectangle
 * @author Éric Elter (comme clone de 6M25-2 de Rémi Angot)
 */

export const uuid = '4b146'

export const refs = {
  'fr-fr': ['6M2C-2', 'BP1AUTO106', 'CM2M1E'],
  'fr-2016': ['6M25-2a'],
  'fr-ch': ['9R1GM2B-6', '9R2GM2B-6', '9R3GM2B-6'],
}
export default class AiresCalculMental6e extends AiresCalculMental {
  constructor() {
    super()
    this.sup = '1-2'
  }
}
