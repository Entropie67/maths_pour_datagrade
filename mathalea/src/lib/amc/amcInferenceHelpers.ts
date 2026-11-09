import Decimal from 'decimal.js'
import FractionEtendue from '../../modules/FractionEtendue'
import Grandeur from '../../modules/Grandeur'
import Hms from '../../modules/Hms'
import { generateCleaner } from '../interactif/cleaners'
import { Complexe } from '../mathFonctions/Complexe'
import { isValeur, type IExercice } from '../types'
import { countDecimals, countDigits, isFractionValue } from './amcHelpers'
import type { IExerciceAMC, ReponseParams } from './amcTypes'
/**
 * @author Jean-claude Lhote
 */

const mathliveNumericCleaner = generateCleaner(['latex', 'virgules', 'espaces'])
const strictNumericPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/
const compactPowerPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)\^[+-]?\d+$/

export type AMCScientificNotation = {
  valeur: number
  param: ReponseParams
}

export type AMCPowerNotation = {
  valeur: number
  param: ReponseParams
}

export type AMCQuantity = {
  valeur: number
  latexUnit: string
  param: ReponseParams
}

export type AMCHmsComponent = {
  key: 'hour' | 'minute' | 'second'
  valeur: number
  latexUnit: string
  param: ReponseParams
}

export type AMCInterval = {
  correct: number
  left: number
  right: number
  step: number
  choices: Array<{ texte: string; statut: boolean }>
}

export type AMCCoordinateComponent = {
  key: 'x' | 'y' | 'z'
  label: 'Abscisse' | 'Ordonnée' | 'Cote'
  valeur: number | { num: number; den: number }
}

export function inferCoordinatesForAMC(
  source: unknown,
): AMCCoordinateComponent[] | undefined {
  if (Array.isArray(source)) {
    if (source.length !== 1) return undefined
    source = source[0]
  }
  if (typeof source !== 'string') return undefined

  const compact = source.trim().replace(/\\(?:left|right)/g, '')
  const coordinates = compact.split(';').map((coordinate) =>
    inferNumericValueForAMC(
      coordinate
        .trim()
        .replace(/^[([]/, '')
        .replace(/[)\]]$/, ''),
    ),
  )
  if (
    (coordinates.length !== 2 && coordinates.length !== 3) ||
    coordinates.some((coordinate) => coordinate === undefined)
  ) {
    return undefined
  }

  const metadata = [
    { key: 'x', label: 'Abscisse' },
    { key: 'y', label: 'Ordonnée' },
    { key: 'z', label: 'Cote' },
  ] as const
  return coordinates.map((valeur, index) => ({
    ...metadata[index],
    valeur: valeur!,
  }))
}

export function inferIntervalForAMC(source: unknown): AMCInterval | undefined {
  if (typeof source !== 'string') return undefined
  const compact = source
    .trim()
    .replace(/\\(?:left|right)/g, '')
    .replace(/\{,\}|,/g, '.')
    .replace(/\\(?:,|;|:|!|quad|qquad|thickspace)/g, '')
    .replace(/\s+/g, '')
  const match = compact.match(
    /^(.)([+-]?(?:\d+(?:\.\d*)?|\.\d+));([+-]?(?:\d+(?:\.\d*)?|\.\d+))(.)$/,
  )
  if (
    match == null ||
    !['[', ']'].includes(match[1]) ||
    !['[', ']'].includes(match[4])
  ) {
    return undefined
  }

  const lower = Number(match[2])
  const upper = Number(match[3])
  const step = upper - lower
  if (!Number.isFinite(lower) || !Number.isFinite(upper) || step <= 0) {
    return undefined
  }

  const left = lower - step
  const right = upper + step
  const correct = lower + step / 2
  if (![left, right, correct].every(Number.isFinite)) return undefined

  const format = (value: number) => String(Number(value.toPrecision(12)))
  const bounds = [left, lower, upper, right]
  return {
    correct,
    left,
    right,
    step,
    choices: bounds.slice(0, -1).map((bound, index) => ({
      texte: `$[${format(bound)}\\,;\\,${format(bounds[index + 1])}[$`,
      statut: index === 1,
    })),
  }
}

