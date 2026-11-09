import MetaExercice from '../MetaExerciceCan'
import Question1 from '../dnbAutomatismes/dnb-2026-06-asie-Q1'
import Question2 from '../dnbAutomatismes/dnb-2026-06-asie-Q2'
import Question3 from '../dnbAutomatismes/dnb-2026-06-asie-Q3'
import Question4 from '../dnbAutomatismes/dnb-2026-06-asie-Q4'
import Question5 from '../dnbAutomatismes/dnb-2026-06-asie-Q5'
import Question6 from '../dnbAutomatismes/dnb-2026-06-asie-Q6'
import Question7 from '../dnbAutomatismes/dnb-2026-06-asie-Q7'
import Question8 from '../dnbAutomatismes/dnb-2026-06-asie-Q8'
import Question9 from '../dnbAutomatismes/dnb-2026-06-asie-Q9'
export const titre = 'Brevet - Asie juin 2026 - Automatismes'
export const interactifReady = true

export const uuid = '8db52'
export const refs = {
  'fr-fr': ['3AutoDNB2026-3'],
  'fr-ch': [],
}
export const dateDePublication = '10/08/2026'

/**
 * Annales Brevet Auto 2026 - Asie juin 2026
 * @author Rémi Angot
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

export default class AutoAsiebrevet2026 extends MetaExercice {
  constructor() {
    super(questions)
  }
}
