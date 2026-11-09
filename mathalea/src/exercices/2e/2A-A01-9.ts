import Question2 from '../EAMPremiere/EAM-AGnonSpe-2026-Q7'
import Question1 from '../EAMPremiere/EAM-AGSpe-2026-Q1'
import Question3 from '../EAMPremiere/EAM-AGSpe-2026-Q3'
import Question4 from '../EAMPremiere/EAM-AGSpe-2026-Q4'
import Question5 from '../EAMPremiere/EAM-AGSpe-2026-Q7'
import Question6 from '../EAMPremiere/EAM-AGSpe-2026-Q8'
import MetaExercice from '../MetaExerciceCan'
export const titre = 'Sujet n°$9$'
export const interactifReady = true

export const dateDeModifImportante = '08/11/2026'

export const uuid = '63c32'
export const refs = {
  'fr-fr': ['2A-A01-9'],
  'fr-ch': [],
}
export const dateDePublication = '15/07/2026'

/**
 * Annales Auto 2026
 * @author Ingrid Vernimmen */

const questions = [
  Question1,
  Question2,
  Question3,
  Question4,
  Question5,
  Question6,
]

export default class AutoAGSpe2026 extends MetaExercice {
  constructor() {
    super(questions, { versionQcm: true })
  }
}
