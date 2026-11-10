import LireUneAbscisseAvecZoom from '../6e/6N1H-3'
export const titre = 'Lire une abscisse décimale avec zoom'
export const amcReady = true
export const amcType = 'AMCHybride'
export const interactifReady = true

export const dateDePublication = '13/11/2020'
export const uuid = 'b2f66'
export const refs = {
  'fr-fr': ['CM2N3J-2'],
  'fr-2016': ['c3N23'],
  'fr-ch': ['9R1NO2C-14', '9R2NO2C-14', '9R3NO2C-14'],
}
export default class LireUneAbscisseAvecZoomCM extends LireUneAbscisseAvecZoom {
  constructor() {
    super()
    this.niveau = 'CM'
    this.sup = 1
    this.besoinFormulaireNumerique = false
  }
}
