import type { Check, CheckOverrides } from './types'

/**
 * Quand la réponse attendue est un entier, une racine carrée qui vaut cet
 * entier est refusée : il faut écrire l'entier. Ce contrôle suppose que la
 * valeur est juste, à combiner avec `isEqual` avant lui.
 */
export function noRadicalForInteger(options: CheckOverrides = {}): Check {
  return {
    name: options.name ?? 'noRadicalForInteger',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie, answer) => {
      const passed = !(/^\d+$/.test(answer) && saisie.includes('\\sqrt'))
      return {
        passed,
        feedbackKo:
          options.feedbackKo ??
          `La valeur est juste, mais cette racine carrée est un nombre entier : il faut écrire $${answer}$.`,
        feedbackOk: options.feedbackOk,
      }
    },
  }
}
