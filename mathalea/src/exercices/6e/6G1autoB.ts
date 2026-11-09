import VocabulaireDesTriangles from '../5e/VocabulaireDesTriangles'
export const titre = 'Utiliser le vocabulaire des triangles'
export const interactifReady = false

/**
 * Vocabulaire des triangles
 * @author Sébastien Lozano
 */
export const uuid = 'b5eaf'

export const refs = {
  'fr-fr': ['6G1autoB'],
  'fr-2016': ['6G20-2'],
  'fr-ch': ['9R1ES2A-2', '9R2ES2A-2', '9R3ES2A-2', 'PRQES02A-3'],
}
export default class VocabulaireDesTriangles6e extends VocabulaireDesTriangles {
  declare classe: number

  constructor() {
    super()
    this.classe = 6
  }
}
