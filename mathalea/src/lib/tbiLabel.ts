import katex from 'katex'

/**
 * Noms affichés dans la vue TBI (onglets, messages) : ils reprennent le titre des
 * exercices, qui contient souvent des formules entre `$`. Un nom peut venir d'un
 * lien partagé : le texte est échappé, et KaTeX n'exécute rien (`trust` à faux).
 */

const MATH_PATTERN = /\$([^$]+)\$/g

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/** Nom en HTML sûr : formules rendues par KaTeX, le reste échappé */
export function tbiLabelHtml(label: string): string {
  let html = ''
  let position = 0
  for (const match of label.matchAll(MATH_PATTERN)) {
    html += escapeHtml(label.slice(position, match.index))
    html += katex.renderToString(match[1], { throwOnError: false })
    position = match.index + match[0].length
  }
  return html + escapeHtml(label.slice(position))
}

/** Nom en texte simple, pour un attribut (`title`, `aria-label`) */
export function tbiLabelPlain(label: string): string {
  return label.replace(MATH_PATTERN, (_, math: string) =>
    math
      .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1/$2')
      .replace(/\\[a-zA-Z]+/g, ' ')
      .replace(/[{}]/g, '')
      .replace(/\s+/g, ' ')
      .trim(),
  )
}
