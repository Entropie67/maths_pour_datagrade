import ExpressionsLogX from '../TT/TTE-8'
export const titre = 'Exprimer en fonction de $\\ln(x)$'
export const dateDePublication = '04/08/2025'
export const interactifReady = true

/**
 * Clone de CanTspeE01 pour les auto 1er
 * @author Stéphane Guyon
 */

export const uuid = '0d232'

export const refs = {
  'fr-fr': ['TSA5-11', 'TCA4-11'],
  'fr-ch': [],
}
export default class ExpressionsLnX extends ExpressionsLogX {
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup2 = 2
  }
}
