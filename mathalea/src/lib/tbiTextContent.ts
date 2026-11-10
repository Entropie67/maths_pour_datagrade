/**
 * Contenus texte d'un visualiseur de la vue TBI : notes Markdown et figures
 * (ApiGeom, JSXGraph). Contrairement à un PDF ou à une image, ils tiennent dans
 * la séance enregistrée, qui peut venir d'un collègue : tout ce qui est lu d'un
 * fichier passe par les vérifications de ce module.
 *
 * Le code d'une figure JSXGraph n'est jamais exécuté dans la page : voir
 * `jsxGraphSrcdoc`.
 */

/** Erreur d'ouverture d'un document, avec un message à montrer au professeur */
export class TbiDocumentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TbiDocumentError'
  }
}

export type TbiFigureFormat = 'apigeom' | 'javascript' | 'jessiecode' | 'html'

export interface TbiFigureContent {
  type: 'figure'
  format: TbiFigureFormat
  /** Nom du fichier, affiché dans la barre du visualiseur */
  name: string
  source: string
}

export interface TbiNoteContent {
  type: 'markdown'
  text: string
  /** Taille de toute la note, 1 étant la taille normale */
  fontSize: number
}

export type TbiTextContent = TbiFigureContent | TbiNoteContent

export type TbiTextDocumentKind = 'markdown' | TbiFigureFormat

export const TBI_NOTE_MIN_FONT_SIZE = 0.5
export const TBI_NOTE_MAX_FONT_SIZE = 5
export const TBI_NOTE_FONT_SIZE_STEP = 0.25

export function clampNoteFontSize(fontSize: number): number {
  if (!Number.isFinite(fontSize)) return 1
  return Math.min(
    TBI_NOTE_MAX_FONT_SIZE,
    Math.max(TBI_NOTE_MIN_FONT_SIZE, fontSize),
  )
}

export function newTbiNote(text = ''): TbiNoteContent {
  return { type: 'markdown', text, fontSize: 1 }
}

const KIND_OF_EXTENSION: Record<string, TbiTextDocumentKind> = {
  md: 'markdown',
  markdown: 'markdown',
  json: 'apigeom',
  apigeom: 'apigeom',
  js: 'javascript',
  jc: 'jessiecode',
  jessie: 'jessiecode',
  html: 'html',
  htm: 'html',
}

/** Compléments de l'attribut `accept` du sélecteur de fichier */
export const TBI_TEXT_DOCUMENT_ACCEPT = Object.keys(KIND_OF_EXTENSION)
  .map((extension) => `.${extension}`)
  .join(',')

/** @returns null si l'extension n'est pas celle d'une note ou d'une figure */
export function textDocumentKindOf(name: string): TbiTextDocumentKind | null {
  const parts = name.toLowerCase().split('.')
  if (parts.length < 2) return null
  return KIND_OF_EXTENSION[parts[parts.length - 1]] ?? null
}

/** Balises HTML sans attribut qu'un texte de figure peut contenir */
const HARMLESS_TAG = /^<\/?(?:b|i|u|em|strong|br|sub|sup|span|div|p)\s*\/?>$/i

/** Vrai si une chaîne ne contient aucune balise HTML en dehors des inoffensives */
function hasOnlyHarmlessTags(text: string): boolean {
  const tags = text.match(/<[a-z!?/][^>]*>/gi) ?? []
  return tags.every((tag) => HARMLESS_TAG.test(tag))
}

function everyStringIsHarmless(value: unknown): boolean {
  if (typeof value === 'string') return hasOnlyHarmlessTags(value)
  if (Array.isArray(value)) return value.every(everyStringIsHarmless)
  if (typeof value !== 'object' || value === null) return true
  return Object.entries(value).every(
    ([key, item]) => hasOnlyHarmlessTags(key) && everyStringIsHarmless(item),
  )
}

/**
 * Vérifie le JSON d'une figure ApiGeom. ApiGeom insère les textes des figures
 * par `innerHTML`, dans la page : une balise avec attribut (`<img onerror=…>`)
 * pourrait y exécuter du code. Les images de la figure sont exclues de la
 * vérification car elles ne sont utilisées que comme sources d'images.
 * @returns le message d'erreur, ou null pour une figure valide
 */
export function apigeomFigureError(source: string): string | null {
  let figure: unknown
  try {
    figure = JSON.parse(source)
  } catch {
    return 'Ce fichier ne peut pas être lu : ce n’est pas un fichier JSON valide.'
  }
  if (
    typeof figure !== 'object' ||
    figure === null ||
    typeof (figure as Record<string, unknown>).apiGeomVersion !== 'string'
  ) {
    return 'Ce fichier JSON n’est pas une figure ApiGeom.'
  }
  const { images: _images, ...content } = figure as Record<string, unknown>
  if (!everyStringIsHarmless(content)) {
    return 'Cette figure ApiGeom contient du code HTML non autorisé : elle ne peut pas être affichée.'
  }
  return null
}

