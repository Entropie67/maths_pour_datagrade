import CourseAuxNombresSpeciale2024 from '../6e/CANSpeciale2024'

export const titre = 'CAN Spéciale année 2024 - 4ème'
export const interactifReady = true

export const uuid = '96476'

export const refs = {
  'fr-fr': ['can4a-NY2024'],
  'fr-ch': [],
}
export const dateDePublication = '01/01/2024'

/**
 * CAN Spéciale année 2024 pour les 4èmes
 *
 * @author Gilles Mora
 */

export default class CourseAuxNombresSpeciale20244e extends CourseAuxNombresSpeciale2024 {
  constructor() {
    super()
    this.sup = 4
    this.besoinFormulaireTexte = false
  }
}
