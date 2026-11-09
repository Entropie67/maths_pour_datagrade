import SommeFractionsDecimales from '../../6e/6N1F-5'
export const interactifReady = true

export const titre = "Écrire sous forme d'une fraction décimale"

export const dateDePublication = '20/01/2022'

/**
 * @author Éric Elter
 * Créé le 20/01/2022

 */
export const uuid = '7945e'

export const refs = {
  'fr-fr': ['can6N21-04', '6N2autoB-7'],
  'fr-ch': ['NR'],
}
export default class SommeFractionsDecimalesCAN extends SommeFractionsDecimales {
  constructor() {
    super()
    this.nbQuestions = 1
    this.can = true
    this.sup = '1-2'
    this.sup2 = 2
  }
}
