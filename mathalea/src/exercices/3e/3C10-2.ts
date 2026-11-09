import PuissancesDunRelatif1 from '../4e/4C33-1'
export const titre = 'Effectuer des calculs avec des puissances'
export const dateDePublication = '17/09/2023'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const uuid = '379cd'
export const refs = {
  'fr-fr': ['3C10-2'],
  'fr-ch': ['10LCNO4A-8', '10LSNO4A-8', 'PRQNO12C-4'],
}
export default class PuissancesDunRelatif13e extends PuissancesDunRelatif1 {
  constructor() {
    super()
    this.classe = 3
    this.besoinFormulaire3CaseACocher = ['Avec des exposants négatifs', false]
    this.sup3 = false
  }
}
