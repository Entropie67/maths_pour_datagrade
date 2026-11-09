import DeriverLambdaU from '../1e/1AN14-1'
export const titre = 'Dériver une fonction du type $\\lambda u$'
export const interactifReady = true

export const dateDePublication = '30/07/2026'

/**
 * Clone de 1AN14-1 pour le Bac Pro Première.
 * Retirer la fonction racine carrée et le monôme de degré 2 à 6 des types de fonctions.
 */

export const uuid = '0e37c'

export const refs = {
  'fr-fr': ['BP1FDEV02'],
  'fr-ch': [],
}
export default class ExerciceBP1FDEV02 extends DeriverLambdaU {
  constructor() {
    super()
    this.besoinFormulaireTexte = false
    this.sup = '1-3-4'
  }
}