/**
 * Note ou figure lue d'un fichier
 * @throws TbiDocumentError pour un fichier qui n'en est pas une
 */
export function parseTextDocument(name: string, text: string): TbiTextContent {
  const kind = textDocumentKindOf(name)
  if (kind === null) {
    throw new TbiDocumentError('Ce format de fichier n’est pas pris en charge.')
  }
  if (kind === 'markdown') return newTbiNote(text)
  if (kind === 'apigeom') {
    const error = apigeomFigureError(text)
    if (error !== null) throw new TbiDocumentError(error)
  } else if (kind === 'javascript' && !/\bJXG\b|\binitBoard\b/.test(text)) {
    throw new TbiDocumentError(
      'Ce fichier JavaScript n’est pas une figure JSXGraph : il n’utilise pas JXG.',
    )
  } else if (kind === 'html' && !/jsxgraph|\bJXG\b/i.test(text)) {
    throw new TbiDocumentError(
      'Ce fichier HTML n’est pas une figure JSXGraph : il n’utilise pas JXG.',
    )
  }
  return { type: 'figure', format: kind, name, source: text }
}

const FIGURE_FORMATS: TbiFigureFormat[] = [
  'apigeom',
  'javascript',
  'jessiecode',
  'html',
]

/**
 * Note ou figure d'une séance enregistrée (déjà passée par JSON.parse)
 * @returns null pour un contenu invalide
 */
export function readSavedTextContent(value: unknown): TbiTextContent | null {
  if (typeof value !== 'object' || value === null) return null
  const saved = value as Record<string, unknown>
  if (saved.type === 'markdown' && typeof saved.text === 'string') {
    return {
      type: 'markdown',
      text: saved.text,
      fontSize: clampNoteFontSize(Number(saved.fontSize)),
    }
  }
  if (
    saved.type !== 'figure' ||
    typeof saved.name !== 'string' ||
    typeof saved.source !== 'string' ||
    !FIGURE_FORMATS.includes(saved.format as TbiFigureFormat)
  ) {
    return null
  }
  const format = saved.format as TbiFigureFormat
  if (format === 'apigeom' && apigeomFigureError(saved.source) !== null) {
    return null
  }
  return { type: 'figure', format, name: saved.name, source: saved.source }
}

/** Clés du cadrage enregistré, recalculé pour la taille du visualiseur */
const APIGEOM_VIEWPORT_KEYS = [
  'pixelsPerUnit',
  'xMin',
  'yMin',
  'scale',
  'zoomLevel',
]
const APIGEOM_NOT_ELEMENTS = new Set([
  ...APIGEOM_VIEWPORT_KEYS,
  'apiGeomVersion',
  'options',
  'xScale',
  'yScale',
  'snapGrid',
  'images',
  'history',
])
/** Marge autour des éléments (unités) : noms des points, épaisseurs… */
const APIGEOM_MARGIN = 1.5

export interface ApigeomViewport {
  pixelsPerUnit: number
  xMin: number
  yMin: number
}

/**
 * Cadrage qui montre tous les éléments d'une figure ApiGeom dans un cadre de
 * cette taille : les éléments positionnés et l'étendue des grilles, qui donne
 * la fenêtre voulue par l'auteur (les courbes, elles, n'ont pas de position).
 * Une figure enregistrée ne connaît pas la taille de la fenêtre dans laquelle
 * elle a été construite.
 * @returns null sans élément positionné : le cadrage enregistré est conservé
 */
export function apigeomViewport(
  figure: Record<string, unknown>,
  width: number,
  height: number,
): ApigeomViewport | null {
  const xs: number[] = []
  const ys: number[] = []
  for (const [key, value] of Object.entries(figure)) {
    if (APIGEOM_NOT_ELEMENTS.has(key)) continue
    if (typeof value !== 'object' || value === null) continue
    const { x, y, xMin, xMax, yMin, yMax } = value as Record<string, unknown>
    if (typeof x === 'number' && typeof y === 'number') {
      xs.push(x)
      ys.push(y)
    }
    if (
      typeof xMin === 'number' &&
      typeof xMax === 'number' &&
      typeof yMin === 'number' &&
      typeof yMax === 'number'
    ) {
      xs.push(xMin, xMax)
      ys.push(yMin, yMax)
    }
  }
  const coordinates = [...xs, ...ys]
  if (coordinates.length === 0 || !coordinates.every(Number.isFinite)) {
    return null
  }
  if (width <= 0 || height <= 0) return null
  const xLow = Math.min(...xs) - APIGEOM_MARGIN
  const xHigh = Math.max(...xs) + APIGEOM_MARGIN
  const yLow = Math.min(...ys) - APIGEOM_MARGIN
  const yHigh = Math.max(...ys) + APIGEOM_MARGIN
  const xScale = Number(figure.xScale ?? 1) || 1
  const yScale = Number(figure.yScale ?? 1) || 1
  const pixelsPerUnit = Math.min(
    width / ((xHigh - xLow) * xScale),
    height / ((yHigh - yLow) * yScale),
  )
  return {
    pixelsPerUnit,
    xMin: (xLow + xHigh) / 2 - width / (2 * pixelsPerUnit * xScale),
    yMin: (yLow + yHigh) / 2 - height / (2 * pixelsPerUnit * yScale),
  }
}

