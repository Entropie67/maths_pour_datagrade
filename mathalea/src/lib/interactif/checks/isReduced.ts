import { all } from './combinators'
import {
  isDistributed,
  noNumericComputation,
  noTrivialFactor,
  termsGrouped,
} from './reductionAtoms'
import type { Check, CheckOverrides } from './types'

type IsReducedOptions = CheckOverrides & {
  allowReducibleFractions?: boolean
}

export function isReduced(options: IsReducedOptions = {}): Check {
  const compare = all([
    noTrivialFactor(),
    noNumericComputation({
      allowReducibleFractions: options.allowReducibleFractions,
    }),
    termsGrouped(),
    isDistributed(),
  ])

  return {
    name: options.name ?? 'isReduced',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie) => {
      const result = compare(saisie, saisie)
      return {
        passed: result.isOk,
        // || et non ?? : le feedback des sous-checks vaut '' quand aucun n'en donne
        feedbackKo:
          options.feedbackKo ||
          result.feedback ||
          "Cette expression n'est pas assez réduite.",
        feedbackOk: options.feedbackOk,
      }
    },
  }
}
