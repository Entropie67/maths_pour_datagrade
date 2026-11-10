import CalculerLaValeurDUneExpressionLitterale from '../5e/5N5B'
export const titre = "Calculer la valeur d'une expression littérale"
export const interactifReady = true

export const uuid = '72766'
export const refs = {
  'fr-fr': ['4L22', '3AutoL02'],
  'fr-ch': ['NR'],
}
export const dateDePublication = '24/05/2025'
/**
 * @author Jean-claude Lhote (implémentation des nombres relatifs dans 5L14)
 */
export default class CalculerLaValeurDUneExpressionLitteraleDeg1Inc1 extends CalculerLaValeurDUneExpressionLitterale {
  constructor() {
    super()
    this.nbQuestions = 2
  }
}
