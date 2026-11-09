/** Construit une matrice MathLive dont chaque coefficient est un emplacement à remplir. */
export function latexMatriceAvecPlaceholders(
  lignes: number,
  colonnes: number,
): string {
  const n = Math.min(10, Math.max(1, Math.trunc(lignes)))
  const p = Math.min(10, Math.max(1, Math.trunc(colonnes)))
  let index = 0
  const contenu = Array.from({ length: n }, () =>
    Array.from({ length: p }, () => `\\placeholder[matrix${index++}]{}`).join(
      '&',
    ),
  ).join('\\\\')
  return `\\begin{pmatrix}${contenu}\\end{pmatrix}`
}
