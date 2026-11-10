import CourseAuxNombresSpeciale2024 from '../6e/CANSpeciale2024'

export const titre = 'CAN Spéciale année 2024 - 5ème'
export const interactifReady = true

export const uuid = '53c5a'

export const refs = {
  'fr-fr': ['can5a-NY2024'],
  'fr-ch': [],
}
export const dateDePublication = '01/01/2024'

/**
 * CAN Spéciale année 2024 pour les 5èmes
 *
 * @author Gilles Mora
 */

export default class CourseAuxNombresSpeciale20245e extends CourseAuxNombresSpeciale2024 {
  constructor() {
    super()
    this.sup = 5
    this.besoinFormulaireTexte = false
  }
}