export function inferHmsForAMC(source: unknown): AMCHmsComponent[] | undefined {
  let duration: Hms
  let isExplicitHm = false

  if (source instanceof Hms) {
    duration = source
  } else if (typeof source === 'string' && source.trim() !== '') {
    const compact = source.replaceAll(' ', '').replaceAll('&nbsp;', '')
    if (!/(?:h|min|s)/.test(compact)) return undefined
    duration = Hms.fromString(source)
    isExplicitHm =
      /(?:h|min)/.test(compact) && !/(?:\\text\{s\}|\d+s)/.test(compact)
  } else {
    return undefined
  }

  const totalSeconds = duration.toSeconds()
  if (!Number.isSafeInteger(totalSeconds) || totalSeconds < 0) return undefined

  const hour = Math.floor(totalSeconds / 3600)
  const minute = Math.floor((totalSeconds % 3600) / 60)
  const second = totalSeconds % 60
  if (hour > 99) return undefined

  const component = (
    key: AMCHmsComponent['key'],
    valeur: number,
    latexUnit: string,
  ): AMCHmsComponent => ({
    key,
    valeur,
    latexUnit,
    param: { digits: 2, decimals: 0, signe: false },
  })

  return [
    component('hour', hour, '\\text{h}'),
    component('minute', minute, '\\text{min}'),
    ...(isExplicitHm ? [] : [component('second', second, '\\text{s}')]),
  ]
}

export function inferQuantityForAMC(
  source: unknown,
  precisionUnite: unknown,
): AMCQuantity | undefined {
  if (!(source instanceof Grandeur) || !Number.isFinite(source.mesure)) {
    return undefined
  }

  const precision = Number(precisionUnite)
  return {
    valeur: source.mesure,
    latexUnit: source.latexUnit,
    param: {
      ...(Number.isFinite(precision) && precision >= 0
        ? { approx: precision }
        : {}),
    },
  }
}

export function inferExactFractionForAMC(
  source: unknown,
): { num: number; den: number } | undefined {
  let numerator: number
  let denominator: number

  if (source instanceof FractionEtendue) {
    numerator = source.num
    denominator = source.den
  } else if (
    typeof source === 'object' &&
    source !== null &&
    'num' in source &&
    'den' in source
  ) {
    numerator = Number(source.num)
    denominator = Number(source.den)
  } else if (typeof source === 'string') {
    const match = source
      .trim()
      .match(/^([+-]?)\s*\\(?:d?frac)\s*{([+-]?\d+)}\s*{([+-]?\d+)}$/)
    if (match == null) return undefined
    numerator = Number(`${match[1]}${match[2]}`)
    denominator = Number(match[3])
  } else {
    return undefined
  }

  if (
    !Number.isSafeInteger(numerator) ||
    !Number.isSafeInteger(denominator) ||
    denominator === 0
  ) {
    return undefined
  }

  return denominator < 0
    ? { num: -numerator, den: -denominator }
    : { num: numerator, den: denominator }
}

function isPowerOfTen(value: number): boolean {
  if (!Number.isSafeInteger(value) || value < 1) return false
  while (value > 1 && value % 10 === 0) value /= 10
  return value === 1
}

function decimalStringToFraction(
  source: string,
): { num: number; den: number } | undefined {
  const compact = source.trim().replace(',', '.')
  const match = compact.match(/^([+-]?)(\d+)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/)
  if (match == null) return undefined

  const sign = match[1] === '-' ? -1 : 1
  const fractionDigits = match[3] ?? ''
  const exponent = Number(match[4] ?? 0)
  const scale = fractionDigits.length - exponent
  const digits = `${match[2]}${fractionDigits}`.replace(/^0+(?=\d)/, '')
  const baseNumerator = sign * Number(digits)
  const numerator =
    scale < 0 ? baseNumerator * 10 ** Math.abs(scale) : baseNumerator
  const denominator = scale > 0 ? 10 ** scale : 1
  return Number.isSafeInteger(numerator) && Number.isSafeInteger(denominator)
    ? { num: numerator, den: denominator }
    : undefined
}

