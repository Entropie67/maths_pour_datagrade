import QuestionsPrix from './6N5-1'

export const titre =
  'Résoudre des problèmes de prix mettant en jeu une division'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

// Gestion de la date de publication initiale
export const dateDePublication = '11/05/2025'

export const uuid = '25d7a'
export const refs = {
  'fr-fr': ['6N2I-1'],
  'fr-2016': ['6C12-0b'],
  'fr-ch': ['NR'],
}
export default class QuestionsPrix2 extends QuestionsPrix {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n7 : Division du prix par 10\n8 : Division du prix par un entier entre 3 et 9',
    ]
    this.sup = '7-8'
  }
}
