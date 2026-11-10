import EcrireUneExpressionNumerique from './_Ecrire_une_expression_numerique'
export const titre = 'Traduire une expression par une phrase'
export const amcReady = true
export const amcType = 'AMCOpen'
export const interactifReady = true

export const dateDeModifImportante = '21/09/2023'
export const uuid = '458ae'
export const refs = {
  'fr-fr': ['5N5D'],
  'fr-2016': ['5L10-3'],
  'fr-ch': ['9R2FA3B-2', '9R3FA3B-2', '10CTFA4A-2', '10LCFA4A-2', '10LSFA4A-2', '10LCFA4C-8', '10LSFA4C-8', '11CTFA3A-2', '11CTFA3C-8', '11LCFA3C-8', '11LSFA3C-8', 'PRQAL01A-4', 'PRQAL01B-8'],
}
export default class TraduireUneExpressionLitteraleParUnePhrase extends EcrireUneExpressionNumerique {
  constructor() {
    super()
    this.version = 2
    this.litteral = true
    this.sup4 = '2-3'
  }
}
