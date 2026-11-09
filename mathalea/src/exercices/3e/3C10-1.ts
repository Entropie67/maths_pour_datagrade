import EcritureDecimalePuissance from '../4e/4C30-3'
export const titre =
  "Donner l'écriture entière ou fractionnaire d'une puissance"
export const dateDePublication = '05/09/2023'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const uuid = 'eb865'
export const refs = {
  'fr-fr': ['3C10-1'],
  'fr-ch': ['10LCNO4A-4', '10LSNO4A-4', 'PRQNO12C-2', '9R1NO5A-3', '9R2NO5A-3', '9R3NO5A-3', 'PRQNO03B-4', 'PRQNO07A-3'],
}
export default class EcritureDecimalePuissance3e extends EcritureDecimalePuissance {
  constructor() {
    super()
    this.sup = 3
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Exposants positifs\n2 : Exposants négatifs\n3 : Mélange',
    ]
  }
}
