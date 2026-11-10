import type { PDFPageProxy } from 'pdfjs-dist'
import {
  fileNameOfUrl,
  isBlockedMixedContent,
  isDropboxFolderUrl,
  type TbiViewerContent,
  webPageContent,
} from './tbiLink'
import {
  parseTextDocument,
  TBI_TEXT_DOCUMENT_ACCEPT,
  TbiDocumentError,
  textDocumentKindOf,
} from './tbiTextContent'

export { TbiDocumentError }

/**
 * Visualiseur de document de la vue TBI : types de fichiers acceptés, calculs
 * d'échelle et chargement des PDF (pdf.js) et des images, depuis un fichier
 * de l'ordinateur ou un lien internet (les vidéos sont dans `tbiLink.ts`).
 *
 * pdf.js est chargé à la demande : c'est une grosse dépendance, inutile tant
 * qu'aucun PDF n'est ouvert (voir aussi `omr/pdfRaster.ts`).
 */

export type TbiDocumentKind = 'pdf' | 'image'

/** Attribut `accept` du sélecteur de fichier */
export const TBI_DOCUMENT_ACCEPT = `application/pdf,.pdf,image/png,image/jpeg,image/webp,image/gif,image/svg+xml,${TBI_TEXT_DOCUMENT_ACCEPT}`

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg']

/**
 * Nature du fichier, d'après son type MIME ou à défaut son extension (un
 * fichier glissé depuis certains gestionnaires de fichiers n'a pas de type).
 * @returns null pour un fichier non pris en charge
 */
export function documentKindOf(file: {
  type: string
  name: string
}): TbiDocumentKind | null {
  if (file.type === 'application/pdf') return 'pdf'
  if (file.type.startsWith('image/')) return 'image'
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (extension === 'pdf') return 'pdf'
  if (IMAGE_EXTENSIONS.includes(extension)) return 'image'
  return null
}

/** Fichiers pris en charge d'une liste (glisser-déposer, presse-papiers) */
export function supportedFiles(
  files: ArrayLike<File> | null | undefined,
): File[] {
  return Array.from(files ?? []).filter(
    (file) =>
      documentKindOf(file) !== null || textDocumentKindOf(file.name) !== null,
  )
}

/**
 * Ajustement de référence de la page : toute la largeur du cadre, ou la page
 * entière. Le zoom s'applique ensuite par rapport à cet ajustement (100 %).
 */
export type TbiDocumentFit = 'width' | 'page'

export const TBI_DOCUMENT_MIN_ZOOM = 0.25
export const TBI_DOCUMENT_MAX_ZOOM = 8
/** Facteur appliqué par les boutons zoom ± */
export const TBI_DOCUMENT_ZOOM_STEP = 1.25

export function clampDocumentZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return 1
  return Math.min(TBI_DOCUMENT_MAX_ZOOM, Math.max(TBI_DOCUMENT_MIN_ZOOM, zoom))
}

/**
 * Échelle qui ajuste une page de taille (pageW, pageH) au cadre (boxW, boxH).
 * @returns 1 tant que l'une des tailles est inconnue (nulle)
 */
export function fitScale(
  pageW: number,
  pageH: number,
  boxW: number,
  boxH: number,
  fit: TbiDocumentFit,
): number {
  if (pageW <= 0 || pageH <= 0 || boxW <= 0 || boxH <= 0) return 1
  const byWidth = boxW / pageW
  return fit === 'width' ? byWidth : Math.min(byWidth, boxH / pageH)
}

/** Rectangle à l'écran, en pixels */
export interface TbiScreenRect {
  left: number
  top: number
  width: number
  height: number
}

/** Partie d'une page, en fractions de sa largeur et de sa hauteur ([0 ; 1]) */
export type TbiDocumentRegion = TbiScreenRect

/** Côté minimal (px) d'une sélection : en dessous, c'est un simple clic */
export const TBI_DOCUMENT_MIN_SELECTION = 12

/**
 * Rectangle de sélection tracé de `from` à `to` (deux angles opposés, dans
 * n'importe quel sens), ramené dans `bounds` (la partie visible de la page).
 * @returns null si la sélection est trop petite
 */
