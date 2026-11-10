import SigneProduitQuotientRelatifs from './4C10-0'

export const dateDeModifImportante = '02/11/2025'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = "Donner le signe d'un quotient de nombres relatifs"

/**
 * Signe du produit de relatifs
 * 4C10-2 fils de 4C10-0
 * @author Sébastien Lozano
 */
export const uuid = 'aa4f9'

export const refs = {
  'fr-fr': ['4C10-2'],
  'fr-ch': ['10LCNO2B-3', '10LSNO2B-3', '11CTNO1A-3', 'PRQNO06B-9'],
}

export default class SigneQuotientRelatifs extends SigneProduitQuotientRelatifs {
  constructor() {
    super()
    this.exo = '4C10-2'
    this.sup = 5
    this.nbQuestions = 4
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      5,
      "1 : Quotient de deux nombres\n2 : Quotient d'un nombre sur un produit de deux facteurs\n3 : Quotient d'un produit de deux facteurs sur un nombre\n4 : Quotient de deux produits de deux facteurs\n5 : Mélange",
    ]
  }
}
