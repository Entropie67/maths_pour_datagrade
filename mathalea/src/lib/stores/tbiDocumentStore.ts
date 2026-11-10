import { derived, get } from 'svelte/store'
import { clampToViewport } from '../components/tbiPointer'
import { parseTbiLink, type TbiViewerContent } from '../tbiLink'
import { readSavedTextContent, type TbiTextContent } from '../tbiTextContent'
import { findFreeSpot } from '../tbiToolPlacement'
import {
  bringTbiToolToFront,
  newTbiToolId,
  nextTbiToolZ,
  occupiedTbiRects,
  TBI_SCOPE_ALL,
  tbiActiveScope,
  tbiTools,
  type TbiDocumentTool,
} from './tbiToolsStore'

/**
 * Visualiseurs de document de la vue TBI (PDF, images, vidéos, pages web,
 * notes, figures).
 *
 * Chaque document ouvert (sélecteur de fichier, lien, glisser-déposer,
 * collage) a son propre visualiseur, déplaçable et redimensionnable. Les
 * visualiseurs ouverts depuis un lien, les notes et les figures sont
 * enregistrés dans la séance (« Mes séances au vidéoprojecteur », donc aussi
 * dans le fichier `.mathalea`) : voir `exportTbiLinkViewers`. Un PDF ou une
 * image de l'ordinateur ne peut être ni partagé ni relu après un rechargement :
 * il n'est enregistré nulle part.
 */

export const TBI_DOCUMENT_VIEWER_MIN_W = 280
export const TBI_DOCUMENT_VIEWER_MAX_W = 4000
export const TBI_DOCUMENT_VIEWER_MIN_H = 220
export const TBI_DOCUMENT_VIEWER_MAX_H = 3000

const DEFAULT_W = 720
const DEFAULT_H = 540
const FIGURE_W = 960
const FIGURE_H = 640
/** Marge gardée entre un visualiseur agrandi et le bord de la fenêtre (px) */
const VIEWPORT_MARGIN = 16
/** Hauteur de la barre de titre du visualiseur (px) */
const TITLE_BAR_H = 36
/** Vidéo : cadre au format 16/9 sous la barre de titre */
const VIDEO_H = Math.round((DEFAULT_W * 9) / 16) + TITLE_BAR_H
/** Position du premier visualiseur et décalage de la cascade (px) */
const CASCADE_ORIGIN = 80
const CASCADE_STEP = 32
const CASCADE_LENGTH = 8

/** Un visualiseur est un outil de la vue : même liste, même fonctionnement */
export type TbiDocumentViewer = TbiDocumentTool

function isViewer(tool: { kind: string }): tool is TbiDocumentViewer {
  return tool.kind === 'document'
}

const viewersOfTools = derived(tbiTools, (tools) => tools.filter(isViewer))

/** Les visualiseurs, vus comme une liste, dans la liste des outils de la vue */
export const tbiDocumentViewers = {
  subscribe: viewersOfTools.subscribe,
  set(viewers: TbiDocumentViewer[]) {
    tbiTools.update((tools) => [
      ...tools.filter((tool) => !isViewer(tool)),
      ...viewers,
    ])
  },
  update(updater: (viewers: TbiDocumentViewer[]) => TbiDocumentViewer[]) {
    tbiDocumentViewers.set(updater(get(viewersOfTools)))
  },
}

/**
 * Position d'un nouveau visualiseur : en cascade à partir du coin supérieur
 * gauche, pour qu'il ne recouvre pas exactement le précédent, et taille
 * réduite si la fenêtre est trop petite.
 */
export function newViewerGeometry(
  index: number,
  viewportW: number,
  viewportH: number,
  size: { w: number; h: number } = { w: DEFAULT_W, h: DEFAULT_H },
): { x: number; y: number; w: number; h: number } {
  const offset = CASCADE_ORIGIN + (index % CASCADE_LENGTH) * CASCADE_STEP
  const w = Math.max(
    TBI_DOCUMENT_VIEWER_MIN_W,
    Math.min(size.w, viewportW - offset - VIEWPORT_MARGIN),
  )
  const h = Math.max(
    TBI_DOCUMENT_VIEWER_MIN_H,
    Math.min(size.h, viewportH - offset - VIEWPORT_MARGIN),
  )
  return {
    x: Math.max(0, Math.min(offset, viewportW - w)),
    y: Math.max(0, Math.min(offset, viewportH - h)),
    w,
    h,
  }
}

/** Lecteur au format 16/9 (une page web garde, elle, le format d'un document) */
function isWidescreen(content: TbiViewerContent | null): boolean {
  return content?.type === 'video' && content.video.provider !== 'web'
}

