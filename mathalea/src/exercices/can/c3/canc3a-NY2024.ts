import CourseAuxNombresSpeciale2024 from '../6e/CANSpeciale2024'
export const titre = 'CAN Spéciale année 2024 - CM'
export const interactifReady = true

export const uuid = '5c15e'
export const refs = {
  'fr-fr': ['canc3a-NY2024'],
  'fr-ch': [],
}
export const dateDePublication = '01/01/2024'

/**
 * CAN Spéciale année 2024 pour les CM2
 *
 * @author Gilles Mora
 */

export default class CourseAuxNombresSpeciale2024CM extends CourseAuxNombresSpeciale2024 {
  declare sup: number

  constructor() {
    super()
    this.sup = 7
    this.besoinFormulaireTexte = false
  }
}
