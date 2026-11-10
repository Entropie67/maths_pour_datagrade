import MetaExercice from '../MetaExerciceCan'
import Question1 from '../dnbAutomatismes/dnb-2026-06-amerique-du-nord-automatisme-Q1'
import Question2 from '../dnbAutomatismes/dnb-2026-06-amerique-du-nord-automatisme-Q2'
import Question3 from '../dnbAutomatismes/dnb-2026-06-amerique-du-nord-automatisme-Q3'
import Question4 from '../dnbAutomatismes/dnb-2026-06-amerique-du-nord-automatisme-Q4'
import Question5 from '../dnbAutomatismes/dnb-2026-06-amerique-du-nord-automatisme-Q5'
import Question6 from '../dnbAutomatismes/dnb-2026-06-amerique-du-nord-automatisme-Q6'
import Question7 from '../dnbAutomatismes/dnb-2026-06-amerique-du-nord-automatisme-Q7'
import Question8 from '../dnbAutomatismes/dnb-2026-06-amerique-du-nord-automatisme-Q8'
export const titre = 'Brevet - Amérique du Nord juin 2026 - Automatismes'
export const interactifReady = true

export const uuid = '9d543'
export const refs = {
  'fr-fr': ['3AutoDNB2026-1'],
  'fr-ch': [],
}
export const dateDePublication = '06/06/2026'

/**
 * Annales Brevet Auto 2026 - Amérique du Nord juin 2026
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
]

export default class AutoANbrevet2026 extends MetaExercice {
  constructor() {
    super(questions)
  }
}
