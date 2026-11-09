import type { Check, CheckOverrides } from './types'
import { evaluateArithmeticExpression } from './evaluateArithmeticExpression'
import {
  insertImplicitProducts,
  normalizeLatexArithmetic,
} from './latexArithmetic'
import {
  expectedCoordinates,
  extractEquations,
  missingCoordinates,
  variablesInExpression,
  type LineDimension,
} from './parametricSystem'

type Vector = number[]

type ParametricLine = {
  point: Vector
  direction: Vector
}

type SameParametricLineOptions = CheckOverrides & {
  dimension?: LineDimension
}

const TOLERANCE = 1e-8

function nearlyZero(value: number): boolean {
  return Math.abs(value) < TOLERANCE
}

function areCollinear(u: Vector, v: Vector): boolean {
  if (u.length !== v.length) return false

  const referenceIndex = v.findIndex((coordinate) => !nearlyZero(coordinate))
  if (referenceIndex === -1) return u.every(nearlyZero)

  const ratio = u[referenceIndex] / v[referenceIndex]
  return u.every((coordinate, index) =>
    nearlyZero(coordinate - ratio * v[index]),
  )
}

function normalizeExpression(
  expression: string,
  variable: string,
  value: number,
): string {
  const normalized = normalizeLatexArithmetic(expression)
    .replace(/[{}]/g, '')
    .replace(new RegExp(variable, 'g'), `(${value})`)

  return insertImplicitProducts(normalized)
}

function evaluateExpression(
  expression: string,
  variable: string,
  value: number,
): number {
  const normalized = normalizeExpression(expression, variable, value)
  if (!/^[\d.()+\-*/]+$/.test(normalized)) return Number.NaN

  return evaluateArithmeticExpression(normalized) ?? Number.NaN
}

function parseLineFromSystem(
  input: string,
  dimension: LineDimension,
): ParametricLine | { error: string } {
  const equations = extractEquations(input)
  const coordinates = expectedCoordinates(dimension)
  const missing = missingCoordinates(equations, coordinates)

  if (missing.length > 0) {
    return {
      error:
        dimension === 2
          ? 'On attend un système avec deux équations : $x=...$ et $y=...$.'
          : 'On attend un système avec trois équations : $x=...$, $y=...$ et $z=...$.',
    }
  }

  if (dimension === 2 && equations.z != null) {
    return {
      error:
        'On attend une représentation dans le plan, avec seulement $x=...$ et $y=...$.',
    }
  }

  const variables = new Set<string>()
  for (const coordinate of coordinates) {
    const expression = equations[coordinate]
    for (const variable of variablesInExpression(expression)) {
      variables.add(variable)
    }
  }

  if (variables.size === 0) {
    return {
      error:
        'On attend une représentation paramétrique contenant une variable, par exemple $t$.',
    }
  }

  if (variables.size > 1) {
    return {
      error:
        'Une seule variable de paramétrage doit être utilisée. Par exemple, utilisez seulement $t$.',
    }
  }

  const variable = Array.from(variables)[0]
  const at = (value: number): Vector =>
    coordinates.map((coordinate) =>
      evaluateExpression(equations[coordinate], variable, value),
    )

  const at0 = at(0)
  const at1 = at(1)
  const at2 = at(2)

  if ([...at0, ...at1, ...at2].some((value) => !Number.isFinite(value))) {
    return {
      error:
        "La représentation n'a pas pu être lue. On attend une forme affine comme $x=1-3t$, $y=1$ ou $x=1-3t$, $y=1$, $z=-1+4t$.",
    }
  }

  const direction = at1.map((coordinate, index) => coordinate - at0[index])

  if (direction.every(nearlyZero)) {
    return {
      error: "Le vecteur directeur obtenu est nul : ce n'est pas une droite.",
    }
  }

  if (
    at2.some(
      (coordinate, index) =>
        !nearlyZero(coordinate - at0[index] - 2 * direction[index]),
    )
  ) {
    return {
      error:
        'Les expressions doivent être affines en la variable de paramétrage.',
    }
  }

  return { point: at0, direction }
}

function parseExpectedLine(
  answer: string,
  dimension: LineDimension,
): ParametricLine | { error: string } {
  try {
    const parsed = JSON.parse(answer) as ParametricLine
    if (
      Array.isArray(parsed.point) &&
      parsed.point.length === dimension &&
      Array.isArray(parsed.direction) &&
      parsed.direction.length === parsed.point.length &&
      parsed.point.every((coordinate) => typeof coordinate === 'number') &&
      parsed.direction.every((coordinate) => typeof coordinate === 'number')
    ) {
      return parsed
    }
  } catch {
    // La réponse attendue peut aussi être écrite comme un système paramétrique.
  }

  return parseLineFromSystem(answer, dimension)
}

function sameLine(input: ParametricLine, expected: ParametricLine): boolean {
  if (input.point.length !== expected.point.length) return false
  if (!areCollinear(input.direction, expected.direction)) return false

  const pointDifference = input.point.map(
    (coordinate, index) => coordinate - expected.point[index],
  )

  return areCollinear(pointDifference, expected.direction)
}

export function sameParametricLine(
  options: SameParametricLineOptions = {},
): Check {
  const dimension = options.dimension ?? 3

  return {
    name: options.name ?? 'sameParametricLine',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie, answer) => {
      const expected = parseExpectedLine(answer, dimension)
      if ('error' in expected) {
        return {
          passed: false,
          feedbackKo: 'Erreur dans la réponse attendue.',
          feedbackOk: options.feedbackOk,
        }
      }

      const input = parseLineFromSystem(saisie, dimension)
      if ('error' in input) {
        return {
          passed: false,
          feedbackKo: options.feedbackKo ?? input.error,
          feedbackOk: options.feedbackOk,
        }
      }

      const passed = sameLine(input, expected)
      return {
        passed,
        feedbackKo:
          options.feedbackKo ??
          'La représentation paramétrique ne décrit pas la droite attendue.',
        feedbackOk: options.feedbackOk,
      }
    },
  }
}
