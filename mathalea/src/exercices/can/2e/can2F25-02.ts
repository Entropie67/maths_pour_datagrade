import ResoudreEquationsFonctionDeReference2 from './can2F3-04_old'

export const titre = 'Résoudre une équation avec la fonction carré$^*$'
export const interactifReady = true

export const dateDePublication = '18/08/2026'
export const uuid = '18ab4'
export const refs = { 'fr-fr': ['can2F25-02', '2F23-flash4'], 'fr-ch': [] }

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora et Stéphane Guyon
 */
export default class EquationCarrePlusB extends ResoudreEquationsFonctionDeReference2 {
  constructor() {
    super()
    this.sup = 1
    this.besoinFormulaireNumerique = false
  }
}
