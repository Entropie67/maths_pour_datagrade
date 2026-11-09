import type { Check, CheckOverrides } from './types'

type Fraction = {
  numerator: number
  denominator: number
}

type ParsedLatexFraction = {
  numerator: string
  denominator: string
  end: number
}

function cleanBasic(value: string): string {
  return value.trim().replaceAll('−', '-').replace(/\s+/g, '')
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    ;[x, y] = [y, x % y]
  }
  return x
}

function normalizeSign(fraction: Fraction): Fraction {
  if (fraction.denominator < 0) {
    return {
      numerator: -fraction.numerator,
      denominator: -fraction.denominator,
    }
  }
  return fraction
}

function parseIntegerFraction(value: string): Fraction | undefined {
  const normalized = cleanBasic(value)
  const latex = normalized.match(
    /^(-?)\\[dtc]?frac\{(-?\d+)\}\{(-?\d+)\}$/,
  )
  if (latex != null) {
    const sign = latex[1] === '-' ? -1 : 1
    const denominator = Number(latex[3])
    if (denominator === 0) return undefined
    return normalizeSign({
      numerator: sign * Number(latex[2]),
      denominator,
    })
  }

  const shortLatex = normalized.match(
    /^(-?)\\[dtc]?frac([+-]?\d)([+-]?\d)(?!\d)$/,
  )
  if (shortLatex != null) {
    const sign = shortLatex[1] === '-' ? -1 : 1
    const denominator = Number(shortLatex[3])
    if (denominator === 0) return undefined
    return normalizeSign({
      numerator: sign * Number(shortLatex[2]),
      denominator,
    })
  }

  const slash = normalized.match(/^(-?\d+)\/(-?\d+)$/)
  if (slash != null) {
    const denominator = Number(slash[2])
    if (denominator === 0) return undefined
    return normalizeSign({
      numerator: Number(slash[1]),
      denominator,
    })
  }

  return undefined
}

function readBraceContent(value: string, start: number) {
  if (value[start] !== '{') return undefined
  let depth = 0
  for (let index = start; index < value.length; index++) {
    const character = value[index]
    if (character === '{') depth++
    if (character === '}') depth--
    if (depth === 0) {
      return {
        content: value.slice(start + 1, index),
        end: index + 1,
      }
    }
  }
  return undefined
}

function parseLatexFractionAt(
  value: string,
  start: number,
): ParsedLatexFraction | undefined {
  const command = value.slice(start).match(/^\\[dtc]?frac/)
  if (command == null) return undefined
  let index = start + command[0].length
  const numerator = readBraceContent(value, index)
  if (numerator == null) return undefined
  index = numerator.end
  const denominator = readBraceContent(value, index)
  if (denominator == null) return undefined
  return {
    numerator: numerator.content,
    denominator: denominator.content,
    end: denominator.end,
  }
}

function latexFractionDenominators(value: string): string[] {
  const denominators: string[] = []
  let index = 0
  while (index < value.length) {
    const parsed = parseLatexFractionAt(value, index)
    if (parsed == null) {
      index++
      continue
    }
    denominators.push(parsed.denominator)
    index = parsed.end
  }
  return denominators
}

function hasSquareRootInSlashDenominator(value: string): boolean {
  return /\/(?:\\sqrt|\([^)]*\\sqrt[^)]*\)|\{[^}]*\\sqrt[^}]*\})/.test(value)
}

function hasSquareRootInDenominator(value: string): boolean {
  const normalized = cleanBasic(value)
  return (
    latexFractionDenominators(normalized).some((denominator) =>
      denominator.includes('\\sqrt'),
    ) || hasSquareRootInSlashDenominator(normalized)
  )
}

export function noSquareRootInDenominator(
  options: CheckOverrides = {},
): Check {
  return {
    name: options.name ?? 'noSquareRootInDenominator',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie) => ({
      passed: !hasSquareRootInDenominator(saisie),
      feedbackKo:
        options.feedbackKo ??
        'Incorrect car la fraction possède une racine carrée au dénominateur.',
      feedbackOk: options.feedbackOk,
    }),
  }
}

export function fractionReducedFromExpected(
  options: CheckOverrides = {},
): Check {
  return {
    name: options.name ?? 'fractionReducedFromExpected',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie, answer) => {
      const input = parseIntegerFraction(saisie)
      const expected = parseIntegerFraction(answer)
      const expectedGcd =
        expected == null ? 0 : gcd(expected.numerator, expected.denominator)
      const quotient =
        input == null || expected == null || input.numerator === 0
          ? undefined
          : expected.numerator / input.numerator
      const passed =
        input !== undefined &&
        expected !== undefined &&
        expectedGcd > 1 &&
        input.numerator * expected.denominator ===
          expected.numerator * input.denominator &&
        quotient !== undefined &&
        quotient > 1 &&
        Number.isInteger(quotient) &&
        input.denominator * quotient === expected.denominator

      return {
        passed,
        feedbackKo:
          options.feedbackKo ??
          'Résultat incorrect car une fraction réduite est attendue.',
        feedbackOk: options.feedbackOk,
      }
    },
  }
}
