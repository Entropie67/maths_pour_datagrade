import SuperFigure from 'apigeom'
import { context } from '../../modules/context'
import { apigeomFigureToSvg } from './apigeom-figure'

/**
 * wrapper des figures provenant de Apigeom, transformer en mathalea2d pour gérer le zoom
 *
 * En Typst, court-circuite la conversion mathalea2d (le SVG converti en
 * image + ses `<div class="divLatex">` positionnés en CSS, sans les
 * attributs `data-left`/`data-top` que `divLatexToTypstLabel` exige pour les
 * repositionner) : le texte de la figure y serait silencieusement perdu.
 * `apigeomFigureToSvg` renvoie directement un SVG autonome avec le texte
 * intégré en noeuds `<text>`.
 */
export function wrapperApigeomToMathalea(figure: SuperFigure) {
  if (context.isTypst) return apigeomFigureToSvg(figure)
  figure.divFigure.classList.add('svgContainer')
  figure.divFigure.querySelector('svg')?.classList.add('mathalea2d')
  for (const di of figure.divFigure.querySelectorAll('div')) {
    di.classList.add('divLatex')
    di.style.whiteSpace = 'nowrap'
    di.style.lineHeight = '1'
  }
  const div = document.createElement('div')
  div.innerHTML = figure.getStaticHtml()
  if (div.firstElementChild instanceof HTMLElement) {
    div.firstElementChild.style.removeProperty('height')
    div.firstElementChild.style.removeProperty('weight')
  }
  return div.innerHTML
}