export function inferDecimalFractionForAMC(
  source: unknown,
): { num: number; den: number } | undefined {
  const exact = inferExactFractionForAMC(source)
  if (exact != null) {
    if (isPowerOfTen(exact.den)) return exact

    let numerator = exact.num
    let denominator = exact.den
    let divisor = Math.abs(numerator)
    let remainder = denominator
    while (remainder !== 0) {
      const next = divisor % remainder
      divisor = remainder
      remainder = next
    }
    const gcd = divisor || 1
    numerator /= gcd
    denominator /= gcd

    let twos = 0
    let fives = 0
    while (denominator % 2 === 0) {
      denominator /= 2
      twos++
    }
    while (denominator % 5 === 0) {
      denominator /= 5
      fives++
    }
    if (denominator !== 1) return undefined

    const power = Math.max(twos, fives)
    const decimalDenominator = 10 ** power
    const decimalNumerator =
      numerator * 2 ** (power - twos) * 5 ** (power - fives)
    return Number.isSafeInteger(decimalNumerator) &&
      Number.isSafeInteger(decimalDenominator)
      ? { num: decimalNumerator, den: decimalDenominator }
      : undefined
  }

  if (typeof source === 'number' && Number.isFinite(source)) {
    return decimalStringToFraction(String(source))
  }
  if (typeof source === 'string') {
    return decimalStringToFraction(mathliveNumericCleaner(source))
  }
  return undefined
}

export function inferPowerNotationForAMC(
  source: unknown,
): AMCPowerNotation | undefined {
  if (typeof source !== 'string') return undefined

  const compact = source
    .trim()
    .replace(/\\(?:left|right)/g, '')
    .replace(/\\(?:lparen|rparen)/g, '')
    .replace(/\s+/g, '')
  const match = compact.match(/^\(?([+-]?\d+)\)?\^\{?([+-]?\d+)\}?$/)
  if (match == null) return undefined

  const base = Number(match[1])
  const exponent = Number(match[2])
  if (!Number.isSafeInteger(base) || !Number.isSafeInteger(exponent)) {
    return undefined
  }

  return {
    valeur: base,
    param: {
      basePuissance: base,
      exposantPuissance: exponent,
      baseNbChiffres: countDigits(base),
      exposantNbChiffres: countDigits(exponent),
      signe: base < 0,
    },
  }
}

export function inferScientificNotationForAMC(
  source: unknown,
): AMCScientificNotation | undefined {
  if (typeof source !== 'string') return undefined

  const compact = source
    .trim()
    .replace(/\{,\}|,/g, '.')
    .replace(/\\(?:,|;|:|!|quad|qquad|thickspace)/g, '')
    .replace(/\s+/g, '')
  const scientificMatch =
    compact.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))[eE]([+-]?\d+)$/) ??
    compact.match(
      /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\\(?:times|cdot)10\^\{?([+-]?\d+)\}?$/,
    )
  if (scientificMatch == null) return undefined

  const mantissa = Number(scientificMatch[1])
  const exponent = Number(scientificMatch[2])
  if (
    !Number.isFinite(mantissa) ||
    !Number.isInteger(exponent) ||
    Math.abs(mantissa) < 1 ||
    Math.abs(mantissa) >= 10
  ) {
    return undefined
  }

  const valeur = Number(`${mantissa}e${exponent}`)
  if (!Number.isFinite(valeur)) return undefined
  const decimals = countDecimals(mantissa)

  return {
    valeur,
    param: {
      digits: countDigits(mantissa) + decimals,
      decimals,
      signe: mantissa < 0,
      exposantNbChiffres: countDigits(exponent),
      exposantSigne: exponent < 0,
    },
  }
}

function normalizeFractionForAMC(
  numerator: number,
  denominator: number,
): number | { num: number; den: number } | undefined {
  if (
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    denominator === 0
  ) {
    return undefined
  }

  if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
    return { num: numerator, den: denominator }
  }

  let a = Math.abs(numerator)
  let b = Math.abs(denominator)
  while (b !== 0) {
    const remainder = a % b
    a = b
    b = remainder
  }
  const gcd = a || 1
  const denominatorSign = denominator < 0 ? -1 : 1
  const num = (numerator / gcd) * denominatorSign
  const den = Math.abs(denominator / gcd)
  return den === 1 ? num : { num, den }
}

