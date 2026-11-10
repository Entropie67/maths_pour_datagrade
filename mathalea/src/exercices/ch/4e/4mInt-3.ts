import PrimitivesSansComposition from './4mInt-1'

export const titre =
  'Déterminer une primitive sans composition vérifiant une condition'
export const dateDePublication = '15/09/2026'
export const uuid = '219c5'
export const interactifReady = true
export const refs = { 'fr-fr': [], 'fr-ch': ['4mInt-3'] }

/** @author Nathan Scheinmann */
export default class PrimitivesSansCompositionCondition extends PrimitivesSansComposition {
  constructor() {
    super(true)
  }
}
