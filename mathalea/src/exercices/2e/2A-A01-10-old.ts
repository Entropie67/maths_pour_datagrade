// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 17667 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import Question1 from '../EAMPremiere/EAM-AGnonSpe-2026-Q1'
import Question2 from '../EAMPremiere/EAM-AGnonSpe-2026-Q2'
import Question4 from '../EAMPremiere/EAM-AGnonSpe-2026-Q4'
import Question6 from '../EAMPremiere/EAM-AGnonSpe-2026-Q6'
import Question3 from '../EAMPremiere/EAM-AGTechno-2026-Q4'
import Question7 from '../EAMPremiere/EAM-ANnonSpe-2026-Q12'
import Question8 from '../EAMPremiere/EAM-FMSpe-2026-Q4'
import Question9 from '../EAMPremiere/EAM-FMSpe-2026-Q5'
import Question5 from '../EAMPremiere/EAM-PolynesieSpecifique-2026-Q2'
import MetaExercice from '../MetaExerciceCan'
export const titre = 'Sujet n°$10$'
export const interactifReady = true

export const uuid = '17667'
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
  Question9,
]

export default class AutoAGNonSpe2026Old extends MetaExercice {
  constructor() {
    super(questions)
  }
}
