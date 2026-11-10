import IntervallesDeR from '../../2e/2N12-1'
export const titre = "Donner l'intervalle associé à une inégalité"
export const interactifReady = true

export const dateDePublication = '11/11/2025'

/**
 * @author
 */
export const uuid = '7e24e'

export const refs = {
  'fr-fr': ['can2N10-05'],
  'fr-ch': [],
}
class Ineg extends IntervallesDeR {
  can: boolean
  constructor() {
    super()
    this.nbQuestions = 1
    this.can = true
    this.sup = 1
  }
}
export default Ineg
