import ResoudreEquationsFonctionDeReference2 from './can2F3-04_old'

export const titre =
  'Résoudre une équation $b-\\sqrt{x}=c$ (année de transition)'
export const interactifReady = true

export const dateDePublication = '18/08/2026'
export const uuid = '4bde7'
export const refs = { 'fr-fr': [], 'fr-ch': [] }

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora et Stéphane Guyon
 */
export default class EquationBMoinsRacine extends ResoudreEquationsFonctionDeReference2 {
  constructor() {
    super()
    this.typeQuestionFixe = 4
    this.besoinFormulaireNumerique = false
  }
}
