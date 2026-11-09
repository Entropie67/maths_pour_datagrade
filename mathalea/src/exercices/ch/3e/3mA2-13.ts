import DeriveesExercice from '../../../lib/mathFonctions/deriveesExercice'
import {
    derivativeFormFor,
    exerciseFamilies,
} from '../../../lib/mathFonctions/deriveesFamilles'

export const titre = 'Dériver un quotient de fonctions'
export const dateDePublication = '30/09/2026'

export const uuid = '85c63'
export const interactifReady = true
export const refs = { 'fr-fr': [], 'fr-ch': ['3mA2-13', '4mDer-6'] }

/** @author Nathan Scheinmann */
export default class DeriveesQuotients extends DeriveesExercice {
  constructor() {
    super(derivativeFormFor(exerciseFamilies.quotient))
  }
}
