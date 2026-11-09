import type { Check, CheckOverrides } from './types'

type ContainsOptions = CheckOverrides & {
  pattern: string | RegExp
}

function testPattern(pattern: string | RegExp, value: string): boolean {
  if (typeof pattern === 'string') return value.includes(pattern)
  pattern.lastIndex = 0
  return pattern.test(value)
}

export function contains(
  patternOrOptions: string | RegExp | ContainsOptions,
): Check {
  const options =
    typeof patternOrOptions === 'string' || patternOrOptions instanceof RegExp
      ? { pattern: patternOrOptions }
      : patternOrOptions

  return {
    name: options.name ?? 'contains',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie) => {
      const passed = testPattern(options.pattern, saisie)
      return {
        passed,
        feedbackKo:
          options.feedbackKo ?? 'La réponse ne contient pas la forme attendue.',
        feedbackOk: options.feedbackOk,
      }
    },
  }
}
