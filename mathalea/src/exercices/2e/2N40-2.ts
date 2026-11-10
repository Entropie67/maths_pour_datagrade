import NotationPuissance from '../4e/4C33-0'
export const titre = 'Utiliser la notation puissance'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDePublication = '12/09/2023'
export const uuid = 'fb1a4'

export const refs = {
  'fr-fr': ['2N40-2'],
  'fr-ch': ['10LCNO4A-5', '10LSNO4A-5'],
}
export default class NotationPuissanceEn2nde extends NotationPuissance {
  constructor() {
    super()
    this.sup = 3
    this.sup3 = 3
    this.classe = 2
    this.besoinFormulaire3Numerique = [
      'Exposant',
      3,
      '1 : Positif\n2 : Négatif\n3 : Mélange',
    ]
  }
}
