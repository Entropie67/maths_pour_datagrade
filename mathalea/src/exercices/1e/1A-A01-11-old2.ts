// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid f0ab9 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import Question1 from '../EAMPremiere/EAM-AGTechno-2026-Q1'
import Question10 from '../EAMPremiere/EAM-AGTechno-2026-Q10'
import Question11 from '../EAMPremiere/EAM-AGTechno-2026-Q11'
import Question12 from '../EAMPremiere/EAM-AGTechno-2026-Q12'
import Question2 from '../EAMPremiere/EAM-AGTechno-2026-Q2'
import Question3 from '../EAMPremiere/EAM-AGTechno-2026-Q3'
import Question4 from '../EAMPremiere/EAM-AGTechno-2026-Q4'
import Question5 from '../EAMPremiere/EAM-AGTechno-2026-Q5'
import Question6 from '../EAMPremiere/EAM-AGTechno-2026-Q6'
import Question7 from '../EAMPremiere/EAM-AGTechno-2026-Q7'
import Question8 from '../EAMPremiere/EAM-AGTechno-2026-Q8-old'
import Question9 from '../EAMPremiere/EAM-AGTechno-2026-Q9'
import MetaExercice from '../MetaExerciceCan'

export const titre = 'Antilles Guyane Techno'
export const interactifReady = true

export const dateDeModifImportante = '22/10/2026'

export const uuid = 'f0ab9'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const dateDePublication = '01/07/2026'

/**
 * Annales Auto 2026
 * @author Jean-Claude Lhote
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

export default class AutoAGNonSpe2026Old2 extends MetaExercice {
  constructor() {
    super(questions, { versionQcm: true })
    this.comment =
      'Afin de nous aligner sur les nouvelles modalités de l’épreuve anticipée du baccalauréat concernant les automatismes, nous avons fait le choix éditorial de retravailler les sujets de la session 2026.<br><br>Les exercices originaux, initialement proposés sous forme de QCM, ont été adaptés en questions ouvertes ou à réponses courtes. Cette modification permet de s’entraîner dans des conditions fidèles aux exigences actuelles de l’examen.'
  }
}
