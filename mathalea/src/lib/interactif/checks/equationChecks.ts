import { compile, ComputeEngine } from '@cortex-js/compute-engine'
import type { Check, CheckOverrides } from './types'
import {
  complexDivide,
  complexEvaluationPoints,
  complexModulus,
  complexSubtract,
  complexVariables,
  evaluateComplexExpression,
  toleranceComplexe,
  type NombreComplexe,
  type PointComplexe,
} from './complexArithmetic'
import {
  insertImplicitProducts,
  normalizeLatexArithmetic,
} from './latexArithmetic'

type Equation = {
  left: string
  right: string
}

type EvaluationPoint = Record<string, number>

const TOLERANCE = 1e-8
const VARIABLE_NAMES = 'abcdefghijklmnopqrstuvwxyz'.split('')
const computeEngine = new ComputeEngine()

function splitEquation(value: string): Equation | undefined {
  const parts = value.split('=')
  if (parts.length !== 2) return undefined
  return {
    left: normalizeExpression(parts[0]),
    right: normalizeExpression(parts[1]),
  }
}

function normalizeExpression(value: string): string {
  return insertImplicitProducts(normalizeLatexArithmetic(value))
}

function variablesInExpression(expression: string): string[] {
  const withoutCommands = expression.replace(/\\[a-z]+/gi, '')
  const variables = new Set<string>()
  for (const variable of withoutCommands.match(/[a-z]/gi) ?? []) {
    variables.add(variable)
  }
  return [...variables].sort()
}

function variablesInEquations(equations: Equation[]): string[] {
  return [
    ...new Set(
      equations.flatMap((equation) => [
        ...variablesInExpression(equation.left),
        ...variablesInExpression(equation.right),
      ]),
    ),
  ].sort()
}

