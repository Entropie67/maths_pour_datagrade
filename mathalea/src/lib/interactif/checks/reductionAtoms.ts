import {
  ComputeEngine,
  isFunction,
  isNumber,
  isSymbol,
  type Expression,
} from '@cortex-js/compute-engine'
import { generateCleaner } from '../cleaners'
import type { Check, CheckOverrides } from './types'

type NumericComputationOptions = CheckOverrides & {
  allowReducibleFractions?: boolean
}

const ce = new ComputeEngine()
const clean = generateCleaner(['virgules', 'parentheses'])

function normalizeExpression(value: string): string {
  return clean(
    value
      .replaceAll('−', '-')
      .replaceAll('–', '-')
      .replaceAll('—', '-')
      .replace(/\s+/g, ''),
  )
}

function parseRaw(value: string): Expression {
  return ce.parse(normalizeExpression(value), { form: 'raw' })
}

function createReductionCheck(
  name: string,
  defaultFeedbackKo: string,
  predicate: (expr: Expression) => boolean,
  options: CheckOverrides = {},
): Check {
  return {
    name: options.name ?? name,
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie) => ({
      passed: predicate(parseRaw(saisie)),
      feedbackKo: options.feedbackKo ?? defaultFeedbackKo,
      feedbackOk: options.feedbackOk,
    }),
  }
}

function unwrapDelimiter(expr: Expression): Expression {
  if (isFunction(expr, 'Delimiter')) return unwrapDelimiter(expr.ops[0])
  return expr
}

// Le signe du premier facteur, sans parenthèses, est celui du produit
// (« -stz », « -\frac{9}{4}x ») ; ailleurs, (-x)y ou x(-y) gardent un signe à sortir.
function hasSignedFactor(factor: Expression, index: number): boolean {
  const delimited = isFunction(factor, 'Delimiter')
  const current = unwrapDelimiter(factor)
  if (!isFunction(current, 'Negate')) return false
  if (index === 0 && !delimited) return false
  return !isNumber(unwrapDelimiter(current.ops[0]))
}

function hasTrivialFactor(expr: Expression): boolean {
  const current = unwrapDelimiter(expr)
  if (!isFunction(current)) return false

  if (current.operator === 'Negate') {
    const operand = unwrapDelimiter(current.ops[0])
    if (
      isFunction(operand, 'Multiply') ||
      isFunction(operand, 'InvisibleOperator') ||
      isFunction(operand, 'Negate')
    ) {
      return true
    }
  }

  if (current.operator === 'Add' || current.operator === 'Subtract') {
    if (current.ops.some((op) => unwrapDelimiter(op).is(0))) return true
  }

  if (
    current.operator === 'Multiply' ||
    current.operator === 'InvisibleOperator'
  ) {
    if (current.ops.some((op) => unwrapDelimiter(op).is(1))) return true
    if (current.ops.some((op) => unwrapDelimiter(op).is(-1))) return true
    if (current.ops.some((op, k) => hasSignedFactor(op, k))) return true
  }

  return current.ops.some(hasTrivialFactor)
}

function isNumericLiteral(expr: Expression): boolean {
  const current = unwrapDelimiter(expr)
  if (isFunction(current, 'Negate')) return isNumericLiteral(current.ops[0])
  return isNumber(current)
}

function isPerfectSquare(value: number): boolean {
  if (!Number.isInteger(value) || value < 0) return false
  return Number.isInteger(Math.sqrt(value))
}

function integerValue(expr: Expression): number | undefined {
  const current = unwrapDelimiter(expr)
  if (isFunction(current, 'Negate')) {
    const value = integerValue(current.ops[0])
    return value === undefined ? undefined : -value
  }
  if (
    isNumber(current) &&
    typeof current.numericValue === 'number' &&
    Number.isInteger(current.numericValue)
  ) {
    return current.numericValue
  }
  return undefined
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    const r = x % y
    x = y
    y = r
  }
  return x
}

function hasNumericDivisionComputation(
  expr: Expression,
  allowReducibleFractions = false,
): boolean {
  const current = unwrapDelimiter(expr)
  if (!isFunction(current, 'Divide')) return false

  const numerator = integerValue(current.ops[0])
  const denominator = integerValue(current.ops[1])
  if (numerator === undefined || denominator === undefined) return false
  if (denominator === 0) return false

  if (Math.abs(denominator) === 1) return true
  if (allowReducibleFractions) return false
  return gcd(numerator, denominator) !== 1
}

