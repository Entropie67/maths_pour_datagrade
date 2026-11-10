import renderMathInElement from 'katex/contrib/auto-render'
import 'katex/dist/katex.min.css'
import { optionsKatex } from './Katex'

export function renderKatex(element: HTMLElement | ShadowRoot) {
  // Ajouter preProcess sans typage strict
  Object.assign(optionsKatex, {
    preProcess: (chaine: string) =>
      '{' + chaine.replaceAll(String.fromCharCode(160), '\\,') + '}',
  })

  renderMathInElement(element as HTMLElement, optionsKatex as any)
  document.dispatchEvent(new window.Event('katexRendered'))
}

/**
 * Rend le LaTeX du DOM léger puis celui de chaque shadow root ouvert.
 * `renderMathInElement()` ne traverse pas les frontières du shadow DOM.
 */
export function renderKatexIncludingShadowRoots(element: HTMLElement): void {
  renderKatex(element)

  const renderShadowRoots = (root: ParentNode): void => {
    root.querySelectorAll<HTMLElement>('*').forEach((child) => {
      if (child.shadowRoot == null) return
      renderKatex(child.shadowRoot)
      renderShadowRoots(child.shadowRoot)
    })
  }

  if (element.shadowRoot != null) {
    renderKatex(element.shadowRoot)
    renderShadowRoots(element.shadowRoot)
  }
  renderShadowRoots(element)
}
