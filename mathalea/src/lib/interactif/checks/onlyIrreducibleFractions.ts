import type { Check, CheckOverrides } from './types'

const FRACTION_PATTERNS = [
  /([+-]?)\\[dtc]?frac\{([+-]?\d+)\}\{([+-]?\d+)\}/g,
  // MathLive omits braces when both numerator and denominator are single digits: \frac24
  /([+-]?)\\[dtc]?frac([+-]?\d)([+-]?\d)(?!\d)/g,
  /(?<![\w}])([+-]?\d+)\/([+-]?\d+)(?![\w{])/g,
]

function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    const r = x % y
    x = y
    y = r
  }
  return x
}

function hasReducibleFraction(value: string): boolean {
  const normalized = value.replace(/\s+/g, '')
  for (const pattern of FRACTION_PATTERNS) {
    pattern.lastIndex = 0
    for (const match of normalized.matchAll(pattern)) {
      const hasLatexLeadingSign = match.length === 4
      const numerator = Number(match[hasLatexLeadingSign ? 2 : 1])
      const denominator = Number(match[hasLatexLeadingSign ? 3 : 2])
      if (denominator === 0) continue
      if (gcd(numerator, denominator) !== 1) return true
    }
  }
  return false
}

export function onlyIrreducibleFractions(options: CheckOverrides = {}): Check {
  return {
    name: options.name ?? 'onlyIrreducibleFractions',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie) => {
      const passed = !hasReducibleFraction(saisie)
      return {
        passed,
        feedbackKo:
          options.feedbackKo ??
          'Résultat incorrect car une fraction irréductible est attendue.',
        feedbackOk: options.feedbackOk,
      }
    },
  }
}