export function extractAMCValue(
  reponse: unknown,
): number | { num: number; den: number } | string | undefined {
  const unwrap = (value: unknown): unknown => {
    // Un tableau représente plusieurs réponses interactives acceptées. Choisir
    // arbitrairement la première rendrait l'export AMC plus restrictif que
    // l'exercice source. Seul le wrapper historique à un élément est sûr.
    if (Array.isArray(value))
      return value.length === 1 ? unwrap(value[0]) : undefined

    if (isValeur(value) && 'reponse' in value)
      return unwrap(value.reponse?.value)

    if (typeof value === 'object' && value !== null) {
      if ('reponse' in value) {
        return unwrap(
          (value as { reponse?: { value?: unknown } }).reponse?.value,
        )
      }
      if ('valeur' in value) {
        return unwrap((value as { valeur?: unknown }).valeur)
      }
      if ('value' in value) {
        return unwrap((value as { value?: unknown }).value)
      }
    }

    return value
  }

  const value = unwrap(reponse)
  if (value === undefined) return undefined
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined
  }
  if (value instanceof Decimal) {
    const numberValue = value.toNumber()
    return Number.isFinite(numberValue) ? numberValue : undefined
  }
  if (value instanceof FractionEtendue) {
    const simplified = value.simplifie()
    return normalizeFractionForAMC(simplified.num, simplified.den)
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'num' in value &&
    'den' in value
  ) {
    return normalizeFractionForAMC(Number(value.num), Number(value.den))
  }
  window.notify(
    'extractAMCValue a reçu une réponse de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire.',
    { reponse: JSON.stringify(reponse) },
  )
  return undefined
}

