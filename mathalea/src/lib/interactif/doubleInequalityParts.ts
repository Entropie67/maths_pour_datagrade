import { fonctionComparaison } from './comparisonFunctions'

type DoubleInequalityPart = {
  bound: string
  operator: '<' | '<=' | '>' | '>='
}

function normalizeInequalityOperator(operator: string) {
  if (['\\leqslant', '\\leq', '\\le', '≤'].includes(operator)) return '<='
  if (['\\geqslant', '\\geq', '\\ge', '≥'].includes(operator)) return '>='
  if (operator === '<' || operator === '>') return operator
  return null
}

function reverseInequalityOperator(operator: DoubleInequalityPart['operator']) {
  if (operator === '<') return '>'
  if (operator === '>') return '<'
  if (operator === '<=') return '>='
  return '<='
}

function parseLeftInequalityPart(value: string): DoubleInequalityPart | null {
  const match =
    /^\s*(.*?)\s*(\\leqslant|\\geqslant|\\leq|\\geq|\\le|\\ge|≤|≥|<|>)\s*$/.exec(
      value,
    )
  if (match == null) return null
  const operator = normalizeInequalityOperator(match[2])
  if (operator == null || match[1].trim() === '') return null
  return { bound: match[1].trim(), operator }
}

function parseRightInequalityPart(value: string): DoubleInequalityPart | null {
  const match =
    /^\s*(\\leqslant|\\geqslant|\\leq|\\geq|\\le|\\ge|≤|≥|<|>)\s*(.*?)\s*$/.exec(
      value,
    )
  if (match == null) return null
  const operator = normalizeInequalityOperator(match[1])
  if (operator == null || match[2].trim() === '') return null
  return { bound: match[2].trim(), operator }
}

function sameBound(input: string, expected: string): boolean {
  return fonctionComparaison(input, expected).isOk
}

function sameInequalityPart(
  input: DoubleInequalityPart,
  expected: DoubleInequalityPart,
): boolean {
  return (
    input.operator === expected.operator &&
    sameBound(input.bound, expected.bound)
  )
}

/**
 * Compare séparément les deux champs d'une inégalité double, dans le sens
 * attendu (`a < x < b`) ou dans le sens inverse (`b > x > a`).
 * Le sens retenu est celui dans lequel au moins un des deux champs est juste.
 */
export function compareDoubleInequalityParts({
  inputLeft,
  inputRight,
  expectedLeft,
  expectedRight,
}: {
  inputLeft: string
  inputRight: string
  expectedLeft: string
  expectedRight: string
}): { left: boolean; right: boolean } {
  const inputLeftPart = parseLeftInequalityPart(inputLeft)
  const inputRightPart = parseRightInequalityPart(inputRight)
  const expectedLeftPart = parseLeftInequalityPart(expectedLeft)
  const expectedRightPart = parseRightInequalityPart(expectedRight)
  if (expectedLeftPart == null || expectedRightPart == null) {
    return { left: false, right: false }
  }
  const sameOrder = {
    left:
      inputLeftPart != null &&
      sameInequalityPart(inputLeftPart, expectedLeftPart),
    right:
      inputRightPart != null &&
      sameInequalityPart(inputRightPart, expectedRightPart),
  }
  if (sameOrder.left || sameOrder.right) return sameOrder
  return {
    left:
      inputLeftPart != null &&
      inputLeftPart.operator ===
        reverseInequalityOperator(expectedRightPart.operator) &&
      sameBound(inputLeftPart.bound, expectedRightPart.bound),
    right:
      inputRightPart != null &&
      inputRightPart.operator ===
        reverseInequalityOperator(expectedLeftPart.operator) &&
      sameBound(inputRightPart.bound, expectedLeftPart.bound),
  }
}

export function areEquivalentDoubleInequalityParts(args: {
  inputLeft: string
  inputRight: string
  expectedLeft: string
  expectedRight: string
}): boolean {
  const { left, right } = compareDoubleInequalityParts(args)
  return left && right
}