export function clampSelection(
  from: { x: number; y: number },
  to: { x: number; y: number },
  bounds: TbiScreenRect,
): TbiScreenRect | null {
  const clampX = (x: number) =>
    Math.min(bounds.left + bounds.width, Math.max(bounds.left, x))
  const clampY = (y: number) =>
    Math.min(bounds.top + bounds.height, Math.max(bounds.top, y))
  const left = Math.min(clampX(from.x), clampX(to.x))
  const right = Math.max(clampX(from.x), clampX(to.x))
  const top = Math.min(clampY(from.y), clampY(to.y))
  const bottom = Math.max(clampY(from.y), clampY(to.y))
  const width = right - left
  const height = bottom - top
  if (
    width < TBI_DOCUMENT_MIN_SELECTION ||
    height < TBI_DOCUMENT_MIN_SELECTION
  ) {
    return null
  }
  return { left, top, width, height }
}

/** Convertit un rectangle d'écran en fractions de la page `page` (à l'écran) */
export function regionOfPage(
  selection: TbiScreenRect,
  page: TbiScreenRect,
): TbiDocumentRegion {
  return {
    left: (selection.left - page.left) / page.width,
    top: (selection.top - page.top) / page.height,
    width: selection.width / page.width,
    height: selection.height / page.height,
  }
}

/**
 * Zoom (relatif à l'ajustement `baseScale`, voir `fitScale`) pour que la
 * largeur de `region` occupe toute la largeur utile du cadre `boxW`. Borné :
 * pour une très petite zone, on s'arrête au zoom maximal.
 */
export function zoomForRegion(
  region: TbiDocumentRegion,
  pageW: number,
  boxW: number,
  baseScale: number,
): number {
  const regionW = region.width * pageW * baseScale
  if (regionW <= 0 || boxW <= 0) return 1
  return clampDocumentZoom(boxW / regionW)
}

/**
 * Partie de la page visible dans la zone de défilement, en pixels de la
 * page (origine = angle haut gauche de la page).
 * @param page rectangle de la page à l'écran
 * @param view rectangle visible de la zone de défilement à l'écran
 * @returns null si la page est entièrement hors du cadre
 */
export function visibleRegion(
  page: TbiScreenRect,
  view: TbiScreenRect,
): TbiScreenRect | null {
  const left = Math.max(page.left, view.left)
  const top = Math.max(page.top, view.top)
  const right = Math.min(page.left + page.width, view.left + view.width)
  const bottom = Math.min(page.top + page.height, view.top + view.height)
  if (right <= left || bottom <= top) return null
  return {
    left: left - page.left,
    top: top - page.top,
    width: right - left,
    height: bottom - top,
  }
}

/**
 * Zone à dessiner : la partie visible élargie de `marginX` et `marginY` de
 * chaque côté (pour que le défilement ne découvre pas du blanc avant le
 * redessin), sans sortir de la page `pageW` × `pageH`.
 */
export function expandRegion(
  region: TbiScreenRect,
  marginX: number,
  marginY: number,
  pageW: number,
  pageH: number,
): TbiScreenRect {
  const left = Math.max(0, region.left - marginX)
  const top = Math.max(0, region.top - marginY)
  const right = Math.min(pageW, region.left + region.width + marginX)
  const bottom = Math.min(pageH, region.top + region.height + marginY)
  return { left, top, width: right - left, height: bottom - top }
}

/** `outer` contient-il `inner` (à `tolerance` pixels près) ? */
export function containsRegion(
  outer: TbiScreenRect,
  inner: TbiScreenRect,
  tolerance = 1,
): boolean {
  return (
    inner.left >= outer.left - tolerance &&
    inner.top >= outer.top - tolerance &&
    inner.left + inner.width <= outer.left + outer.width + tolerance &&
    inner.top + inner.height <= outer.top + outer.height + tolerance
  )
}

/** Numéro de page ramené dans [1 ; count] (1 pour une saisie invalide) */
export function clampPage(page: number, count: number): number {
  if (!Number.isFinite(page)) return 1
  return Math.min(Math.max(1, count), Math.max(1, Math.round(page)))
}

/**
 * Surface et côté maximaux d'un canvas : au-delà, Safari (iOS en
 * particulier) refuse de le dessiner et Chrome le laisse vide.
 */
const MAX_CANVAS_AREA = 16_000_000
const MAX_CANVAS_SIDE = 16_000

/**
 * Densité de pixels du canvas d'une page affichée en cssW × cssH : celle de
 * l'écran, réduite si le canvas dépasserait les limites des navigateurs (à
 * fort zoom, la page est alors un peu moins nette au lieu de disparaître).
 */
