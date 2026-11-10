import seedrandom from 'seedrandom'
import { afterEach, expect, it } from 'vitest'
import ImagesEnFonctionDeN from '../../src/exercices/2e/2F13-6'
import { fonctionComparaison } from '../../src/lib/interactif/comparisonFunctions'
import { context } from '../../src/modules/context'

const originalRandom = Math.random
const originalContext = { ...context }
afterEach(() => {
  Math.random = originalRandom
  Object.assign(context, originalContext)
})

// Évaluer les polynômes affichés, indépendamment du calcul des coefficients.
function evaluate(expression: string, variable: string, value: number) {
  const terms = expression.replaceAll('-', '+-').split('+').filter(Boolean)
  return terms.reduce((sum, term) => {
    if (!term.includes(variable)) return sum + Number(term)
    const [coefficient, power] = term.split(variable)
    const factor =
      coefficient === '' ? 1 : coefficient === '-' ? -1 : Number(coefficient)
    return sum + factor * value ** (power ? Number(power.slice(1)) : 1)
  }, 0)
}

it.each([1, 2])('calculer les quatre types d’images (fonction %s)', (type) => {
  context.isHtml = true
  context.isAmc = false
  for (let seed = 0; seed < 20; seed++) {
    seedrandom(`images-n-${seed}`, { global: true })
    const exercise = new ImagesEnFonctionDeN()
    exercise.numeroExercice = 0
    exercise.interactif = true
    exercise.sup = type
    exercise.nouvelleVersion()
    expect(exercise.listeQuestions).toHaveLength(4)
    exercise.listeQuestions.forEach((question, i) => {
      const expression = exercise.consigne.match(/f\(x\)=([^$]+)/)![1]
      const argument = question.match(/\$f\(([^)]+)\)/)![1]
      const answer = String(exercise.autoCorrection[i].valeur?.reponse?.value)
      expect(argument).toContain('n')
      expect(question.match(/<mathalea-mathfield/g)).toHaveLength(1)
      expect(question.match(/\$f\(/g)).toHaveLength(1)
      for (const n of [0, 1, 2, 5, 10]) {
        expect(evaluate(answer, 'n', n)).toBe(
          evaluate(expression, 'x', evaluate(argument, 'n', n)),
        )
      }
      expect(
        fonctionComparaison(answer, answer, {
          expressionsForcementReduites: true,
        }).isOk,
      ).toBe(true)
      if (i === 0) expect(argument).toBe('n+1')
      if (i === 2) expect(argument).toMatch(/^[2-5]n$/)
      if (i === 3) expect(argument).toMatch(/^[2-5]n[+-]\d+$/)
    })
  }
})

it.each(['1', '2', '3', '4', '1-2-3-4', '5'])(
  'conserver une fonction et des images distinctes (types %s)',
  (types) => {
    for (let seed = 0; seed < 20; seed++) {
      seedrandom(`unique-images-${seed}`, { global: true })
      const exercise = new ImagesEnFonctionDeN()
      exercise.nbQuestions = 20
      exercise.sup2 = types
      exercise.nouvelleVersion()
      const expectedCount = types === '1' ? 1 : 20
      expect(exercise.listeQuestions).toHaveLength(expectedCount)
      const argumentsList = exercise.listeQuestions.map(
        (question) => question.match(/\$f\(([^)]+)\)/)![1],
      )
      expect(new Set(argumentsList).size).toBe(expectedCount)
      expect(exercise.consigne.match(/f\(x\)=/g)).toHaveLength(1)
      expect(
        exercise.listeQuestions.every(
          (question) => !question.includes('f(x)='),
        ),
      ).toBe(true)
      if (types === '3' || types === '4') {
        for (const argument of argumentsList) {
          expect(Number(argument.match(/^(\d+)n/)![1])).toBeGreaterThan(1)
          expect(argument).not.toBe('n+1')
        }
      }
    }
  },
)

it('conserver la fonction quand le nombre de questions change', () => {
  const definitions = [1, 4, 10, 20].map((count) => {
    seedrandom('same-function', { global: true })
    const exercise = new ImagesEnFonctionDeN()
    exercise.nbQuestions = count
    exercise.nouvelleVersion()
    return exercise.consigne.match(/f\(x\)=([^$]+)/)![1]
  })
  expect(new Set(definitions).size).toBe(1)
})
