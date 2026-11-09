import MetaExercice from '../../MetaExerciceCan'
import Question1 from '../can6a-2026/can6a-2026-Q1'
import Question10 from '../can6a-2026/can6a-2026-Q10'
import Question12 from '../can6a-2026/can6a-2026-Q12'
import Question2 from '../can6a-2026/can6a-2026-Q2'
import Question3 from '../can6a-2026/can6a-2026-Q3'
import Question4 from '../can6a-2026/can6a-2026-Q4'
import Question5 from '../can6a-2026/can6a-2026-Q5'
import Question6 from '../can6a-2026/can6a-2026-Q6'
import Question7 from '../can6a-2026/can6a-2026-Q7'
import Question8 from '../can6a-2026/can6a-2026-Q8'
import Question9 from '../can6a-2026/can6a-2026-Q9'
import Question11 from '../canc3a-2026/canc3a-2026-Q11'
import Question13 from '../canc3a-2026/canc3a-2026-Q13'
import Question14 from '../canc3a-2026/canc3a-2026-Q14'
import Question15 from '../canc3a-2026/canc3a-2026-Q15'
import Question16 from '../canc3a-2026/canc3a-2026-Q16'
import Question17 from '../canc3a-2026/canc3a-2026-Q17'
import Question18 from '../canc3a-2026/canc3a-2026-Q18'
import Question19 from '../canc3a-2026/canc3a-2026-Q19'
import Question20 from '../canc3a-2026/canc3a-2026-Q20'
import Question21 from '../canc3a-2026/canc3a-2026-Q21'
import Question22 from '../canc3a-2026/canc3a-2026-Q22'
import Question23 from '../canc3a-2026/canc3a-2026-Q23'
import Question24 from '../canc3a-2026/canc3a-2026-Q24'
import Question25 from '../canc3a-2026/canc3a-2026-Q25'
import Question26 from '../canc3a-2026/canc3a-2026-Q26'
import Question27 from '../canc3a-2026/canc3a-2026-Q27'
import Question28 from '../canc3a-2026/canc3a-2026-Q28'
import Question29 from '../canc3a-2026/canc3a-2026-Q29'
import Question30 from '../canc3a-2026/canc3a-2026-Q30'

export const titre = 'CAN CM2 sujet 2026'
export const interactifReady = true

export const uuid = 'ab88c'
export const refs = {
  'fr-fr': ['canc3a-2026'],
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

export default class Canc3a2026 extends MetaExercice {
  constructor() {
    super(questions)
  }
}
