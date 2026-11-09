import { fonctionComparaison } from '../comparisonFunctions'
import { extraireRacineCarree } from '../../outils/calculs'
import type { Check, CheckOverrides } from './types'

const SQRT_INTEGER_PATTERN = /\\sqrt\{(\d+)\}|\\sqrt(\d+)/g

function hasUnextractedSquareFactor(value: string): boolean {
  for (const match of value.matchAll(SQRT_INTEGER_PATTERN)) {
    const radicand = Number(match[1] ?? match[2])
    if (!Number.isInteger(radicand) || radicand < 0) continue
    const [outside] = extraireRacineCarree(radicand)
    if (outside !== 1) return true
  }
  return false
}

export function extractedRadicands(options: CheckOverrides = {}): Check {
  return {
    name: options.name ?? 'extractedRadicands',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie, answer) => {
      const equality = fonctionComparaison(saisie, answer)
      if (!equality.isOk) {
        return {
          passed: false,
          feedbackKo:
            options.feedbackKo ||
            equality.feedback ||
            'Le résultat est incorrect.',
          feedbackOk: options.feedbackOk,
        }
      }

      const passed = !hasUnextractedSquareFactor(saisie)
      return {
        passed,
        feedbackKo:
          options.feedbackKo ??
          'Les facteurs carrés doivent être extraits des racines carrées.',
        feedbackOk: options.feedbackOk,
      }
    },
  }
}
