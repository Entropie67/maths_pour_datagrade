import { ComputeEngine } from '@cortex-js/compute-engine'
import seedrandom from 'seedrandom'
import { afterEach, expect, it } from 'vitest'
import DevelopperExpressionsSecondDegre from '../../src/exercices/2e/2L11-7'
import { context } from '../../src/modules/context'

const originalRandom = Math.random
const originalContext = { ...context }
const ce = new ComputeEngine()

afterEach(() => {
  Math.random = originalRandom
  Object.assign(context, originalContext)
})

function generate(seed: string, type: string, operation: number) {
  seedrandom(seed, { global: true })
  context.isHtml = true
  context.isAmc = false
  const exercise = new DevelopperExpressionsSecondDegre()
  exercise.numeroExercice = 0
  exercise.interactif = true
  exercise.nbQuestions = 1
  exercise.sup = type
  exercise.sup2 = operation
  exercise.nouvelleVersion()
  return exercise
}

it('expliciter la soustraction du trinôme pour la graine signalée YFe4', () => {
  const exercise = generate('YFe4', '1', 3)
  expect(exercise.listeQuestions[0]).toContain(
    '3x(-x-8)-\\left(-x^{2}-4x+1\\right)',
  )
  expect(exercise.autoCorrection[0].valeur?.reponse?.value).toBe(
    '-2x^{2}-20x-1',
  )
})

it.each([1, 2, 3])(
  'conserver la valeur de chaque égalité et de la réponse (opération %s)',
  (operation) => {
    for (const type of ['1', '2', '3', '4', '5', '6']) {
      for (let seed = 0; seed < 20; seed++) {
        const exercise = generate(`developper-${seed}`, type, operation)
        expect(exercise.listeQuestions).toHaveLength(1)
        const expression = exercise.listeQuestions[0].split('$')[1].slice(2, -1)
        const answer = String(exercise.autoCorrection[0].valeur?.reponse?.value)
        const steps = exercise.listeCorrections[0]
          .split('\\\\')
          .slice(1, -1)
          .map((step) => step.trim().slice(2))
        // Trois valeurs distinctes suffisent pour comparer ces polynômes de degré 2.
        for (const x of [-2, 0, 3]) {
          const evaluate = (latex: string) =>
            ce
              .parse(latex.replaceAll('x', `(${x})`))
              .N()
              .valueOf()
          const expected = evaluate(expression)
          expect(typeof expected).toBe('number')
          expect(evaluate(answer), expression).toBe(expected)
          for (const step of steps) {
            expect(evaluate(step), `${expression} = ${step}`).toBe(expected)
          }
        }
      }
    }
  },
)