/** Figure ApiGeom sans son cadrage, à charger avant de calculer le sien */
export function withoutApigeomViewport(
  figure: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(figure).filter(
      ([key]) => !APIGEOM_VIEWPORT_KEYS.includes(key),
    ),
  )
}

/** Code placé dans une balise `<script>` : ne doit pas pouvoir la refermer */
function escapeScriptEnd(code: string): string {
  return code.replace(/<\/(script)/gi, '<\\/$1')
}

/**
 * Affiche une erreur de la figure dans le cadre : sans cela, il resterait vide.
 * Texte inséré par `textContent`, jamais interprété.
 */
const JSXGRAPH_ERROR_SCRIPT = `<script>
window.addEventListener('error', function (event) {
  var message = document.createElement('pre')
  message.style.cssText = 'position:fixed;left:0;right:0;bottom:0;margin:0;padding:8px;background:#fee2e2;color:#991b1b;font:14px sans-serif;white-space:pre-wrap'
  message.textContent = 'Erreur dans la figure : ' + event.message
  document.body.appendChild(message)
})
</script>`

/**
 * `initBoard` accepte n'importe quel identifiant de cadre : celui de la figure
 * (« box », « jxgbox »…) est donné au cadre de la page, un cadre étant ajouté
 * pour chaque tableau supplémentaire.
 */
const JSXGRAPH_BOARD_SCRIPT = `<script>
(function () {
  var initBoard = JXG.JSXGraph.initBoard
  var mainBoardIsFree = true
  JXG.JSXGraph.initBoard = function (box, attributes) {
    if (typeof box === 'string' && (mainBoardIsFree || document.getElementById(box) === null)) {
      var element = mainBoardIsFree ? document.getElementById('box') : document.createElement('div')
      element.id = box
      element.className = 'jxgbox'
      document.body.appendChild(element)
    }
    mainBoardIsFree = false
    return initBoard.call(this, box, attributes)
  }
})()
</script>`

/**
 * Document de l'iframe d'une figure JSXGraph. Une figure JSXGraph est le plus
 * souvent du JavaScript, qui peut venir d'une séance reçue d'un collègue : il
 * n'est exécuté que dans une iframe `sandbox="allow-scripts"`, sans accès à la
 * page (origine opaque).
 * @param assets bibliothèque auto-hébergée (adresse absolue, une iframe
 * `srcdoc` en origine opaque ne résout pas les chemins du site) et sa feuille
 * de style
 */
export function jsxGraphSrcdoc(
  figure: TbiFigureContent,
  assets: { coreUrl: string; css: string },
): string {
  const core = `<script src="${assets.coreUrl}"></script>`
  if (figure.format === 'html') {
    // la page peut charger sa propre version, ou une copie relative absente ici
    const head = `${JSXGRAPH_ERROR_SCRIPT}${core}`
    return /<head[^>]*>/i.test(figure.source)
      ? figure.source.replace(/<head[^>]*>/i, (tag) => `${tag}${head}`)
      : `${head}${figure.source}`
  }
  const code =
    figure.format === 'jessiecode'
      ? `var board = JXG.JSXGraph.initBoard('box', { boundingbox: [-8, 8, 8, -8], axis: true, keepaspectratio: true, showCopyright: false })
board.jc.parse(${JSON.stringify(figure.source).replace(/</g, '\\u003c')})`
      : escapeScriptEnd(figure.source)
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<style>${assets.css}
html, body { margin: 0; height: 100%; background: #fff; }
.jxgbox { box-sizing: border-box; width: 100%; height: 100%; border: 0; border-radius: 0; }
</style>
${JSXGRAPH_ERROR_SCRIPT}
${core}
</head>
<body>
<div id="box" class="jxgbox"></div>
${JSXGRAPH_BOARD_SCRIPT}
<script>
${code}
</script>
</body>
</html>`
}
