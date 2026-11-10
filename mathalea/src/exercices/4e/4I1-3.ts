import ExerciceTableurVocabulaire from '../6e/6I1B-5'
export const titre = 'Saisir une formule simple sur tableur'
export const dateDePublication = '23/05/2026'
export const interactifReady = true

/**
 * @author Éric Elter
 */

export const uuid = '62b48'

export const refs = {
  'fr-fr': ['4I1-3'],
  'fr-ch': [],
}
export default class ExerciceTableurVocabulaire4e extends ExerciceTableurVocabulaire {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Types de formules',
      [
        'Nombres séparés par des tirets :',
        ' 0 : Mélange',
        ' 1 : Double',
        ' 2 : Triple',
        ' 3 : Moitié',
        ' 4 : Quart',
        ' 5 : Dixième',
        ' 6 : Carré',
        ' 7 : Cube',
        ' 8 : Opposé',
        ' 9 : Inverse',
        '10 : Somme de deux nombres',
        '11 : Différence entre deux nombres',
        '12 : Produit de deux nombres',
        '13 : Quotient de deux nombres',
      ].join('\n'),
    ]

    this.niveau = 4
    this.sup2 = 1
  }
}
