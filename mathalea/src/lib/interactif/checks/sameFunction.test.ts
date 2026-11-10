import { describe, expect, it } from 'vitest'
import { sameFunction } from './primitiveChecks'

describe('sameFunction', () => {
  it.each([
    [
      '\\frac{2x}{x^2+3}-\\frac{1}{x-1}',
      '\\frac{x^2-2x-3}{(x^2+3)(x-1)}',
      [1.5, 5],
    ],
    ['\\frac{1-2\\ln(x)}{x^3}', '\\frac{x-2x\\ln x}{x^4}', [0.2, 5]],
    [
      '\\frac{e^{\\sqrt{x+3}}}{2\\sqrt{x+3}}',
      '\\frac{\\mathrm{e}^{\\sqrt{x+3}}}{2\\sqrt{x+3}}',
      [-2.9, 3],
    ],
  ] as [string, string, [number, number]][])(
    'accepter %s pour %s',
    (saisie, reponse, domaine) => {
      expect(sameFunction({ domaine }).run(saisie, reponse).passed).toBe(true)
    },
  )
  it('refuser une autre fonction, même à une constante près', () => {
    const check = sameFunction({ domaine: [0.2, 5] })
    expect(check.run('\\ln(x)+1', '\\ln(x)')).toMatchObject({
      passed: false,
      feedbackKo: "Cette fonction n'est pas égale à la fonction attendue.",
    })
    expect(check.run('\\frac{1}{x^2}', '\\frac{1}{x}').passed).toBe(false)
  })
  it('signaler une saisie non évaluable', () => {
    expect(sameFunction().run('\\frac{', 'x').passed).toBe(false)
  })
})
