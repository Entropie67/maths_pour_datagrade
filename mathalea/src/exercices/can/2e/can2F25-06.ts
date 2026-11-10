import ResoudreEquationsFonctionDeReference2 from './can2F3-04_old'

export const titre = 'Résoudre une équation avec la fonction valeur absolue'
export const interactifReady = true

export const dateDePublication = '18/08/2026'
export const uuid = '8fbc1'
export const refs = { 'fr-fr': ['can2F25-06'], 'fr-ch': [] }

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora et Stéphane Guyon
 */
export default class EquationValeurAbsolueDecalee extends ResoudreEquationsFonctionDeReference2 {
  constructor() {
    super()
    this.typeQuestionFixe = 8
    this.besoinFormulaireNumerique = false
  }
}
