import { describe, expect, it } from 'vitest'
import Can2a2021 from '../../../../src/exercices/can/2e/can2a-2021'
import Can2a2022 from '../../../../src/exercices/can/2e/can2a-2022'
import Can3a2021 from '../../../../src/exercices/can/3e/can3a-2021'
import Can3a2022 from '../../../../src/exercices/can/3e/can3a-2022'
import Can5a2020 from '../../../../src/exercices/can/5e/can5a-2020'
import Can5a2021 from '../../../../src/exercices/can/5e/can5a-2021'

const sujets = {
  'CAN 2e 2021': Can2a2021,
  'CAN 2e 2022': Can2a2022,
  'CAN 3e 2021': Can3a2021,
  'CAN 3e 2022': Can3a2022,
  'CAN 5e 2020': Can5a2020,
  'CAN 5e 2021': Can5a2021,
}

describe.each(Object.entries(sujets))(
  '%s : choix des questions',
  (_nom, Sujet) => {
    it('respecte le nombre de questions choisies', () => {
      const exercice = new Sujet()
      exercice.sup = '3-1-2'
      exercice.nouvelleVersion()
      expect(exercice.nbQuestions).toBe(3)
      expect(exercice.listeQuestions).toHaveLength(3)
      expect(exercice.nbQuestionsModifiable).toBe(false)
    })

    it('conserve le sujet complet par défaut', () => {
      const exercice = new Sujet()
      exercice.nouvelleVersion()
      expect(exercice.listeQuestions).toHaveLength(30)
      expect(exercice.nbQuestionsModifiable).toBe(true)
    })
  },
)
