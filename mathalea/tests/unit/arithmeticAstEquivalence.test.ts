import { describe, expect, it } from 'vitest'
import {
  areArithmeticAstsEquivalent,
  hasAtLeastTwoOperationOccurrences,
  hasAtLeastTwoPlusOrMulti,
  type ArithmeticAst,
} from '../../src/lib/mathFonctions/expression'

const n = (value: number): ArithmeticAst => ({ type: 'number', value })

const op = (
  operator: 'plus' | 'moins' | 'multi' | 'divise',
  left: ArithmeticAst,
  right: ArithmeticAst,
): ArithmeticAst => ({
  type: 'operation',
  op: operator,
  left,
  right,
})

describe('areArithmeticAstsEquivalent', () => {
  it("accepte la commutativite de l'addition", () => {
    const left = op('plus', n(3), n(5))
    const right = op('plus', n(5), n(3))

    expect(areArithmeticAstsEquivalent(left, right)).toBe(true)
  })

  it('accepte la commutativite de la multiplication', () => {
    const left = op('multi', n(2), n(7))
    const right = op('multi', n(7), n(2))

    expect(areArithmeticAstsEquivalent(left, right)).toBe(true)
  })

  it("accepte l'associativite de l'addition", () => {
    const left = op('plus', op('plus', n(1), n(2)), n(3))
    const right = op('plus', n(1), op('plus', n(2), n(3)))

    expect(areArithmeticAstsEquivalent(left, right)).toBe(true)
  })

  it("accepte l'associativite de la multiplication", () => {
    const left = op('multi', op('multi', n(2), n(3)), n(4))
    const right = op('multi', n(2), op('multi', n(3), n(4)))

    expect(areArithmeticAstsEquivalent(left, right)).toBe(true)
  })

  it('accepte combinaison commutativite + associativite', () => {
    const left = op('plus', n(1), op('plus', n(2), n(3)))
    const right = op('plus', op('plus', n(3), n(1)), n(2))

    expect(areArithmeticAstsEquivalent(left, right)).toBe(true)
  })

  it('accepte une ecriture equivalente avec addition et soustraction melangees', () => {
    const expected = op(
      'plus',
      op('moins', op('plus', n(16), n(26)), n(25)),
      n(10),
    )
    const student = op(
      'plus',
      n(26),
      op('plus', n(16), op('moins', n(10), n(25))),
    )

    expect(areArithmeticAstsEquivalent(student, expected)).toBe(true)
  })

  it('refuse une permutation pour la soustraction', () => {
    const left = op('moins', n(9), n(4))
    const right = op('moins', n(4), n(9))

    expect(areArithmeticAstsEquivalent(left, right)).toBe(false)
  })

  it('refuse une permutation pour la division', () => {
    const left = op('divise', n(12), n(3))
    const right = op('divise', n(3), n(12))

    expect(areArithmeticAstsEquivalent(left, right)).toBe(false)
  })

  it('refuse des operateurs differents', () => {
    const left = op('plus', n(4), n(2))
    const right = op('multi', n(4), n(2))

    expect(areArithmeticAstsEquivalent(left, right)).toBe(false)
  })
})

describe('hasAtLeastTwoOperationOccurrences', () => {
  it('retourne true avec deux additions', () => {
    const ast = op('plus', n(3), op('plus', n(4), n(5)))
    expect(hasAtLeastTwoOperationOccurrences(ast, 'plus')).toBe(true)
  })

  it('retourne false avec une seule addition', () => {
    const ast = op('plus', n(3), n(4))
    expect(hasAtLeastTwoOperationOccurrences(ast, 'plus')).toBe(false)
  })

  it('retourne true avec deux multiplications', () => {
    const ast = op('multi', n(3), op('multi', n(4), n(5)))
    expect(hasAtLeastTwoOperationOccurrences(ast, 'multi')).toBe(true)
  })

  it('retourne true si au moins deux plus ou deux multi', () => {
    const plusAst = op('plus', n(1), op('plus', n(2), n(3)))
    const multiAst = op('multi', n(2), op('multi', n(3), n(4)))
    const mixedAst = op('plus', n(1), op('multi', n(2), n(3)))

    expect(hasAtLeastTwoPlusOrMulti(plusAst)).toBe(true)
    expect(hasAtLeastTwoPlusOrMulti(multiAst)).toBe(true)
    expect(hasAtLeastTwoPlusOrMulti(mixedAst)).toBe(false)
  })
})
