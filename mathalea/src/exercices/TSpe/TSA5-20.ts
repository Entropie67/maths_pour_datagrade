import EquationsLog from '../TT/TTE-5'
export const titre = 'Résoudre des équations du type $a^x = b$'
export const dateDePublication = '04/08/2025'
export const interactifReady = true

/**
 * Clone de CanTspeE01 pour les auto 1er
 * @author Stéphane Guyon
 */

export const uuid = '00ec7'

export const refs = {
  'fr-fr': ['TSA5-20', 'TCA4-20'],
  'fr-ch': [],
}
export default class EquationsLogln extends EquationsLog {
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup2 = 2
  }
}
