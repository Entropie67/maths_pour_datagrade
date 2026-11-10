import Derivees1 from './1AN14-1'
import Derivees3 from './1AN14-3'
import Derivees4 from './1AN14-4'
import Derivees5 from './1AN14-5'
import Derivees6 from './1AN14-6'
import Derivees7 from './1AN14-7'

import MetaExercice from '../MetaExerciceCan'
export const titre = 'Effectuer un bilan sur la dérivation'
export const interactifReady = true

export const uuid = 'f38cf'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['3mA2-10'],
}
export const dateDePublication = '18/04/2024'
const questions = [
  Derivees1,
  Derivees3,
  Derivees4,
  Derivees5,
  Derivees6,
  Derivees7,
]
/**
 * Un exercice bilan pour les regrouper tous (les exos de dérivation)
 * @author Jean-claude Lhote
 *
 */
class DerivationBilan extends MetaExercice {
  constructor() {
    super(questions)
    this.besoinFormulaireCaseACocher = false
    this.nbQuestions = 6
    this.correctionDetailleeDisponible = true
    this.nbQuestionsModifiable = false
  }
}
export default DerivationBilan
