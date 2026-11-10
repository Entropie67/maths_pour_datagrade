import VocabulaireAngles from '../5e/5G4autoA'
export const interactifReady = true

export const titre = 'Connaître le vocabulaire sur les angles'
export const dateDePublication = '05/08/2025'

/**
 * @author Éric Elter
 */

export const uuid = '04ea4'

export const refs = {
  'fr-fr': ['6G4A-3'],
  'fr-2016': ['6G22-3'],
  'fr-ch': ['9R1ES1C-4', '9R2ES1C-4', '9R3ES1C-4', 'PRQES01B-7'],
}
export default class VocabulaireAngles6e extends VocabulaireAngles {
  constructor() {
    super()
    this.sup = '3-4-6-7-8'
  }
}
