import EcrireUneExpressionNumerique from './_Ecrire_une_expression_numerique'
export const titre = 'Traduire une expression par une phrase'
export const amcReady = true
export const amcType = 'AMCOpen'
export const interactifReady = true

export const dateDeModifImportante = '18/10/2026'
export const uuid = '49964'
export const refs = {
  'fr-fr': ['5N1F-1'],
  'fr-2016': ['5C11-1'],
  'fr-ch': ['9R1NO8A-5', '9R2NO8A-5', '9R3NO8A-5', 'PRQST02A-6'],
}
export default class TraduireUneExpressionParUnePhrase extends EcrireUneExpressionNumerique {
  constructor() {
    super()
    this.version = 2
    this.litteral = false
    this.sousCasCinqOperations = [3, 4, 5] // formes à 5 opérations
    this.nbQuestions = 5
    this.sup4 = '1-2-3'
  }
}
