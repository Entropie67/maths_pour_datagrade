import Question16 from '../canCE1a-2026/canCE1-2026-Q16'
import Question1 from '../canCE2a-2026/canCE2-2026-Q1'
import Question10 from '../canCE2a-2026/canCE2-2026-Q10'
import Question11 from '../canCE2a-2026/canCE2-2026-Q11'
import Question12 from '../canCE2a-2026/canCE2-2026-Q12'
import Question13 from '../canCE2a-2026/canCE2-2026-Q13'
import Question14 from '../canCE2a-2026/canCE2-2026-Q14'
import Question15 from '../canCE2a-2026/canCE2-2026-Q15'
import Question17 from '../canCE2a-2026/canCE2-2026-Q17'
import Question18 from '../canCE2a-2026/canCE2-2026-Q18'
import Question19 from '../canCE2a-2026/canCE2-2026-Q19'
import Question2 from '../canCE2a-2026/canCE2-2026-Q2'
import Question20 from '../canCE2a-2026/canCE2-2026-Q20'
import Question3 from '../canCE2a-2026/canCE2-2026-Q3'
import Question4 from '../canCE2a-2026/canCE2-2026-Q4'
import Question5 from '../canCE2a-2026/canCE2-2026-Q5'
import Question6 from '../canCE2a-2026/canCE2-2026-Q6'
import Question7 from '../canCE2a-2026/canCE2-2026-Q7'
import Question8 from '../canCE2a-2026/canCE2-2026-Q8'
import Question9 from '../canCE2a-2026/canCE2-2026-Q9'

import MetaExercice from '../../MetaExerciceCan'

export const titre = 'CAN CE2 sujet 2026'
export const interactifReady = true

export const uuid = '189f8'
export const refs = {
  'fr-fr': ['canCE2-2026'],
  'fr-ch': [],
}
export const dateDePublication = '09/04/2026'

/**
 * Annales CAN 2026
 * @author Jean-claude Lhote
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
]

export default class Can5CE12025 extends MetaExercice {
  constructor() {
    super(questions)
  }
}