function valueAt(
  expression: string,
  point: EvaluationPoint,
): number | undefined {
  const compiled = compile(expression)
  if (compiled == null || compiled.run == null) return undefined
  let value: unknown
  try {
    value = compiled.run(point)
  } catch {
    value = runCompiledCode(compiled.code, point)
  }
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function runCompiledCode(
  code: string | undefined,
  point: EvaluationPoint,
): unknown {
  if (code == null || code === '') return undefined

  const variableNames = Object.keys(point).sort()
  const variableValues = variableNames.map((variable) => point[variable])
  return Function(
    '_',
    ...variableNames,
    `"use strict"; return (${code});`,
  )(point, ...variableValues)
}

function equationDifferenceAt(
  equation: Equation,
  point: EvaluationPoint,
): number | undefined {
  const left = valueAt(equation.left, point)
  const right = valueAt(equation.right, point)
  if (left === undefined || right === undefined) return undefined
  return left - right
}

function evaluationPoints(variables: string[]): EvaluationPoint[] {
  if (variables.length === 0) return [{}]

  const points: EvaluationPoint[] = []
  for (let index = 0; index < Math.max(8, variables.length * 3); index++) {
    const point: EvaluationPoint = {}
    variables.forEach((variable, variableIndex) => {
      point[variable] = ((index + 2 * variableIndex) % 5) - 2
    })
    points.push(point)
  }
  return points
}

function isZeroExpression(expression: string): boolean {
  const normalized = normalizeExpression(expression)
  return evaluationPoints(variablesInExpression(normalized)).every((point) => {
    const value = valueAt(normalized, point)
    return value !== undefined && Math.abs(value) <= TOLERANCE
  })
}

function areEquivalentEquations(input: Equation, answer: Equation): boolean {
  const points = evaluationPoints(variablesInEquations([input, answer]))
  let ratio: number | undefined

  for (const point of points) {
    const inputValue = equationDifferenceAt(input, point)
    const answerValue = equationDifferenceAt(answer, point)
    if (inputValue === undefined || answerValue === undefined) return false

    if (Math.abs(answerValue) <= TOLERANCE) {
      if (Math.abs(inputValue) > TOLERANCE) return false
      continue
    }

    const currentRatio = inputValue / answerValue
    if (ratio === undefined) {
      ratio = currentRatio
    } else if (Math.abs(currentRatio - ratio) > TOLERANCE) {
      return false
    }
  }

  return ratio !== undefined
}

function haveSameFiniteUnivariateSolutions(
  input: Equation,
  answer: Equation,
): boolean {
  const variables = variablesInEquations([input, answer])
  if (variables.length !== 1) return false

  const solutions = [input, answer].map((equation) => {
    try {
      const difference = computeEngine.box([
        'Subtract',
        computeEngine.parse(equation.left).json,
        computeEngine.parse(equation.right).json,
      ])
      const solved = difference.solve(variables[0])
      if (!Array.isArray(solved) || solved.length === 0) return null
      const boxedSolutions = solved as unknown as Array<{
        readonly isFinite?: boolean
        readonly latex: string
      }>
      if (
        boxedSolutions.some(
          (solution) =>
            solution.isFinite !== true ||
            variablesInExpression(solution.latex).length > 0,
        )
      )
        return null
      return boxedSolutions.map((solution) => solution.latex)
    } catch {
      return null
    }
  })

  const [inputSolutions, answerSolutions] = solutions
  if (
    inputSolutions == null ||
    answerSolutions == null ||
    inputSolutions.length !== answerSolutions.length
  )
    return false

  const unmatched = [...answerSolutions]
  return inputSolutions.every((inputSolution) => {
    const matchIndex = unmatched.findIndex((answerSolution) =>
      isZeroExpression(`(${inputSolution})-(${answerSolution})`),
    )
    if (matchIndex === -1) return false
    unmatched.splice(matchIndex, 1)
    return true
  })
}

/**
 * Équivalence de deux équations dans C : `i` est l'unité imaginaire et les
 * autres lettres sont des inconnues complexes. Les équations sont équivalentes
 * lorsque leurs différences « membre de gauche - membre de droite » sont
 * proportionnelles (par un complexe non nul) en tout point testé.
 */
function areEquivalentComplexEquations(
  input: Equation,
  answer: Equation,
): boolean {
  const variables = complexVariables(
    `${input.left}${input.right}${answer.left}${answer.right}`,
  )
  const difference = (
    equation: Equation,
    point: PointComplexe,
  ): NombreComplexe | undefined => {
    const left = evaluateComplexExpression(equation.left, point)
    const right = evaluateComplexExpression(equation.right, point)
    return left == null || right == null
      ? undefined
      : complexSubtract(left, right)
  }
  let ratio: NombreComplexe | undefined
  for (const point of complexEvaluationPoints(variables)) {
    const inputValue = difference(input, point)
    const answerValue = difference(answer, point)
    if (inputValue === undefined || answerValue === undefined) return false
    if (
      complexModulus(answerValue) <= toleranceComplexe(answerValue, inputValue)
    ) {
      if (
        complexModulus(inputValue) > toleranceComplexe(answerValue, inputValue)
      )
        return false
      continue
    }
    const currentRatio = complexDivide(inputValue, answerValue)
    if (ratio === undefined) ratio = currentRatio
    else if (
      complexModulus(complexSubtract(currentRatio, ratio)) >
      toleranceComplexe(currentRatio, ratio)
    )
      return false
  }
  return ratio !== undefined && complexModulus(ratio) > TOLERANCE
}

export function isEquation(options: CheckOverrides = {}): Check {
  return {
    name: options.name ?? 'isEquation',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    run: (saisie) => {
      const passed = splitEquation(saisie) !== undefined

      return {
        passed,
        feedbackKo:
          options.feedbackKo ??
          'La réponse doit être une équation avec un seul signe =.',
        feedbackOk: options.feedbackOk ?? 'La réponse est bien une équation.',
      }
    },
  }
}

export function isEquivalentEquation(
  options: CheckOverrides & { complexes?: boolean } = {},
): Check {
  return {
    name: options.name ?? 'isEquivalentEquation',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    run: (saisie, answer) => {
      const passed = options.complexes
        ? areEquivalentComplexEquationStrings(saisie, answer)
        : areEquivalentRealEquationStrings(saisie, answer)

      return {
        passed,
        feedbackKo:
          options.feedbackKo ??
          "L'équation saisie n'est pas équivalente à l'équation attendue.",
        feedbackOk:
          options.feedbackOk ??
          "L'équation saisie est équivalente à l'équation attendue.",
      }
    },
  }
}

export function areEquivalentRealEquationStrings(
  saisie: string,
  answer: string,
): boolean {
  const inputEquation = splitEquation(saisie)
  const answerEquation = splitEquation(answer)
  return (
    inputEquation !== undefined &&
    answerEquation !== undefined &&
    (areEquivalentEquations(inputEquation, answerEquation) ||
      haveSameFiniteUnivariateSolutions(inputEquation, answerEquation))
  )
}

function areEquivalentComplexEquationStrings(
  saisie: string,
  answer: string,
): boolean {
  const inputParts = saisie.split('=')
  const answerParts = answer.split('=')
  return (
    inputParts.length === 2 &&
    answerParts.length === 2 &&
    areEquivalentComplexEquations(
      { left: inputParts[0], right: inputParts[1] },
      { left: answerParts[0], right: answerParts[1] },
    )
  )
}

export function hasZeroMember(options: CheckOverrides = {}): Check {
  return {
    name: options.name ?? 'hasZeroMember',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    run: (saisie) => {
      const equation = splitEquation(saisie)
      const passed =
        equation !== undefined &&
        (isZeroExpression(equation.left) || isZeroExpression(equation.right))

      return {
        passed,
        feedbackKo:
          options.feedbackKo ??
          "L'équation doit être écrite avec un membre égal à 0.",
        feedbackOk:
          options.feedbackOk ??
          "L'équation est bien écrite avec un membre égal à 0.",
      }
    },
  }
}
