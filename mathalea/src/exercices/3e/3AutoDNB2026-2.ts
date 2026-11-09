import MetaExercice from '../MetaExerciceCan'
import Question1 from '../dnbAutomatismes/dnb-2026-06-antilles-Q1'
import Question2 from '../dnbAutomatismes/dnb-2026-06-antilles-Q2'
import Question3 from '../dnbAutomatismes/dnb-2026-06-antilles-Q3'
import Question4 from '../dnbAutomatismes/dnb-2026-06-antilles-Q4'
import Question5 from '../dnbAutomatismes/dnb-2026-06-antilles-Q5'
import Question6 from '../dnbAutomatismes/dnb-2026-06-antilles-Q6'
import Question7 from '../dnbAutomatismes/dnb-2026-06-antilles-Q7'
import Question8 from '../dnbAutomatismes/dnb-2026-06-antilles-Q8'
import Question9 from '../dnbAutomatismes/dnb-2026-06-antilles-Q9'
export const titre = 'Brevet - Antilles juin 2026 - Automatismes'
export const interactifReady = true

export const uuid = '8db41'
export const refs = {
  'fr-fr': ['3AutoDNB2026-2'],
  'fr-ch': [],
}
export const dateDePublication = '06/06/2026'

/**
 * Annales Brevet Auto 2026 - Antilles juin 2026
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

export default class AutoAntillesbrevet2026 extends MetaExercice {
  constructor() {
    super(questions)
  }
}
