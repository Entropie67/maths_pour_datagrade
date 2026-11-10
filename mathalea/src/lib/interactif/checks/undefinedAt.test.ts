import { describe, expect, it } from 'vitest'
import { all } from './combinators'
import { sameRationalFunction } from './sameRationalFunction'
import { undefinedAt } from './undefinedAt'

describe('undefinedAt', () => {
  const check = undefinedAt({ values: [2] })
  it.each([
    '\\frac{(x+1)(x-2)}{(x-1)(x-2)}',
    '\\frac{x^2-x-2}{x^2-3x+2}',
    '1+\\frac{2}{x-1}\\cdot\\frac{x-2}{x-2}',
    '\\frac{1}{(x-2)^2}',
  ])('accepter %s', (saisie) => {
    expect(check.run(saisie, '').passed).toBe(true)
  })
  it.each(['\\frac{x+1}{x-1}', '1+\\frac{2}{x-1}', 'x+3'])(
    'refuser %s',
    (saisie) => {
      const resultat = check.run(saisie, '')
      expect(resultat.passed).toBe(false)
      expect(resultat.feedbackKo).toContain('$x=2$')
    },
  )
  it('accepter une valeur rationnelle', () => {
    expect(
      undefinedAt({ values: [0.5] }).run('\\frac{1}{2x-1}', '').passed,
    ).toBe(true)
    expect(
      undefinedAt({ values: [0.5] }).run('\\frac{1}{x-1}', '').passed,
    ).toBe(false)
  })
  it('refuser une saisie non rationnelle', () => {
    expect(check.run('\\sin(x)', '').passed).toBe(false)
  })
  it('compléter sameRationalFunction pour un trou', () => {
    const compare = all([sameRationalFunction(), undefinedAt({ values: [2] })])
    const attendu = '\\frac{(x+1)(x-2)}{(x-1)(x-2)}'
    expect(compare(attendu, attendu).isOk).toBe(true)
    expect(compare('\\frac{x+1}{x-1}', attendu).isOk).toBe(false)
  })
})
