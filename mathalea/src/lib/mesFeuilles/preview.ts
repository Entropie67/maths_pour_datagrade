import type { SheetPreview } from './library'
import { stripScripts } from './libraryFile'

/**
 * Aperçu à enregistrer avec une feuille, à partir du SVG de l'aperçu de la
 * vue Impression (pages séparées par `separatePages`).
 * @returns `undefined` quand il n'y a pas encore d'aperçu compilé
 */
export function buildPreview(
  svg: string,
  pages: readonly { width: number; height: number }[],
): SheetPreview | undefined {
  const first = pages[0]
  if (
    svg === '' ||
    first === undefined ||
    first.width <= 0 ||
    first.height <= 0
  ) {
    return undefined
  }
  return {
    svg: withSvgNamespace(toImageSvg(svg)),
    pageWidth: first.width,
    pageHeight: first.height,
    pageCount: pages.length,
  }
}

/**
 * SVG lisible comme image : l'aperçu de typst.ts, sérialisé en HTML, contient
 * des entités (`&nbsp;`) et une couche de sélection du texte en HTML
 * (`<foreignObject>`), refusées par le lecteur XML d'une `<img>`. On retire
 * cette couche (invisible) et les scripts, puis on sérialise en XML.
 */
function toImageSvg(svg: string): string {
  try {
    const doc = new DOMParser().parseFromString(svg, 'text/html')
    const root = doc.querySelector('svg')
    if (root == null) return stripScripts(svg)
    for (const name of ['script', 'foreignObject']) {
      for (const node of [...root.getElementsByTagNameNS('*', name)]) {
        node.remove()
      }
    }
    return new XMLSerializer().serializeToString(root)
  } catch {
    return stripScripts(svg)
  }
}

/**
 * Un SVG affiché comme image (`<img>`) doit déclarer son espace de noms,
 * que la sérialisation HTML de l'aperçu peut avoir laissé implicite.
 */
function withSvgNamespace(svg: string): string {
  const openingTag = svg.match(/^\s*<svg\b[^>]*>/i)?.[0]
  if (openingTag === undefined) return svg
  let tag = openingTag
  if (!/\sxmlns=/.test(tag)) {
    tag = tag.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"')
  }
  if (/xlink:/.test(svg) && !/\sxmlns:xlink=/.test(tag)) {
    tag = tag.replace(
      /<svg\b/i,
      '<svg xmlns:xlink="http://www.w3.org/1999/xlink"',
    )
  }
  return tag + svg.slice(svg.indexOf(openingTag) + openingTag.length)
}

/** URL `blob:` affichable dans une `<img>` ; à libérer avec `URL.revokeObjectURL` */
export function previewObjectUrl(preview: SheetPreview): string {
  return URL.createObjectURL(new Blob([preview.svg], { type: 'image/svg+xml' }))
}

/** Page d'un document déjà rasterisée (image de la page, dimensions en pixels) */
export interface RasterPage {
  /** URL `data:` de l'image (JPEG ou PNG) */
  dataUrl: string
  width: number
  height: number
}

/** Espace entre deux pages de l'aperçu, en pixels */
const PAGE_GAP = 12

/**
 * Aperçu à enregistrer avec une feuille LaTeX : les pages du PDF, déjà
 * rasterisées, empilées dans un SVG lisible comme image (les images sont
 * incluses en `data:`, une `<img>` ne charge rien d'extérieur).
 * @returns `undefined` quand il n'y a aucune page
 */
export function buildRasterPreview(
  pages: readonly RasterPage[],
): SheetPreview | undefined {
  const first = pages[0]
  if (first === undefined || first.width <= 0 || first.height <= 0) {
    return undefined
  }
  const width = Math.max(...pages.map((page) => page.width))
  let y = 0
  const images: string[] = []
  for (const page of pages) {
    images.push(
      `<image x="0" y="${y}" width="${page.width}" height="${page.height}" href="${page.dataUrl}"/>`,
    )
    y += page.height + PAGE_GAP
  }
  const height = y - PAGE_GAP
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    images.join('') +
    '</svg>'
  return {
    svg,
    pageWidth: first.width,
    pageHeight: first.height,
    pageCount: pages.length,
  }
}
