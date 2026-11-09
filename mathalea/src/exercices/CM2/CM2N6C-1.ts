import QuestionsPrix from '../6e/6N5-1'
export const titre = 'Résoudre des problèmes de prix'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

// Gestion de la date de publication initiale
export const dateDePublication = '02/11/2021'

/**
 * @author Éric Elter

 * Date octobre 2021
 */
export const uuid = 'b0311'

export const refs = {
  'fr-fr': ['CM2N6C-1', 'BP2CCF5'],
  'fr-2016': ['c3C13', 'BP2CCF5'],
  'fr-ch': ['NR'],
}

export default class QuestionsPrixCM extends QuestionsPrix {
  constructor() {
    super()
    this.sup = '1-2-3-4-5-6' // Par défaut, pas de divisions
    this.sup3 = false // Par défaut, que des entiers
  }
}
