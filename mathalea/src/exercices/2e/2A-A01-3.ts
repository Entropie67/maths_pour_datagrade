import Question6 from '../EAMPremiere/EAM-AGTechno-2026-Q11'
import Question1 from '../EAMPremiere/EAM-AGTechno-2026-Q2'
import Question4 from '../EAMPremiere/EAM-AGTechno-2026-Q6'
import Question2 from '../EAMPremiere/EAM-CESpe-2026-Q2'
import Question3 from '../EAMPremiere/EAM-CESpe-2026-Q3'
import Question5 from '../EAMPremiere/EAM-CESpe-2026-Q5'
import Question7 from '../EAMPremiere/EAM-CESpe-2026-Q8'
import MetaExercice from '../MetaExerciceCan'
export const titre = 'Sujet n°$3$'
export const interactifReady = true

export const dateDeModifImportante = '26/10/2026'

export const uuid = '6fe1a'
export const refs = {
  'fr-fr': ['2A-A01-3'],
  'fr-ch': [],
}
export const dateDePublication = '15/07/2026'

/**
 * Annales Auto 2026
 * @author Ingrid Vernimmen
 */

const questions = [
  Question1,
  Question2,
  Question3,
  Question4,
  Question5,
  Question6,
  Question7,
]

export default class AutoCEspe2026 extends MetaExercice {
  constructor() {
    super(questions, { versionQcm: true })
  }
}
