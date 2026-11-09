import type {
  AutoCorrection,
  IDragAndDrop,
  IExercice,
  OptionsComparaisonType,
} from '../../../src/lib/types'
import Grandeur from '../../../src/modules/Grandeur'

export interface VerificationResult {
  questionIndex: number
  format: string
  verificationFunctionName: string
  optionsComparaison?: OptionsComparaisonType
  simulatedInput: string
  goodAnswer: string
  isOk: boolean
  feedback: string
  skipped: boolean
  skipReason?: string
}

function normalizeLatexNumberFormatting(value: string): string {
  return value.replace(/\{,\}/g, ',').replace(/\{\.\}/g, '.')
}

/**
 * Converts a Grandeur string like "7,5\u202fcm^2" to the LaTeX format
 * that unitsCompare/inputToGrandeur expects: "7,5\\operatorname{cm^2}"
 */
export function grandeurStringToLatex(value: string): string {
  const cleaned = normalizeLatexNumberFormatting(value).replace(
    /[\u202f\u00a0]/g,
    '',
  )
  const g = Grandeur.fromString(cleaned)
  if (g.unite === '°C' || g.unite === '°') {
    return `${String(g.mesure).replace('.', ',')}${g.unite}`
  }
  return `${String(g.mesure).replace('.', ',')}\\operatorname{${g.unite}}`
}

export function transformeEnOperations(
  value: string,
  options: OptionsComparaisonType = {},
): string {
  const trimmed = value.trim()
  const n = Number(trimmed)

  if (Number.isNaN(n) || !Number.isFinite(n)) {
    return value
  }

  // On applique l’option active
  if (options.additionSeulementEtNonResultat) {
    return `${n - 1}+1`
  }

  if (options.soustractionSeulementEtNonResultat) {
    return `${n + 1}-1`
  }

  if (options.multiplicationSeulementEtNonResultat) {
    return `${n / 2}*2`
  }

  if (options.divisionSeulementEtNonResultat) {
    return `${n * 2}/2`
  }

  // Si aucune option activée → on ne change rien
  return value
} /**
 * Converts scientific notation "1,5e3" or "1.5e-3" to LaTeX "1,5\\times10^{3}"
 * Handles both comma (French) and dot decimal separators.
 * Returns the original string if it's not in e-notation.
 */
function eNotationToLatex(value: string): string {
  const match = value.match(/^(-?\d+(?:[.,]\d+)?)e([+-]?\d+)$/)
  if (!match) return value
  const mantissa = match[1].replace('.', ',')
  const exponent = match[2].replace(/^\+/, '')
  return `${mantissa}\\times10^{${exponent}}`
}

function pgcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    const t = y
    y = x % y
    x = t
  }
  return x
}

function simplifyFractionLatex(value: string): string {
  const cleaned = value.replace(/\s+|\\,/g, '')
  const latexMatch = cleaned.match(/^([+-]?)\\d?frac{(-?\d+)}{(-?\d+)}$/)
  let num: number
  let den: number

  if (latexMatch) {
    const sign = latexMatch[1] === '-' ? -1 : 1
    num = sign * parseInt(latexMatch[2], 10)
    den = parseInt(latexMatch[3], 10)
  } else {
    const slashMatch = cleaned.match(/^(-?\d+)\/(-?\d+)$/)
    if (!slashMatch) return value
    num = parseInt(slashMatch[1], 10)
    den = parseInt(slashMatch[2], 10)
  }

  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return value
  if (den < 0) {
    num = -num
    den = -den
  }
  const d = pgcd(num, den)
  if (d <= 1) return value
  return `\\dfrac{${num / d}}{${den / d}}`
}

function scientificPowerToLatex(value: string): string {
  const cleaned = value.replace(/\s+/g, '')
  if (cleaned.includes('\\times')) return value
  const match = cleaned.match(/^(-?)10\^(\{?-?\d+\}?)$/)
  if (!match) return value
  const mantissa = match[1] === '-' ? '-1' : '1'
  return `${mantissa}\\times10^${match[2]}`
}

