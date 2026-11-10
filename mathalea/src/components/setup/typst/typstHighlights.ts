/** Mise en évidence partagée, utilisable aussi dans un éditeur Typst externe. */
export const TYPST_HIGHLIGHT_HELPER = `#let evidence(body, couleur: rgb("#F15929")) = text(
  fill: couleur,
  stroke: (paint: couleur, thickness: 0.025em),
  math.bold(body),
)`

/**
 * Factorise les contours produits par le convertisseur, sans analyser ni
 * modifier le corps mathématique (fractions, couleurs imbriquées, etc.).
 * Le gras, la couleur et le contour sont réunis dans evidence(...).
 */
export function simplifyTypstHighlights(code: string): string {
  const masked = maskTypstLiterals(code)
  const edits: { start: number; end: number; text: string }[] = []
  for (const match of code.matchAll(
    /text\(fill: #(rgb\("[^"]*"\)|[a-z]+), stroke: #stroke\(paint: \1, thickness: 0\.025em\), bold\(/g,
  )) {
    if (!masked.startsWith('text(', match.index)) continue
    const bodyStart = match.index + match[0].length
    const bodyEnd = typstClosingDelimiter(masked, bodyStart - 1)
    if (bodyEnd < 0 || !/^\s*\)/.test(masked.slice(bodyEnd + 1))) continue
    const color = match[1]
    edits.push({
      start: match.index,
      end: bodyStart,
      text: /^rgb\("#f15929"\)$/i.test(color)
        ? 'evidence('
        : `evidence(couleur: #${color}, `,
    })
    edits.push({ start: bodyEnd, end: bodyEnd + 1, text: '' })
  }
  return applyTypstSourceEdits(code, edits)
}

/** Ajoute la définition une seule fois, seulement quand elle est utilisée. */
export function withTypstHighlights(code: string): string {
  const simplified = simplifyTypstHighlights(code)
  return /\bevidence\(/.test(simplified) && !/#let evidence\(/.test(simplified)
    ? `${TYPST_HIGHLIGHT_HELPER}\n\n${simplified}`
    : simplified
}
import {
  applyTypstSourceEdits,
  maskTypstLiterals,
  typstClosingDelimiter,
} from './typstSource'
