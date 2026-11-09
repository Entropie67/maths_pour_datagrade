import Question1 from '../can3a-2026/can3a-2026-Q1'
import Question10 from '../can3a-2026/can3a-2026-Q10'
import Question2 from '../can3a-2026/can3a-2026-Q2'
import Question3 from '../can3a-2026/can3a-2026-Q3'
import Question4 from '../can3a-2026/can3a-2026-Q4'
import Question5 from '../can3a-2026/can3a-2026-Q5'
import Question6 from '../can3a-2026/can3a-2026-Q6'
import Question7 from '../can3a-2026/can3a-2026-Q7'
import Question8 from '../can3a-2026/can3a-2026-Q8'
import Question9 from '../can3a-2026/can3a-2026-Q9'
import Question11 from '../can4a-2026/can4a-2026-Q11'
import Question12 from '../can4a-2026/can4a-2026-Q12'
import Question13 from '../can4a-2026/can4a-2026-Q13'
import Question14 from '../can4a-2026/can4a-2026-Q14'
import Question15 from '../can4a-2026/can4a-2026-Q15'
import Question16 from '../can4a-2026/can4a-2026-Q16'
import Question17 from '../can4a-2026/can4a-2026-Q17'
import Question18 from '../can4a-2026/can4a-2026-Q18'
import Question19 from '../can4a-2026/can4a-2026-Q19'
import Question20 from '../can4a-2026/can4a-2026-Q20'
import Question21 from '../can4a-2026/can4a-2026-Q21'
import Question22 from '../can4a-2026/can4a-2026-Q22'
import Question23 from '../can4a-2026/can4a-2026-Q23'
import Question24 from '../can4a-2026/can4a-2026-Q24'
import Question25 from '../can4a-2026/can4a-2026-Q25'
import Question26 from '../can4a-2026/can4a-2026-Q26'
import Question27 from '../can4a-2026/can4a-2026-Q27'
import Question28 from '../can4a-2026/can4a-2026-Q28'
import Question29 from '../can4a-2026/can4a-2026-Q29'
import Question30 from '../can4a-2026/can4a-2026-Q30'

import MetaExercice from '../../MetaExerciceCan'

export const titre = 'CAN 4e sujet 2026'
export const interactifReady = true

export const uuid = 'c9665'
export const refs = {
  'fr-fr': ['can4a-2026'],
  'fr-ch': [''],
}
export const dateDePublication = '09/04/2026'

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

export default class Can4a2026 extends MetaExercice {
  constructor() {
    super(questions)
  }
}
