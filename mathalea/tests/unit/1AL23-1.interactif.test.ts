import seedrandom from 'seedrandom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Inequations from '../../src/exercices/1e/1AL23-1'
import { fonctionComparaison } from '../../src/lib/interactif/comparisonFunctions'
import type { OptionsComparaisonType } from '../../src/lib/types'
import { context } from '../../src/modules/context'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

const originalRandom = Math.random

afterEach(() => {
  Math.random = originalRandom
})

describe('1AL23-1 : saisie de l’ensemble des solutions', () => {
  it('vérifie les intervalles, unions, singletons, ensemble vide et réels', () => {
    context.isHtml = true
    window.notify = vi.fn()
    const covered = new Set<string>()
    for (const type of ['1', '2', '3', '4']) {
      for (let seed = 0; seed < 8; seed++) {
        seedrandom(`inequations-${seed}`, { global: true })
        const exercise = new Inequations()
        exercise.interactif = true
        exercise.numeroExercice = 0
        exercise.nbQuestions = 6
        exercise.sup = type
        exercise.nouvelleVersion()
        expect(exercise.listeQuestions).toHaveLength(6)
        for (let i = 0; i < exercise.nbQuestions; i++) {
          const response = exercise.autoCorrection[i].valeur
            ?.reponse as unknown as {
            value: string
            options: OptionsComparaisonType
          }
          const compare = (input: string) =>
            fonctionComparaison(input, response.value, response.options)
          expect(compare(response.value).isOk, response.value).toBe(true)
          expect(compare('12345').isOk).toBe(false)
          expect(exercise.listeQuestions[i]).toContain('$S=$')
          expect(
            exercise.listeQuestions[i].match(/<mathalea-mathfield/g),
          ).toHaveLength(1)
          const kind = response.value.startsWith('\\{')
            ? 'singleton'
            : response.value.includes('\\cup')
              ? 'union'
              : response.value
          covered.add(kind)
          if (kind === '\\mathbb{R}') {
            expect(compare(']-\\infty;+\\infty[').isOk).toBe(true)
            expect(compare(']-\\infty;\\infty[').isOk).toBe(true)
            expect(compare(']-\\infty;+\\infty]').isOk).toBe(false)
            expect(compare(']-\\infty;3[').isOk).toBe(false)
          }
          if (kind === 'singleton') {
            const root = response.value.slice(2, -2)
            expect(compare(`\\{\\frac{${Number(root) * 2}}{2}\\}`).isOk).toBe(
              true,
            )
          }
          if (kind === 'union') {
            expect(
              compare(response.value.split('\\cup').reverse().join('\\cup'))
                .isOk,
            ).toBe(true)
          }
        }
      }
    }
    for (const kind of ['singleton', 'union', '\\emptyset', '\\mathbb{R}']) {
      expect(covered.has(kind), kind).toBe(true)
    }
  })
})
