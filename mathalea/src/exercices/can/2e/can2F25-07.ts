import ResoudreEquationsFonctionDeReference from './can2F3-03_old'

export const titre =
  'Résoudre une équation avec la fonction racine carrée (année de transition)'
export const interactifReady = true

export const dateDePublication = '18/08/2026'

export const uuid = '9d6e2'

export const refs = {
  'fr-fr': ['can2F25-07'],
  'fr-ch': [],
}

/**
 * @author Stéphane Guyon
 * @author Gilles Mora
 */
export default class EquationFonctionRacineCarree extends ResoudreEquationsFonctionDeReference {
  constructor() {
    super()
    this.typeQuestionFixe = 5
    this.besoinFormulaire3Numerique = false
  }
}
