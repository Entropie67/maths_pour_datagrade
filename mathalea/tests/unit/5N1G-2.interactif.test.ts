import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MettreDesParentheses from '../../src/exercices/5e/5N1G-2'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

function prepare(complexity = '1') {
  seedrandom('feedback-parentheses', { global: true })
  const exercice = new MettreDesParentheses()
  exercice.interactif = true
  exercice.numeroExercice = 0
  exercice.nbQuestions = 1
  exercice.sup = complexity
  exercice.nouvelleVersion()
  const answers = exercice.autoCorrection[0].valeur
  const variables = Object.entries(answers).filter(([key]) =>
    key.startsWith('champ'),
  )
  const values = Object.fromEntries(
    variables.map(([key, answer]) => [key, answer.value]),
  )
  const mathfield = Object.assign(document.createElement('div'), {
    getPrompts: () => Object.keys(values),
    getPromptValue: (key: string) => values[key],
    setPromptState: vi.fn(),
  })
  mathfield.id = 'champTexteEx0Q0'
  document.body.appendChild(mathfield)
  return {
    values,
    maxScore: () => answers.bareme(variables.map(() => 1))[1],
    check: () => answers.callback(exercice, 0, variables, answers.bareme),
  }
}

describe('5N1G-2 : feedback des parenthèses', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    window.notify = vi.fn()
    window.notifyLocal = vi.fn()
  })

  it.each(['ç', '2', '+', '\\frac{1}{2}'])(
    'refuse le caractère interdit %s sans afficher une erreur du moteur',
    (input) => {
      const { values, check } = prepare()
      values.champ1 = '('
      values.champ3 = input
      const result = check()
      expect(result.feedback).toBe(
        'Saisir uniquement des parenthèses ou laisser les cases vides.',
      )
      expect(result.score).toEqual({ nbBonnesReponses: 0, nbReponses: 1 })
    },
  )

  it.each(['(', ')', ')('])(
    'signale les parenthèses mal équilibrées : %s',
    (input) => {
      const { values, check } = prepare()
      for (const key of Object.keys(values)) values[key] = ''
      values.champ1 = input
      expect(check().feedback).toContain('Les parenthèses sont mal équilibrées')
    },
  )

  it.each(['1', '2'])(
    'accepte la réponse attendue avec un score fixe pour la complexité %s',
    (complexity) => {
      const { check, maxScore } = prepare(complexity)
      const result = check()
      expect(result.isOk).toBe(true)
      expect(result.feedback).toBe("L'égalité est respectée.")
      expect(result.score).toEqual({ nbBonnesReponses: 1, nbReponses: 1 })
      expect(maxScore()).toBe(1)
    },
  )

  it('conserve le calcul dans le feedback pour une égalité fausse', () => {
    const { values, check } = prepare()
    for (const key of Object.keys(values)) values[key] = ''
    const result = check()
    expect(result.isOk).toBe(false)
    expect(result.feedback).toContain(
      "L'égalité n'est pas respectée : en effet, $",
    )
    expect(result.feedback).not.toMatch(/NaN|\\error/)
  })

  it('signale les parenthèses inutiles même avec les commandes MathLive', () => {
    const { values, check } = prepare()
    values.champ1 = '\\left(' + values.champ1
    values.champ4 += '\\right)'
    const result = check()
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "L'égalité est respectée, mais il y a des parenthèses inutiles.",
    )
  })

  it('ne tente pas d’afficher un calcul contenant des parenthèses vides', () => {
    const { values, check } = prepare()
    values.champ1 = '()' + values.champ1
    const result = check()
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      "L'expression est mal écrite. Vérifier le placement des parenthèses.",
    )
  })
})
