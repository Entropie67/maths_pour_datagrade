import { buildRasterPreview, type RasterPage } from './preview'
import type { SheetPreview } from './library'

/**
 * Aperçu d'une feuille LaTeX à partir du PDF compilé : les premières pages,
 * rasterisées par pdf.js.
 *
 * pdf.js est chargé à la demande (c'est une grosse dépendance, inutile tant
 * qu'on n'enregistre pas de feuille LaTeX).
 */

/** Nombre de pages gardées dans l'aperçu (le SVG est stocké avec la feuille) */
export const PREVIEW_MAX_PAGES = 3
/** Largeur des pages de l'aperçu, en pixels */
const PREVIEW_WIDTH = 560
const JPEG_QUALITY = 0.8

/**
 * @returns l'aperçu, ou `undefined` si le PDF n'a pas pu être lu (l'aperçu est
 *   un confort : l'enregistrement de la feuille ne doit pas en dépendre)
 */
export async function buildPdfPreview(
  pdf: Blob,
  maxPages: number = PREVIEW_MAX_PAGES,
): Promise<SheetPreview | undefined> {
  try {
    const pdfjs = await import('pdfjs-dist')
    const workerUrl = (await import('pdfjs-dist/build/pdf.worker.mjs?url'))
      .default
    // le worker est créé ici et passé à pdf.js (voir `omr/pdfRaster.ts`)
    const port = new Worker(workerUrl, { type: 'module' })
    const worker = pdfjs.PDFWorker.create({ port })
    const task = pdfjs.getDocument({ data: await pdf.arrayBuffer(), worker })
    try {
      const document = await task.promise
      const pages: RasterPage[] = []
      const count = Math.min(document.numPages, maxPages)
      for (let number = 1; number <= count; number++) {
        const page = await document.getPage(number)
        const base = page.getViewport({ scale: 1 })
        const viewport = page.getViewport({ scale: PREVIEW_WIDTH / base.width })
        const width = Math.round(viewport.width)
        const height = Math.round(viewport.height)
        const canvas = window.document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        if (context === null) return undefined
        // un PDF n'a pas toujours de fond opaque : un JPEG le rendrait noir
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, width, height)
        await page.render({ canvas, canvasContext: context, viewport }).promise
        pages.push({
          dataUrl: canvas.toDataURL('image/jpeg', JPEG_QUALITY),
          width,
          height,
        })
        page.cleanup()
      }
      const preview = buildRasterPreview(pages)
      // `pageCount` du PDF entier : l'aperçu n'en montre que les premières
      return preview === undefined
        ? undefined
        : { ...preview, pageCount: document.numPages }
    } finally {
      await task.destroy()
      worker.destroy()
      port.terminate()
    }
  } catch (error) {
    console.error('Aperçu du PDF impossible', error)
    return undefined
  }
}
