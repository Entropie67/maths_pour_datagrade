import QuestionsPrix from './6N5-1'

export const titre =
  'Résoudre des problèmes de prix avec des objets mettant en jeu des multiplications'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

// Gestion de la date de publication initiale
export const dateDePublication = '11/05/2025'

export const uuid = '04314'
export const refs = {
  'fr-fr': ['6N2G'],
  'fr-2016': ['6C12-0a'],
  'fr-ch': ['NR'], // Primaire anciennement :['9NO16-5'],
}
export default class QuestionsPrix1 extends QuestionsPrix {
  constructor() {
    super()
    this.sup = '1-2-5-6'
  }
}
