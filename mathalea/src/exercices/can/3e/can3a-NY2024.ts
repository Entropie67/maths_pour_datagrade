import CourseAuxNombresSpeciale2024 from '../6e/CANSpeciale2024'

export const titre = 'CAN Spéciale année 2024 - 3ème'
export const interactifReady = true

export const uuid = '64c10'

export const refs = {
  'fr-fr': ['can3a-NY2024'],
  'fr-ch': [],
}
export const dateDePublication = '01/01/2024'

/**
 * CAN Spéciale année 2024 pour les 3èmes
 *
 * @author Gilles Mora
 */

export default class CourseAuxNombresSpeciale20243e extends CourseAuxNombresSpeciale2024 {
  constructor() {
    super()
    this.sup = 3
    this.besoinFormulaireTexte = false
  }
}
