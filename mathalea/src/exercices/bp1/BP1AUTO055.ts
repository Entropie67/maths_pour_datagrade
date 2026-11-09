import FonctionsLineaires from '../3e/3F20'
export const titre = 'Fonctions linéaires'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDePublication = '30/07/2026'

/**
 * Clone de 3F20 pour le Bac Pro Première.
 * Uniquement les questions de type 7 et 8 (expression par valeurs et par graphique).
 */

export const uuid = 'b3348'

export const refs = {
  'fr-fr': ['BP1AUTO055'],
  'fr-ch': ['NR'],
}
export default class ExerciceBP1AUTO055 extends FonctionsLineaires {
  constructor() {
    super()
    this.besoinFormulaire2Texte = false
    this.sup2 = '7-8'
  }
}
