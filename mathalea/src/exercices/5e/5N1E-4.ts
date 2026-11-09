import EcrireUneExpressionNumerique from './_Ecrire_une_expression_numerique'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const titre = 'Traduire une phrase par une expression et la calculer'
export const dateDeModifImportante = '18/10/2026'
export const uuid = '1f853'
export const refs = {
  'fr-fr': ['5N1E-4'],
  'fr-2016': ['5C12-1'],
  'fr-ch': ['9R1NO8C-4', '9R2NO8C-4', '9R3NO8C-4', 'PRQST02A-2', 'PRQST02B-4'],
}
export default class TraduireUnePhraseParUneExpressionEtCalculer extends EcrireUneExpressionNumerique {
  constructor() {
    super()
    this.version = 3
    this.sup3 = true
    this.litteral = false
    this.sousCasCinqOperations = [3, 4, 5] // formes à 5 opérations
    this.sup4 = 6
    this.besoinFormulaire2CaseACocher = [
      'Utilisation de décimaux (pas de calcul mental)',
      false,
    ]
    this.besoinFormulaire3CaseACocher = ['Présence du signe "fois"', true]
  }
}
