import { compositionForm } from '../../../lib/mathFonctions/deriveesComposees'
import DeriveesExercice from '../../../lib/mathFonctions/deriveesExercice'

export const titre = 'Dériver une fonction composée'
export const dateDePublication = '29/09/2026'
export const dateDeModifImportante = '30/09/2026'

export const uuid = '7fccd'
export const interactifReady = true
export const refs = { 'fr-fr': [], 'fr-ch': ['3mA2-11', '4mDer-4'] }

/** @author Nathan Scheinmann */
export default class DeriveesComposees extends DeriveesExercice {
  constructor() {
    super(compositionForm)
  }
}
