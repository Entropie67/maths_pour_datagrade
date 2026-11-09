// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid baa4b continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import EcrireUneExpressionNumerique from './_Ecrire_une_expression_numerique'
export const titre = 'Traduire une expression par une phrase'
export const amcReady = true
export const amcType = 'AMCOpen'
export const interactifReady = true

export const dateDeModifImportante = '21/09/2023'
export const uuid = 'baa4b'
export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}
export default class TraduireUneExpressionParUnePhraseOld extends EcrireUneExpressionNumerique {
  constructor() {
    super()
    this.version = 2
    this.litteral = false
    this.nbQuestions = 5
    this.sup4 = '1-2-3'
  }
}
