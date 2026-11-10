// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid d2665 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import Question1 from '../EAMPremiere/EAM-AGSpe-2026-Q1'
import Question2 from '../EAMPremiere/EAM-AGSpe-2026-Q2'
import Question3 from '../EAMPremiere/EAM-AGSpe-2026-Q3'
import Question4 from '../EAMPremiere/EAM-AGSpe-2026-Q4'
import Question5 from '../EAMPremiere/EAM-AGSpe-2026-Q5'
import Question6 from '../EAMPremiere/EAM-AGSpe-2026-Q6'
import Question7 from '../EAMPremiere/EAM-AGSpe-2026-Q7-old'
import Question8 from '../EAMPremiere/EAM-AGSpe-2026-Q8-old'
import MetaExercice from '../MetaExerciceCan'
export const titre = 'Antilles Guyane Spécialité'
export const interactifReady = true

export const uuid = 'd2665'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const dateDePublication = '11/06/2026'

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
]

export default class AutoAGSpe2026Old extends MetaExercice {
  constructor() {
    super(questions)
  }
}
