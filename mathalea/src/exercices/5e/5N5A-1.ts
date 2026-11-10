import EcrireUneExpressionNumerique from './_Ecrire_une_expression_numerique'
export const titre = 'Traduire une phrase par une expression'
export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDeModifImportante = '04/11/2023'
export const interactifReady = true

export const uuid = 'fefa0'
export const refs = {
  'fr-fr': ['5N5A-1'],
  'fr-2016': ['5L10-1'],
  'fr-ch': ['9R2FA3C-2', '9R3FA3C-2', '10LCFA4C-2', '10LSFA4C-2', '11CTFA3C-2', '11LCFA3C-2', '11LSFA3C-2', 'PRQAL01B-3'],
}
export default class TraduireUnePhraseParUneExpressionLitterale extends EcrireUneExpressionNumerique {
  constructor() {
    super()
    this.version = 1
    this.sup2 = false
    this.litteral = true
    this.sup4 = '2-3-4-5'
  }
}
