import ResoudreEquationsFonctionDeReference2 from './can2F3-04_old'

export const titre = 'Résoudre une équation avec la fonction inverse'
export const interactifReady = true

export const dateDePublication = '18/08/2026'
export const uuid = '5cef8'
export const refs = { 'fr-fr': ['can2F25-04'], 'fr-ch': [] }

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora et Stéphane Guyon
 */
export default class EquationInversePlusB extends ResoudreEquationsFonctionDeReference2 {
  constructor() {
    super()
    this.sup = 2
    this.besoinFormulaireNumerique = false
  }
}
