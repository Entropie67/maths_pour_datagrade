// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid df67c continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import Question1 from '../EAMPremiere/EAM-FMTechno-2026-Q1'
import Question10 from '../EAMPremiere/EAM-FMTechno-2026-Q10'
import Question11 from '../EAMPremiere/EAM-FMTechno-2026-Q11'
import Question12 from '../EAMPremiere/EAM-FMTechno-2026-Q12'
import Question2 from '../EAMPremiere/EAM-FMTechno-2026-Q2'
import Question3 from '../EAMPremiere/EAM-FMTechno-2026-Q3'
import Question4 from '../EAMPremiere/EAM-FMTechno-2026-Q4'
import Question5 from '../EAMPremiere/EAM-FMTechno-2026-Q5'
import Question6 from '../EAMPremiere/EAM-FMTechno-2026-Q6'
import Question7 from '../EAMPremiere/EAM-FMTechno-2026-Q7'
import Question8 from '../EAMPremiere/EAM-FMTechno-2026-Q8'
import Question9 from '../EAMPremiere/EAM-FMTechno-2026-Q9'
import MetaExercice from '../MetaExerciceCan'
export const titre = 'France métropole Techno'
export const interactifReady = true

export const uuid = 'df67c'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const dateDePublication = '17/06/2026'

/**
 * Annales Auto 2026
 * @author Gilles Mora
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
  Question11,
  Question12,
]

export default class AutoFMsTechno2026Old extends MetaExercice {
  constructor() {
    super(questions)
  }
}
