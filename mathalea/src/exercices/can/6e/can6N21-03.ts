import SommeFractionsDecimales from '../../6e/6N1F-5'
export const interactifReady = true

export const titre =
  'Passer d’un calcul de fractions décimales à une écriture décimale'

export const dateDePublication = '20/01/2022'

/**
 * @author Éric Elter
 * Créé le 20/01/2022

 */
export const uuid = 'ce3de'

export const refs = {
  'fr-fr': ['can6N21-03', '6N2autoB-9'],
  'fr-ch': ['NR'],
}
export default class SommeFractionsDecimalesCAN extends SommeFractionsDecimales {
  constructor() {
    super()
    this.nbQuestions = 1
    this.can = true
    this.sup = '5-6'
    this.sup2 = 1
  }
}
