import { describe, expect, it } from 'vitest'
import { suppressionParentheses } from '../../src/lib/mathFonctions/outilsMaths'

function norm(latex: string): string {
  return latex.replace(/\s+/g, '')
}

describe('suppressionParentheses', () => {
  it('conserve les parenthèses autour des bases négatives, fractionnaires ou composées dans une puissance', () => {
    const options = { isColored: false }

    expect(norm(suppressionParentheses('(-1)^2', options))).toBe('(-1)^2')
    expect(norm(suppressionParentheses('(-2)^3', options))).toBe('(-2)^3')
    expect(norm(suppressionParentheses('(1/2)^4', options))).toBe(
      '(\\frac{1}{2})^4',
    )
    expect(norm(suppressionParentheses('(-1/2)^4', options))).toBe(
      '(\\frac{-1}{2})^4',
    )
    expect(norm(suppressionParentheses('(\\dfrac{1}{2})^4', options))).toBe(
      '(\\frac{1}{2})^4',
    )
    expect(norm(suppressionParentheses('(x-1)^2', options))).toBe('(x-1)^2')
    expect(norm(suppressionParentheses('(-2-2x)^2', options))).toBe(
      '((-2)-2x)^2',
    )
  })

  it('conserve ces parenthèses quand la puissance apparaît dans une somme', () => {
    expect(
      norm(
        suppressionParentheses('x+(-1)^2+(-2)^3+(1/2)^4+(x-1)^2+(-2-2x)^2', {
          isColored: false,
        }),
      ),
    ).toBe('x+(-1)^2+(-2)^3+(\\frac{1}{2})^4+(x-1)^2+((-2)-2x)^2')
  })
})
