import CourseAuxNombresSpeciale2024 from './CANSpeciale2024'

export const titre = 'CAN Spéciale année 2024 - 6ème'
export const interactifReady = true

export const uuid = '49fcb'

export const refs = {
  'fr-fr': ['can6a-NY2024'],
  'fr-ch': [],
}
export const dateDePublication = '01/01/2024'

/**
 * CAN Spéciale année 2024 pour les 6èmes
 *
 * @author Gilles Mora
 */

export default class CourseAuxNombresSpeciale20246e extends CourseAuxNombresSpeciale2024 {
  constructor() {
    super()
    this.sup = 6
    this.besoinFormulaireTexte = false
  }
}
