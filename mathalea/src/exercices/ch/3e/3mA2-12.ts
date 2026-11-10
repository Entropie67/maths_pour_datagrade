import DeriveesExercice from '../../../lib/mathFonctions/deriveesExercice'
import {
    derivativeFormFor,
    exerciseFamilies,
} from '../../../lib/mathFonctions/deriveesFamilles'

export const titre = 'Dériver un produit de fonctions'
export const dateDePublication = '30/09/2026'

export const uuid = 'ce9e6'
export const interactifReady = true
export const refs = { 'fr-fr': [], 'fr-ch': ['3mA2-12', '4mDer-5'] }

/** @author Nathan Scheinmann */
export default class DeriveesProduits extends DeriveesExercice {
  constructor() {
    super(derivativeFormFor(exerciseFamilies.product))
  }
}
