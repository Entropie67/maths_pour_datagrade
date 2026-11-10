import { estPremier } from '../../outils/primalite'
import type { Check, CheckOverrides } from './types'

/**
 * Analyse un produit d'entiers au format LaTeX : `2^{3}\times 3\times(5\times7)`.
 * Seuls la multiplication, les puissances d'exposant entier et les parenthèses
 * sont acceptés. Renvoie les bases entières rencontrées, ou `null` si la saisie
 * n'est pas un produit.
 */
function basesDuProduit(saisie: string): number[] | null {
  const texte = saisie
    .replace(/\\left|\\right|\\[,;:! ]|\s/g, '')
    .replace(/\\times|\\cdot|\*/g, '*')
  const bases: number[] = []
  let position = 0

  const entier = (): number | null => {
    const correspondance = /^\d+/.exec(texte.slice(position))
    if (correspondance == null) return null
    position += correspondance[0].length
    return Number(correspondance[0])
  }

  const exposant = (): boolean => {
    if (texte[position] !== '^') return true
    position++
    if (texte[position] === '{') {
      position++
      if (entier() == null || texte[position] !== '}') return false
      position++
      return true
    }
    return /^\d/.test(texte[position] ?? '') && entier() != null
  }

  const facteur = (): boolean => {
    if (texte[position] === '(') {
      position++
      if (!produit() || texte[position] !== ')') return false
      position++
      return exposant()
    }
    const base = entier()
    if (base == null) return false
    bases.push(base)
    return exposant()
  }

  const produit = (): boolean => {
    if (!facteur()) return false
    while (texte[position] === '*') {
      position++
      if (!facteur()) return false
    }
    return true
  }

  return produit() && position === texte.length ? bases : null
}

/**
 * La saisie est uniquement un produit d'entiers : `90`, `9\times10`,
 * `2\times3^{2}\times5`. Toute addition, soustraction, division ou fraction
 * est refusée. La valeur n'est pas vérifiée : combiner avec `isEqual`.
 */
export function onlyProduct(options: CheckOverrides = {}): Check {
  return {
    name: options.name ?? 'onlyProduct',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie) => ({
      passed: basesDuProduit(saisie) != null,
      feedbackKo:
        options.feedbackKo ??
        'Seules des multiplications sont attendues, sans addition ni soustraction.',
      feedbackOk: options.feedbackOk,
    }),
  }
}

/**
 * La saisie est un produit de facteurs premiers, avec ou sans puissances :
 * `2^{3}\times3^{2}\times5` et `2\times2\times3` sont acceptés ; `4\times3`,
 * `12` et `2+3` sont refusés. La valeur n'est pas vérifiée : combiner avec
 * `isEqual`.
 */
export function isPrimeFactorization(options: CheckOverrides = {}): Check {
  return {
    name: options.name ?? 'isPrimeFactorization',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie) => {
      const bases = basesDuProduit(saisie)
      return {
        passed: bases != null && bases.every((base) => estPremier(base)),
        feedbackKo:
          options.feedbackKo ??
          'La réponse doit être un produit de facteurs premiers.',
        feedbackOk: options.feedbackOk,
      }
    },
  }
}
