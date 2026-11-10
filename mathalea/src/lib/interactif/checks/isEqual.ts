import { fonctionComparaison } from '../comparisonFunctions'
import { evaluateArithmeticExpression } from './evaluateArithmeticExpression'
import { normalizeLatexArithmetic } from './latexArithmetic'
import type { Check, EqualsOptions } from './types'

function asNumber(value: string): number {
  const normalized = normalizeLatexArithmetic(value)

  if (normalized === '') return Number.NaN

  return evaluateArithmeticExpression(normalized) ?? Number.NaN
}

function compareWithTolerance(
  saisie: string,
  answer: string,
  options: EqualsOptions,
): boolean | undefined {
  if (options.tolerance === undefined) return undefined
  if (saisie.trim() === '') return false
  const inputNumber = asNumber(saisie)
  const answerNumber = asNumber(answer)
  if (Number.isFinite(inputNumber) && Number.isFinite(answerNumber)) {
    return compareNumbers(inputNumber, answerNumber, options)
  }

  return compareSimpleMonomials(saisie, answer, options)
}

function compareNumbers(
  inputNumber: number,
  answerNumber: number,
  options: EqualsOptions,
): boolean {
  const tolerance = options.tolerance
  if (tolerance === undefined) return false
  const difference = Math.abs(inputNumber - answerNumber)
  const epsilon = 1e-12

  return difference <= 10 ** tolerance + epsilon
}

type SimpleMonomial = {
  coefficient: number
  variable: string
}

function parseSimpleMonomial(value: string): SimpleMonomial | undefined {
  const normalized = value
    .trim()
    .replaceAll(',', '.')
    .replaceAll('−', '-')
    .replaceAll('\\times', '*')
    .replace(/\s+/g, '')

  const match = normalized.match(
    /^([+-]?(?:\d+(?:\.\d+)?|\.\d+)?)\*?([A-Za-z]+)$/,
  )
  if (match == null) return undefined

  const rawCoefficient = match[1]
  const coefficient =
    rawCoefficient === '' || rawCoefficient === '+'
      ? 1
      : rawCoefficient === '-'
        ? -1
        : Number(rawCoefficient)

  if (!Number.isFinite(coefficient)) return undefined

  return {
    coefficient,
    variable: match[2],
  }
}

function compareSimpleMonomials(
  saisie: string,
  answer: string,
  options: EqualsOptions,
): boolean | undefined {
  const inputMonomial = parseSimpleMonomial(saisie)
  const answerMonomial = parseSimpleMonomial(answer)
  if (inputMonomial == null || answerMonomial == null) return undefined
  if (inputMonomial.variable !== answerMonomial.variable) return false
  return compareNumbers(
    inputMonomial.coefficient,
    answerMonomial.coefficient,
    options,
  )
}

export function isEqual(options: EqualsOptions = {}): Check {
  return {
    name: options.name ?? 'isEqual',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie, answer) => {
      const toleranceResult = compareWithTolerance(saisie, answer, options)
      const result =
        toleranceResult === undefined
          ? fonctionComparaison(saisie, answer, options.comparisonOptions)
          : { isOk: toleranceResult, feedback: undefined }

      return {
        passed: result.isOk,
        feedbackKo:
          options.feedbackKo ?? result.feedback ?? 'Le résultat est incorrect.',
        feedbackOk: options.feedbackOk ?? 'La valeur est correcte.',
      }
    },
  }
}
