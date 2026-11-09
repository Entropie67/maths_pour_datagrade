import ComparerAvecFctRef from './can2F3-06_old'

export const titre =
  'Comparer deux nombres avec la fonction cube (année de transition)'
export const interactifReady = true

export const dateDePublication = '18/08/2026'
export const uuid = 'c27b8'
export const refs = { 'fr-fr': ['can2F23-05'], 'fr-ch': [] }

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora et Stéphane Guyon
 */
export default class ComparerAvecFonctionCube extends ComparerAvecFctRef {
  constructor() {
    super()
    this.typeQuestionFixe = 2
  }
}
