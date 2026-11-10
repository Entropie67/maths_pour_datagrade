import ResoudreEquationsFonctionDeReference2 from './can2F3-04_old'

export const titre = 'Résoudre une équation $b-\\dfrac{1}{x}=c$'
export const interactifReady = true

export const dateDePublication = '18/08/2026'
export const uuid = '6dfa9'
export const refs = { 'fr-fr': [], 'fr-ch': [] }

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora et Stéphane Guyon
 */
export default class EquationBMoinsInverse extends ResoudreEquationsFonctionDeReference2 {
  constructor() {
    super()
    this.typeQuestionFixe = 6
    this.besoinFormulaireNumerique = false
  }
}
