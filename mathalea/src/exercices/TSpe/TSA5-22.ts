import EquationsLog from '../TT/TTE-7'
export const titre = 'Résoudre une équation simple avec le logarithme'
export const dateDePublication = '04/08/2025'
export const interactifReady = true

/**
 * Clone de CanTspeE01 pour les auto 1er
 * @author Stéphane Guyon
 */

export const uuid = '76477'

export const refs = {
  'fr-fr': ['TSA5-22', 'TCA4-22'],
  'fr-ch': [],
}
export default class EquationsLogln extends EquationsLog {
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup2 = 2
  }
}
