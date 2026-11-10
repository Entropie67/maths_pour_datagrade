import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TablesDeMultiplicationALEnvers from '../../src/exercices/6e/6N3autoD-6'

vi.mock('../../src/lib/renderScratch', () => ({
  renderScratch: vi.fn(() => 'mocked value'),
}))

vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(() => 'mocked value'),
}))

function installMathfield(values: Record<string, string>) {
  const mathfield = document.createElement('div') as unknown as HTMLElement & {
    getPromptValue: (key: string) => string
    setPromptState: (key: string, state: string, value: boolean) => void
  }
  mathfield.id = 'champTexteEx0Q0'
  mathfield.getPromptValue = (key: string) => values[key] ?? ''
  mathfield.setPromptState = vi.fn()
  document.body.appendChild(mathfield)
}

describe('6N3autoD-6 interactif', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
    window.notifyLocal = vi.fn()
  })

  it('compte une réponse vide comme une réponse incorrecte', () => {
    seedrandom('T6WQ', { global: true })
    const exercice = new TablesDeMultiplicationALEnvers()
    exercice.interactif = true
    exercice.numeroExercice = 0
    exercice.nbQuestions = 1
    exercice.sup = '3-4-5-6-7-8-9'
    exercice.sup2 = 9
    exercice.nouvelleVersion()
    installMathfield({ champ1: '', champ2: '' })

    const valeurs = exercice.autoCorrection[0].valeur
    const result = valeurs.callback(
      exercice,
      0,
      Object.entries(valeurs).filter(([key]) => key.startsWith('champ')),
      valeurs.bareme,
    )

    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe('')
    expect(result.score).toEqual({ nbBonnesReponses: 0, nbReponses: 1 })
  })
})
