import ConstructibiliteDesTriangles from '../5e/_Constructibilite_des_triangles'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

export const titre = 'Justifier la construction des triangles via les angles'
export const dateDeModifImportante = '10/12/2023'

/**
 * Justifier la construction des triangles via les angles
 * @author Sébastien Lozano
 */
export const uuid = 'bcbe1'

export const refs = {
  'fr-fr': ['6G6C-1'],
  'fr-2016': ['5G31-1'],
  'fr-ch': ['9R1ES2A-5', '9R2ES2A-5', '9R3ES2A-5', 'PRQES01C-2'],
}
export default class ConstructibiliteDesTrianglesLongueurs extends ConstructibiliteDesTriangles {
  exo: string
  constructor() {
    super()
    this.exo = '5G31-1'
  }
}
