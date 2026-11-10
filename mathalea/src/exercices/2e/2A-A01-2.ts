import Question1 from '../EAMPremiere/EAM-ANnonSpe-2026-Q10'
import Question4 from '../EAMPremiere/EAM-ANnonSpe-2026-Q12'
import Question2 from '../EAMPremiere/EAM-ANnonSpe-2026-Q2'
import Question3 from '../EAMPremiere/EAM-ANnonSpe-2026-Q3'
import Question5 from '../EAMPremiere/EAM-ANnonSpe-2026-Q5'
import Question6 from '../EAMPremiere/EAM-ANnonSpe-2026-Q6'
import Question8 from '../EAMPremiere/EAM-ANnonSpe-2026-Q7'
import Question9 from '../EAMPremiere/EAM-FMnonSpe-2026-Q6'
import Question7 from '../EAMPremiere/EAM-PolynesieSpecifique-2026-Q5'
import Question10 from '../EAMPremiere/EAM-PolynesieTechno-2026-Q7'
import MetaExercice from '../MetaExerciceCan'
export const titre = 'Sujet n°$2$'
export const interactifReady = true

export const dateDeModifImportante = '26/10/2026'

export const uuid = '0a493'
export const refs = {
  'fr-fr': ['2A-A01-2'],
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
  Question9,
  Question10,
]

export default class AutoSujet1 extends MetaExercice {
  constructor() {
    super(questions, { versionQcm: true })
  }
}
