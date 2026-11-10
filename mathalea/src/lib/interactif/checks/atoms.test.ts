// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { all } from './combinators'
import { contains } from './contains'
import { doesNotContain } from './doesNotContain'
import { isEqual } from './isEqual'
import { isReduced } from './isReduced'
import {
  isDistributed,
  noNumericComputation,
  noTrivialFactor,
  termsGrouped,
} from './reductionAtoms'

describe('checks atoms', () => {
  describe('isEqual', () => {
    it('checks mathematical equality using the current comparator engine', () => {
      const compare = all([isEqual()])

      expect(compare('\\sqrt{36}', '6').isOk).toBe(true)
      expect(compare('7', '6')).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('uses exact comparison when tolerance is omitted', () => {
      expect(all([isEqual()])('0.1', '1')).toMatchObject({
        isOk: false,
        score: 0,
      })
      expect(all([isEqual()])('1', '1')).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('does not parse an empty input as zero in tolerance mode', () => {
      const compare = all([isEqual({ tolerance: -2 })])

      expect(compare('', '0')).toMatchObject({ isOk: false, score: 0 })
      expect(compare('   ', '0')).toMatchObject({ isOk: false, score: 0 })
    })

    it('accepts tolerance 0 as approximate comparison with tolerance 1', () => {
      const compare = all([isEqual({ tolerance: 0 })])

      expect(compare('0.1', '1')).toMatchObject({ isOk: true, score: 1 })
      expect(compare('-0.1', '1')).toMatchObject({ isOk: false, score: 0 })
    })

    it('supports power-of-ten tolerance', () => {
      const compare = all([isEqual({ tolerance: -2 })])

      expect(compare('1.005', '1')).toMatchObject({ isOk: true, score: 1 })
      expect(compare('1.02', '1')).toMatchObject({ isOk: false, score: 0 })
      expect(compare('0', '1')).toMatchObject({ isOk: false, score: 0 })
    })

    it('uses the tolerance value as an exponent directly', () => {
      const compare = all([isEqual({ tolerance: -1 })])

      expect(compare('0.9', '1')).toMatchObject({ isOk: true, score: 1 })
      expect(compare('0.89', '1')).toMatchObject({ isOk: false, score: 0 })
    })

    it('applies tolerance to simple fractions', () => {
      expect(all([isEqual({ tolerance: -1 })])('0.45', '1/2')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(
        all([isEqual({ tolerance: -2 })])('0.49', '\\dfrac{1}{2}'),
      ).toMatchObject({ isOk: true, score: 1 })
      expect(
        all([isEqual({ tolerance: -2 })])('0.49', '\\dfrac12'),
      ).toMatchObject({ isOk: true, score: 1 })
    })

    it('applies tolerance to simple monomial coefficients when requested', () => {
      const compare = all([isEqual({ tolerance: -0.05 })])

      expect(compare('0.9*z', 'z')).toMatchObject({ isOk: true, score: 1 })
      expect(compare('0.9z', 'z')).toMatchObject({ isOk: true, score: 1 })
      expect(compare('0.9\\times z', 'z')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(compare('-0.9z', '-z')).toMatchObject({ isOk: true, score: 1 })
      expect(compare('2.1z', 'z')).toMatchObject({ isOk: false, score: 0 })
      expect(compare('0.9z', 'y')).toMatchObject({ isOk: false, score: 0 })
    })

    it('normalizes comma as decimal separator', () => {
      // '1,5' and '1.5' both parse to 1.5, so exact comparison passes
      const compare = all([isEqual()])
      expect(compare('1,5', '1.5').isOk).toBe(true)
    })

    it('tolerance boundary: exactly at tolerance passes, just outside fails', () => {
      const compare = all([isEqual({ tolerance: -1 })])

      // exactly at tolerance → passes (≤)
      expect(compare('1.1', '1')).toMatchObject({ isOk: true, score: 1 })
      // just outside tolerance → fails
      expect(compare('1.11', '1')).toMatchObject({ isOk: false, score: 0 })
    })

    it('negative numbers with tolerance', () => {
      const compare = all([isEqual({ tolerance: -1 })])

      expect(compare('-1.02', '-1')).toMatchObject({ isOk: true, score: 1 })
      expect(compare('-1.11', '-1')).toMatchObject({ isOk: false, score: 0 })
    })

    it('custom feedbackKo overrides the default error message', () => {
      const compare = all([
        isEqual({ feedbackKo: 'Mauvaise réponse personnalisée.' }),
      ])

      const result = compare('7', '6')
      expect(result.isOk).toBe(false)
      expect(result.feedback).toBe('Mauvaise réponse personnalisée.')
    })

    it('custom feedbackOk appears in feedback when check passes but answer globally wrong', () => {
      const compare = all([
        isEqual({ feedbackOk: 'La valeur numérique est bonne.' }),
        {
          name: 'shape',
          run: () => ({ passed: false, feedbackKo: 'Forme incorrecte.' }),
        },
      ])

      const result = compare('6', '6')
      expect(result.isOk).toBe(false)
      expect(result.feedback).toContain('La valeur numérique est bonne.')
      expect(result.feedback).toContain('Forme incorrecte.')
    })

    it('non-numeric inputs with tolerance fall through to fonctionComparaison', () => {
      // When neither input parses as finite number nor as simple monomial,
      // compareWithTolerance returns undefined and fonctionComparaison is called
      const compare = all([isEqual({ tolerance: -2 })])

      // '\\frac{1}{2}' parses as 0.5 via asNumber, '0.5' parses as 0.5 → numeric path
      expect(compare('\\frac{1}{2}', '0.5')).toMatchObject({
        isOk: true,
        score: 1,
      })
    })
  })

  describe('contains and doesNotContain', () => {
    it('checks literal and regexp patterns', () => {
      expect(all([contains('\\sin')])('\\sin(x)', 'x').isOk).toBe(true)
      expect(all([contains(/x\^2/)])('3x^2+1', 'x').isOk).toBe(true)
      expect(all([doesNotContain('\\times')])('2x', '2x').isOk).toBe(true)
      expect(
        all([doesNotContain(/\\times/)])('2\\times x', '2x'),
      ).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('contains: empty string input fails for non-empty pattern', () => {
      // Empty string does not contain a non-empty literal
      expect(all([contains('x')])('', '0')).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('contains: pattern matched at the start or end of the string', () => {
      expect(all([contains('\\sin')])('\\sin(x)+1', '0').isOk).toBe(true)
      expect(all([contains('+1')])('\\sin(x)+1', '0').isOk).toBe(true)
    })

    it('contains: regex with case-insensitive flag', () => {
      expect(all([contains(/sin/i)])('SIN(x)', '0').isOk).toBe(true)
      expect(all([contains(/sin/i)])('sin(x)', '0').isOk).toBe(true)
    })

    it('contains: custom feedbackKo appears when failing', () => {
      const compare = all([
        contains({ pattern: 'x', feedbackKo: 'Il faut inclure x.' }),
      ])

      const result = compare('3', '0')
      expect(result.isOk).toBe(false)
      expect(result.feedback).toBe('Il faut inclure x.')
    })

    it('doesNotContain: empty string input passes for any non-empty pattern', () => {
      // Empty string contains nothing, so doesNotContain passes
      expect(all([doesNotContain('x')])('', '0')).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('doesNotContain: custom feedbackKo appears when failing', () => {
      const compare = all([
        doesNotContain({
          pattern: '\\times',
          feedbackKo: 'Ne pas utiliser \\times.',
        }),
      ])

      const result = compare('2\\times x', '2x')
      expect(result.isOk).toBe(false)
      expect(result.feedback).toBe('Ne pas utiliser \\times.')
    })

    it('feedbackEnabled: false suppresses feedback even when check fails', () => {
      const compare = all([
        contains({
          pattern: 'x',
          feedbackEnabled: false,
          feedbackKo: 'Manque x.',
        }),
        {
          name: 'value',
          run: () => ({ passed: false, feedbackKo: 'Valeur incorrecte.' }),
        },
      ])

      const result = compare('3', '0')
      expect(result.isOk).toBe(false)
      // The contains check feedback should be suppressed
      expect(result.feedback).not.toContain('Manque x.')
      // The value check feedback should still appear
      expect(result.feedback).toContain('Valeur incorrecte.')
    })
  })

  describe('isReduced', () => {
    it('accepts a single integer as reduced', () => {
      expect(all([isReduced()])('1', '0')).toMatchObject({
        isOk: true,
        score: 1,
        feedback: '',
      })
      expect(all([isReduced()])('42', '0')).toMatchObject({
        isOk: true,
        score: 1,
        feedback: '',
      })
    })

    it('refuses an unreduced sum like 1+1', () => {
      expect(all([isReduced()])('1+1', '0')).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('custom feedbackKo appears when failing', () => {
      const compare = all([
        isReduced({ feedbackKo: "Simplifiez encore l'expression." }),
      ])

      const result = compare('1+1', '0')
      expect(result.isOk).toBe(false)
      expect(result.feedback).toBe("Simplifiez encore l'expression.")
    })

    it('accepts an already reduced expression even when minus signs differ', () => {
      const compare = all([isReduced()])

      expect(compare('2x-2', '0')).toMatchObject({
        isOk: true,
        score: 1,
        feedback: '',
      })
      expect(compare('2x-2', '2x-2')).toMatchObject({
        isOk: true,
        score: 1,
        feedback: '',
      })
      expect(compare('2x-2', '2x−2')).toMatchObject({
        isOk: true,
        score: 1,
        feedback: '',
      })
      expect(compare('-2+2x', '2x-2')).toMatchObject({
        isOk: true,
        score: 1,
        feedback: '',
      })
      expect(compare('-1-1+2x', '2x-2')).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('composes reduction atoms independently from mathematical equality', () => {
      const compare = all([isEqual({ weight: 0.7 }), isReduced({ weight: 0.3 })])

      expect(compare('2x', 'x+x')).toMatchObject({
        isOk: true,
        score: 1,
        feedback: '',
      })

      expect(compare('x+x', '2x')).toMatchObject({
        isOk: false,
        score: 0.7,
      })
      expect(compare('x+x', '2x').feedback).toContain(
        'les termes semblables doivent être regroupés',
      )
    })
  })

  describe('reduction atoms', () => {
    it('noTrivialFactor refuses neutral factors and zero terms', () => {
      const compare = all([noTrivialFactor()])

      expect(compare('1x', '0')).toMatchObject({ isOk: false, score: 0 })
      expect(compare('x1', '0')).toMatchObject({ isOk: false, score: 0 })
      expect(compare('x+0', '0')).toMatchObject({ isOk: false, score: 0 })
      expect(compare('x', '0')).toMatchObject({ isOk: true, score: 1 })
      expect(compare('xy', '0')).toMatchObject({ isOk: true, score: 1 })
    })

    it.each([
      '1*x',
      'x*1',
      '-x*1',
      '1*x*y',
      'x*y*1',
      'x*y*z*k*1*k*4',
      '(2*x)+0',
      '0+(2*x)',
      'x-0',
      'x+(0)',
      '(-1)*x',
      'x*(-1)',
      '2*(-1)*x',
      '(-x)y',
      '-(xy)',
      '-(x*y)',
      '-(2xy)',
      '(-s)tz',
      'x(-y)',
      '-(-x)',
      '-(x+0)',
      '(x+1)*1',
      '1*(x+1)',
      '\\frac{1}{1}x',
    ])('noTrivialFactor refuses %s', (saisie) => {
      expect(all([noTrivialFactor()])(saisie, '0')).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it.each([
      'x',
      '-x',
      'xy',
      '4xy',
      '(2*x)+1',
      '2x-1',
      'x-y',
      '-2x',
      '-(x+1)',
      'x^2',
      '4x^2y',
      '-stz',
      '-bx^2+5k^2',
      '-\\frac{9}{4}ryz^2',
    ])('noTrivialFactor accepts %s', (saisie) => {
      expect(all([noTrivialFactor()])(saisie, '0')).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('noNumericComputation refuses pending numeric calculations', () => {
      const compare = all([noNumericComputation()])

      expect(compare('1+1', '0')).toMatchObject({ isOk: false, score: 0 })
      expect(compare('2\\times3', '0')).toMatchObject({ isOk: false, score: 0 })
      expect(compare('\\sqrt{4}', '0')).toMatchObject({ isOk: false, score: 0 })
      expect(compare('1+x', '0')).toMatchObject({ isOk: true, score: 1 })
      expect(compare('2x', '0')).toMatchObject({ isOk: true, score: 1 })
      expect(compare('\\sqrt{3}', '0')).toMatchObject({ isOk: true, score: 1 })
    })

    it.each([
      '1+1',
      '2-1',
      '2+3+x',
      'x+2+3',
      '2\\times3',
      '2*3',
      '2*3*x',
      '2*x*3',
      'x*2*3*y',
      'x*y*z*k*1*k*4',
      '\\sqrt{0}',
      '\\sqrt{1}',
      '\\sqrt{4}',
      '\\sqrt{9}',
      '2^3',
      '4/2',
      '\\frac{4}{2}',
      '\\frac{2}{4}',
      '\\frac{1}{1}',
      '-1-1+2x',
      '(-1)-1+2x',
      '\\frac{4\\times3}{6}',
      '\\frac{5\\times3}{2}',
      '\\frac{2+3}{4}',
      '\\frac{7}{2\\times3}',
      '\\sqrt{16\\times3}',
      '\\sqrt{9+16}',
    ])('noNumericComputation refuses %s', (saisie) => {
      expect(all([noNumericComputation()])(saisie, '0')).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it.each([
      '1+x',
      'x+1',
      '(2*x)+1',
      '2x',
      '-2x',
      '2xy',
      '4xy',
      'x-1',
      '\\sqrt{2}',
      '\\sqrt{3}',
      '1/2',
      '\\frac{1}{2}',
      '\\dfrac{1}{2}',
      '-\\frac{3}{5}',
      'x^2',
      '2x^3',
      '\\frac{x}{2}',
      '\\frac{2}{x}',
    ])('noNumericComputation accepts %s', (saisie) => {
      expect(all([noNumericComputation()])(saisie, '0')).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('noNumericComputation can allow reducible numeric fractions', () => {
      const compare = all([
        noNumericComputation({ allowReducibleFractions: true }),
      ])

      expect(compare('\\frac{2}{4}', '0')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(compare('1+1', '0')).toMatchObject({
        isOk: false,
        score: 0,
      })
      expect(compare('\\frac{2}{1}', '0')).toMatchObject({
        isOk: false,
        score: 0,
      })
      // Une fraction non simplifiée est acceptée, pas un calcul dans la fraction
      expect(compare('\\frac{8}{10}', '0')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(compare('\\frac{4\\times2}{10}', '0')).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it('termsGrouped refuses ungrouped like terms', () => {
      const compare = all([termsGrouped()])

      expect(compare('x+x', '0')).toMatchObject({ isOk: false, score: 0 })
      expect(compare('2x+3x', '0')).toMatchObject({ isOk: false, score: 0 })
      expect(compare('2*x*x', '0')).toMatchObject({ isOk: false, score: 0 })
      expect(compare('2xx', '0')).toMatchObject({ isOk: false, score: 0 })
      expect(compare('x+y', '0')).toMatchObject({ isOk: true, score: 1 })
      expect(compare('2x+3y', '0')).toMatchObject({ isOk: true, score: 1 })
      expect(compare('2x^2', '0')).toMatchObject({ isOk: true, score: 1 })
    })

    it.each([
      'x+x',
      'x-x',
      '-x+x',
      '2x+3x',
      '2x-3x',
      'xy+2xy',
      '2xy+3yx',
      'x*y*y*x',
      'x*y*x',
      'x^2*x',
      'x*x^2',
      '2*x*x',
      '2xx',
      'x*y*z*k*1*k*4',
      '(x+y)+(2x+3y)',
      '2(x+y)+3(x+y)',
    ])('termsGrouped refuses %s', (saisie) => {
      expect(all([termsGrouped()])(saisie, '0')).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it.each([
      'x+y',
      '2x+3y',
      'xy+xz',
      '2xy+3xz',
      'x^2y',
      'x^2y^2',
      '2x^2y',
      '4x^2yzk',
      '(2*x)+1',
      '2x^2+3y^2',
      'x^2+x',
      'x^3+x^2',
    ])('termsGrouped accepts %s', (saisie) => {
      expect(all([termsGrouped()])(saisie, '0')).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('isDistributed refuses products over sums', () => {
      const compare = all([isDistributed()])

      expect(compare('(1+x)y', '0')).toMatchObject({ isOk: false, score: 0 })
      expect(compare('2(x+1)', '0')).toMatchObject({ isOk: false, score: 0 })
      expect(compare('y+xy', '0')).toMatchObject({ isOk: true, score: 1 })
      expect(compare('2x+2', '0')).toMatchObject({ isOk: true, score: 1 })
    })

    it.each([
      '(1+x)y',
      'y(1+x)',
      '2(x+1)',
      '(x+1)2',
      '(x+y)(z+k)',
      '(x+y)^2',
      '(x-y)^3',
      'x(y+z)k',
      'x*(y+z)*k',
      '(2*x+1)y',
      '(x+1)(x-1)',
      '-(x+1)y',
    ])('isDistributed refuses %s', (saisie) => {
      expect(all([isDistributed()])(saisie, '0')).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it.each([
      'y+xy',
      '2x+2',
      'xy+xz',
      'xz+yz',
      'x^2+2x+1',
      '(2*x)+1',
      'x*y*z*k*1*k*4',
      '2x^2y^2',
      '-xy-y',
    ])('isDistributed accepts %s', (saisie) => {
      expect(all([isDistributed()])(saisie, '0')).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it.each([
      ['1*x', 'noTrivialFactor'],
      ['x*1', 'noTrivialFactor'],
      ['-x*1', 'noTrivialFactor'],
      ['x*y*y*x', 'termsGrouped'],
      ['x*y*z*k*1*k*4', 'multiple atoms'],
      ['(-x)y', 'noTrivialFactor'],
      ['-(xy)', 'noTrivialFactor'],
      ['2*3*x', 'noNumericComputation'],
      ['x+0', 'noTrivialFactor'],
      ['x+x', 'termsGrouped'],
      ['(1+x)y', 'isDistributed'],
      ['2(x+1)', 'isDistributed'],
      ['(x+y)^2', 'isDistributed'],
      ['-1-1+2x', 'noNumericComputation'],
    ])('isReduced refuses %s through %s', (saisie) => {
      expect(all([isReduced()])(saisie, '0')).toMatchObject({
        isOk: false,
        score: 0,
      })
    })

    it.each([
      'x',
      '-x',
      'xy',
      '4xy',
      '(2*x)+1',
      '2x^2',
      'x^2y^2',
      'x+y',
      '2x+3y',
      'xy+xz',
      'y+xy',
      '2x+2',
      'x^2+2x+1',
      '1/2',
      '\\frac{1}{2}',
      '-\\frac{3}{5}',
    ])('isReduced accepts %s', (saisie) => {
      expect(all([isReduced()])(saisie, '0')).toMatchObject({
        isOk: true,
        score: 1,
      })
    })

    it('isReduced can allow reducible numeric fractions', () => {
      const compare = all([isReduced({ allowReducibleFractions: true })])

      expect(compare('\\frac{2}{4}', '0')).toMatchObject({
        isOk: true,
        score: 1,
      })
      expect(compare('1+1', '0')).toMatchObject({
        isOk: false,
        score: 0,
      })
    })
  })
})
