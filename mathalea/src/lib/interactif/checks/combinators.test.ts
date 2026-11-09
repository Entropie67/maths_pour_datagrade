// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { all, seq } from './combinators'
import type { Check } from './types'

const passingCheck = (name: string, options: Partial<Check> = {}): Check => ({
  name,
  ...options,
  run: () => ({ passed: true, feedbackKo: '' }),
})

const failingCheck = (name: string, options: Partial<Check> = {}): Check => ({
  name,
  ...options,
  run: () => ({ passed: false, feedbackKo: `${name} ko` }),
})

describe('checks combinators', () => {
  describe('all', () => {
    it('evaluates every check and returns a binary score without weights', () => {
      const compare = all([
        passingCheck('value'),
        failingCheck('shape'),
        passingCheck('syntax'),
      ])

      const result = compare('2/4', '1/2')

      expect(result.isOk).toBe(false)
      expect(result.score).toBe(0)
      expect(result.feedback).toBe('shape ko')
      expect(result.details).toEqual([
        { name: 'value', passed: true },
        { name: 'shape', passed: false },
        { name: 'syntax', passed: true },
      ])
    })

    it('adds successful feedback only when the answer is not globally correct', () => {
      const compare = all([
        {
          ...passingCheck('value', { feedbackEnabled: true }),
          run: () => ({
            passed: true,
            feedbackKo: '',
            feedbackOk: 'value ok',
          }),
        },
        failingCheck('shape'),
      ])

      expect(compare('2/4', '1/2').feedback).toBe('value ok\nshape ko')
    })

    it('keeps globally correct answers quiet by default', () => {
      const compare = all([passingCheck('value'), passingCheck('shape')])

      expect(compare('1/2', '1/2')).toMatchObject({
        isOk: true,
        score: 1,
        feedback: '',
      })
    })

    it('can include successful feedback when the answer is globally correct', () => {
      const compare = all([
        {
          ...passingCheck('value', { feedbackOnSuccess: true }),
          run: () => ({
            passed: true,
            feedbackKo: '',
            feedbackOk: 'value ok',
          }),
        },
      ])

      expect(compare('1/2', '1/2')).toMatchObject({
        isOk: true,
        score: 1,
        feedback: 'value ok',
      })
    })

    it('computes partial weighted score', () => {
      const compare = all([
        {
          ...passingCheck('value', { weight: 0.7 }),
          run: () => ({
            passed: true,
            feedbackKo: '',
            feedbackOk: 'value ok',
          }),
        },
        failingCheck('irreducible', { weight: 0.3 }),
      ])

      expect(compare('2/4', '1/2')).toMatchObject({
        isOk: false,
        score: 0.7,
        feedback: 'value ok\nirreducible ko',
      })
    })

    it('rejects mixed weighted and unweighted checks', () => {
      expect(() =>
        all([passingCheck('value', { weight: 0.7 }), passingCheck('shape')]),
      ).toThrow(/weights/i)
    })

    it('rejects weighted checks whose sum is not 1', () => {
      expect(() =>
        all([
          passingCheck('value', { weight: 0.7 }),
          passingCheck('shape', { weight: 0.2 }),
        ]),
      ).toThrow(/sum/i)
    })

    it('rejects duplicate names in the same comparator', () => {
      expect(() => all([passingCheck('value'), passingCheck('value')])).toThrow(
        /duplicate/i,
      )
    })

    it('empty checks list — vacuously true with score 1 and no feedback', () => {
      const result = all([])('x', 'x')

      expect(result.isOk).toBe(true)
      expect(result.score).toBe(1)
      expect(result.feedback).toBe('')
      expect(result.details).toEqual([])
    })

    it('a failing check with feedbackEnabled: false does not appear in feedback', () => {
      const compare = all([
        failingCheck('shape', { feedbackEnabled: false }),
        failingCheck('value'),
      ])

      const result = compare('x', 'y')
      expect(result.isOk).toBe(false)
      expect(result.feedback).not.toContain('shape ko')
      expect(result.feedback).toContain('value ko')
    })

    it('multiple failing checks — their feedbacks are joined with newline', () => {
      const compare = all([
        failingCheck('check-a'),
        failingCheck('check-b'),
        failingCheck('check-c'),
      ])

      const result = compare('x', 'y')
      expect(result.isOk).toBe(false)
      expect(result.feedback).toBe('check-a ko\ncheck-b ko\ncheck-c ko')
    })

    it('weighted all-passing gives score exactly 1', () => {
      const compare = all([
        passingCheck('a', { weight: 0.5 }),
        passingCheck('b', { weight: 0.5 }),
      ])

      const result = compare('x', 'x')
      expect(result.isOk).toBe(true)
      expect(result.score).toBe(1)
    })

    it('weights 0.1 + 0.2 + 0.7 are accepted (floating-point sum within tolerance)', () => {
      // 0.1 + 0.2 + 0.7 ≈ 1 within the 1e-12 tolerance used by assertWeights
      expect(() =>
        all([
          passingCheck('a', { weight: 0.1 }),
          passingCheck('b', { weight: 0.2 }),
          passingCheck('c', { weight: 0.7 }),
        ]),
      ).not.toThrow()
    })

    it('weights summing to 0.91 are rejected', () => {
      expect(() =>
        all([
          passingCheck('a', { weight: 0.5 }),
          passingCheck('b', { weight: 0.41 }),
        ]),
      ).toThrow(/sum/i)
    })

    it('feedbackEnabled: false on a passing check in globally failing context — feedbackOk not in feedback', () => {
      const compare = all([
        {
          ...passingCheck('value', { feedbackEnabled: false }),
          run: () => ({
            passed: true,
            feedbackKo: '',
            feedbackOk: 'valeur ok',
          }),
        },
        failingCheck('shape'),
      ])

      const result = compare('x', 'y')
      expect(result.isOk).toBe(false)
      expect(result.feedback).not.toContain('valeur ok')
      expect(result.feedback).toContain('shape ko')
    })
  })

  describe('seq', () => {
    it('short-circuits at the first failure', () => {
      const executed: string[] = []
      const first: Check = {
        name: 'syntax',
        run: () => {
          executed.push('syntax')
          return { passed: false, feedbackKo: 'syntax ko' }
        },
      }
      const second: Check = {
        name: 'value',
        run: () => {
          executed.push('value')
          return { passed: true, feedbackKo: '' }
        },
      }

      const result = seq([first, second])('x+', 'x')

      expect(executed).toEqual(['syntax'])
      expect(result).toMatchObject({
        isOk: false,
        score: 0,
        feedback: 'syntax ko',
        details: [{ name: 'syntax', passed: false }],
      })
    })

    it('returns ok when every check passes', () => {
      const result = seq([passingCheck('syntax'), passingCheck('value')])(
        'x',
        'x',
      )

      expect(result).toMatchObject({
        isOk: true,
        score: 1,
        feedback: '',
      })
    })

    it('empty checks list — vacuously true with score 1 and empty details', () => {
      const result = seq([])('x', 'x')

      expect(result.isOk).toBe(true)
      expect(result.score).toBe(1)
      expect(result.feedback).toBe('')
      expect(result.details).toEqual([])
    })

    it('single failing check gives isOk false and 1-entry details', () => {
      const result = seq([failingCheck('syntax')])('x+', 'x')

      expect(result).toMatchObject({
        isOk: false,
        score: 0,
        feedback: 'syntax ko',
        details: [{ name: 'syntax', passed: false }],
      })
    })

    it('fails at second check — first in details (passed), second in details (failed), third absent', () => {
      const executed: string[] = []
      const first: Check = {
        name: 'first',
        run: () => {
          executed.push('first')
          return { passed: true, feedbackKo: '' }
        },
      }
      const second: Check = {
        name: 'second',
        run: () => {
          executed.push('second')
          return { passed: false, feedbackKo: 'second ko' }
        },
      }
      const third: Check = {
        name: 'third',
        run: () => {
          executed.push('third')
          return { passed: true, feedbackKo: '' }
        },
      }

      const result = seq([first, second, third])('x', 'x')

      expect(executed).toEqual(['first', 'second'])
      expect(result.isOk).toBe(false)
      expect(result.score).toBe(0)
      expect(result.details).toHaveLength(2)
      expect(result.details[0]).toEqual({ name: 'first', passed: true })
      expect(result.details[1]).toEqual({ name: 'second', passed: false })
    })

    it('feedbackEnabled: false on failing check — its feedback not in result', () => {
      const compare = seq([failingCheck('syntax', { feedbackEnabled: false })])

      const result = compare('x+', 'x')
      expect(result.isOk).toBe(false)
      expect(result.feedback).toBe('')
    })

    it('all 3 checks passing — details has all 3 entries, isOk true', () => {
      const result = seq([
        passingCheck('a'),
        passingCheck('b'),
        passingCheck('c'),
      ])('x', 'x')

      expect(result.isOk).toBe(true)
      expect(result.score).toBe(1)
      expect(result.details).toHaveLength(3)
      expect(result.details.every((d) => d.passed)).toBe(true)
    })

    it('weighted checks score the passing prefix before the first failure', () => {
      expect(() =>
        seq([
          passingCheck('a', { weight: 0.5 }),
          passingCheck('b', { weight: 0.5 }),
        ]),
      ).not.toThrow()

      // All checks passing still gives the full score.
      const allPass = seq([
        passingCheck('a', { weight: 0.5 }),
        passingCheck('b', { weight: 0.5 }),
      ])('x', 'x')
      expect(allPass.score).toBe(1)

      const firstFails = seq([
        failingCheck('a', { weight: 0.5 }),
        passingCheck('b', { weight: 0.5 }),
      ])('x', 'x')
      expect(firstFails.score).toBe(0)

      const secondFails = seq([
        passingCheck('a', { weight: 0.3 }),
        failingCheck('b', { weight: 0.4 }),
        passingCheck('c', { weight: 0.3 }),
      ])('x', 'x')
      expect(secondFails).toMatchObject({
        isOk: false,
        score: 0.3,
        details: [
          { name: 'a', passed: true },
          { name: 'b', passed: false },
        ],
      })
    })
  })
})
