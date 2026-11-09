import { describe, expect, it } from 'vitest'
import SujetCAN2023Quatrieme from '../../../../src/exercices/can/4e/can4a-2023'

describe('CAN 4e 2023 : choix des questions', () => {
  it('respecte les numéros et leur ordre', () => {
    const exercice = new SujetCAN2023Quatrieme()
    exercice.sup2 = true
    exercice.sup = '2-1'
    exercice.nouvelleVersion()
    expect(exercice.nbQuestions).toBe(2)
    expect(exercice.listeQuestions).toHaveLength(2)
    expect(exercice.listeQuestions[0]).toContain('le chiffre des')
    expect(exercice.listeQuestions[1]).toContain('\\times')
  })

  it('conserve le sujet complet par défaut', () => {
    const exercice = new SujetCAN2023Quatrieme()
    exercice.nouvelleVersion()
    expect(exercice.listeQuestions).toHaveLength(30)
  })
})
