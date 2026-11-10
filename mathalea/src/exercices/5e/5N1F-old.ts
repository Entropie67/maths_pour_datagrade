// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 9d15d continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import EcrireUneExpressionNumerique from './_Ecrire_une_expression_numerique'
export const titre = 'Traduire une phrase par une expression'
export const dateDeModifImportante = '21/09/2023'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'
export const uuid = '9d15d'
export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}
export default class TraduireUnePhraseParUneExpressionOld extends EcrireUneExpressionNumerique {
  constructor() {
    super()
    this.version = 1
    this.litteral = false
    this.sup2 = false
    this.nbQuestions = 5
    this.sup4 = '1-2-3'
  }
}
