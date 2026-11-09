import ResoudreEquationsFonctionDeReference from './can2F3-03_old'

export const titre = 'Résoudre une équation avec la fonction carré'
export const interactifReady = true

export const dateDePublication = '18/08/2026'

export const uuid = '6c2d9'

export const refs = {
  'fr-fr': ['can2F25-01', '2F23-flash3'],
  'fr-ch': [],
}

/**
 * @author Stéphane Guyon
 * @author Gilles Mora
 */
export default class EquationFonctionCarre extends ResoudreEquationsFonctionDeReference {
  constructor() {
    super()
    this.typeQuestionFixe = 2
    this.besoinFormulaire3Numerique = false
  }
}
