import type { Check, Comparator, CompareResult } from './types'

const WEIGHT_SUM_TOLERANCE = 1e-12

function assertUniqueNames(checks: Check[]) {
  const names = new Set<string>()
  for (const check of checks) {
    if (names.has(check.name)) {
      throw new Error(`Duplicate check name "${check.name}" in comparator.`)
    }
    names.add(check.name)
  }
}

function assertWeights(checks: Check[]) {
  const weighted = checks.filter((check) => check.weight !== undefined)
  if (weighted.length === 0) return
  if (weighted.length !== checks.length) {
    throw new Error('Either all checks define weights or none of them do.')
  }
  const sum = checks.reduce((total, check) => total + (check.weight ?? 0), 0)
  if (Math.abs(sum - 1) > WEIGHT_SUM_TOLERANCE) {
    throw new Error(`Weighted checks must sum to 1, got ${sum}.`)
  }
}

function assertChecks(checks: Check[]) {
  assertUniqueNames(checks)
  assertWeights(checks)
}

function feedbackFor(
  isOk: boolean,
  results: Array<{ check: Check; passed: boolean; feedback?: string }>,
): string {
  return results
    .filter(({ check, passed }) => !isOk || !passed || check.feedbackOnSuccess)
    .filter(({ check }) => check.feedbackEnabled !== false)
    .map(({ feedback }) => feedback)
    .filter((message): message is string => message != null && message !== '')
    .join('\n')
}

export function all(checks: Check[]): Comparator {
  assertChecks(checks)

  const comparator = ((saisie: string, answer: string): CompareResult => {
    const weighted = checks.some((check) => check.weight !== undefined)
    const results = checks.map((check) => {
      const result = check.run(saisie, answer)
      return {
        check,
        passed: result.passed,
        feedback: result.passed ? result.feedbackOk : result.feedbackKo,
      }
    })
    const isOk = results.every((result) => result.passed)
    const score = weighted
      ? results.reduce(
          (total, result) =>
            total + (result.passed ? (result.check.weight ?? 0) : 0),
          0,
        )
      : isOk
        ? 1
        : 0

    return {
      isOk,
      score,
      feedback: feedbackFor(isOk, results),
      details: results.map((result) => ({
        name: result.check.name,
        passed: result.passed,
      })),
    }
  }) as Comparator

  comparator.kind = 'all'
  comparator.checks = checks
  return comparator
}

export function seq(checks: Check[]): Comparator {
  assertChecks(checks)

  const comparator = ((saisie: string, answer: string): CompareResult => {
    const results: Array<{
      check: Check
      passed: boolean
      feedback?: string
    }> = []

    for (const check of checks) {
      const result = check.run(saisie, answer)
      results.push({
        check,
        passed: result.passed,
        feedback: result.passed ? result.feedbackOk : result.feedbackKo,
      })
      if (!result.passed) break
    }

    const isOk =
      results.length === checks.length && results.every((r) => r.passed)
    const weighted = checks.some((check) => check.weight !== undefined)
    const score = weighted
      ? results.reduce(
          (total, result) =>
            total + (result.passed ? (result.check.weight ?? 0) : 0),
          0,
        )
      : isOk
        ? 1
        : 0

    return {
      isOk,
      score,
      feedback: feedbackFor(isOk, results),
      details: results.map((result) => ({
        name: result.check.name,
        passed: result.passed,
      })),
    }
  }) as Comparator

  comparator.kind = 'seq'
  comparator.checks = checks
  return comparator
}
