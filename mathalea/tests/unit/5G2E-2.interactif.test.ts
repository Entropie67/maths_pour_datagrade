import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PerimetreAireEtPortionsDeDisques from '../../src/exercices/5e/5G2E-2'
import { MultiMathfieldElement } from '../../src/lib/customElements/MultiMathfield'
import { context } from '../../src/modules/context'
import { randint } from '../../src/modules/outils'

vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

vi.mock('../../src/modules/outils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../src/modules/outils')>()),
  randint: vi.fn(),
}))

beforeEach(() => {
  context.isHtml = true
  context.isAmc = false
  document.body.innerHTML = ''
  window.notify = vi.fn()
  window.notifyLocal = vi.fn()
})

afterEach(() => {
  vi.clearAllMocks()
  document.body.innerHTML = ''
})

function checkAnswers(
  exercise: PerimetreAireEtPortionsDeDisques,
  answers: number[],
) {
  document.body.innerHTML = ''
  const host = document.createElement('div')
  host.id = 'multiMathfieldEx0Q0'
  const root = host.attachShadow({ mode: 'open' })
  for (const [index, answer] of answers.entries()) {
    const field = document.createElement('div')
    field.id = `${host.id}-champ${index + 1}`
    Object.assign(field, {
      getValue: () => answer.toFixed(1).replace('.', ','),
    })
    root.appendChild(field)
  }
  document.body.appendChild(host)
  return MultiMathfieldElement.verifQuestion(exercise, 0)
}

describe('5G2E-2 : valeurs approchées interactives', () => {
  it.each([1, 2, 3])(
    'accepte les arrondis au dixième pour le mode %s et toutes les figures',
    (mode) => {
      for (const figure of [1, 2, 3]) {
        for (let length = 2; length <= 10; length++) {
          vi.mocked(randint).mockReturnValue(length)
          const exercise = new PerimetreAireEtPortionsDeDisques()
          exercise.numeroExercice = 0
          exercise.interactif = true
          exercise.nbQuestions = 1
          exercise.sup = mode
          exercise.sup2 = String(figure)
          exercise.nouvelleVersion()

          const radius = figure === 2 ? length / 2 : length
          const fraction = figure / 4
          const perimeter = 2 * radius + fraction * 2 * Math.PI * radius
          const area = fraction * Math.PI * radius ** 2
          const answers = [
            ...(mode !== 2 ? [perimeter] : []),
            ...(mode !== 1 ? [area] : []),
          ].map((value) => Math.round(value * 10) / 10)

          expect(checkAnswers(exercise, answers)).toMatchObject({
            isOk: true,
            score: {
              nbBonnesReponses: answers.length,
              nbReponses: answers.length,
            },
          })
          expect(
            checkAnswers(
              exercise,
              answers.map((answer) => answer + 1),
            ),
          ).toMatchObject({
            isOk: false,
            score: { nbBonnesReponses: 0, nbReponses: answers.length },
          })
        }
      }
    },
  )
})
