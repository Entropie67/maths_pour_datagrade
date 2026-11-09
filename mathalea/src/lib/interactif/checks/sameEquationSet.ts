import { areEquivalentRealEquationStrings } from './equationChecks'
import type { Check, CheckOverrides, CheckResult } from './types'

/** Écritures acceptées pour « aucune équation ». */
const EMPTY = new Set(['\\emptyset', '\\varnothing', '\\{\\}', '∅', 'aucune'])

/**
 * Découpe une liste d'équations ou de valeurs séparées par des points-virgules,
 * entourée ou non d'accolades. Renvoie une liste vide pour l'ensemble vide.
 */
export function splitList(value: string): string[] {
  let text = value
    .replaceAll('\\left', '')
    .replaceAll('\\right', '')
    .replaceAll(/\\[,;:! ]/g, '')
    .replaceAll(/\s/g, '')
  if (EMPTY.has(text) || EMPTY.has(text.toLowerCase())) return []
  if (text.startsWith('\\{') && text.endsWith('\\}')) text = text.slice(2, -2)
  return text.split(';').filter((part) => part !== '')
}

/**
 * Même ensemble d'équations, sans tenir compte de l'ordre : chaque équation
 * saisie doit être équivalente à une équation attendue différente. Utile pour
 * les équations des asymptotes d'une courbe (`x=2;y=0`, ou `\emptyset`).
 */
export function sameEquationSet(options: CheckOverrides = {}): Check {
  return {
    name: options.name ?? 'sameEquationSet',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie, answer) => {
      const input = splitList(saisie)
      const expected = splitList(answer)
      if (input.some((equation) => equation.split('=').length !== 2)) {
        return {
          passed: false,
          feedbackKo:
            'Séparer les équations par des points-virgules, par exemple $x=2;y=1$.',
        }
      }
      if (input.length !== expected.length) {
        return {
          passed: false,
          feedbackKo:
            options.feedbackKo ??
            (input.length < expected.length
              ? 'Il manque au moins une équation.'
              : 'Il y a trop d’équations.'),
        }
      }
      const unmatched = [...expected]
      const passed = input.every((equation) => {
        const index = unmatched.findIndex((candidate) =>
          areEquivalentRealEquationStrings(equation, candidate),
        )
        if (index === -1) return false
        unmatched.splice(index, 1)
        return true
      })
      return {
        passed,
        feedbackKo:
          options.feedbackKo ?? 'Au moins une équation est incorrecte.',
        feedbackOk: options.feedbackOk,
      }
    },
  }
}

/**
 * Compare deux listes sans tenir compte de l'ordre : chaque élément saisi doit
 * correspondre à un élément attendu différent.
 */
export function compareLists(
  input: string[],
  expected: string[],
  same: (a: string, b: string) => boolean,
  options: CheckOverrides,
  [manque, trop, incorrect]: [string, string, string],
): CheckResult {
  if (input.length !== expected.length) {
    return {
      passed: false,
      feedbackKo:
        options.feedbackKo ?? (input.length < expected.length ? manque : trop),
    }
  }
  const unmatched = [...expected]
  const passed = input.every((element) => {
    const index = unmatched.findIndex((candidate) => same(element, candidate))
    if (index === -1) return false
    unmatched.splice(index, 1)
    return true
  })
  return {
    passed,
    feedbackKo: options.feedbackKo ?? incorrect,
    feedbackOk: options.feedbackOk,
  }
}
