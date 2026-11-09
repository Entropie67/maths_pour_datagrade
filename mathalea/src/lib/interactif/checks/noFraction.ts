import type { Check, CheckOverrides } from './types'

const FRACTION_PATTERN = /\\[dt]?frac|\\div|\//

/**
 * La saisie ne contient aucun trait de fraction : `\frac`, `\dfrac`, `\tfrac`,
 * `\div` ou `/`. Utile quand la réponse doit s'écrire sans fraction, comme
 * une factorisation dont les facteurs ne doivent pas contenir de fraction.
 * Combiner avec un contrôle de valeur, par exemple `isEqual`.
 */
export function noFraction(options: CheckOverrides = {}): Check {
  return {
    name: options.name ?? 'noFraction',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie) => ({
      passed: !FRACTION_PATTERN.test(saisie),
      feedbackKo:
        options.feedbackKo ?? 'Il ne doit plus rester de trait de fraction.',
      feedbackOk: options.feedbackOk,
    }),
  }
}
