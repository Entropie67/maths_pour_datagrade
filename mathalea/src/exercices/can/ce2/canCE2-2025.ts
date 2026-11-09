import Question1 from '../canCE2a-2025/canCE2-2025-Q1'
import Question10 from '../canCE2a-2025/canCE2-2025-Q10'
import Question11 from '../canCE2a-2025/canCE2-2025-Q11'
import Question12 from '../canCE2a-2025/canCE2-2025-Q12'
import Question13 from '../canCE2a-2025/canCE2-2025-Q13'
import Question14 from '../canCE2a-2025/canCE2-2025-Q14'
import Question15 from '../canCE2a-2025/canCE2-2025-Q15'
import Question16 from '../canCE2a-2025/canCE2-2025-Q16'
import Question17 from '../canCE2a-2025/canCE2-2025-Q17'
import Question18 from '../canCE2a-2025/canCE2-2025-Q18'
import Question19 from '../canCE2a-2025/canCE2-2025-Q19'
import Question2 from '../canCE2a-2025/canCE2-2025-Q2'
import Question20 from '../canCE2a-2025/canCE2-2025-Q20'
import Question3 from '../canCE2a-2025/canCE2-2025-Q3'
import Question4 from '../canCE2a-2025/canCE2-2025-Q4'
import Question5 from '../canCE2a-2025/canCE2-2025-Q5'
import Question6 from '../canCE2a-2025/canCE2-2025-Q6'
import Question7 from '../canCE2a-2025/canCE2-2025-Q7'
import Question8 from '../canCE2a-2025/canCE2-2025-Q8'
import Question9 from '../canCE2a-2025/canCE2-2025-Q9'

import MetaExercice from '../../MetaExerciceCan'

export const titre = 'CAN CE2 sujet 2025'
export const interactifReady = true

export const uuid = 'ad71f'
export const refs = {
  'fr-fr': ['canCE2a-2025'],
  'fr-ch': [],
}
export const dateDePublication = '01/05/2025'

/**
 * Annales CAN 2025
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

export default class Can5a2025 extends MetaExercice {
  constructor() {
    super(questions)
    this.canOfficielle = true
  }
}
