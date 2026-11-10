import BetaModeleSpline from '../../2e/2F32-3'
export const interactifReady = true

export const titre = "Dresser un tableau de signes à partir d'un graphique"
export const dateDePublication = '07/12/2023'
/**
 * @author Gilles Mora
 *

 */
export const uuid = '659da'

export const refs = {
  'fr-fr': ['can2F3-06', '2F32-flash4'],
  'fr-ch': [],
}
export default class BetaModeleSplineCAN extends BetaModeleSpline {
  can: boolean
  constructor() {
    super()
    this.reponseCourteDisponible = false // La réponse est une figure ou un tableau.
    this.nbQuestions = 1
    this.can = true
    this.sup = 1
    this.correctionDetaillee = true
  }
}
