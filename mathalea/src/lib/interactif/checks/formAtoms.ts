import { ComputeEngine, isFunction } from '@cortex-js/compute-engine'
import { generateCleaner } from '../cleaners'
import { isReduced } from './isReduced'
import type { Check, CheckOverrides } from './types'

const ce = new ComputeEngine()

type PowerFormOptions = CheckOverrides & {
  forbidExponentOne?: boolean
  exactExpectedPower?: boolean
}

const FRACTION_PATTERN =
  /^-?(?:\\[dtc]?frac\{[^{}]+\}\{[^{}]+\}|\\[dtc]?frac-?\d-?\d|[^/{}]+\/[^/{}]+)$/

function cleanBasic(value: string): string {
  return value.trim().replaceAll('−', '-').replace(/\s+/g, '')
}

function createTextCheck(
  name: string,
  defaultFeedbackKo: string,
  predicate: (saisie: string, answer: string) => boolean,
  options: CheckOverrides = {},
): Check {
  return {
    name: options.name ?? name,
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie, answer) => {
      const passed = predicate(saisie, answer)
      return {
        passed,
        feedbackKo: options.feedbackKo ?? defaultFeedbackKo,
        feedbackOk: options.feedbackOk,
      }
    },
  }
}

function parseFractionParts(value: string): [number, number] | undefined {
  const normalized = cleanBasic(value)
  const latex = normalized.match(/^(-?)\\[dtc]?frac\{(-?\d+)\}\{(-?\d+)\}$/)
  if (latex != null) {
    const sign = latex[1] === '-' ? -1 : 1
    return [sign * Number(latex[2]), Number(latex[3])]
  }

  const shortLatex = normalized.match(/^(-?)\\[dtc]?frac(-?\d)(-?\d)$/)
  if (shortLatex != null) {
    const sign = shortLatex[1] === '-' ? -1 : 1
    return [sign * Number(shortLatex[2]), Number(shortLatex[3])]
  }

  const slash = normalized.match(/^(-?\d+)\/(-?\d+)$/)
  if (slash != null) return [Number(slash[1]), Number(slash[2])]

  return undefined
}

function isPowerOfTen(value: number): boolean {
  let current = Math.abs(value)
  if (!Number.isInteger(current) || current < 1) return false
  while (current > 1 && current % 10 === 0) current /= 10
  return current === 1
}

function normalizedForCe(value: string): string {
  return generateCleaner([
    'virgules',
    'parentheses',
    'fractionsMemesNegatives',
    'puissances',
  ])(value)
}

function splitCoordinates(value: string): string[] | undefined {
  const normalized = value
    .trim()
    .replaceAll('\\left', '')
    .replaceAll('\\right', '')
    .replace(/^\\lparen|^[(]/, '')
    .replace(/\\rparen$|[)]$/, '')
  const parts = normalized.split(';').map((part) => part.trim())
  return parts.length > 0 && parts.every((part) => part !== '')
    ? parts
    : undefined
}

function splitIntervalBounds(value: string): string[] | undefined {
  const normalized = value
    .trim()
    .replaceAll('\\left', '')
    .replaceAll('\\right', '')
  if (normalized === '\\emptyset' || normalized === '∅') return []
  const parts = normalized.match(/[^[\];]+/g)
  if (parts == null) return undefined
  return parts
    .map((part) => part.trim())
    .filter((part) => part !== '\\cup' && part !== '\\cap')
}

function allPartsReduced(parts: string[] | undefined): boolean {
  if (parts === undefined) return false
  const reduced = isReduced()
  return parts.every((part) => reduced.run(part, '').passed)
}

export function isFraction(options: CheckOverrides = {}): Check {
  return createTextCheck(
    'isFraction',
    'Résultat incorrect car une fraction est attendue.',
    (saisie) => FRACTION_PATTERN.test(cleanBasic(saisie)),
    options,
  )
}

export function isDecimalFraction(options: CheckOverrides = {}): Check {
  return createTextCheck(
    'isDecimalFraction',
    'Résultat incorrect car une fraction décimale est attendue.',
    (saisie) => {
      const parts = parseFractionParts(saisie)
      return parts !== undefined && parts[1] !== 0 && isPowerOfTen(parts[1])
    },
    options,
  )
}

