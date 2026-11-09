import { describe, expect, it } from 'vitest'
import {
  arithmeticAstToLatex,
  arithmeticMismatchFeedback,
  describeArithmeticAstCorrection,
  generateArithmeticAst,
  type ArithmeticAst,
} from './expression'

function createSeededRandInt(
  seedStart: number,
): (min: number, max: number) => number {
  let seed = seedStart
  return (min: number, max: number): number => {
    seed = (seed * 1103515245 + 12345) % 2147483648
    return min + (seed % (max - min + 1))
  }
}

function hasOperation(node: ArithmeticAst, op: string): boolean {
  if (node.type === 'number') return false
  return (
    node.op === op ||
    hasOperation(node.left, op) ||
    hasOperation(node.right, op)
  )
}

function isAdditiveOperation(node: ArithmeticAst): boolean {
  return (
    node.type === 'operation' && (node.op === 'plus' || node.op === 'moins')
  )
}

function hasHighOperationWithOneAdditiveChild(node: ArithmeticAst): boolean {
  if (node.type === 'number') return false

  const isHighOperation = node.op === 'multi' || node.op === 'divise'
  const hasOneAdditiveChild =
    isAdditiveOperation(node.left) !== isAdditiveOperation(node.right)

  return (
    (isHighOperation && hasOneAdditiveChild) ||
    hasHighOperationWithOneAdditiveChild(node.left) ||
    hasHighOperationWithOneAdditiveChild(node.right)
  )
}

function rootShape(node: ArithmeticAst): string {
  if (node.type === 'number') return 'number'
  const leftAdditive = isAdditiveOperation(node.left)
  const rightAdditive = isAdditiveOperation(node.right)
  if (
    (node.op === 'multi' || node.op === 'divise') &&
    leftAdditive &&
    rightAdditive
  ) {
    return `two-additive-${node.op}`
  }
  if (node.op === 'plus' || node.op === 'moins') {
    return `outer-${node.op}`
  }
  if (
    (node.op === 'multi' || node.op === 'divise') &&
    leftAdditive !== rightAdditive
  ) {
    return `one-additive-${node.op}`
  }
  return node.op
}

function operationCount(node: ArithmeticAst): number {
  if (node.type === 'number') return 0
  return 1 + operationCount(node.left) + operationCount(node.right)
}

describe('generateArithmeticAst', () => {
  it('ne genere pas d expression parenthesee quand requireParentheses vaut false', () => {
    const randInt = createSeededRandInt(123456)

    for (let index = 0; index < 100; index++) {
      const ast = generateArithmeticAst(4, randInt, {
        operationCount: 3,
        requireParentheses: false,
        negativeAllowed: true,
        strictInteger: false,
      })
      const latex = arithmeticAstToLatex(ast, true)

      expect(latex).not.toContain('(')
      expect(latex).not.toContain(')')
    }
  })

  it('genere plusieurs formes parenthesees quand requireParentheses vaut true', () => {
    const randInt = createSeededRandInt(123456)
    const latexExpressions = new Set<string>()
    const shapes = new Set<string>()
    let hasDivision = false
    let hasMixedExpression = false

    for (let index = 0; index < 150; index++) {
      const ast = generateArithmeticAst(3, randInt, {
        operationCount: 3,
        requireParentheses: true,
        negativeAllowed: true,
        strictInteger: false,
      })
      const latex = arithmeticAstToLatex(ast, true)

      latexExpressions.add(latex)
      shapes.add(rootShape(ast))
      hasDivision ||= hasOperation(ast, 'divise')
      hasMixedExpression ||= hasHighOperationWithOneAdditiveChild(ast)

      expect(operationCount(ast)).toBe(3)
      expect(latex).toContain('(')
      expect(latex).toContain(')')
    }

    expect(latexExpressions.size).toBeGreaterThan(20)
    expect(shapes.size).toBeGreaterThanOrEqual(3)
    expect(hasDivision).toBe(true)
    expect(hasMixedExpression).toBe(true)
  })

  it('conserve cette variete quand les operations doivent tomber juste', () => {
    const randInt = createSeededRandInt(789012)
    let hasDivision = false
    let hasMixedExpression = false

    for (let index = 0; index < 150; index++) {
      const ast = generateArithmeticAst(3, randInt, {
        operationCount: 3,
        requireParentheses: true,
        negativeAllowed: false,
        strictInteger: true,
      })

      hasDivision ||= hasOperation(ast, 'divise')
      hasMixedExpression ||= hasHighOperationWithOneAdditiveChild(ast)

      expect(operationCount(ast)).toBe(3)
      expect(arithmeticAstToLatex(ast, true)).toContain('(')
    }

    expect(hasDivision).toBe(true)
    expect(hasMixedExpression).toBe(true)
  })
})

describe('correction et feedback détaillés', () => {
  const num = (value: number): ArithmeticAst => ({ type: 'number', value })
  const op = (
    o: 'plus' | 'moins' | 'multi' | 'divise',
    left: ArithmeticAst,
    right: ArithmeticAst,
  ): ArithmeticAst => ({ type: 'operation', op: o, left, right })

  it('décrit la multiplication prioritaire de 9 × 10 + 7', () => {
    const ast = op('plus', op('multi', num(9), num(10)), num(7))
    const lines = describeArithmeticAstCorrection(ast, true)
    expect(lines[0]).toContain('En premier')
    expect(lines[0]).toContain('$9 \\times 10$')
    expect(lines[0]).toContain("prioritaire sur l'addition")
    expect(lines[1]).toContain('En dernier')
    expect(lines.join(' ')).toContain('contient à gauche le bloc de la multiplication')
  })

  it('décrit le calcul entre parenthèses de 9 × (10 + 7)', () => {
    const ast = op('multi', num(9), op('plus', num(10), num(7)))
    const lines = describeArithmeticAstCorrection(ast, true)
    expect(lines[0]).toContain('$10 + 7$')
    expect(lines[0]).toContain('calcul entre parenthèses')
    expect(lines[1]).toContain('En dernier')
    expect(lines[1]).toContain('la multiplication')
  })

  it("décrit une seule opération et ne dit rien d'un nombre seul", () => {
    expect(describeArithmeticAstCorrection(num(3), true)).toEqual([])
    const lines = describeArithmeticAstCorrection(op('moins', num(8), num(3)), true)
    expect(lines[0]).toBe("Il n'y a qu'une seule opération : la soustraction.")
  })

  it('montre le calcul réellement codé par l’élève', () => {
    const expected = op('plus', op('multi', num(9), num(10)), num(7))
    const student = op('multi', num(9), op('plus', num(10), num(7)))
    const feedback = arithmeticMismatchFeedback(student, expected, true)
    expect(feedback).toContain('$9 \\times (10 + 7)$')
    expect(feedback).toContain('$9 \\times 10 + 7$')
    expect(feedback).toContain("l'addition")
  })

  it('signale des nombres différents', () => {
    const feedback = arithmeticMismatchFeedback(
      op('plus', num(1), num(2)),
      op('plus', num(1), num(3)),
      true,
    )
    expect(feedback).toContain('Vérifie les nombres utilisés.')
  })
})
