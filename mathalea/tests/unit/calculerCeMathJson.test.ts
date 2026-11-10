import type { MathJsonExpression } from '@cortex-js/compute-engine'
import { describe, expect, it } from 'vitest'
import {
  buildCorrDetails,
  renderMathJsonLatex,
  toMathJsonNode,
} from '../../src/lib/calculerCe'

describe('adaptateur MathJSON arithmétique', () => {
  it('copie les tuples readonly en préservant ordre et parenthèses', () => {
    const sum = Object.freeze(['Add', 3, -5] as const)
    const delimiter = Object.freeze(['Delimiter', sum] as const)
    const source = Object.freeze(['Multiply', -2, delimiter] as const)
    const node = toMathJsonNode(source)

    expect(node).toEqual(source)
    expect(node).not.toBe(source)
    expect(renderMathJsonLatex(node)).toBe('-2\\times\\left(3-5\\right)')
    expect(renderMathJsonLatex(node, { implicitMultiply: true })).toBe(
      '-2\\left(3-5\\right)',
    )
  })

  it('normalise les objets fn et sym sans conserver leurs annotations', () => {
    const source: MathJsonExpression = {
      fn: ['Power', { sym: 'x', latex: 'x' }, 2],
      comment: 'Annotation sans effet sur le calcul.',
    }
    expect(toMathJsonNode(source)).toEqual(['Power', 'x', 2])
    expect(renderMathJsonLatex(toMathJsonNode(source))).toBe('x^{2}')
  })

  it.each(['9007199254740993', '0.1234567890123456789', '1.(3)', '1e999'])(
    'conserve exactement le nombre JSON %s',
    (num) => {
      const source = Object.freeze({ num })
      const node = toMathJsonNode(source)
      expect(node).toEqual({ num })
      expect(node).not.toBe(source)
    },
  )

  it('conserve les étapes de calcul et les parenthèses des puissances négatives', () => {
    const json: MathJsonExpression = [
      'Add',
      ['Multiply', 2, 3],
      ['Power', -2, 2],
    ]
    expect(buildCorrDetails({ json })).toEqual([
      '6+\\left(-2\\right)^{2}',
      '6+4',
      '10',
    ])
  })

  it('signale le chemin de la forme non prise en charge', () => {
    expect(() =>
      toMathJsonNode(['Add', 1, { dict: { valeur: true } }]),
    ).toThrow('MathJSON unsupported à $[2]')
    expect(() => toMathJsonNode({ str: 'texte' })).toThrow('unsupported')
    expect(() => toMathJsonNode({ num: 'NaN' })).toThrow('unsupported')
    expect(() => toMathJsonNode({ num: '12oops' })).toThrow('unsupported')
    expect(() => toMathJsonNode({ sym: 'x', num: '1' })).toThrow('ambiguë')
    expect(() => toMathJsonNode(Infinity)).toThrow('unsupported')
  })

  it('délègue le rendu des nombres JSON au ComputeEngine', () => {
    expect(renderMathJsonLatex(toMathJsonNode({ num: '12' }))).toBe('12')
  })
})
