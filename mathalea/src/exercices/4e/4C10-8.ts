import FabriqueAYohaku from '../6e/_Yohaku'
export const titre =
  'Résoudre un Yohaku multiplicatif avec des nombres relatifs'
export const dateDePublication = '10/08/2022'
export const dateDeModifImportante = '16/12/2023'

export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCOpen'

export const uuid = '2fbc0'

export const refs = {
  'fr-fr': ['4C10-8'],
  'fr-ch': ['10LCNO2C-6', '10LSNO2C-6', '11CTNO1B-6'],
}
/**
 * @author Jean-claude Lhote
 * @constructor
 */
export default class FabriqueAYohaku4R1 extends FabriqueAYohaku {
  constructor() {
    super()
    this.sup = 10
    this.sup2 = 2
    this.sup3 = 2
    this.sup4 = false
    this.type = 'entiers relatifs'
    this.besoinFormulaireNumerique = false
    this.besoinFormulaire2Numerique = false
    this.besoinFormulaire3Numerique = false
    this.besoinFormulaire4CaseACocher = [
      "Avec aide (la présence d'une valeur impose une solution unique)",
      false,
    ]
  }
}
