import Question5 from '../EAMPremiere/EAM-AGSpe-2026-Q2'
import Question1 from '../EAMPremiere/EAM-FMTechno-2026-Q1'
import Question8 from '../EAMPremiere/EAM-FMTechno-2026-Q10'
import Question3 from '../EAMPremiere/EAM-FMTechno-2026-Q3'
import Question4 from '../EAMPremiere/EAM-FMTechno-2026-Q4'
import Question6 from '../EAMPremiere/EAM-FMTechno-2026-Q6'
import Question7 from '../EAMPremiere/EAM-FMTechno-2026-Q9'
import Question2 from '../EAMPremiere/EAM-PolynesieTechno-2026-Q6'
import MetaExercice from '../MetaExerciceCan'
export const titre = 'Sujet n°$8$'
export const interactifReady = true

export const dateDeModifImportante = '26/10/2026'

export const uuid = 'a7701'
export const refs = {
  'fr-fr': ['2A-A01-8'],
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
  Question8,
]

export default class AutoFMsTechno2026 extends MetaExercice {
  constructor() {
    super(questions, { versionQcm: true })
  }
}
