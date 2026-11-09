import ResoudreEquationsFonctionDeReference from './can2F3-03_old'

export const titre =
  'Résoudre une équation avec la fonction cube (année de transition)'
export const interactifReady = true

export const dateDePublication = '18/08/2026'

export const uuid = '8a5c3'

export const refs = {
  'fr-fr': ['can2F25-08'],
  'fr-ch': [],
}

/**
 * @author Stéphane Guyon
 * @author Gilles Mora
 */
export default class EquationFonctionCube extends ResoudreEquationsFonctionDeReference {
  constructor() {
    super()
    this.typeQuestionFixe = 4
    this.besoinFormulaire3Numerique = false
  }
}
