import FabriqueAYohaku from './_Yohaku'
export const titre = 'Résoudre un Yohaku multiplicatif'
export const dateDePublication = '10/08/2022'
export const dateDeModifImportante = '16/12/2023'

export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCOpen'
export const uuid = '08680'

export const refs = {
  'fr-fr': ['6N3autoD-4'],
  'fr-2016': ['6C10-7b'],
  'fr-ch': ['9R1NO6H-5', '9R2NO6H-5', '9R3NO6H-5', 'PRQST04A-2'], // Primaire anciennement :['9NO3-13'],
}
/**
 * @author Jean-claude Lhote
 * @constructor
 */
export default class FabriqueAYohaku6B extends FabriqueAYohaku {
  constructor() {
    super()
    this.sup = 10
    this.sup2 = 2
    this.sup3 = 2
    this.sup4 = false
    this.type = 'entiers'
    this.besoinFormulaireNumerique = false
    this.besoinFormulaire2Numerique = false
    this.besoinFormulaire3Numerique = false
    this.besoinFormulaire4CaseACocher = [
      "Avec aide (la présence d'une valeur impose une solution unique)",
      false,
    ]
  }
}
