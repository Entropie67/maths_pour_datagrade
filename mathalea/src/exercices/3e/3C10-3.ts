import NotationPuissance from '../4e/4C33-0'
export const titre = 'Utiliser la notation puissance'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDePublication = '24/09/2023'
export const uuid = '31bd7'
export const refs = {
  'fr-fr': ['3C10-3'],
  'fr-ch': ['PRQNO03B-6'],
}
export default class NotationPuissanceEn3eme extends NotationPuissance {
  constructor() {
    super()
    this.sup = 3
    this.sup3 = 3
    this.classe = 3
    this.besoinFormulaire3Numerique = [
      'Exposant',
      3,
      '1 : Positif\n2 : Négatif\n3 : Mélange',
    ]
  }
}
