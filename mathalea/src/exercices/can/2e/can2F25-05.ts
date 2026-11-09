import ResoudreEquationsFonctionDeReference from './can2F3-03_old'

export const titre = 'Résoudre une équation avec une valeur absolue'
export const interactifReady = true

export const dateDePublication = '18/08/2026'

export const uuid = 'f31a8'

export const refs = {
  'fr-fr': ['can2F25-05'],
  'fr-ch': [],
}

/**
 * @author Stéphane Guyon
 * @author Gilles Mora
 */
export default class EquationValeurAbsolue extends ResoudreEquationsFonctionDeReference {
  constructor() {
    super()
    this.typeQuestionFixe = 1
    this.besoinFormulaire3Numerique = false
  }
}
