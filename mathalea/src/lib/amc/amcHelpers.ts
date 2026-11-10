import FractionEtendue from '../../modules/FractionEtendue'
import { lettreDepuisChiffre } from '../outils/outilString'
import type { IExercice } from '../types'
import type {
  AMCFractionValue,
  AMCReponseValue,
  ReponseParams,
} from './amcTypes'
/**
 * @author Jean-claude Lhote
 */
export function ensureAmcParam(exerciseAny: IExercice, i: number) {
  let autoCorrectionAMC = exerciseAny.autoCorrectionAMC
  if (!Array.isArray(autoCorrectionAMC)) {
    autoCorrectionAMC = []
  }
  if (autoCorrectionAMC[i] == null) {
    autoCorrectionAMC[i] = {}
  }
  if (autoCorrectionAMC[i].reponse == null) {
    autoCorrectionAMC[i].reponse = {}
  }
  if (autoCorrectionAMC[i].reponse?.param == null) {
    autoCorrectionAMC[i].reponse.param = {}
  }
  return autoCorrectionAMC[i].reponse.param
}

export function buildAMCId(
  ref: string,
  exoIndex: number,
  qIndex: number,
): string {
  return `${ref}/${lettreDepuisChiffre(exoIndex + 1)}-${qIndex + 10}`
}

export function createIdGenerator(ref: string, idExo: number) {
  let counter = 0

  return () => {
    const id = buildAMCId(ref, idExo, counter)
    counter++
    return id
  }
}

export function countDecimals(value: number): number {
  if (!Number.isFinite(value)) return 0

  const rounded = Number(value.toFixed(10))
  const s = rounded.toString()

  if (s.includes('e-')) {
    const [, exp] = s.split('e-')
    return parseInt(exp, 10)
  }

  const parts = s.split('.')
  return parts[1] ? parts[1].length : 0
}

export function countDigits(n: number): number {
  return Math.abs(Math.trunc(n)).toString().length
}

export function normalizeTexte(s: string): string {
  return s.replace(/\s+/g, ' ').trim().toLowerCase()
}

export function isFractionValue(value: unknown): value is AMCFractionValue {
  return (
    (typeof value === 'object' &&
      value !== null &&
      typeof (value as AMCFractionValue).num === 'number' &&
      typeof (value as AMCFractionValue).den === 'number') ||
    (typeof value === 'string' &&
      value.match(/^\s*-?\+?(\\frac|\\dfrac)/) !== null)
  )
}

export function getDecimalValue(value: AMCReponseValue | undefined): number {
  if (typeof value === 'number') return value
  if (
    typeof value === 'object' &&
    value !== null &&
    'valeurDecimale' in value &&
    typeof value.valeurDecimale === 'number'
  ) {
    return value.valeurDecimale
  }
  return 0
}

export function computeDecimalAMC(rep?: {
  valeur?: AMCReponseValue | AMCReponseValue[]
  param?: ReponseParams
}) {
  const rawValue = Array.isArray(rep?.valeur) ? rep?.valeur[0] : rep?.valeur
  let value = getDecimalValue(rawValue)
  const param = rep?.param ?? {}
  let decimals = Math.max(countDecimals(value), param.decimals ?? 0)
  let approx: number
  const alsocorrect =
    param.aussiCorrect instanceof FractionEtendue
      ? param.aussiCorrect.valeurDecimale
      : Number(param.aussiCorrect)

  if (param.milieuIntervalle !== undefined) {
    const target = param.milieuIntervalle
    const delta = target - value
    const deltaDecimals = countDecimals(delta)

    decimals = Math.max(decimals, deltaDecimals)

    const scale = 10 ** decimals
    value = target

    if (param.approx === 'intervalleStrict') {
      approx = Math.round(delta * scale) - 1
    } else {
      approx = Math.round(delta * scale)
    }
  } else {
    approx = Number(param.approx) || 0
  }

  return {
    value,
    decimals,
    approx,
    alsocorrect,
  }
}

export function asArrayValue<T>(v: T | T[] | undefined): T[] {
  if (v === undefined) return []
  return Array.isArray(v) ? v : [v]
}

export function isHybridFraction(
  value: unknown,
): value is { num: number; den: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { num?: unknown }).num === 'number' &&
    typeof (value as { den?: unknown }).den === 'number'
  )
}
