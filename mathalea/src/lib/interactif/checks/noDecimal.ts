import type { Check, CheckOverrides } from './types'

const DECIMAL_NUMBER_PATTERN =
  /(?<![A-Za-z])[-+]?(?:\d+[.,]\d+|\d+[.,])(?:\\times10\^\{?-?\d+\}?)?/g
const NEGATIVE_POWER_OF_TEN_PATTERN = /10\^\{?-\d+\}?/

function hasForbiddenDecimal(value: string): boolean {
  if (NEGATIVE_POWER_OF_TEN_PATTERN.test(value)) return true
  for (const match of value.matchAll(DECIMAL_NUMBER_PATTERN)) {
    const [raw] = match
    const normalized = raw.replace(',', '.')
    const number = Number(
      normalized.replace(/\\times10\^\{?(-?\d+)\}?$/, 'e$1'),
    )
    if (!Number.isFinite(number)) return true
    if (!Number.isInteger(number)) return true
  }
  return false
}

export function noDecimal(options: CheckOverrides = {}): Check {
  return {
    name: options.name ?? 'noDecimal',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie) => {
      const passed = !hasForbiddenDecimal(saisie)
      return {
        passed,
        feedbackKo:
          options.feedbackKo ??
          "La réponse ne doit pas contenir d'écriture décimale.",
        feedbackOk: options.feedbackOk,
      }
    },
  }
}
