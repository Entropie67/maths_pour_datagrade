import { describe, expect, it } from 'vitest'
import SujetCAN2021Quatrieme from '../../../../src/exercices/can/4e/can4a-2021'

describe('CAN 4e 2021 : choix des questions', () => {
  it('respecte les numéros et leur ordre', () => {
    const exercice = new SujetCAN2021Quatrieme()
    exercice.sup2 = true
    exercice.sup = '2-1'
    exercice.nouvelleVersion()
    expect(exercice.nbQuestions).toBe(2)
    expect(exercice.listeQuestions).toHaveLength(2)
    // la question 2 tire au hasard entre « Le quart de » et « Le tiers de »
    expect(exercice.listeQuestions[0]).toMatch(/Le (quart|tiers) de/)
    expect(exercice.listeQuestions[1]).toContain('\\times')
  })

  it('conserve le sujet complet par défaut', () => {
    const exercice = new SujetCAN2021Quatrieme()
    exercice.nouvelleVersion()
    expect(exercice.listeQuestions).toHaveLength(30)
  })
})
