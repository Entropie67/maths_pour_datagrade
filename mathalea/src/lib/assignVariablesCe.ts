import ce from './interactif/comparisonFunctions'

/**
 * Substitue les variables dans une expression LaTeX à l'aide du ComputeEngine de cortex-js
 * @param {string} expression - Expression LaTeX, ex : 'a\\times x+b'
 * @param {Variables} variables - Objet associant les noms de variables à leur valeur
 * @returns {string} - Expression LaTeX avec les variables substituées
 */
export function assignVariablesCe(
  expression: string,
  variables: Record<string, any>,
  options?: {
    invisibleMultiply?: string
    multiplySymbol?: string
    divideSymbol?: string
    divideToFraction?: boolean
  },
  // @todo faire en sorte de gérer ces options et que cela fonctionne !
): string {
  const expr = ce.parse(expression, { form: 'raw' })
  if (!expr) return expression

  // Substitution des variables (assurez-vous de conserver leur forme sous forme de nombre)
  const subs: Record<string, number | string> = {}
  for (const [key, value] of Object.entries(variables)) {
    if (typeof value === 'number' || typeof value === 'string') {
      subs[key] = value
    } else if (typeof value === 'object' && value !== null && 'n' in value) {
      subs[key] = `${(value as any).n} / ${(value as any).d}`
    }
  }

  // Substitution sans simplification implicite
  const substituted = expr.subs(subs, { canonical: false })

  // Utilisation de `toLatex` pour afficher la multiplication explicitement
  if (typeof substituted.toLatex === 'function') {
    return substituted.toLatex({
      canonical: false,
      invisibleMultiply: options?.invisibleMultiply ?? '',
      multiply: options?.multiplySymbol ?? '\\times',
    })
  }
  return substituted.toString()
}
