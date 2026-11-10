import CourseAuxNombresSpeciale2024 from '../6e/CANSpeciale2024'

export const titre = 'S’entraîner avec le sujet CAN spéciale année 2024 - 2nde'
export const interactifReady = true

export const uuid = 'dd9d0'

export const refs = {
  'fr-fr': ['can2a-NY2024'],
  'fr-ch': [],
}
export const dateDePublication = '01/01/2024'

/**
 * CAN Spéciale année 2024 pour les 2ndes
 *
 * @author Gilles Mora
 */

export default class CourseAuxNombresSpeciale20242nde extends CourseAuxNombresSpeciale2024 {
  constructor() {
    super()
    this.sup = 2
    this.besoinFormulaireTexte = false
  }
}
