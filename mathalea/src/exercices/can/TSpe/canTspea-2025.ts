import MetaExercice from '../../MetaExerciceCan'
import Question11 from '../can1a-2025/can1a-2025-Q11'
import Question12 from '../can1a-2025/can1a-2025-Q12'
import Question27 from '../can1a-2025/can1a-2025-Q26'
import Question24 from '../can1a-2025/can1a-2025-Q30'
import Question1 from '../can2a-2025/can2a-2025-Q1'
import Question10 from '../can2a-2025/can2a-2025-Q10'
import Question2 from '../can2a-2025/can2a-2025-Q2'
import Question3 from '../can2a-2025/can2a-2025-Q3'
import Question4 from '../can2a-2025/can2a-2025-Q4'
import Question5 from '../can2a-2025/can2a-2025-Q5'
import Question6 from '../can2a-2025/can2a-2025-Q6'
import Question7 from '../can2a-2025/can2a-2025-Q7'
import Question8 from '../can2a-2025/can2a-2025-Q8'
import Question9 from '../can2a-2025/can2a-2025-Q9'
import Question13 from '../canTspea-2025/canTspea-2025-Q13'
import Question14 from '../canTspea-2025/canTspea-2025-Q14'
import Question15 from '../canTspea-2025/canTspea-2025-Q15'
import Question16 from '../canTspea-2025/canTspea-2025-Q16'
import Question17 from '../canTspea-2025/canTspea-2025-Q17'
import Question18 from '../canTspea-2025/canTspea-2025-Q18'
import Question19 from '../canTspea-2025/canTspea-2025-Q19'
import Question20 from '../canTspea-2025/canTspea-2025-Q20'
import Question21 from '../canTspea-2025/canTspea-2025-Q21'
import Question22 from '../canTspea-2025/canTspea-2025-Q22'
import Question23 from '../canTspea-2025/canTspea-2025-Q23'
import Question25 from '../canTspea-2025/canTspea-2025-Q25'
import Question26 from '../canTspea-2025/canTspea-2025-Q26'
import Question28 from '../canTspea-2025/canTspea-2025-Q28'
import Question29 from '../canTspea-2025/canTspea-2025-Q29'
import Question30 from '../canTspea-2025/canTspea-2025-Q30'

export const titre = 'CAN Terminale sujet 2025'
export const interactifReady = true

export const uuid = '6ca87'
export const refs = {
  'fr-fr': ['canTSpea-2025'],
  'fr-ch': [],
}
export const dateDePublication = '01/05/2025'

/**
 * Annales CAN 2025
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

export default class CanTSpea2025 extends MetaExercice {
  constructor() {
    super(questions)
  }
}
