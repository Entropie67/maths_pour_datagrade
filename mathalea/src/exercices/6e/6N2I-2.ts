import QuestionsMasses from './6N5-2'

export const titre =
  'Résoudre des problèmes de masses mettant en jeu une division'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

// Gestion de la date de publication initiale
export const dateDePublication = '11/05/2025'

export const uuid = 'f5c44'
export const refs = {
  'fr-fr': ['6N2I-2'],
  'fr-2016': ['6C12-1b'],
  'fr-ch': ['NR'],
}
export default class QuestionsMasses2 extends QuestionsMasses {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n7 : Division du prix par 10\n8 : Division du prix par un entier entre 3 et 9',
    ]
    this.sup = '7-8'
  }
}
