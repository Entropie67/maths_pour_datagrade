import { ComputeEngine } from '@cortex-js/compute-engine'
import type { Check, CheckOverrides } from './types'

export type Polynomial = bigint[]
export type Rational = { numerator: Polynomial; denominator: Polynomial }
export type SameRationalFunctionOptions = CheckOverrides & { variable?: string }
const ce = new ComputeEngine()
const ONE = [1n]

function trim(p: Polynomial): Polynomial {
  while (p.length > 1 && p.at(-1) === 0n) p.pop()
  if (p.length > 65 || p.some((c) => c.toString().length > 2048))
    throw new Error('Expression trop grande.')
  return p
}
const isZero = (p: Polynomial) => p.every((c) => c === 0n)
const negative = (p: Polynomial) => p.map((c) => -c)
function add(p: Polynomial, q: Polynomial): Polynomial {
  return trim(
    Array.from(
      { length: Math.max(p.length, q.length) },
      (_, i) => (p[i] ?? 0n) + (q[i] ?? 0n),
    ),
  )
}
function multiply(p: Polynomial, q: Polynomial): Polynomial {
  if (p.length + q.length - 1 > 65) throw new Error('Degré trop élevé.')
  const result: Polynomial = Array(p.length + q.length - 1).fill(0n)
  p.forEach((a, i) =>
    q.forEach((b, j) => {
      result[i + j] += a * b
    }),
  )
  return trim(result)
}
function rational(numerator: Polynomial, denominator: Polynomial): Rational {
  if (isZero(denominator)) throw new Error('Division par zéro.')
  return { numerator: trim(numerator), denominator: trim(denominator) }
}
function product(a: Rational, b: Rational): Rational {
  return rational(
    multiply(a.numerator, b.numerator),
    multiply(a.denominator, b.denominator),
  )
}
function sum(a: Rational, b: Rational): Rational {
  return rational(
    add(
      multiply(a.numerator, b.denominator),
      multiply(b.numerator, a.denominator),
    ),
    multiply(a.denominator, b.denominator),
  )
}
function quotient(a: Rational, b: Rational): Rational {
  return product(a, rational(b.denominator, b.numerator))
}

/** Décimaux finis interprétés exactement, sans passage par une tolérance flottante. */
export function literal(value: string): Rational {
  const match = value.match(/^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i)
  if (match == null || value.length > 100)
    throw new Error('Nombre non rationnel.')
  const decimalPlaces = match[3]?.length ?? 0
  const exponent = Number(match[4] ?? 0) - decimalPlaces
  if (Math.abs(exponent) > 100) throw new Error('Exposant trop grand.')
  const numerator = BigInt(
    (match[1] === '-' ? '-' : '') + match[2] + (match[3] ?? ''),
  )
  return exponent >= 0
    ? rational([numerator * 10n ** BigInt(exponent)], ONE)
    : rational([numerator], [10n ** BigInt(-exponent)])
}

/** Parcourir uniquement l'arbre syntaxique brut : aucun simplify/isEqual du moteur. */
export function parseRational(source: string, variable: string): Rational {
  if (source.trim() === '' || source.length > 2000)
    throw new Error('Saisie vide ou trop longue.')
  let remaining = 500
  const walk = (node: unknown): Rational => {
    if (--remaining < 0) throw new Error('Expression trop longue.')
    if (typeof node === 'number') return literal(String(node))
    if (typeof node === 'string') {
      if (node === variable) return rational([0n, 1n], ONE)
      return literal(node)
    }
    if (node != null && typeof node === 'object' && !Array.isArray(node)) {
      if ('num' in node) return literal(String(node.num))
      throw new Error('Symbole non reconnu.')
    }
    if (!Array.isArray(node)) throw new Error('Expression non reconnue.')
    const [operator, ...operands] = node
    if (operator === 'Delimiter' && operands.length === 1)
      return walk(operands[0])
    if (operator === 'Negate' && operands.length === 1) {
      const value = walk(operands[0])
      return rational(negative(value.numerator), value.denominator)
    }
    if (operator === 'Add' && operands.length >= 2)
      return operands.map(walk).reduce(sum)
    if (
      (operator === 'Multiply' || operator === 'InvisibleOperator') &&
      operands.length >= 2
    )
      return operands.map(walk).reduce(product)
    if (operator === 'Subtract' && operands.length === 2) {
      const right = walk(operands[1])
      return sum(
        walk(operands[0]),
        rational(negative(right.numerator), right.denominator),
      )
    }
    if (
      (operator === 'Divide' || operator === 'Rational') &&
      operands.length === 2
    )
      return quotient(walk(operands[0]), walk(operands[1]))
    if (operator === 'Power' && operands.length === 2) {
      let base = walk(operands[0])
      const exponent = walk(operands[1])
      if (
        exponent.numerator.length !== 1 ||
        exponent.denominator.length !== 1 ||
        exponent.numerator[0] % exponent.denominator[0] !== 0n
      )
        throw new Error('Exposant non entier.')
      let n = exponent.numerator[0] / exponent.denominator[0]
      if (n < -32n || n > 32n || (n === 0n && isZero(base.numerator)))
        throw new Error('Puissance non admise.')
      if (n < 0n) {
        base = rational(base.denominator, base.numerator)
        n = -n
      }
      let result = rational(ONE, ONE)
      for (let i = 0n; i < n; i++) result = product(result, base)
      return result
    }
    throw new Error('Expression non rationnelle.')
  }
  ce.pushScope()
  try {
    return walk(
      ce.parse(source.replaceAll('−', '-').replace(/\{,\}|,/g, '.'), {
        form: 'raw',
      }).json,
    )
  } finally {
    ce.popScope()
  }
}

/** Égalité dans Q(x), après simplification, par produits croisés exacts.
 * Ne compare pas les domaines des écritures avant simplification.
 */
export function sameRationalFunction(
  options: SameRationalFunctionOptions = {},
): Check {
  return {
    name: options.name ?? 'sameRationalFunction',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (input, answer) => {
      let passed = false
      let feedback =
        'Cette fonction rationnelle n’est pas égale à celle attendue.'
      try {
        const variable = options.variable ?? 'x'
        const a = parseRational(input, variable)
        const b = parseRational(answer, variable)
        passed = isZero(
          add(
            multiply(a.numerator, b.denominator),
            negative(multiply(b.numerator, a.denominator)),
          ),
        )
      } catch {
        feedback =
          'Saisir une expression rationnelle à coefficients rationnels.'
      }
      return {
        passed,
        feedbackKo: options.feedbackKo ?? feedback,
        feedbackOk: options.feedbackOk,
      }
    },
  }
}
