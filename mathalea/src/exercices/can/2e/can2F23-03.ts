import ComparerAvecFctRef from './can2F3-06_old'

export const titre = 'Comparer deux nombres avec la valeur absolue'
export const interactifReady = true

export const dateDePublication = '18/08/2026'
export const uuid = 'b26a7'
export const refs = { 'fr-fr': ['can2F23-03', '2N13-flash1'], 'fr-ch': [] }

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora et Stéphane Guyon
 */
export default class ComparerAvecValeurAbsolue extends ComparerAvecFctRef {
  constructor() {
    super()
    this.typeQuestionFixe = 4
  }
}
