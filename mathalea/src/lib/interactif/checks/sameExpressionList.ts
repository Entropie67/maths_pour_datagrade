import { isEqual } from './isEqual'
import { compareLists, splitList } from './sameEquationSet'
import type { Check, CheckOverrides } from './types'

/**
 * Même liste de valeurs, séparées par des points-virgules, sans tenir compte
 * de l'ordre. Chaque valeur est comparée avec `isEqual`, si bien que les
 * écritures exactes avec `\ln`, `\mathrm{e}` ou des racines sont acceptées
 * (`\sqrt{\mathrm{e}}` pour `\mathrm{e}^{1/2}`).
 */
export function sameExpressionList(options: CheckOverrides = {}): Check {
  const equal = isEqual()
  return {
    name: options.name ?? 'sameExpressionList',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie, answer) =>
      compareLists(
        splitList(saisie),
        splitList(answer),
        (a, b) => equal.run(a, b).passed,
        options,
        [
          'Il manque au moins une valeur.',
          'Il y a trop de valeurs.',
          'Au moins une valeur est incorrecte.',
        ],
      ),
  }
}