export function inferNumericValueForAMC(
  value: number | { num: number; den: number } | string | undefined,
): number | { num: number; den: number } | undefined {
  if (value === undefined) return undefined
  if (Array.isArray(value)) {
    value = value[0]
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    Number.isFinite(value.num) &&
    Number.isFinite(value.den) &&
    value.den !== 0
  ) {
    return value
  }
  // Gérer le cas Decimal
  if (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as any).toNumber === 'function'
  ) {
    const decimalValue = (value as any).toNumber()
    return Number.isFinite(decimalValue) ? decimalValue : undefined
  }

  if (value instanceof Complexe) {
    if (value.isReal) return value.re
    return undefined
  }
  if (typeof value !== 'string') {
    window.notify(
      'inferNumericValueForAMC a reçu une valeur de type inattendu, elle doit être une chaîne de caractères, un nombre ou un objet fractionnaire.',
      { value: JSON.stringify(value) },
    )
    return undefined
  }

  // à partir d'ici, on considère que value est une chaine de caractères
  const trimmed = value.trim()
  if (trimmed.length === 0) return undefined

  // On teste le cas fractionnaire
  if (isFractionValue(trimmed)) {
    const match = trimmed.match(
      /^\s*([+-]?)\s*\\(?:d?frac)\s*{([^}]*)}\s*{([^}]*)}\s*$/,
    )
    if (match == null) return undefined

    const sign = match[1]
    const numerator = Number.parseFloat(`${sign}${match[2]}`)
    const denominator = Number.parseFloat(match[3])

    return normalizeFractionForAMC(numerator, denominator)
  }

  // Pour l'instant on n'infère que les valeurs numériques décimales.
  if (/^\\?sqrt/.test(trimmed)) return undefined

  const cleaned = mathliveNumericCleaner(trimmed)
  if (strictNumericPattern.test(cleaned)) {
    const parsed = Number(cleaned)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  if (compactPowerPattern.test(cleaned)) {
    const base = cleaned.split('^', 1)[0]
    const parsed = Number(base)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  return undefined
}

export function mergeNumericParamsFromOptions(
  baseParam: ReponseParams | undefined,
  options: unknown,
): ReponseParams {
  const merged: ReponseParams = { ...(baseParam ?? {}) }
  if (options == null || typeof options !== 'object') return merged
  const optionRecord = options as Record<string, unknown>

  const supportedOptionKeys: Array<keyof ReponseParams> = [
    'digits',
    'decimals',
    'signe',
    'exposantNbChiffres',
    'exposantSigne',
    'approx',
    'vertical',
    'strict',
    'scoreapprox',
    'tpoint',
  ]

  for (const key of supportedOptionKeys) {
    const optionValue = optionRecord[key]
    if (optionValue !== undefined && merged[key] === undefined) {
      ;(merged as Record<string, unknown>)[key] = optionValue
    }
  }

  return merged
}

type InteractiveAnswerCandidate = {
  value: unknown
}

function extractInteractiveAnswerCandidate(
  source: unknown,
): InteractiveAnswerCandidate | undefined {
  if (typeof source !== 'object' || source == null) {
    window.notify(
      'extractInteractiveAnswerCandidate a reçu une source de type inattendu, elle doit être un objet contenant une propriété "value" ou "reponse".',
      { source: JSON.stringify(source) },
    )
    return undefined
  }

  const record = source as Record<string, unknown>

  if ('value' in record) {
    return {
      value: record.value,
    }
  }

  if ('reponse' in record) {
    return extractInteractiveAnswerCandidate(record.reponse)
  }

  if ('champ1' in record && !('champ2' in record)) {
    return extractInteractiveAnswerCandidate(record.champ1)
  }

  if ('field1' in record && !('field2' in record)) {
    return extractInteractiveAnswerCandidate(record.field1)
  }

  if ('valeur' in record) {
    return extractInteractiveAnswerCandidate(record.valeur)
  }

  return undefined
}

/**
 * Infère des options AMCNum à partir d'une réponse interactive de type
 * `{ reponse: { value, options, compare } }`.
 *
 * Cette fonction ne remplace pas des options AMC explicites (`reponse.param`),
 * elle produit seulement une base à fusionner ensuite à partir de `value`.
 * Les options de comparaison interactive (`options`, `compare`) ne servent
 * pas à inférer les paramètres AMC.
 */
export function inferAmcOptionsFromAnswerType(
  source: unknown,
): ReponseParams | undefined {
  const candidate = extractInteractiveAnswerCandidate(source)
  if (candidate == null) return undefined

  const answerValues = Array.isArray(candidate.value)
    ? candidate.value
    : [candidate.value]

  let hasNumericCandidate = false
  let inferredDigits = 0
  let inferredDecimals = 0
  let inferredSign = false

  for (const answerValue of answerValues) {
    const numericValue = inferNumericValueForAMC(extractAMCValue(answerValue))
    if (numericValue === undefined) continue

    hasNumericCandidate = true

    if (typeof numericValue === 'number') {
      const decimals = countDecimals(numericValue)
      const digits = countDigits(numericValue) + decimals
      inferredDigits = Math.max(inferredDigits, digits)
      inferredDecimals = Math.max(inferredDecimals, decimals)
      inferredSign ||= numericValue < 0
      continue
    }

    const digitsNum = countDigits(numericValue.num)
    const digitsDen = countDigits(numericValue.den)
    inferredDigits = Math.max(inferredDigits, digitsNum + digitsDen)
    inferredDecimals = Math.max(inferredDecimals, digitsDen)
    inferredSign ||= numericValue.num * numericValue.den < 0
  }

  if (!hasNumericCandidate) return undefined

  const inferred: ReponseParams = {
    digits: inferredDigits,
    decimals: inferredDecimals,
    signe: inferredSign,
  }

  return inferred
}

export function extractInteractifOptions(
  reponse: unknown,
): { [key: string]: unknown } | undefined {
  if (typeof reponse === 'object' && reponse !== null) {
    if ('reponse' in reponse) {
      return extractInteractifOptions(
        (reponse as { reponse?: { value?: unknown; param?: unknown } }).reponse,
      )
    }
    if ('options' in reponse) {
      return (reponse as { options?: { [key: string]: unknown } }).options
    }
  }
  return undefined
}

export function ensureAMCOpenAutoCorrection(
  exercice: IExercice | IExerciceAMC,
  targetAutoCorrection?: Array<any>,
) {
  const autoCorrection = targetAutoCorrection ?? exercice.autoCorrection

  const questionCount = Math.max(
    autoCorrection.length,
    exercice.listeQuestions.length,
    exercice.listeCorrections.length,
    exercice.question != null ? 1 : 0,
    1,
  )

  for (let i = 0; i < questionCount; i++) {
    const existing = autoCorrection[i] as
      | {
          enonce?: string
          propositions?: Array<{
            texte?: string
            statut?: number
            sanscadre?: boolean
            pointilles?: boolean
          }>
        }
      | undefined

    const enonce =
      existing?.enonce ??
      exercice.listeQuestions[i] ??
      (i === 0 ? (exercice.question ?? '') : '')
    const correction =
      exercice.listeCorrections[i] ??
      (i === 0 ? (exercice.correction ?? '') : '')

    if (existing == null) {
      autoCorrection[i] = {
        enonce,
        propositions: [
          {
            texte: correction,
            statut: 3,
            sanscadre: false,
            pointilles: true,
          },
        ],
      }
      continue
    }

    if (existing.enonce == null) existing.enonce = enonce
    if ((existing.propositions?.length ?? 0) === 0) {
      existing.propositions = [
        {
          texte: correction,
          statut: 3,
          sanscadre: false,
          pointilles: true,
        },
      ]
    }
  }
}
