import CourseAuxNombresSpeciale2024 from '../6e/CANSpeciale2024'

export const titre = 'CAN Spéciale année 2024 - 1ère'
export const interactifReady = true

export const uuid = 'ac288'

export const refs = {
  'fr-fr': ['can1a-NY2024'],
  'fr-ch': [],
}
export const dateDePublication = '01/01/2024'

/**
 * CAN Spéciale année 2024 pour les 1ères
 *
 * @author Gilles Mora
 */

export default class CourseAuxNombresSpeciale20241ere extends CourseAuxNombresSpeciale2024 {
  constructor() {
    super()
    this.sup = 1
    this.besoinFormulaireTexte = false
  }
}
