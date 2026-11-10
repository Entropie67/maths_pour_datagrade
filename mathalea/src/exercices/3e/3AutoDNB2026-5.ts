import MetaExercice from '../MetaExerciceCan'
import Question1 from '../dnbAutomatismes/dnb-2026-06-polynesie-Q1'
import Question2 from '../dnbAutomatismes/dnb-2026-06-polynesie-Q2'
import Question3 from '../dnbAutomatismes/dnb-2026-06-polynesie-Q3'
import Question4 from '../dnbAutomatismes/dnb-2026-06-polynesie-Q4'
import Question5 from '../dnbAutomatismes/dnb-2026-06-polynesie-Q5'
import Question6 from '../dnbAutomatismes/dnb-2026-06-polynesie-Q6'
import Question7 from '../dnbAutomatismes/dnb-2026-06-polynesie-Q7'
import Question8 from '../dnbAutomatismes/dnb-2026-06-polynesie-Q8'
import Question9 from '../dnbAutomatismes/dnb-2026-06-polynesie-Q9'

export const titre = 'Brevet - Polynésie - Automatismes'
export const interactifReady = true

export const uuid = '8de53'
export const refs = {
  'fr-fr': ['3AutoDNB2026-5'],
  'fr-ch': [],
}
export const dateDePublication = '11/08/2026'

/**
 * Annales Brevet Auto 2026 - Polynésie juin 2026
 * @author Jean-Claude Lhote
 */

const questions = [
  Question1,
  Question2,
  Question3,
  Question4,
  Question5,
  Question6,
  Question7,
  Question8,
  Question9,
]

export default class AutoPolynesieBrevet2026 extends MetaExercice {
  constructor() {
    super(questions)
  }
}
