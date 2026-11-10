import type { Check, CheckOverrides } from './types'

type DoesNotContainOptions = CheckOverrides & {
  pattern: string | RegExp
}

function testPattern(pattern: string | RegExp, value: string): boolean {
  if (typeof pattern === 'string') return value.includes(pattern)
  pattern.lastIndex = 0
  return pattern.test(value)
}

export function doesNotContain(
  patternOrOptions: string | RegExp | DoesNotContainOptions,
): Check {
  const options =
    typeof patternOrOptions === 'string' || patternOrOptions instanceof RegExp
      ? { pattern: patternOrOptions }
      : patternOrOptions

  return {
    name: options.name ?? 'doesNotContain',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie) => {
      const passed = !testPattern(options.pattern, saisie)
      return {
        passed,
        feedbackKo:
          options.feedbackKo ?? 'La réponse contient une forme non attendue.',
        feedbackOk: options.feedbackOk,
      }
    },
  }
}
