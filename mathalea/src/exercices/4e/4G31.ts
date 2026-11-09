import ReciproqueThales from '../3e/3G21'
export const titre = 'Contrôler si deux droites sont parallèles'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDeModifImportante = '11/06/2024'
export const uuid = '4dce8'
export const refs = {
  'fr-fr': ['4G31'],
  'fr-ch': ['NR'],
}
export default class ReciproqueThales4eme extends ReciproqueThales {
  constructor() {
    super()
    this.quatrieme = true
    this.besoinFormulaire3Numerique = false
  }
}
