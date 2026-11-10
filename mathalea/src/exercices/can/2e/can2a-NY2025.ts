import Question10 from '../canNY-2025/can2NY-2025-Q10'
import Question16 from '../canNY-2025/can2NY-2025-Q16'
import Question18 from '../canNY-2025/can2NY-2025-Q18'
import Question19 from '../canNY-2025/can2NY-2025-Q19'
import Question23 from '../canNY-2025/can2NY-2025-Q23'
import Question25 from '../canNY-2025/can2NY-2025-Q25'
import Question28 from '../canNY-2025/can2NY-2025-Q28'
import Question4 from '../canNY-2025/can2NY-2025-Q4'
import Question5 from '../canNY-2025/can2NY-2025-Q5'
import Question8 from '../canNY-2025/can2NY-2025-Q8'
import Question1 from '../canNY-2025/can3NY-2025-Q1'
import Question11 from '../canNY-2025/can3NY-2025-Q11'
import Question12 from '../canNY-2025/can3NY-2025-Q12'
import Question13 from '../canNY-2025/can3NY-2025-Q13'
import Question14 from '../canNY-2025/can3NY-2025-Q14'
import Question15 from '../canNY-2025/can3NY-2025-Q15'
import Question2 from '../canNY-2025/can3NY-2025-Q2'
import Question20 from '../canNY-2025/can3NY-2025-Q20'
import Question21 from '../canNY-2025/can3NY-2025-Q21'
import Question22 from '../canNY-2025/can3NY-2025-Q22'
import Question24 from '../canNY-2025/can3NY-2025-Q24'
import Question26 from '../canNY-2025/can3NY-2025-Q26'
import Question27 from '../canNY-2025/can3NY-2025-Q27'
import Question29 from '../canNY-2025/can3NY-2025-Q29'
import Question30 from '../canNY-2025/can3NY-2025-Q30'
import Question9 from '../canNY-2025/can3NY-2025-Q9'
import Question6 from '../canNY-2025/can6NY-2025-Q15'
import Question7 from '../canNY-2025/can6NY-2025-Q17'
import Question17 from '../canNY-2025/can6NY-2025-Q29'
import Question3 from '../canNY-2025/can6NY-2025-Q4'

import MetaExercice from '../../MetaExerciceCan'

export const titre = 'S’entraîner avec le sujet CAN spéciale année 2025'
export const interactifReady = true

export const uuid = 'af62a'
export const dateDePublication = '08/12/2024'
export const refs = {
  'fr-fr': ['can2a-NY2025'],
  'fr-ch': [],
}
/**
 * Annales CAN 2025
 * @author
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

export default class Can2aNY2025 extends MetaExercice {
  constructor() {
    super(questions)
  }
}
