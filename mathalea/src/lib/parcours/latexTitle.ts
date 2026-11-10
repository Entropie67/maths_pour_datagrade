import { renderKatex } from '../latex/renderKatex'

/**
 * Action Svelte : titre d'exercice de MathALÉA, qui contient souvent du LaTeX
 * entre `$` (« Dériver une fonction du type $u^n$ »), rendu avec KaTeX.
 * Le texte est posé tel quel (aucun HTML interprété), puis rendu.
 */
export function latexTitle(node: HTMLElement, text: string) {
  const render = (t: string) => {
    node.textContent = t
    renderKatex(node)
  }
  render(text)
  return { update: render }
}
