import DeriveesExercice from '../../../lib/mathFonctions/deriveesExercice'
import {
    derivativeFormFor,
    exerciseFamilies,
} from '../../../lib/mathFonctions/deriveesFamilles'

export const titre =
  'Dériver des puissances et des sommes de fonctions'
export const dateDePublication = '30/09/2026'

export const uuid = '01df0'
export const interactifReady = true
export const refs = { 'fr-fr': [], 'fr-ch': ['3mA2-14', '4mDer-7'] }

/** @author Nathan Scheinmann */
export default class DeriveesPuissances extends DeriveesExercice {
  constructor() {
    super(derivativeFormFor(exerciseFamilies.power))
  }
}
