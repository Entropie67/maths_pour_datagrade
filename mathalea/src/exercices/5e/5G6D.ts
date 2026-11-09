import ConstructionsParallelogrammesParticuliers from './ConstructionsParallelogrammesParticuliers'

export const amcReady = true
export const amcType = 'AMCHybride'
export const titre =
  'Utiliser une propriété caractéristique du parallélogramme pour le construire et auto-vérification'
export const dateDePublication = '25/06/2026'

/**
 * Tracer des parallélogrammes et auto-vérificatioon
 *
 * @author Eric Elter
 */

export const uuid = 'faff5'

export const refs = {
  'fr-fr': ['5G6D'],
  'fr-2016': ['5G41-4'],
  'fr-ch': ['NR'],
}
export default class ConstruireParallélogrammesCaracteristiques extends ConstructionsParallelogrammesParticuliers {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de construction',
      [
        'Nombres séparés par des tirets  :',
        '1 : 2 côtés et une diagonale donnés',
        '2 : Diagonales et angle entre elles donnés',
        '3 : 2 côtés et un angle au sommet donnés',
        '4 : Un côté et demi-diagonales donnés',
        '5 : Une diagonale et 2 angles donnés',
        '6 : Mélange',
      ].join('\n'),
    ]
    this.sup = '2-3-4-5'
    this.nbQuestions = 2
    this.exo = '5G6D'
  }
}
