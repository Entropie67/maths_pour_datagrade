import IntervallesDeR from '../../2e/2N12-1'
export const titre = "Donner l'inégalité associée à un intervalle"
export const interactifReady = true

export const dateDePublication = '11/11/2025'

/**
 * @author
 */
export const uuid = '0ff65'

export const refs = {
  'fr-fr': ['can2N10-06'],
  'fr-ch': [],
}
class Interv extends IntervallesDeR {
  can: boolean
  constructor() {
    super()
    this.nbQuestions = 1
    this.can = true
    this.sup = 2
  }
}
export default Interv
