// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 1497d continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import Question4 from '../EAMPremiere/EAM-AGSpe-2026-Q3'
import Question1 from '../EAMPremiere/EAM-CENonSpe-2026-Q1'
import Question8 from '../EAMPremiere/EAM-CENonSpe-2026-Q10'
import Question2 from '../EAMPremiere/EAM-CENonSpe-2026-Q2'
import Question3 from '../EAMPremiere/EAM-CENonSpe-2026-Q3'
import Question7 from '../EAMPremiere/EAM-CENonSpe-2026-Q7'
import Question5 from '../EAMPremiere/EAM-FMTechno-2026-Q12'
import Question6 from '../EAMPremiere/EAM-PolynesieTechno-2026-Q4'
import MetaExercice from '../MetaExerciceCan'
export const titre = 'Sujet n°$4$'
export const interactifReady = true

export const uuid = '1497d'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
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

export default class AutoCEspe2026Old extends MetaExercice {
  constructor() {
    super(questions)
  }
}
