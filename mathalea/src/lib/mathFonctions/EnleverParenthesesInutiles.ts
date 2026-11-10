/**
 * Supprime les parenthèses inutiles dans du LaTeX tout en conservant :
 * - (-x) après +, -, \times ou \div
 * - Les fractions et nombres négatifs correctement
 *
 * Exemples :
 *  deparenthise('\\dfrac{(+4)}{(-8)}')
 *    -> '\\dfrac{4}{-8}'
 *  deparenthise('$ … + (-3,3) = (+5,6) $')
 *    -> '$ … + (-3,3) = 5,6 $'
 *  deparenthise('2 \\times (-3)')
 *    -> '2 \\times (-3)'
 */
export function deparenthise(latexIn: string): string {
  let result = ''
  let i = 0

  while (i < latexIn.length) {
    // Détecte (+...) ou (-...) parenthèse ouvrante suivie d'un signe
    if (
      latexIn[i] === '(' &&
      (latexIn[i + 1] === '+' || latexIn[i + 1] === '-')
    ) {
      const sign = latexIn[i + 1] // '+' ou '-'
      let j = i + 2
      let depth = 1

      // Trouver la parenthèse fermante correspondante
      while (j < latexIn.length && depth > 0) {
        if (latexIn[j] === '(') depth++
        else if (latexIn[j] === ')') depth--
        j++
      }

      const content = latexIn.slice(i + 2, j - 1) // contenu à l'intérieur des parenthèses

      // Chercher le dernier caractère significatif avant '('
      let k = result.length - 1
      while (k >= 0 && result[k] === ' ') k--
      const prev = k >= 0 ? result[k] : '<<START>>'

      if (sign === '+') {
        // (+x) -> on supprime toujours les parenthèses
        result += content
      } else {
        // (-x) -> on garde les parenthèses si précédé de +, -, \ ou on supprime sinon
        if (prev === '+' || prev === '-' || prev === '\\') {
          result += `(-${content})` // garde les parenthèses
        } else if (
          result.slice(k - 4, k + 1) === 'times' ||
          result.slice(k - 2, k + 1) === 'div'
        ) {
          result += `(-${content})` // garde les parenthèses
        } else {
          result += `-${content}` // enlève les parenthèses
        }
      }

      i = j
      continue
    }

    // Sinon, copie le caractère tel quel
    result += latexIn[i]
    i++
  }

  // Enlève les parenthèses autour d’un nombre positif si :
  // - pas après \times, \div, + ou -
  // ⚡ Remarque : ne touche pas aux nombres négatifs déjà entre parenthèses
  result = result.replace(
    /(?<!\\times\s)(?<!\\div\s)(?<![-+])\((\d+(?:,\d+)?)\)/g,
    '$1',
  )

  // Produit et division négatifs : ajoute des parenthèses pour la clarté
  result = result.replace(/\\times-([0-9]+)/g, '\\times(-$1)')
  result = result.replace(/\\div-([0-9]+)/g, '\\div(-$1)')

  // Cas +(...×...) -> +...×...
  result = result.replace(
    /\+\((\d+\\times[^()]*(?:\([^()]*\)[^()]*)*)\)/g,
    '+$1',
  )

  // Cas +(...÷...) -> +...÷...
  result = result.replace(/\+\((\d+\\div[^()]*(?:\([^()]*\)[^()]*)*)\)/g, '+$1')

  // Cas (...×...)+ -> ...×...+
  result = result.replace(/\((\d+\\times\d+)\)\+/g, '$1+')

  // Cas (...÷...)+ -> ...÷...+
  result = result.replace(/\((\d+\\div\d+)\)\+/g, '$1+')

  return result
}

/* Ancienne version mais qui ne fonctionne plus depuis le passage à la version 0.54.1 de ComputeEngine
export function deparenthise(latexIn: string): string {
  // Comptage des \frac et \dfrac
  const dfracCount = (latexIn.match(/\\dfrac\b/g) || []).length
  const fracCount = (latexIn.match(/\\frac\b/g) || []).length + dfracCount

  // Normalisation temporaire : \dfrac → \frac pour Compute Engine
  const normalized = latexIn.replace(/\\dfrac\b/g, '\\frac')

  const boxed = ce.parse(normalized, { form: 'raw' })
  const mathJson = boxed.json as MathJsonExpression

  // Nettoyage
  const stripped = stripDelimiter(mathJson)

  // Restauration des "Frac" à partir des Divide
  const restored = restoreFracNodes(stripped, fracCount).node

  // Conversion LaTeX
  // let result = ce.expr(restored).toLatex
  let result = mathJsonToLatex(ce.expr(restored))

  // Restauration des \dfrac (si présents en tête)
  if (dfracCount > 0) {
    let replaced = 0
    result = result.replace(/\\frac\{/g, () => {
      replaced++
      return replaced <= dfracCount ? '\\dfrac{' : '\\frac{'
    })
  }

  return result
}
*/
