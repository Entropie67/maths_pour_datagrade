import { describe, expect, it } from 'vitest'
import SujetCAN2024Mai from '../../../../src/exercices/can/can2a-2024-2/can2a-2024-mai'

describe('CAN Seconde mai 2024 : choix des questions', () => {
  it('propose les 30 questions par défaut', () => {
    const exercice = new SujetCAN2024Mai()
    exercice.nouvelleVersion()
    expect(exercice.listeQuestions).toHaveLength(30)
  })

  it('respecte les numéros et leur ordre', () => {
    const exercice = new SujetCAN2024Mai()
    exercice.sup2 = '2-1'
    exercice.nouvelleVersion()
    expect(exercice.listeQuestions).toHaveLength(2)
    expect(exercice.listeQuestions[0]).toContain('42 - 55 + 5')
    expect(exercice.listeQuestions[1]).toContain('8 \\times 1,25')
  })

  it('affiche le graphique pour la question 28 seule', () => {
    const exercice = new SujetCAN2024Mai()
    exercice.sup2 = '28'
    exercice.nouvelleVersion()
    expect(exercice.listeQuestions).toHaveLength(1)
    expect(exercice.listeQuestions[0]).toContain('mathalea2d')
    expect(exercice.listeQuestions[0]).toContain('antécédents')
  })
})
