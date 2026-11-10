import PuissanceDUnEntier from '../4e/4C30-5'
export const titre = 'Effectuer des calculs avec des puissances'
export const dateDePublication = '02/07/2026'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
/**
 * Puissances d'un entier (variant de 4C30-5 avec des bases relatives)
 * @author Jean-Claude Lhote adaptation pour le programme de 4e et de 3e : pas de règles de calcul
 */
export const uuid = 'c72db'

export const refs = {
  'fr-fr': ['3C10-5'],
  'fr-ch': ['10LCNO4A-9', '10LSNO4A-9', 'PRQNO12C-5'],
}
export default class PuissanceDUnEntier3e extends PuissanceDUnEntier {
  constructor() {
    super()
    this.niveau = 3
    this.besoinFormulaire2CaseACocher = ['Avec des exposants négatifs', false]
    this.sup2 = false
  }
}
