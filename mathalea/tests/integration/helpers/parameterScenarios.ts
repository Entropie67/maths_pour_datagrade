import type { IExercice } from '../../../src/lib/types'

export type ParamTestLevel = 'default' | 'single' | 'full'

type SupKey = 'sup' | 'sup2' | 'sup3' | 'sup4' | 'sup5'
type ParamKind = 'check' | 'num' | 'num-select' | 'text'

type ParamSup = {
  key: SupKey
  kind: ParamKind
  defaultValue: string | undefined
  values: (string | undefined)[]
}

export interface ParamScenario {
  label: string
  overrides: Partial<Record<SupKey, string | undefined>>
}

const SUP_KEYS: SupKey[] = ['sup', 'sup2', 'sup3', 'sup4', 'sup5']
const DEFAULT_PARAM_MAX_SCENARIOS = 40

function normalizeLevel(raw?: string): string {
  return (raw ?? '').trim().toLowerCase()
}

export function resolveParamTestLevel(raw?: string): ParamTestLevel {
  const level = normalizeLevel(raw)
  if (level === 'single' || level === 'full' || level === 'default') {
    return level
  }
  return 'default'
}

function supSuffix(key: SupKey): '' | '2' | '3' | '4' | '5' {
  switch (key) {
    case 'sup':
      return ''
    case 'sup2':
      return '2'
    case 'sup3':
      return '3'
    case 'sup4':
      return '4'
    case 'sup5':
      return '5'
  }
}

function dedupeValues(values: (string | undefined)[]): (string | undefined)[] {
  const result: (string | undefined)[] = []
  for (const value of values) {
    if (result.some((existing) => Object.is(existing, value))) continue
    result.push(value)
  }
  return result
}

function toSafeString(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (value == null) return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function numericCandidates(defaultValue: unknown, maxRaw: unknown): number[] {
  const max = Number(maxRaw)
  if (!Number.isFinite(max) || max < 1) {
    const fallback = Number(defaultValue)
    return [Number.isFinite(fallback) ? fallback : 1]
  }

  const d = Number(defaultValue)
  const base = Number.isFinite(d) ? Math.min(Math.max(d, 1), max) : 1
  const mid = Math.min(max, Math.max(1, base === 1 ? 2 : base))
  return Array.from(new Set([base, 1, mid, max]))
}

function textCandidatesFromLabel(label: string): string[] {
  const numbers = (label.match(/\d+/g) ?? []).map(Number)
  const uniqueNumbers = Array.from(new Set(numbers))
  if (uniqueNumbers.length === 0) return []
  return [uniqueNumbers.map((n) => String(n)).join('-')]
}

function selectCandidates(
  defaultValue: unknown,
  tooltipRaw: unknown,
): number[] {
  const tooltip = String(tooltipRaw ?? '')
  const options = tooltip
    .split('\n')
    .map((x) => x.trim())
    .filter((x) => x.length > 0)

  const total = options.length
  if (total < 1) {
    const d = Number(defaultValue)
    return [Number.isFinite(d) ? d : 1]
  }

  const defaultNum = Number(defaultValue)
  const normalizedDefault =
    Number.isFinite(defaultNum) && defaultNum >= 1 && defaultNum <= total
      ? defaultNum
      : 1

  const indexes = Array.from({ length: total }, (_, i) => i + 1)
  return Array.from(new Set([normalizedDefault, ...indexes]))
}

function discoverSup(exercice: IExercice, key: SupKey): ParamSup | null {
  const suffix = supSuffix(key)
  const defaultValue = exercice[key]

  const checkDecl = exercice[`besoinFormulaire${suffix}CaseACocher`]
  if (checkDecl) {
    return {
      key,
      kind: 'check',
      defaultValue,
      values: dedupeValues([defaultValue, false, true]),
    }
  }

  const numericDecl = exercice[`besoinFormulaire${suffix}Numerique`]
  if (Array.isArray(numericDecl) && numericDecl.length > 0) {
    if (numericDecl.length === 2) {
      const maxRaw = numericDecl[1]
      return {
        key,
        kind: 'num',
        defaultValue,
        values: dedupeValues([
          defaultValue,
          ...numericCandidates(defaultValue, maxRaw),
        ]),
      }
    }
    if (numericDecl.length === 3) {
      const tooltipRaw = numericDecl[2]
      return {
        key,
        kind: 'num-select',
        defaultValue,
        values: dedupeValues([
          defaultValue,
          ...selectCandidates(defaultValue, tooltipRaw),
        ]),
      }
    }
  }

  const textDecl = exercice[`besoinFormulaire${suffix}Texte`]
  if (Array.isArray(textDecl) && textDecl.length > 0) {
    const label = textDecl[1]
    return {
      key,
      kind: 'text',
      defaultValue,
      values: dedupeValues([defaultValue, ...textCandidatesFromLabel(label)]),
    }
  }

  return null
}

function discoverSups(exercice: IExercice): ParamSup[] {
  const sups: ParamSup[] = []
  for (const key of SUP_KEYS) {
    const sup = discoverSup(exercice, key)
    if (sup && sup.values.length > 0) {
      sups.push(sup)
    }
  }
  return sups
}

function cartesianWithCap<T>(lists: T[][], cap: number): T[][] {
  if (lists.length === 0) return [[]]
  let acc: T[][] = [[]]
  for (const list of lists) {
    const next: T[][] = []
    for (const prefix of acc) {
      for (const value of list) {
        next.push([...prefix, value])
        if (next.length >= cap) return next
      }
    }
    acc = next
    if (acc.length >= cap) return acc.slice(0, cap)
  }
  return acc
}

function buildSingleScenarios(sups: ParamSup[]): ParamScenario[] {
  const scenarios: ParamScenario[] = [{ label: 'default', overrides: {} }]

  for (const sup of sups) {
    for (const value of sup.values) {
      if (Object.is(value, sup.defaultValue)) continue
      scenarios.push({
        label: `s${supSuffix(sup.key)}=${toSafeString(value)}`,
        overrides: { [sup.key]: value },
      })
    }
  }

  return scenarios
}

function getScenarioCap(): number {
  const raw = process.env.TEST_PARAM_MAX
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_PARAM_MAX_SCENARIOS
  return Math.floor(parsed)
}

function buildFullScenarios(sups: ParamSup[]): ParamScenario[] {
  if (sups.length === 0) {
    return [{ label: 'default', overrides: {} }]
  }

  const cap = getScenarioCap()
  const tuples = cartesianWithCap(
    sups.map((sup) => sup.values),
    cap,
  )
  const scenarios = tuples.map((tuple) => {
    const overrides: Partial<Record<SupKey, string | undefined>> = {}
    const labelParts: string[] = []

    for (let i = 0; i < sups.length; i++) {
      const sup = sups[i]
      const value = i < tuple.length ? tuple[i] : sup.defaultValue
      if (!Object.is(value, sup.defaultValue)) {
        overrides[sup.key] = value
        labelParts.push(`s${supSuffix(sup.key)}=${toSafeString(value)}`)
      }
    }

    return {
      label: labelParts.length > 0 ? labelParts.join('&') : 'default',
      overrides,
    }
  })

  return scenarios
}

export function buildParamScenarios(
  exercice: IExercice,
  level: ParamTestLevel,
): ParamScenario[] {
  if (level === 'default') {
    return [{ label: 'default', overrides: {} }]
  }

  const sups = discoverSups(exercice)
  if (level === 'single') {
    return buildSingleScenarios(sups)
  }

  return buildFullScenarios(sups)
}
