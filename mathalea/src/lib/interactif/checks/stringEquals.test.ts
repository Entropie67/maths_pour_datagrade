import { describe, expect, it } from 'vitest'
import { stringEquals } from './stringEquals'

describe('stringEquals : texte LaTeX', () => {
  const check = stringEquals({
    ignoreLatexText: true,
    trim: true,
    ignoreCase: true,
  })
  it.each([
    'dizaine de mille',
    '\\text{dizaine de mille}',
    '\\text{dizaine}\\text{ de }\\text{mille}',
    '\\mathrm{Dizaine}  de mille',
  ])('accepte %s', (input) => {
    expect(check.run(input, 'dizaine de mille').passed).toBe(true)
  })
  it('refuse un autre mot et les commandes mathématiques', () => {
    expect(check.run('centaine', 'dizaine').passed).toBe(false)
    expect(check.run('\\frac{1}{2}', '1/2').passed).toBe(false)
  })
  it('conserve la comparaison stricte par défaut', () => {
    expect(stringEquals().run('\\text{dizaine}', 'dizaine').passed).toBe(false)
  })
})

describe('stringEquals : délimiteurs LaTeX', () => {
  const check = stringEquals({
    ignoreLatexText: true,
    ignoreLatexDelimiters: true,
    trim: true,
    ignoreCase: true,
  })
  it.each(['A', '$A$', '{A}', '\\text{a}', '$\\text{A}$'])(
    'accepte %s pour A',
    (input) => {
      expect(check.run(input, 'A').passed).toBe(true)
    },
  )
  it('refuse une autre lettre', () => {
    expect(check.run('$B$', 'A').passed).toBe(false)
  })
  it('sans ignoreLatexDelimiters, les délimiteurs restent', () => {
    expect(stringEquals({ trim: true }).run('$A$', 'A').passed).toBe(false)
  })
})
