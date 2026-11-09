import MetaExercice from '../../MetaExerciceCan'
import Question1 from './can2a-2024-mai-Q1'
import Question2 from './can2a-2024-mai-Q2'
import Question3 from './can2a-2024-mai-Q3'
import Question4 from './can2a-2024-mai-Q4'
import Question5 from './can2a-2024-mai-Q5'
import Question6 from './can2a-2024-mai-Q6'
import Question7 from './can2a-2024-mai-Q7'
import Question8 from './can2a-2024-mai-Q8'
import Question9 from './can2a-2024-mai-Q9'
import Question10 from './can2a-2024-mai-Q10'
import Question11 from './can2a-2024-mai-Q11'
import Question12 from './can2a-2024-mai-Q12'
import Question13 from './can2a-2024-mai-Q13'
import Question14 from './can2a-2024-mai-Q14'
import Question15 from './can2a-2024-mai-Q15'
import Question16 from './can2a-2024-mai-Q16'
import Question17 from './can2a-2024-mai-Q17'
import Question18 from './can2a-2024-mai-Q18'
import Question19 from './can2a-2024-mai-Q19'
import Question20 from './can2a-2024-mai-Q20'
import Question21 from './can2a-2024-mai-Q21'
import Question22 from './can2a-2024-mai-Q22'
import Question23 from './can2a-2024-mai-Q23'
import Question24 from './can2a-2024-mai-Q24'
import Question25 from './can2a-2024-mai-Q25'
import Question26 from './can2a-2024-mai-Q26'
import Question27 from './can2a-2024-mai-Q27'
import Question28 from './can2a-2024-mai-Q28'
import Question29 from './can2a-2024-mai-Q29'
import Question30 from './can2a-2024-mai-Q30'

export const titre = 'Course aux nombres - 2nde - Mai 2024'
export const dateDePublication = '7/5/2024'
export const interactifReady = true

export const uuid = 'can2a-2024-2'

/**
 * Sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi angot
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
  Question13,
  Question14,
  Question15,
  Question16,
  Question17,
  Question18,
  Question19,
  Question20,
  Question21,
  Question22,
  Question23,
  Question24,
  Question25,
  Question26,
  Question27,
  Question28,
  Question29,
  Question30,
]

export default class Can2a2024Mai extends MetaExercice {
  constructor() {
    super(questions)
  }
}
