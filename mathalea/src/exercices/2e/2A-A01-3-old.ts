// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid d545c continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
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

export const uuid = 'd545c'
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
]

export default class AutoCEspe2026Old extends MetaExercice {
  constructor() {
    super(questions)
  }
}
