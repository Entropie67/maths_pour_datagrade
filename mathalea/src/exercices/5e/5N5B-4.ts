import EcrireUneExpressionNumerique from './_Ecrire_une_expression_numerique'
export const titre = 'Traduire une phrase par une expression et la calculer'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '21/09/2023'
export const uuid = '2c600'
export const refs = {
  'fr-fr': ['5N5B-4'],
  'fr-2016': ['5L14-5'],
  'fr-ch': ['9R2FA3C-6', '9R3FA3C-6', '10CTFA4B-9', '10LCFA4B-9', '10LSFA4B-9', '11CTFA3B-9', '11LCFA3B-9', '11LSFA3B-9'],
}
export default class TraduireUnePhraseParUneExpressionLitteraleEtCalculer extends EcrireUneExpressionNumerique {
  constructor() {
    super()
    this.version = 3
    this.litteral = true
    this.sup4 = '1-2-3'
  }
}
