import CalculerUnPourcentage from '../../6e/6N3P'

export const interactifReady = true

export const amcType = 'AMCNum'
export const amcReady = true
export const titre =
  'Résoudre un problème de calcul de pourcentage par complément à $100\\,\\%$'

export const dateDePublication = '15/11/2022'

/**
 * @author Gilles Mora
 * Créé le 20/01/2022

 */

export const uuid = 'fb422'

export const refs = {
  'fr-fr': ['can6P2-03', '6N3O-flash1'],
  'fr-ch': ['NR'],
}
export default class CalculerUnPourcentageCAN extends CalculerUnPourcentage {
  constructor() {
    super()
    this.nbQuestions = 1
    this.can = true
    this.consigne = ''
  }
}
