import type { Check, CheckOverrides } from './types'

/**
 * Lit le signe saisi : `<`, `>`, `\leq`, `\geq`, `≤`, `≥`, `<=` et `>=` sont
 * acceptés. Renvoie `''` si la saisie n'est pas un signe de comparaison.
 */
function signeSaisi(saisie: string): '<' | '>' | '' {
  const saisieNormalisee = saisie
    .replace(/\s/g, '')
    .replace(/[$]/g, '')
    .replace(/[{}]/g, '')
    .replace(/\\(?:geqslant|geq|ge)/g, '>')
    .replace(/\\(?:leqslant|leq|le)/g, '<')
    .replace(/[≥⩾]/g, '>')
    .replace(/[≤⩽]/g, '<')
    .replace(/>=/g, '>')
    .replace(/<=/g, '<')

  if (saisieNormalisee === '>' || saisieNormalisee === '<') {
    return saisieNormalisee
  }
  return ''
}

/**
 * La saisie est le signe de comparaison attendu, `<` ou `>`, à la place de la
 * réponse attendue. Les écritures `\leq`, `\geq`, `≤`, `≥`, `<=` et `>=` sont
 * acceptées. Une saisie qui n'est pas un signe est refusée.
 */
export function sameComparisonSign(options: CheckOverrides = {}): Check {
  return {
    name: options.name ?? 'sameComparisonSign',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie, answer) => ({
      passed: signeSaisi(saisie) === answer,
      feedbackKo:
        options.feedbackKo ?? 'Écrire le signe de comparaison attendu.',
      feedbackOk: options.feedbackOk,
    }),
  }
}
