import CalculDeLongueur from '../3e/3G30'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const titre =
  'Utiliser le cosinus pour calculer une longueur dans un triangle rectangle'
export const dateDeModifImportante = '14/03/2026'

/**
 * @author Jean-claude Lhote
 * Exercice refait avec mathalea2d l'ancien exo MG32 porte la référence 4G40-MG32
 */
export const uuid = '3303a'

export const refs = {
  'fr-fr': ['4G40', '3AutoG13-1'],
  'fr-ch': ['NR'],
}
export default class CalculDeLongueur4e extends CalculDeLongueur {
  constructor() {
    super()

    this.level = 4
    this.sup = true
    this.sup2 = '3'
    this.besoinFormulaire2Texte = [
      'Types de questions',
      'Nombres séparés par des tirets  :\n1 : Côté adjacent (cosinus)\n2 : Hypoténuse (cosinus)\n3 : Mélange',
    ]
  }
}
