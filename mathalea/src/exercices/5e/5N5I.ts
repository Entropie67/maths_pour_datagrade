import ExerciceTableurVocabulaire from '../6e/6I1B-5'
export const titre = 'Saisir une formule simple sur tableur'
export const dateDePublication = '23/05/2026'
export const interactifReady = true

/**
 * @author Éric Elter
 */

export const uuid = '51f1e'

export const refs = {
  'fr-fr': ['5N5I'],
  'fr-2016': ['5I14'],
  'fr-ch': [],
}
export default class ExerciceTableurVocabulaire5e extends ExerciceTableurVocabulaire {
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
        ' 6 : Opposé',
        ' 7 : Somme de deux nombres',
        ' 8 : Différence entre deux nombres',
        ' 9 : Produit de deux nombres',
        '10 : Quotient de deux nombres',
      ].join('\n'),
    ]

    this.niveau = 5
    this.sup2 = 4
  }
}
