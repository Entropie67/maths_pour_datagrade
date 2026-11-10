import SigneProduitQuotientRelatifs from './4C10-0'

export const dateDeModifImportante = '02/11/2025'
export const titre = "Donner le signe d'un produit de nombres relatifs"
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

/**
 * Signe du produit de relatifs
 * 4C10-1 fils de 4C10-0
 * @author Sébastien Lozano
 */
export const uuid = '4fd42'

export const refs = {
  'fr-fr': ['4C10-1'],
  'fr-ch': ['10LCNO2B-2', '10LSNO2B-2', '11CTNO1A-2', 'PRQNO06B-8'],
}
export default class SigneProduitRelatifs extends SigneProduitQuotientRelatifs {
  constructor() {
    super()
    this.exo = '4C10-1'
    this.sup = 4
    this.nbQuestions = 3

    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      '1 : 2 facteurs\n2 : 3 facteurs\n3 : 4 facteurs\n4 : Mélange',
    ]
  }
}