/**
 * Taille d'un nouveau visualiseur : 16/9 pour une vidéo ; une figure a besoin
 * de place, ses curseurs et ses textes ne suivant pas son échelle
 */
function defaultSize(content: TbiViewerContent | null) {
  if (isWidescreen(content)) return { w: DEFAULT_W, h: VIDEO_H }
  if (content?.type === 'figure') return { w: FIGURE_W, h: FIGURE_H }
  return { w: DEFAULT_W, h: DEFAULT_H }
}

/**
 * Ouvre chaque contenu dans un nouveau visualiseur, au premier plan et sur une
 * place libre (null : visualiseur vide, qui propose de saisir un lien ou de
 * choisir un fichier).
 */
export function openTbiViewers(contents: (TbiViewerContent | null)[]) {
  if (contents.length === 0) return
  const viewport = { w: window.innerWidth, h: window.innerHeight }
  for (const content of contents) {
    const geometry = newViewerGeometry(
      get(tbiDocumentViewers).length,
      viewport.w,
      viewport.h,
      defaultSize(content),
    )
    const viewer: TbiDocumentViewer = {
      id: newTbiToolId(),
      kind: 'document',
      scope: get(tbiActiveScope),
      content,
      ...geometry,
      ...findFreeSpot(geometry, occupiedTbiRects(), viewport),
      z: nextTbiToolZ(),
    }
    tbiTools.update((tools) => [...tools, viewer])
  }
}

/** Ouvre chaque fichier dans un nouveau visualiseur, au premier plan */
export function openTbiDocuments(files: File[]) {
  openTbiViewers(files.map((file) => ({ type: 'file', file })))
}

/**
 * Remplace le document d'un visualiseur (boutons « Ouvrir » de sa barre).
 * Une vidéo qui remplace un document garde la largeur du cadre, dont la
 * hauteur passe au format 16/9.
 */
export function replaceTbiDocument(id: number, content: TbiViewerContent) {
  const viewer = get(tbiDocumentViewers).find((v) => v.id === id)
  if (!viewer) return
  if (isWidescreen(content) && viewer.content?.type !== 'video') {
    const h = Math.min(
      TBI_DOCUMENT_VIEWER_MAX_H,
      Math.max(
        TBI_DOCUMENT_VIEWER_MIN_H,
        Math.round((viewer.w * 9) / 16) + TITLE_BAR_H,
      ),
    )
    updateTbiDocumentViewer(id, { content, h })
    return
  }
  if (content.type === 'figure' && viewer.content?.type !== 'figure') {
    // un fichier s'ouvre comme un document avant que sa nature soit connue
    updateTbiDocumentViewer(id, {
      content,
      w: Math.max(
        viewer.w,
        Math.min(FIGURE_W, window.innerWidth - viewer.x - VIEWPORT_MARGIN),
      ),
      h: Math.max(
        viewer.h,
        Math.min(FIGURE_H, window.innerHeight - viewer.y - VIEWPORT_MARGIN),
      ),
    })
    return
  }
  updateTbiDocumentViewer(id, { content })
}

export function updateTbiDocumentViewer(
  id: number,
  patch: Partial<Omit<TbiDocumentViewer, 'id'>>,
) {
  tbiDocumentViewers.update((viewers) =>
    viewers.map((viewer) =>
      viewer.id === id ? { ...viewer, ...patch } : viewer,
    ),
  )
}

/** Passe un visualiseur au premier plan (sans rien changer s'il y est déjà) */
export function bringTbiDocumentViewerToFront(id: number) {
  bringTbiToolToFront(id)
}

export function closeTbiDocumentViewer(id: number) {
  tbiTools.update((tools) => tools.filter((tool) => tool.id !== id))
}

// ------------------------------------------------------------------
// Enregistrement dans une séance
// ------------------------------------------------------------------

/**
 * Visualiseur tel qu'il est enregistré dans une séance : le lien saisi par le
 * professeur (et non l'adresse du lecteur intégré, recalculée à l'ouverture),
 * ou le contenu d'une note ou d'une figure, avec la position et la taille.
 */
export interface TbiSavedDocument {
  url?: string
  content?: TbiTextContent
  /** Rang de l'onglet du visualiseur ; absent ou 'all' : tous les onglets */
  scope?: number | 'all'
  x: number
  y: number
  w: number
  h: number
}

/** Lien saisi par le professeur, ou null pour un fichier ou un visualiseur vide */
function linkOf(content: TbiViewerContent | null): string | null {
  if (content?.type === 'link') return content.url
  if (content?.type === 'video') return content.video.pageUrl
  return null
}

