import seedrandom from 'seedrandom'
import katex from 'katex'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Divisibilite from '../../src/exercices/3e/3A10-6'
import EcrireUnNombre from '../../src/exercices/5e/5N1E-2'
import { fonctionComparaison } from '../../src/lib/interactif/comparisonFunctions'
import { context } from '../../src/modules/context'

vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

const originalRandom = Math.random

beforeEach(() => {
  context.isHtml = true
  context.isAmc = false
  window.notify = vi.fn()
  window.notifyLocal = vi.fn()
})

afterEach(() => {
  Math.random = originalRandom
})

describe('10021 : écrire la moitié ou le quart sous forme de fraction', () => {
  for (const [type, diviseur] of [
    [5, 2],
    [6, 4],
  ]) {
    it(`accepte la fraction et la division pour le type ${type}`, () => {
      for (const seed of ['10021', 'fraction', 'division', 'autre']) {
        seedrandom(seed, { global: true })
        const exercise = new EcrireUnNombre()
        Object.assign(exercise, {
          numeroExercice: 0,
          interactif: true,
          sup: String(type),
          nbQuestions: 1,
        })
        exercise.nouvelleVersion()
        const answer = exercise.autoCorrection[0].valeur!.reponse!
        const values = answer.value as string[]
        expect(values).toHaveLength(2)
        for (const value of values) {
          expect(() =>
            katex.renderToString(value, { throwOnError: true }),
          ).not.toThrow()
        }
        const numerateur = Number(values[0].split(' ')[0])
        for (const input of [
          `\\frac{${numerateur}}{${diviseur}}`,
          `${numerateur}\\div ${diviseur}`,
        ]) {
          expect(fonctionComparaison(input, values[0]).isOk).toBe(true)
        }
        expect(
          fonctionComparaison(String(numerateur + 1), values[0]).isOk,
        ).toBe(false)
      }
    })
  }
})

// Une correction doit garder des délimiteurs équilibrés et des formules valides,
// y compris dans les branches des critères de divisibilité combinés.
it('rendre les corrections de divisibilité pour tous les critères', () => {
  for (const sup of ['1', '2', '3', '4', '5', '6', '7']) {
    for (const seed of ['10021', 'autre', 'correction']) {
      seedrandom(seed, { global: true })
      const exercise = new Divisibilite()
      Object.assign(exercise, {
        numeroExercice: 0,
        sup,
        sup2: '2-4-6',
        nbQuestions: 3,
      })
      exercise.nouvelleVersion()
      for (const correction of exercise.listeCorrections) {
        expect(correction.match(/\$/g)?.length ?? 0).toSatisfy(
          (n: number) => n % 2 === 0,
        )
        for (const [, latex] of correction.matchAll(/\$([^$]+)\$/g)) {
          expect(() =>
            katex.renderToString(latex.replaceAll('&nbsp;', ' '), {
              throwOnError: true,
            }),
          ).not.toThrow()
        }
      }
    }
  }
}, 30_000)
