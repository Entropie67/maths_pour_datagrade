import { describe, expect, it } from 'vitest'
import { all } from './combinators'
import { sameRationalFunction } from './sameRationalFunction'

const check = sameRationalFunction()
describe('sameRationalFunction', () => {
  it.each([
    ['2+\\frac{3}{x-1}', '\\frac{2x+1}{x-1}'],
    ['\\frac{4x+2}{2x-2}', '\\frac{2x+1}{x-1}'],
    ['\\frac{x^2-1}{x-1}', 'x+1'],
    ['\\frac{2x^3+x^2-4x+3}{x^2-x-2}', '2x+3+\\frac{3x+9}{(x-2)(x+1)}'],
    ['\\frac{1}{2}+\\frac{x+3}{4x(x-1)}', '\\frac{2x^2-x+3}{4x^2-4x}'],
    ['\\frac{1}{x}+\\frac{1}{x+1}', '\\frac{2x+1}{x(x+1)}'],
    ['\\frac{1}{\\frac{x+1}{x}}', '\\frac{x}{x+1}'],
    ['x^{-2}', '\\frac{1}{x^2}'],
    ['(x-1)^2', 'x^2-2x+1'],
    ['0.5x', '\\frac{x}{2}'],
    ['0{,}25x', '\\frac{x}{4}'],
    ['\\frac12 x', '\\frac{x}{2}'],
    ['\\left(x+1\\right)\\left(x-1\\right)', 'x^2-1'],
    ['0', 'x-x'],
    ['0/(x-1)', '0'],
    ['-(-x)', 'x'],
    ['x^0', '1'],
  ])('accepter %s comme %s', (input, answer) => {
    expect(check.run(input, answer).passed).toBe(true)
  })
  it.each([
    ['2+\\frac{2}{x-1}', '\\frac{2x+1}{x-1}'],
    ['\\frac{1}{x+1}', '\\frac{1}{x-1}'],
    ['0.3333333333333333x', '\\frac{x}{3}'],
    ['x+(x-1)(x-2)(x-3)', 'x'],
    ['\\frac{1}{x-x}', '1'],
    ['0/0', '0'],
    ['(1/0)^0', '1'],
    ['0^0', '1'],
    ['y', 'x'],
    ['x+y-y', 'x'],
    ['\\sin(x)', 'x'],
    ['\\sqrt{x}', 'x'],
    ['x^{1/2}', 'x'],
    ['x^x', 'x'],
    ['x=1', '1'],
    ['\\frac{x}{', 'x'],
    ['', '0'],
    ['x', '1/0'],
    ['x^{100000000}', 'x'],
    ['(x+1)^32(x+1)^32(x+1)', 'x'],
  ])('refuser %s comme %s', (input, answer) => {
    expect(check.run(input, answer).passed).toBe(false)
  })
  it('respecter la variable et les retours personnalisés', () => {
    const custom = sameRationalFunction({
      variable: 't',
      name: 'rationnelle',
      feedbackKo: 'Réessayer.',
      feedbackOk: 'Correct.',
      weight: 2,
    })
    expect(custom.run('1+1/t', '(t+1)/t')).toEqual({
      passed: true,
      feedbackKo: 'Réessayer.',
      feedbackOk: 'Correct.',
    })
    expect(custom.run('x', 't').passed).toBe(false)
    expect(custom.name).toBe('rationnelle')
    expect(custom.weight).toBe(2)
  })
  it('composer le contrôle et garder un résultat déterministe', () => {
    const compare = all([sameRationalFunction()])
    expect(compare('2+3/(x-1)', '(2x+1)/(x-1)').isOk).toBe(true)
    expect(compare('2+3/(x-1)', '(2x+2)/(x-1)').isOk).toBe(false)
    for (let i = 0; i < 30; i++)
      expect(
        check.run(
          '\\frac{1}{2}+\\frac{x+3}{4x(x-1)}',
          '\\frac{2x^2-x+3}{4x^2-4x}',
        ).passed,
      ).toBe(true)
  })
})
