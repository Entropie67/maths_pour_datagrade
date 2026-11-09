import CourseAuxNombresSpeciale2024 from '../6e/CANSpeciale2024'

export const titre = 'CAN Spéciale année 2024 - Terminale'
export const interactifReady = true

export const uuid = '60653'

export const refs = {
  'fr-fr': ['canTExa-NY2024'],
  'fr-ch': ['NR'],
}
export const dateDePublication = '01/01/2024'

/**
 * CAN Spéciale année 2024 pour les Terminales
 *
 * @author Gilles Mora
 */

export default class CourseAuxNombresSpeciale2024Terminale extends CourseAuxNombresSpeciale2024 {
  constructor() {
    super()
    this.besoinFormulaireTexte = false
    this.sup = '0'
  }
}
