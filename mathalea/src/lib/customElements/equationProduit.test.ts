import { describe, expect, it } from 'vitest'
import { equationsProduitNul } from './equationProduit'

describe('equationsProduitNul', () => {
  it.each([
    ['(x+2)(x+3)=0', ['x+2=0', 'x+3=0']],
    ['(2x+1)(x-3)=0', ['2x+1=0', 'x-3=0']],
    ['0=(2x+1)(x-3)', ['2x+1=0', 'x-3=0']],
    ['\\left(2x+1\\right)\\left(x-3\\right)=0', ['2x+1=0', 'x-3=0']],
    ['(2x+1)\\times(x-3)=0', ['2x+1=0', 'x-3=0']],
    ['(2x+1)\\cdot(x-3)=0', ['2x+1=0', 'x-3=0']],
    ['3x(2x+1)=0', ['3x=0', '2x+1=0']],
    ['x(x-4)=0', ['x=0', 'x-4=0']],
    ['2(x+1)(x-3)=0', ['x+1=0', 'x-3=0']],
    ['-(x+1)(x-3)=0', ['x+1=0', 'x-3=0']],
    ['(x+3)(x+3)=0', ['x+3=0', 'x+3=0']],
    ['(\\dfrac{1}{2}x+1)(x-3)=0', ['\\dfrac{1}{2}x+1=0', 'x-3=0']],
    ['(-x+1)(x-3)=0', ['-x+1=0', 'x-3=0']],
    ['\\lparen x+2\\rparen\\lparen x+6\\rparen=0', ['x+2=0', 'x+6=0']],
  ])('reconnaît %s', (equation, attendu) => {
    expect(equationsProduitNul(equation)).toEqual(attendu)
  })

  it.each([
    'x^2+5x+6=0',
    '(x+2)(x+3)=1',
    '(x+2)(x+3)=x',
    '(x+2)(x+3)+1=0',
    '(x+2)(x+3)-(x+2)(x+1)=0',
    '(x+3)^2=0',
    '(x+2)(x+3)(x+4)=0',
    '(x^2+1)(x+3)=0',
    '(x+2)(y+3)=0',
    '2(x+3)=0',
    '(2)(x+3)=0',
    '0(x+3)(x+1)=0',
    '(x+2)(x+3)',
    'x=0',
    '',
  ])('refuse %s', (equation) => {
    expect(equationsProduitNul(equation)).toBeNull()
  })

  it("accepte une autre lettre pour l'inconnue", () => {
    expect(equationsProduitNul('(t+2)(2t-1)=0', 't')).toEqual([
      't+2=0',
      '2t-1=0',
    ])
    expect(equationsProduitNul('(t+2)(2t-1)=0', 'x')).toBeNull()
  })
})