/** Lecteurs de l'état des figures affichées, modifiables à l'écran (par visualiseur) */
const figureSourceReaders = new Map<number, () => string>()

/** Déclare (ou retire, avec null) le lecteur de l'état d'une figure affichée */
export function setTbiFigureSourceReader(
  id: number,
  read: (() => string) | null,
) {
  if (read === null) figureSourceReaders.delete(id)
  else figureSourceReaders.set(id, read)
}

/**
 * Note ou figure telle qu'elle est à l'écran. Un état qui ne repasserait pas la
 * vérification à la réouverture (texte saisi avec du HTML) serait perdu avec la
 * figure : le contenu d'origine est alors gardé.
 */
function currentTextContent(
  id: number,
  content: TbiTextContent,
): TbiTextContent {
  const read = figureSourceReaders.get(id)
  if (content.type !== 'figure' || read === undefined) return content
  const current = { ...content, source: read() }
  return readSavedTextContent(current) ?? content
}

/**
 * Visualiseurs à enregistrer, du plus éloigné au premier plan.
 * @param scopeOf rang de l'onglet d'un visualiseur
 */
export function exportTbiLinkViewers(
  scopeOf: (scope: string) => number | 'all' = () => TBI_SCOPE_ALL,
): TbiSavedDocument[] {
  return [...get(tbiDocumentViewers)]
    .sort((a, b) => a.z - b.z)
    .flatMap((viewer): TbiSavedDocument[] => {
      const { id, content, x, y, w, h } = viewer
      const scope = scopeOf(viewer.scope)
      if (content?.type === 'markdown' || content?.type === 'figure') {
        return [{ content: currentTextContent(id, content), scope, x, y, w, h }]
      }
      const url = linkOf(content)
      if (url === null) return []
      return [{ url, scope, x, y, w, h }]
    })
}

/** Visualiseurs enregistrés d'une séance (contenu déjà passé par JSON.parse) */
export function readSavedDocuments(value: unknown): TbiSavedDocument[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item: unknown) => {
    if (typeof item !== 'object' || item === null) return []
    const { url, content, scope, x, y, w, h } = item as Record<string, unknown>
    const savedScope =
      typeof scope === 'number' && Number.isInteger(scope) && scope >= 0
        ? { scope }
        : {}
    const numbers = [x, y, w, h]
    if (!numbers.every((n) => typeof n === 'number' && Number.isFinite(n))) {
      return []
    }
    if (content !== undefined) {
      // le fichier a pu être reçu d'un collègue : son contenu est revérifié
      const saved = readSavedTextContent(content)
      return saved
        ? [{ content: saved, ...savedScope, x, y, w, h } as TbiSavedDocument]
        : []
    }
    if (typeof url !== 'string' || parseTbiLink(url) === null) return []
    return [{ url, ...savedScope, x, y, w, h } as TbiSavedDocument]
  })
}

/**
 * Rouvre les visualiseurs enregistrés dans une séance, à leur place (ramenés
 * dans la fenêtre si l'écran est plus petit). Ils remplacent les
 * visualiseurs de lien, de note et de figure déjà ouverts ; ceux des fichiers
 * de l'ordinateur sont conservés.
 * @param tabIdAt identifiant de l'onglet d'un rang donné
 */
export function restoreTbiLinkViewers(
  saved: TbiSavedDocument[],
  tabIdAt: (index: number) => string | undefined = () => undefined,
) {
  tbiDocumentViewers.update((viewers) => {
    const result = viewers.filter((viewer) => viewer.content?.type === 'file')
    let z = nextTbiToolZ()
    for (const document of saved) {
      const content = document.content ?? parseTbiLink(document.url ?? '')
      if (content === null) continue
      const w = Math.min(
        TBI_DOCUMENT_VIEWER_MAX_W,
        Math.max(TBI_DOCUMENT_VIEWER_MIN_W, document.w),
      )
      const h = Math.min(
        TBI_DOCUMENT_VIEWER_MAX_H,
        Math.max(TBI_DOCUMENT_VIEWER_MIN_H, document.h),
      )
      result.push({
        id: newTbiToolId(),
        kind: 'document',
        scope:
          typeof document.scope === 'number'
            ? (tabIdAt(document.scope) ?? TBI_SCOPE_ALL)
            : TBI_SCOPE_ALL,
        content,
        ...clampToViewport(document.x, document.y, w, h),
        w,
        h,
        z: z++,
      })
    }
    return result
  })
}
