import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RepresentationParametrique from '../../src/exercices/can/TSpe/canTSpeE03'

vi.mock('../../src/lib/renderScratch', () => ({
  renderScratch: vi.fn(() => 'mocked value'),
}))

vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(() => 'mocked value'),
}))

function texCoefficient(coefficient: number): string {
  if (coefficient === 1) return ''
  if (coefficient === -1) return '-'
  return String(coefficient)
}

function texConstante(constante: number): string {
  if (constante === 0) return ''
  return constante > 0 ? `+${constante}` : String(constante)
}

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

function coordinateExpression(
  expected: { point: [number, number, number]; direction: [number, number, number] },
  index: number,
  multiplier = 1,
) {
  return `${texCoefficient(multiplier * expected.direction[index])}t${texConstante(expected.point[index])}`
}

describe('canTSpeE03 / 3G98-1 interactif', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
    window.notifyLocal = vi.fn()
  })

  it('accepte les réponses attendues avec le check de droite paramétrique', () => {
    seedrandom('3G98-1', { global: true })
    const exercice = new RepresentationParametrique()
    exercice.interactif = true
    exercice.numeroExercice = 0
    exercice.nouvelleVersion()

    const valeurs = exercice.autoCorrection[0].valeur
    const expected = JSON.parse(String(valeurs.champ1.value)) as {
      point: [number, number, number]
      direction: [number, number, number]
    }
    installMathfield({
      champ1: coordinateExpression(expected, 0),
      champ2: coordinateExpression(expected, 1),
      champ3: coordinateExpression(expected, 2),
    })

    expect(valeurs.champ1.compare).toBeUndefined()
    expect(valeurs.champ2.compare).toBeUndefined()
    expect(valeurs.champ3.compare).toBeUndefined()
    const result = valeurs.callback(
      exercice,
      0,
      Object.entries(valeurs).filter(([key]) => key.startsWith('champ')),
      valeurs.bareme,
    )

    expect(result.isOk).toBe(true)
    expect(result.score).toEqual({ nbBonnesReponses: 1, nbReponses: 1 })
  })

  it('accepte une représentation équivalente utilisant un vecteur directeur proportionnel', () => {
    seedrandom('3G98-1', { global: true })
    const exercice = new RepresentationParametrique()
    exercice.interactif = true
    exercice.numeroExercice = 0
    exercice.nouvelleVersion()

    const valeurs = exercice.autoCorrection[0].valeur
    const expected = JSON.parse(String(valeurs.champ1.value)) as {
      point: [number, number, number]
      direction: [number, number, number]
    }
    installMathfield({
      champ1: coordinateExpression(expected, 0, 2),
      champ2: coordinateExpression(expected, 1, 2),
      champ3: coordinateExpression(expected, 2, 2),
    })

    const result = valeurs.callback(
      exercice,
      0,
      Object.entries(valeurs).filter(([key]) => key.startsWith('champ')),
      valeurs.bareme,
    )

    expect(result.isOk).toBe(true)
  })
})
