import type { Check, StringEqualsOptions } from './types'

function normalize(value: string, options: StringEqualsOptions): string {
  let normalized = value
  if (options.ignoreLatexText) {
    normalized = normalized
      .replace(/\\(?:text|mathrm)\{([^{}]*)\}/g, '$1')
      .replace(/\s+/g, ' ')
  }
  if (options.ignoreLatexDelimiters)
    normalized = normalized.replace(/[${}\\]/g, '')
  if (options.trim) normalized = normalized.trim()
  if (options.ignoreCase) normalized = normalized.toLowerCase()
  return normalized
}

export function stringEquals(options: StringEqualsOptions = {}): Check {
  return {
    name: options.name ?? 'stringEquals',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie, answer) => {
      const passed = normalize(saisie, options) === normalize(answer, options)
      return {
        passed,
        feedbackKo:
          options.feedbackKo ??
          'Le texte saisi ne correspond pas à la réponse attendue.',
        feedbackOk: options.feedbackOk,
      }
    },
  }
}

export function stringComparison(options: StringEqualsOptions = {}): Check {
  return stringEquals({
    ...options,
    name: options.name ?? 'stringComparison',
  })
}