/**
 * Converts decimal numbers to a decimal-fraction LaTeX string.
 * Examples: "0.25" -> "\\dfrac{25}{100}", "-3,02" -> "\\dfrac{-302}{100}".
 * Returns the original value if it's already a fraction/expression or not a plain decimal.
 */
function decimalToFractionLatex(value: string): string {
  const cleaned = normalizeLatexNumberFormatting(value)
    .replace(/\s+/g, '')
    .replace(',', '.')
  if (
    cleaned.includes('/') ||
    cleaned.includes('\\frac') ||
    cleaned.includes('\\dfrac')
  ) {
    return value
  }
  const match = cleaned.match(/^([+-]?)(\d+)(?:\.(\d+))?$/)
  if (!match) return value

  const sign = match[1] === '-' ? -1n : 1n
  const intPart = match[2]
  const fracPart = match[3] ?? ''
  const denominator = 10n ** BigInt(fracPart.length)
  const numeratorAbs = BigInt(`${intPart}${fracPart}`)
  const numerator = sign * numeratorAbs
  return `\\dfrac{${numerator.toString()}}{${denominator.toString()}}`
}

/**
 * Converts an interval string like "]1;2[" or "[3,5;4,5]" to a numeric point
 * inside the interval (midpoint), as expected by interval comparisons.
 */
function intervalToMidpoint(value: string): string | null {
  const match = value.match(/[[\]](.+);(.+)[[\]]/)
  if (!match) return null
  const lo = parseFloat(match[1].replace(',', '.'))
  const hi = parseFloat(match[2].replace(',', '.'))
  if (isNaN(lo) || isNaN(hi)) return null
  return String((lo + hi) / 2)
}

export function toCompareInput(
  value: string,
  options: OptionsComparaisonType,
): string {
  if (options.unite) {
    return grandeurStringToLatex(value)
  }
  if (options.estDansIntervalle || options.estDecimalDansIntervalle) {
    return intervalToMidpoint(value) ?? value
  }
  if (options.ecritureScientifique) {
    return scientificPowerToLatex(eNotationToLatex(value))
  }
  if (options.fractionDecimale) {
    return decimalToFractionLatex(value)
  }
  if (
    options.fractionSimplifiee ||
    options.fractionReduite ||
    options.fractionIrreductible
  ) {
    return simplifyFractionLatex(value)
  }
  if (
    options.additionSeulementEtNonResultat ||
    options.soustractionSeulementEtNonResultat ||
    options.multiplicationSeulementEtNonResultat ||
    options.divisionSeulementEtNonResultat
  ) {
    return transformeEnOperations(value, {
      additionSeulementEtNonResultat: options.additionSeulementEtNonResultat,
      soustractionSeulementEtNonResultat:
        options.soustractionSeulementEtNonResultat,
      multiplicationSeulementEtNonResultat:
        options.multiplicationSeulementEtNonResultat,
      divisionSeulementEtNonResultat: options.divisionSeulementEtNonResultat,
    })
  }
  return value
}

type DndAnswer = {
  value?: string | string[]
  options?: { multi?: boolean }
}
export type DndValeur = Record<string, DndAnswer>

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null
}

export function toDndValeur(value: unknown): DndValeur {
  const out: DndValeur = {}
  if (!isRecord(value)) return out
  for (const [key, answer] of Object.entries(value)) {
    if (!/^rectangle\d+$/.test(key)) continue
    if (!isRecord(answer)) continue
    const normalized: DndAnswer = {}
    if (typeof answer.value === 'string' || Array.isArray(answer.value)) {
      normalized.value = answer.value
    }
    if (isRecord(answer.options) && 'multi' in answer.options) {
      if (typeof answer.options.multi === 'boolean') {
        normalized.options = { multi: answer.options.multi }
      }
    }
    out[key] = normalized
  }
  return out
}

