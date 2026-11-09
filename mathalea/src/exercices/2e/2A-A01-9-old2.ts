// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid bf391 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import Question2 from '../EAMPremiere/EAM-AGnonSpe-2026-Q7'
import Question1 from '../EAMPremiere/EAM-AGSpe-2026-Q1'
import Question3 from '../EAMPremiere/EAM-AGSpe-2026-Q3'
import Question4 from '../EAMPremiere/EAM-AGSpe-2026-Q4'
import Question5 from '../EAMPremiere/EAM-AGSpe-2026-Q7-old'
import Question6 from '../EAMPremiere/EAM-AGSpe-2026-Q8-old'
import MetaExercice from '../MetaExerciceCan'
export const titre = 'Sujet n°$9$'
export const interactifReady = true

export const dateDeModifImportante = '26/10/2026'

export const uuid = 'bf391'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
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

export default class AutoAGSpe2026Old2 extends MetaExercice {
  constructor() {
    super(questions, { versionQcm: true })
  }
}
