import Question1 from '../can1a-2024/can1a-2024-Q1'
import Question10 from '../can1a-2024/can1a-2024-Q10'
import Question11 from '../can1a-2024/can1a-2024-Q11'
import Question12 from '../can1a-2024/can1a-2024-Q12'
import Question13 from '../can1a-2024/can1a-2024-Q13'
import Question14 from '../can1a-2024/can1a-2024-Q14'
import Question15 from '../can1a-2024/can1a-2024-Q15'
import Question16 from '../can1a-2024/can1a-2024-Q16'
import Question17 from '../can1a-2024/can1a-2024-Q17'
import Question18 from '../can1a-2024/can1a-2024-Q18'
import Question19 from '../can1a-2024/can1a-2024-Q19'
import Question2 from '../can1a-2024/can1a-2024-Q2'
import Question20 from '../can1a-2024/can1a-2024-Q20'
import Question21 from '../can1a-2024/can1a-2024-Q21'
import Question22 from '../can1a-2024/can1a-2024-Q22'
import Question23 from '../can1a-2024/can1a-2024-Q23'
import Question24 from '../can1a-2024/can1a-2024-Q24'
import Question25 from '../can1a-2024/can1a-2024-Q25'
import Question26 from '../can1a-2024/can1a-2024-Q26'
import Question27 from '../can1a-2024/can1a-2024-Q27'
import Question28 from '../can1a-2024/can1a-2024-Q28'
import Question29 from '../can1a-2024/can1a-2024-Q29'
import Question30 from '../can1a-2024/can1a-2024-Q30'
import Question6 from '../can1a-2024/can1a-2024-Q6'
import Question7 from '../can1a-2024/can1a-2024-Q7'
import Question8 from '../can1a-2024/can1a-2024-Q8'
import Question9 from '../can1a-2024/can1a-2024-Q9'
import Question3 from '../can2a-2024/can2a-2024-Q3'
import Question4 from '../can2a-2024/can2a-2024-Q4'
import Question5 from '../can2a-2024/can2a-2024-Q5'

import MetaExercice from '../../MetaExerciceCan'

export const titre = 'CAN première sujet 2024'
export const interactifReady = true

export const uuid = '640f2'
export const refs = {
  'fr-fr': ['can1a-2024'],
  'fr-ch': [],
}
export const dateDePublication = '14/04/2024'
/**
 * Annales CAN 2024
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

export default class Can1a2024 extends MetaExercice {
  constructor() {
    super(questions)
  }
}