export function onlyDecimalNumbers(options: CheckOverrides = {}): Check {
  return createTextCheck(
    'onlyDecimalNumbers',
    'Résultat incorrect car seuls des nombres décimaux ou entiers sont attendus.',
    (saisie) => {
      const normalized = cleanBasic(saisie)
        .replaceAll(',', '.')
        .replaceAll(',', '.')
      if (/\\[dtc]?frac|\\sqrt|(?<=\d)\/(?=\d)/.test(normalized)) return false
      const numbers = normalized.match(
        /(?<![A-Za-z\\])[-+]?(?:\d+(?:\.\d*)?|\.\d+)/g,
      )
      return (
        numbers !== null &&
        numbers.every((value) => Number.isFinite(Number(value)))
      )
    },
    options,
  )
}

export function isScientificNotation(options: CheckOverrides = {}): Check {
  return createTextCheck(
    'isScientificNotation',
    'La réponse doit être écrite en notation scientifique.',
    (saisie) => {
      const normalized = cleanBasic(saisie)
        .replaceAll(',', '.')
        .replaceAll(',', '.')
        .replaceAll('\\cdot', '\\times')
      const mantissaFirst = normalized.match(
        /^(-?\d+(?:\.\d+)?)\\times10\^{?(-?\d+)}?$/,
      )
      const powerFirst = normalized.match(
        /^10\^{?(-?\d+)}?\\times(-?\d+(?:\.\d+)?)$/,
      )
      const mantissa = Number(mantissaFirst?.[1] ?? powerFirst?.[2])
      if (!Number.isFinite(mantissa)) return false
      return Math.abs(mantissa) >= 1 && Math.abs(mantissa) < 10
    },
    options,
  )
}

export function isPowerForm(options: PowerFormOptions = {}): Check {
  return createTextCheck(
    'isPowerForm',
    'Une puissance est attendue.',
    (saisie, answer) => {
      const input = ce.parse(normalizedForCe(saisie), { form: 'raw' })
      if (!isFunction(input, 'Power')) return false
      if (options.forbidExponentOne && input.op2.is(1)) return false
      if (!options.exactExpectedPower) return true
      return input.isSame(ce.parse(normalizedForCe(answer), { form: 'raw' }))
    },
    options,
  )
}

export function noTrigonometry(options: CheckOverrides = {}): Check {
  return createTextCheck(
    'noTrigonometry',
    "Aucune fonction trigonométrique n'est autorisée.",
    (saisie) => !/(?:\\)?(?:cos|sin|tan)\b/.test(saisie),
    options,
  )
}

export function hasGroupedNumberSpacing(options: CheckOverrides = {}): Check {
  return createTextCheck(
    'hasGroupedNumberSpacing',
    'Le nombre est mal écrit, il faut faire attention aux espaces.',
    (saisie, answer) => {
      const format = (value: string) => {
        const normalized = value
          .replaceAll('\\,', ' ')
          .replaceAll(',', ',')
          .replace(/\s+/g, '')
        return normalized.replace(/\b\d+(?:[.,]\d+)?\b/g, (match) => {
          const separator = match.includes(',') ? ',' : '.'
          const [integer, decimal] = match.split(separator)
          const groupedInteger = integer.replace(/(\d)(?=(\d{3})+$)/g, '$1 ')
          if (decimal == null) return groupedInteger
          const groupedDecimal = decimal.replace(/(\d{3})(?=\d)/g, '$1 ')
          return `${groupedInteger}${separator}${groupedDecimal}`
        })
      }

      return (
        saisie
          .replaceAll('\\,', ' ')
          .replace(/\s{2,}/g, ' ')
          .trim() === format(answer).replace(',', ',')
      )
    },
    options,
  )
}

export function coordinatesReduced(options: CheckOverrides = {}): Check {
  return createTextCheck(
    'coordinatesReduced',
    'Les coordonnées ne sont pas assez réduites.',
    (saisie) => allPartsReduced(splitCoordinates(saisie)),
    options,
  )
}

export function intervalBoundsReduced(options: CheckOverrides = {}): Check {
  return createTextCheck(
    'intervalBoundsReduced',
    "Les bornes de l'intervalle ne sont pas assez réduites.",
    (saisie) => allPartsReduced(splitIntervalBounds(saisie)),
    options,
  )
}
