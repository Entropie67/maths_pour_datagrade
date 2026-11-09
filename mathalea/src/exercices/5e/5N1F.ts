import EcrireUneExpressionNumerique from './_Ecrire_une_expression_numerique'
export const titre = 'Traduire une phrase par une expression'
export const dateDeModifImportante = '18/10/2026'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const uuid = '10777'
export const refs = {
  'fr-fr': ['5N1F'],
  'fr-2016': ['5C11'],
  'fr-ch': ['9R1NO8A-4', '9R2NO8A-4', '9R3NO8A-4', 'PRQST02A-1'],
}
export default class TraduireUnePhraseParUneExpression extends EcrireUneExpressionNumerique {
  constructor() {
    super()
    this.version = 1
    this.litteral = false
    this.sousCasCinqOperations = [3, 4, 5] // formes à 5 opérations
    this.sup2 = false
    this.nbQuestions = 5
    this.sup4 = '1-2-3'
  }
}
