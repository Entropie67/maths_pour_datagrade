import type { TypstAnchor } from '../typst/typstCompiler'

/**
 * Préparation commune de l'aperçu SVG des vues Typst.
 *
 * Les quatre vues qui compilent du Typst — fiche à imprimer, flash-cards,
 * diaporama PDF, évaluation papier — affichent le même artefact : un SVG où
 * typst.ts empile les pages sans séparation ni fond. Elles le retouchent de la
 * même façon et en tirent la même géométrie, seule capable de convertir les
 * repères `mathalea-anchor` (en points, par page) en positions de pastilles sur
 * l'aperçu. D'où ce module, plutôt qu'une quatrième copie de la fonction.
 */

/** Espace entre deux pages de l'aperçu, en unités SVG (pt) */
export const PAGE_GAP = 16

/** Géométrie d'une page dans le SVG de l'aperçu (unités pt du viewBox) */
export interface PreviewPageGeometry {
  /** Ordonnée du haut de la page (espacement entre pages inclus) */
  y: number
  width: number
  height: number
}

/** Aperçu préparé : SVG retouché et géométrie des pages pour la palette */
export interface SeparatedPreview {
  svg: string
  pages: PreviewPageGeometry[]
  viewBox: { width: number; height: number }
}

/**
 * Insère un fond blanc bordé derrière chaque page (`g.typst-page`) et un espace
 * entre les pages, pour les détacher du fond gris du panneau d'aperçu.
 *
 * @returns le SVG retouché et la géométrie des pages ; en cas d'échec, l'aperçu
 *   d'origine et une géométrie vide — un aperçu sans séparation ni palette vaut
 *   mieux que pas d'aperçu du tout
 */
export function separatePages(svg: string): SeparatedPreview {
  const degraded: SeparatedPreview = {
    svg,
    pages: [],
    viewBox: { width: 0, height: 0 },
  }
  try {
    // parseur HTML (pas XML) : le SVG de typst.ts embarque un <script>
    // et des styles qui ne sont pas du XML strict
    const doc = new DOMParser().parseFromString(svg, 'text/html')
    const root = doc.querySelector('svg')
    if (root == null) return degraded
    const pages = [...root.querySelectorAll('g.typst-page')]
    if (pages.length === 0) return degraded
    const viewBox = (root.getAttribute('viewBox') ?? '')
      .trim()
      .split(/\s+/)
      .map(Number)
    if (viewBox.length !== 4 || viewBox.some(Number.isNaN)) return degraded
    const geometry: PreviewPageGeometry[] = []
    let cumulatedY = 0
    for (const [i, page] of pages.entries()) {
      const width = parseFloat(page.getAttribute('data-page-width') ?? '0')
      const height = parseFloat(page.getAttribute('data-page-height') ?? '0')
      // la position verticale de la page est celle de son transform
      // (les pages sont empilées) ; à défaut, la somme des hauteurs
      const translate = (page.getAttribute('transform') ?? '').match(
        /translate\(\s*[\d.e+-]+[ ,]+([\d.e+-]+)\s*\)/i,
      )
      const pageY = translate != null ? parseFloat(translate[1]) : cumulatedY
      cumulatedY += height
      geometry.push({ y: pageY + i * PAGE_GAP, width, height })
      const wrapper = doc.createElementNS('http://www.w3.org/2000/svg', 'g')
      wrapper.setAttribute('transform', `translate(0, ${i * PAGE_GAP})`)
      const sheet = doc.createElementNS('http://www.w3.org/2000/svg', 'rect')
      sheet.setAttribute('x', '0')
      sheet.setAttribute('y', String(pageY))
      sheet.setAttribute('width', String(width))
      sheet.setAttribute('height', String(height))
      sheet.setAttribute('fill', '#ffffff')
      sheet.setAttribute('stroke', '#c8c8c8')
      sheet.setAttribute('stroke-width', '1')
      page.replaceWith(wrapper)
      wrapper.appendChild(sheet)
      wrapper.appendChild(page)
    }
    const totalGap = (pages.length - 1) * PAGE_GAP
    viewBox[3] += totalGap
    root.setAttribute('viewBox', viewBox.join(' '))
    const heightAttr = parseFloat(root.getAttribute('height') ?? '')
    if (!Number.isNaN(heightAttr)) {
      root.setAttribute('height', String(heightAttr + totalGap))
    }
    return {
      svg: root.outerHTML,
      pages: geometry,
      viewBox: { width: viewBox[2], height: viewBox[3] },
    }
  } catch {
    // aperçu dégradé (pages non séparées, pas de palette) plutôt que rien
    return degraded
  }
}

/**
 * Convertit un repère publié par le document (en points, relatif à sa page) en
 * position exprimée en pourcentage du conteneur de l'aperçu — la seule unité
 * qui suive le SVG quand il est redimensionné.
 *
 * @returns `null` quand la page du repère n'est pas (ou pas encore) dans
 *   l'aperçu : la pastille est alors simplement omise
 */
export function anchorPosition(
  anchor: TypstAnchor,
  pages: readonly PreviewPageGeometry[],
  viewBox: { width: number; height: number },
): { left: number; top: number } | null {
  if (viewBox.width <= 0 || viewBox.height <= 0) return null
  const page = pages[anchor.page - 1]
  if (page == null) return null
  return {
    left: (anchor.x / viewBox.width) * 100,
    top: ((page.y + anchor.y) / viewBox.height) * 100,
  }
}
