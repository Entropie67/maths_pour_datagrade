import MetaExercice from '../../MetaExerciceCan'
import Question1 from '../can2a-2025C/can2a-2025C-Q1'
import Question10 from '../can2a-2025C/can2a-2025C-Q10'
import Question11 from '../can2a-2025C/can2a-2025C-Q11'
import Question12 from '../can2a-2025C/can2a-2025C-Q12'
import Question13 from '../can2a-2025C/can2a-2025C-Q13'
import Question14 from '../can2a-2025C/can2a-2025C-Q14'
import Question15 from '../can2a-2025C/can2a-2025C-Q15'
import Question16 from '../can2a-2025C/can2a-2025C-Q16'
import Question17 from '../can2a-2025C/can2a-2025C-Q17'
import Question18 from '../can2a-2025C/can2a-2025C-Q18'
import Question19 from '../can2a-2025C/can2a-2025C-Q19'
import Question2 from '../can2a-2025C/can2a-2025C-Q2'
import Question20 from '../can2a-2025C/can2a-2025C-Q20'
import Question21 from '../can2a-2025C/can2a-2025C-Q21'
import Question22 from '../can2a-2025C/can2a-2025C-Q22'
import Question23 from '../can2a-2025C/can2a-2025C-Q23'
import Question24 from '../can2a-2025C/can2a-2025C-Q24'
import Question25 from '../can2a-2025C/can2a-2025C-Q25'
import Question26 from '../can2a-2025C/can2a-2025C-Q26'
import Question27 from '../can2a-2025C/can2a-2025C-Q27'
import Question28 from '../can2a-2025C/can2a-2025C-Q28'
import Question29 from '../can2a-2025C/can2a-2025C-Q29'
import Question3 from '../can2a-2025C/can2a-2025C-Q3'
import Question30 from '../can2a-2025C/can2a-2025C-Q30'
import Question4 from '../can2a-2025C/can2a-2025C-Q4'
import Question5 from '../can2a-2025C/can2a-2025C-Q5'
import Question6 from '../can2a-2025C/can2a-2025C-Q6'
import Question7 from '../can2a-2025C/can2a-2025C-Q7'
import Question8 from '../can2a-2025C/can2a-2025C-Q8'
import Question9 from '../can2a-2025C/can2a-2025C-Q9'

export const titre =
  'S’entraîner avec le sujet CAN Seconde 2025 - AEFE Champions'
export const interactifReady = true

export const uuid = '005bb'
export const refs = {
  'fr-fr': ['can2a-2025C'],
  'fr-ch': [],
}
export const dateDePublication = '01/03/2026'

/**
 * Annales CAN 2026
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

export default class Can2a2026 extends MetaExercice {
  constructor() {
    super(questions)
  }
}
