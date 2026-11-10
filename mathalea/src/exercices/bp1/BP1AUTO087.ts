import FactoriserIdentitesRemarquables2 from '../2e/2L12-9'
export const titre = 'Factoriser une différence de deux carrés'
export const interactifReady = true

export const dateDePublication = '30/07/2026'

/**
 * Clone de 2L11-7 pour le Bac Pro Première.
 * Seulement la factorisation de x² - a², a étant un entier naturel donné.
 */

export const uuid = 'fbd2b'

export const refs = {
  'fr-fr': ['BP1AUTO087'],
  'fr-ch': [],
}
export default class ExerciceBP1AUTO087 extends FactoriserIdentitesRemarquables2 {
  constructor() {
    super()
    this.seulementDifferenceDeCarres = true
    this.besoinFormulaireNumerique = false
  }
}