export function canvasPixelRatio(
  cssW: number,
  cssH: number,
  devicePixelRatio: number,
): number {
  if (cssW <= 0 || cssH <= 0) return devicePixelRatio
  return Math.min(
    devicePixelRatio,
    Math.sqrt(MAX_CANVAS_AREA / (cssW * cssH)),
    MAX_CANVAS_SIDE / cssW,
    MAX_CANVAS_SIDE / cssH,
  )
}

/** Rotation ajoutée par le professeur, en degrés (multiple de 90) */
export type TbiDocumentRotation = 0 | 90 | 180 | 270

export function nextRotation(
  rotation: TbiDocumentRotation,
): TbiDocumentRotation {
  return ((rotation + 90) % 360) as TbiDocumentRotation
}

export interface TbiImageDocument {
  kind: 'image'
  pageCount: 1
  /** URL d'objet de l'image (libérée par `destroy`) ou lien internet */
  url: string
  width: number
  height: number
  destroy: () => Promise<void>
}

export interface TbiPdfDocument {
  kind: 'pdf'
  pageCount: number
  getPage: (page: number) => Promise<PDFPageProxy>
  destroy: () => Promise<void>
}

export type TbiDocumentSource = TbiImageDocument | TbiPdfDocument

/**
 * Charge une image depuis une adresse (URL d'objet d'un fichier, ou lien
 * internet). Une image d'un autre site sans en-têtes CORS se dessine quand
 * même dans le canvas du visualiseur : il devient alors « contaminé »
 * (tainted), ce qui est sans conséquence puisqu'il n'est jamais relu.
 */
async function loadImageUrl(
  url: string,
  release: () => void = () => {},
): Promise<TbiImageDocument> {
  const image = new Image()
  image.src = url
  try {
    await image.decode()
  } catch {
    release()
    throw new TbiDocumentError('Cette image ne peut pas être lue.')
  }
  return {
    kind: 'image',
    pageCount: 1,
    url,
    // une image SVG sans dimensions intrinsèques a une taille nulle
    width: image.naturalWidth || 800,
    height: image.naturalHeight || 600,
    destroy: async () => release(),
  }
}

async function loadImage(file: File): Promise<TbiImageDocument> {
  const url = URL.createObjectURL(file)
  return loadImageUrl(url, () => URL.revokeObjectURL(url))
}

async function loadPdf(file: File): Promise<TbiPdfDocument> {
  const pdfjs = await import('pdfjs-dist')
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.mjs?url'))
    .default
  // worker créé ici et passé à pdf.js, comme dans `omr/pdfRaster.ts`
  const port = new Worker(workerUrl, { type: 'module' })
  const worker = pdfjs.PDFWorker.create({ port })
  const task = pdfjs.getDocument({ data: await file.arrayBuffer(), worker })
  const destroy = async () => {
    await task.destroy()
    worker.destroy()
    port.terminate()
  }
  // si le script du worker ne se charge pas (type MIME refusé, réseau…),
  // pdf.js attend sans fin : l'erreur du worker met fin au chargement
  const workerFailure = new Promise<never>((_, reject) => {
    port.addEventListener('error', () =>
      reject(new TbiDocumentError('Le lecteur de PDF ne peut pas démarrer.')),
    )
  })
  try {
    const document = await Promise.race([task.promise, workerFailure])
    return {
      kind: 'pdf',
      pageCount: document.numPages,
      getPage: (page) => document.getPage(page),
      destroy,
    }
  } catch (error) {
    await destroy()
    if (error instanceof TbiDocumentError) throw error
    if (error instanceof Error && error.name === 'PasswordException') {
      throw new TbiDocumentError(
        'Ce PDF est protégé par un mot de passe : il ne peut pas être affiché.',
      )
    }
    throw new TbiDocumentError('Ce fichier PDF ne peut pas être lu.')
  }
}

/**
 * Résultat d'une ouverture : un document paginé, ou le contenu à afficher à la
 * place (note, figure, page web) qui remplace alors celui du visualiseur.
 */
export type TbiDocumentLoad = TbiDocumentSource | TbiViewerContent

/** Ouvre un fichier choisi par le professeur */
export async function loadTbiDocument(file: File): Promise<TbiDocumentLoad> {
  if (textDocumentKindOf(file.name) !== null) {
    return parseTextDocument(file.name, await file.text())
  }
  const kind = documentKindOf(file)
  if (kind === 'pdf') return loadPdf(file)
  if (kind === 'image') return loadImage(file)
  throw new TbiDocumentError(
    'Format non pris en charge : choisir un PDF ou une image (PNG, JPG…).',
  )
}

