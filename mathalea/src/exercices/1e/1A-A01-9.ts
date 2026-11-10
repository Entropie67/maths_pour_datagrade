import Question1 from '../EAMPremiere/EAM-AGSpe-2026-Q1'
import Question2 from '../EAMPremiere/EAM-AGSpe-2026-Q2'
import Question3 from '../EAMPremiere/EAM-AGSpe-2026-Q3'
import Question4 from '../EAMPremiere/EAM-AGSpe-2026-Q4'
import Question5 from '../EAMPremiere/EAM-AGSpe-2026-Q5'
import Question6 from '../EAMPremiere/EAM-AGSpe-2026-Q6'
import Question7 from '../EAMPremiere/EAM-AGSpe-2026-Q7'
import Question8 from '../EAMPremiere/EAM-AGSpe-2026-Q8'
import MetaExercice from '../MetaExerciceCan'
export const titre = 'Antilles Guyane Spécialité'
export const interactifReady = true

export const dateDeModifImportante = '08/11/2026'

export const uuid = 'e54f8'
export const refs = {
  'fr-fr': ['1A-A01-9'],
  'fr-ch': [],
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

export default class AutoAGSpe2026 extends MetaExercice {
  constructor() {
    super(questions, { versionQcm: true })
    this.comment =
      'Afin de nous aligner sur les nouvelles modalités de l’épreuve anticipée du baccalauréat concernant les automatismes, nous avons fait le choix éditorial de retravailler les sujets de la session 2026.<br><br>Les exercices originaux, initialement proposés sous forme de QCM, ont été adaptés en questions ouvertes ou à réponses courtes. Cette modification permet de s’entraîner dans des conditions fidèles aux exigences actuelles de l’examen.'
  }
}
