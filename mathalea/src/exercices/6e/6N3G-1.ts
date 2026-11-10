import FractionsCalculsSimples from './6N3K-1'

export const titre = 'Effectuer des multiplications simples avec des fractions'
export const dateDePublication = '24/06/2025'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * Effectuer des multiplications simples avec des fractions
 * @author Rémi Angot pour 6N22 et Éric Elter pour ce clone
 */

export const uuid = '704ee'
export const refs = {
  'fr-fr': ['6N3G-1', 'CM2N2I'],
  'fr-2016': ['6N22-3'],
  'fr-ch': ['10LSNO3B-1', '11CTNO2A-1', '11LCNO2A-1', 'PRQNO12B-4'],
}
export default class FractionsCalculsSimples2 extends FractionsCalculsSimples {
  constructor() {
    super()
    this.sup2 = 5
    this.besoinFormulaire2Texte = false
    this.nbQuestions = 4
  }
}