/** Nature d'un lien d'après l'extension de son chemin */
export function documentKindOfUrl(href: string): TbiDocumentKind | null {
  try {
    const url = new URL(href)
    const name = url.pathname.split('/').pop() ?? ''
    return documentKindOf({ type: '', name })
  } catch {
    return null
  }
}

/** Les premiers octets d'un fichier PDF sont « %PDF- » */
export async function looksLikePdf(blob: Blob): Promise<boolean> {
  const head = new Uint8Array(await blob.slice(0, 5).arrayBuffer())
  return String.fromCharCode(...head) === '%PDF-'
}

/**
 * Page web affichée dans une iframe, sauf si le navigateur le refusera
 * @throws TbiDocumentError pour une page http dans une vue https
 */
function webPageOrError(href: string): TbiViewerContent {
  if (isBlockedMixedContent(href, window.location.protocol)) {
    throw new TbiDocumentError(
      'Ce site n’est pas sécurisé (http) : le navigateur refuse de l’afficher ici. L’ouvrir dans un nouvel onglet.',
    )
  }
  return webPageContent(href)
}

/**
 * Ouvre un lien internet : document (PDF ou image), note ou figure, et sinon
 * page web affichée dans une iframe.
 *
 * Le fichier est d'abord téléchargé, ce qui demande que le site l'autorise
 * (en-têtes CORS) : sa nature se lit alors dans sa réponse (type MIME,
 * extension ou premiers octets, un PDF étant souvent servi en
 * `application/octet-stream`). Sans cette autorisation, une image reste
 * affichable directement par son adresse, mais pas un PDF : pdf.js doit en
 * lire les octets.
 */
export async function loadTbiDocumentFromUrl(
  href: string,
): Promise<TbiDocumentLoad> {
  if (URL.canParse(href) && isDropboxFolderUrl(new URL(href))) {
    throw new TbiDocumentError(
      'Un dossier Dropbox ne peut pas être affiché : ouvrir le fichier voulu dans le dossier, puis copier son lien de partage.',
    )
  }
  const name = fileNameOfUrl(href)
  // une page HTML en ligne n'est pas une figure à charger : c'est une page web
  const textKind = textDocumentKindOf(name)
  const hasTextDocument = textKind !== null && textKind !== 'html'
  let response: Response | null = null
  try {
    response = await fetch(href, { credentials: 'omit' })
  } catch {
    // site sans CORS ou réseau indisponible : voir ci-dessous
  }
  if (response !== null) {
    if (!response.ok) {
      throw new TbiDocumentError(
        `Ce lien ne répond pas (erreur ${response.status}) : vérifier l’adresse.`,
      )
    }
    const blob = await response.blob()
    const type = (blob.type || '').split(';')[0].trim()
    let kind = documentKindOf({ type, name })
    if (kind === null && (await looksLikePdf(blob))) kind = 'pdf'
    if (kind === null) {
      if (hasTextDocument) {
        try {
          return parseTextDocument(name, await blob.text())
        } catch {
          // un autre fichier `.json` ou `.js` : affiché comme une page web
        }
      }
      return webPageOrError(href)
    }
    const file = new File([blob], name, {
      type: kind === 'pdf' ? 'application/pdf' : type,
    })
    return kind === 'pdf' ? loadPdf(file) : loadImage(file)
  }
  const kind = documentKindOfUrl(href)
  if (kind !== 'pdf') {
    try {
      return await loadImageUrl(href)
    } catch {
      // ce n'est pas une image (ou elle est inaccessible)
    }
  }
  if (kind === 'pdf') {
    throw new TbiDocumentError(
      'Le site qui héberge ce PDF ne permet pas de l’afficher ici (ou la connexion a échoué) : télécharger le fichier, puis le déposer dans la page.',
    )
  }
  if (kind === 'image') {
    throw new TbiDocumentError(
      'Cette image ne peut pas être téléchargée : vérifier l’adresse ou la connexion.',
    )
  }
  if (hasTextDocument) {
    throw new TbiDocumentError(
      'Le site qui héberge ce fichier ne permet pas de l’afficher ici (ou la connexion a échoué) : télécharger le fichier, puis le déposer dans la page.',
    )
  }
  return webPageOrError(href)
}
