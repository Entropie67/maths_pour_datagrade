import FabriqueAYohaku from '../6e/_Yohaku'
export const titre = 'Résoudre un Yohaku additif avec des fractions'
export const dateDePublication = '10/08/2022'
export const dateDeModifImportante = '16/12/2023'

export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCOpen'

export const uuid = '1a61d'

export const refs = {
  'fr-fr': ['4C21-2', 'BP2AutoH11'],
  'fr-ch': ['9R3NO4J-9', '10CTNO3A-9', '10LCNO3A-9', '10LSNO3A-9', 'PRQNO12A-7'],
}
/**
 * @author Jean-claude Lhote
 * @constructor
 */
export default class FabriqueAYohaku4CF2 extends FabriqueAYohaku {
  constructor() {
    super()
    this.sup = 10
    this.sup2 = 1
    this.sup3 = 2
    this.sup4 = false
    this.type = 'fractions dénominateurs multiples'
    this.besoinFormulaireNumerique = false
    this.besoinFormulaire2Numerique = false
    this.besoinFormulaire3Numerique = false
    this.besoinFormulaire4CaseACocher = [
      "Avec aide (la présence d'une valeur impose une solution unique)",
      false,
    ]
  }
}
