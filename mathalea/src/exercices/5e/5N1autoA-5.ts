import TrouverChiffre from '../3e/3A10-6'
export const titre =
  "Trouver un chiffre pour qu'un nombre soit divisible par un autre"
export const interactifReady = true

export const dateDePublication = '11/09/2026'
export const uuid = '187ee'
export const refs = {
  'fr-fr': ['5N1autoA-5'],
  'fr-ch': ['NR'],
}

/**
 * @author Éric Elter
 */

export default class TrouverChiffre5ebis extends TrouverChiffre {
  constructor() {
    super()
    this.sup = '2-3'
    this.sup2 = '1-3-8'
    this.sup4 = true
  }
}