function hasNumericComputation(
  expr: Expression,
  allowReducibleFractions = false,
): boolean {
  const current = unwrapDelimiter(expr)
  if (!isFunction(current)) return false

  if (current.operator === 'Sqrt') {
    const radicand = unwrapDelimiter(current.ops[0])
    if (
      isNumber(radicand) &&
      typeof radicand.numericValue === 'number' &&
      isPerfectSquare(radicand.numericValue)
    )
      return true
    // Un calcul sous la racine (\sqrt{16\times3}) reste à effectuer
    return hasNumericComputation(radicand, allowReducibleFractions)
  }

  if (current.operator === 'Power') {
    return current.ops.every(isNumericLiteral)
  }

  if (current.operator === 'Divide') {
    if (hasNumericDivisionComputation(current, allowReducibleFractions))
      return true
    // Un calcul au numérateur ou au dénominateur (\frac{4\times3}{6}) reste à effectuer
    return current.ops.some((op) =>
      hasNumericComputation(op, allowReducibleFractions),
    )
  }

  if (current.operator === 'Add' || current.operator === 'Subtract') {
    if (current.ops.every(isNumericLiteral)) return true
    if (current.ops.filter(isNumericLiteral).length > 1) return true
  }

  if (
    current.operator === 'Multiply' ||
    current.operator === 'InvisibleOperator'
  ) {
    if (current.ops.every(isNumericLiteral)) return true
    if (current.ops.filter(isNumericLiteral).length > 1) return true
  }

  return current.ops.some((op) =>
    hasNumericComputation(op, allowReducibleFractions),
  )
}

function additiveTerms(expr: Expression): Expression[] {
  const current = unwrapDelimiter(expr)
  if (isFunction(current, 'Add')) return current.ops.flatMap(additiveTerms)
  if (isFunction(current, 'Subtract')) {
    return current.ops.flatMap(additiveTerms)
  }
  return [current]
}

function termKey(expr: Expression): string {
  const current = unwrapDelimiter(expr)
  if (isSymbol(current)) return JSON.stringify(current.json)
  if (isNumber(current)) return ''

  if (
    isFunction(current, 'Negate') ||
    (isFunction(current, 'Delimiter') && current.ops.length === 1)
  ) {
    return termKey(current.ops[0])
  }

  if (
    isFunction(current, 'Multiply') ||
    isFunction(current, 'InvisibleOperator')
  ) {
    const factors = current.ops
      .map(unwrapDelimiter)
      .filter((op) => !isNumber(op))
      .map((op) => JSON.stringify(op.json))
      .sort()
    return factors.join('*')
  }

  return JSON.stringify(current.json)
}

function factorKey(expr: Expression): string {
  const current = unwrapDelimiter(expr)
  if (isNumber(current)) return ''
  if (isFunction(current, 'Power') && current.ops.length === 2) {
    return JSON.stringify(unwrapDelimiter(current.ops[0]).json)
  }
  return JSON.stringify(current.json)
}

function hasGroupedFactors(expr: Expression): boolean {
  const current = unwrapDelimiter(expr)
  if (!isFunction(current)) return true

  if (
    current.operator === 'Multiply' ||
    current.operator === 'InvisibleOperator'
  ) {
    const seen = new Set<string>()
    for (const factor of current.ops) {
      const key = factorKey(factor)
      if (key === '') continue
      if (seen.has(key)) return false
      seen.add(key)
    }
  }

  return current.ops.every(hasGroupedFactors)
}

function hasGroupedTerms(expr: Expression): boolean {
  const current = unwrapDelimiter(expr)
  const terms = additiveTerms(current)
  if (terms.length > 1) {
    const seen = new Set<string>()
    for (const term of terms) {
      const key = termKey(term)
      if (key === '') continue
      if (seen.has(key)) return false
      seen.add(key)
    }
  }

  if (!isFunction(current)) return true
  return hasGroupedFactors(current) && current.ops.every(hasGroupedTerms)
}

function isAdditive(expr: Expression): boolean {
  const current = unwrapDelimiter(expr)
  if (isFunction(current, 'Negate')) return isAdditive(current.ops[0])
  return isFunction(current, 'Add') || isFunction(current, 'Subtract')
}

function isDistributedExpression(expr: Expression): boolean {
  const current = unwrapDelimiter(expr)
  if (!isFunction(current)) return true

  if (isFunction(current, 'Power')) {
    const exponent = unwrapDelimiter(current.ops[1])
    if (
      isAdditive(current.ops[0]) &&
      isNumber(exponent) &&
      typeof exponent.numericValue === 'number' &&
      exponent.numericValue >= 2
    ) {
      return false
    }
  }

  if (
    current.operator === 'Multiply' ||
    current.operator === 'InvisibleOperator'
  ) {
    if (current.ops.some(isAdditive)) return false
  }

  return current.ops.every(isDistributedExpression)
}

export function noTrivialFactor(options: CheckOverrides = {}): Check {
  return createReductionCheck(
    'noTrivialFactor',
    "Cette expression n'est pas assez réduite : elle contient un facteur trivial ou un terme nul.",
    (expr) => !hasTrivialFactor(expr),
    options,
  )
}

export function noNumericComputation(
  options: NumericComputationOptions = {},
): Check {
  return createReductionCheck(
    'noNumericComputation',
    "Cette expression n'est pas assez réduite : un calcul numérique reste à effectuer.",
    (expr) => !hasNumericComputation(expr, options.allowReducibleFractions),
    options,
  )
}

export function termsGrouped(options: CheckOverrides = {}): Check {
  return createReductionCheck(
    'termsGrouped',
    "Cette expression n'est pas assez réduite : les termes semblables doivent être regroupés.",
    hasGroupedTerms,
    options,
  )
}

export function isDistributed(options: CheckOverrides = {}): Check {
  return createReductionCheck(
    'isDistributed',
    "Cette expression n'est pas assez réduite : les produits doivent être développés.",
    isDistributedExpression,
    options,
  )
}