export function ensureDragAndDropQuestion(
  exercice: IExercice,
  questionIndex: number,
): void {
  if (!Array.isArray(exercice.dragAndDrops)) {
    exercice.dragAndDrops = []
  }
  const existing = exercice.dragAndDrops[questionIndex]
  if (existing != null) {
    if (!Array.isArray(existing.listeners)) {
      existing.listeners = []
    }
    return
  }
  const fallback: IDragAndDrop = {
    exercice,
    question: questionIndex,
    consigne: '',
    etiquettes: [],
    enonceATrous: '',
    listeners: [],
    ajouteDragAndDrop() {
      return ''
    },
  }
  exercice.dragAndDrops[questionIndex] = fallback
}

export function normalizeCustomCorrectionResult(
  result: string | string[],
): boolean {
  if (Array.isArray(result)) {
    return result.every((value) => value === 'OK')
  }
  return result === 'OK'
}

export function extractPromptValuesForCustom(
  ac: AutoCorrection | undefined,
): Record<string, string> {
  const out: Record<string, string> = {}
  const valeur = ac?.reponse?.valeur
  if (!isRecord(valeur)) return out
  for (const [key, answer] of Object.entries(valeur)) {
    if (!/^champ\d+$/.test(key)) continue
    if (!isRecord(answer) || answer.value == null) continue
    out[key] = Array.isArray(answer.value)
      ? String(answer.value[0] ?? '')
      : String(answer.value)
  }
  return out
}

function extractPromptKeys(ac: AutoCorrection | undefined): string[] {
  const valeur = ac?.reponse?.valeur
  if (!isRecord(valeur)) return []
  return Object.keys(valeur).filter((key) => /^champ\d+$/.test(key))
}

function extractTargetProduct(text: string): number | null {
  const match = text.match(/(^|[^0-9])([0-9]{1,4})\s*=/)
  if (!match) return null
  const value = Number.parseInt(match[2], 10)
  return Number.isFinite(value) ? value : null
}

function findFactorPair(product: number): [number, number] | null {
  if (!Number.isInteger(product) || product < 4) return null
  for (let factor = 2; factor <= Math.floor(Math.sqrt(product)); factor++) {
    if (product % factor === 0) {
      return [factor, product / factor]
    }
  }
  return null
}

export function extractPromptValuesForCallbackQuestion(
  exercice: IExercice,
  questionIndex: number,
  ac: AutoCorrection | undefined,
): Record<string, string> {
  const promptValues = extractPromptValuesForCustom(ac)
  const promptKeys = extractPromptKeys(ac)
  if (promptKeys.length === 0) return promptValues

  const hasNonEmptyPromptValue = promptKeys.some((key) => {
    const value = promptValues[key]
    return typeof value === 'string' && value.trim() !== ''
  })
  if (hasNonEmptyPromptValue) return promptValues

  if (promptKeys.length !== 2) return {}
  const questionText = exercice.listeQuestions[questionIndex] ?? ''
  const correctionText = exercice.listeCorrections[questionIndex] ?? ''
  const targetProduct =
    extractTargetProduct(correctionText) ?? extractTargetProduct(questionText)
  if (targetProduct == null) return {}

  const pair = findFactorPair(targetProduct)
  if (pair == null) return {}

  return {
    [promptKeys[0]]: String(pair[0]),
    [promptKeys[1]]: String(pair[1]),
  }
}

export function extractClockValuesForCustom(
  ac: AutoCorrection | undefined,
): { hour: string; minute: string } | null {
  const valeur = ac?.reponse?.valeur
  if (!isRecord(valeur)) return null
  const answer = valeur.reponse
  if (!isRecord(answer)) return null
  const raw = answer.value
  const value = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')
  const match = value.match(/^(\d{1,2})h(\d{1,2})$/)
  if (!match) return null
  return { hour: match[1], minute: match[2] }
}
