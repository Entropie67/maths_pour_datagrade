import { fonctionComparaison } from '../comparisonFunctions'
import type { OptionsComparaisonType } from '../../types'
import type { Check, CheckOverrides } from './types'

export function fromOptions(
  opts: OptionsComparaisonType,
  overrides: CheckOverrides = {},
): Check {
  return {
    name: overrides.name ?? 'fromOptions',
    weight: overrides.weight,
    feedbackEnabled: overrides.feedbackEnabled,
    feedbackOnSuccess: overrides.feedbackOnSuccess,
    run: (saisie, answer) => {
      const result = fonctionComparaison(saisie, answer, opts)
      return {
        passed: result.isOk,
        feedbackKo: overrides.feedbackKo ?? result.feedback ?? '',
        feedbackOk: overrides.feedbackOk,
      }
    },
  }
}
