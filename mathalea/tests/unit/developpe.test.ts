import { describe, expect, it } from 'vitest'
import { developpe } from '../../src/lib/mathFonctions/outilsMaths'

function norm(latex: string): string {
  return latex.replace(/\s+/g, '')
}

describe('developpe', () => {
  it('conserve les parenthèses autour des monômes négatifs élevés au carré', () => {
    expect(
      norm(
        developpe('\\left(-3x+4\\right)^2', {
          isColored: false,
          level: 2,
        }),
      ),
    ).toBe(
      norm('\\left( -3x\\right) ^2+2\\times \\left( -3x\\right) \\times 4+4^2'),
    )
  })

  it('conserve les parenthèses autour des facteurs issus de bases composées', () => {
    expect(
      norm(
        developpe('\\left(-2-2x\\right)^2', {
          isColored: false,
          level: 2,
        }),
      ),
    ).toBe(
      norm(
        '\\left( -2x\\right) ^2+2\\times \\left( -2x\\right) \\times \\left( -2\\right) +\\left( -2\\right) ^2',
      ),
    )

    expect(
      norm(
        developpe('\\left(x-1\\right)^2', {
          isColored: false,
          level: 2,
        }),
      ),
    ).toBe(
      norm('x^2+2\\times x\\times \\left( -1\\right) +\\left( -1\\right) ^2'),
    )
  })

  it('conserve les parenthèses autour des monômes fractionnaires élevés au carré', () => {
    expect(
      norm(
        developpe('\\left(-\\dfrac{3}{5}x+4\\right)^2', {
          isColored: false,
          level: 2,
        }),
      ),
    ).toBe(
      norm(
        '\\left( \\dfrac{-3x}{5}\\right) ^2+2\\times \\left( \\dfrac{-3x}{5}\\right) \\times 4+4^2',
      ),
    )

    expect(
      norm(
        developpe('\\left(\\dfrac{2}{3}x+1\\right)^2', {
          isColored: false,
          level: 2,
        }),
      ),
    ).toBe(
      norm(
        '\\left( \\dfrac{2x}{3}\\right) ^2+2\\times \\left( \\dfrac{2x}{3}\\right) \\times 1+1^2',
      ),
    )
  })
})
