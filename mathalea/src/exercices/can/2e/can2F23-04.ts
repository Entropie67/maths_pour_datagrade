import ComparerAvecFctRef from './can2F3-06_old'

export const titre =
  'Comparer deux nombres avec la fonction racine carrée (année de transition)'
export const interactifReady = true

export const dateDePublication = '18/08/2026'
export const uuid = 'd28c9'
export const refs = { 'fr-fr': ['can2F23-04'], 'fr-ch': [] }

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora et Stéphane Guyon
 */
export default class ComparerAvecFonctionRacineCarree extends ComparerAvecFctRef {
  constructor() {
    super()
    this.typeQuestionFixe = 3
  }
}
