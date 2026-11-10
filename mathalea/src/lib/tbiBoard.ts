/**
 * Fond et écriture d'un onglet de la vue TBI. Fonctions sans DOM.
 * Les traits sont en coordonnées relatives à la largeur de la page (y compris
 * en hauteur), pour rester à leur place, garder leurs proportions d'un écran à
 * l'autre et défiler avec le contenu.
 */

export type TbiBoardBackground = 'blank' | 'grid' | 'seyes' | 'dots'
export type TbiBoardInk = 'ink' | 'blue' | 'red' | 'green'
export type TbiShape =
  | 'line'
  | 'arrow'
  | 'rectangle'
  | 'filledRectangle'
  | 'ellipse'
  | 'filledEllipse'
export type TbiStrokeTool = 'pen' | 'highlighter' | TbiShape

/** Formes proposées, dans l'ordre du panneau */
export const TBI_BOARD_SHAPES: { value: TbiShape; label: string }[] = [
  { value: 'line', label: 'Trait' },
  { value: 'arrow', label: 'Flèche' },
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'filledRectangle', label: 'Rectangle plein' },
  { value: 'ellipse', label: 'Ovale' },
  { value: 'filledEllipse', label: 'Ovale plein' },
]

export function isTbiShape(value: unknown): value is TbiShape {
  return TBI_BOARD_SHAPES.some((shape) => shape.value === value)
}

export function isFilledShape(tool: TbiStrokeTool): boolean {
  return tool === 'filledRectangle' || tool === 'filledEllipse'
}

export const TBI_BOARD_BACKGROUNDS: {
  value: TbiBoardBackground
  label: string
}[] = [
  { value: 'blank', label: 'Blanc' },
  { value: 'grid', label: 'Quadrillé' },
  { value: 'seyes', label: 'Seyès' },
  { value: 'dots', label: 'Pointé' },
]

export interface TbiStroke {
  tool: TbiStrokeTool
  color: TbiBoardInk
  /** Épaisseur, relative à la largeur de l'écran */
  size: number
  /**
   * Suite de points x, y, x, y… relatifs à la largeur de l'écran. Une forme en a
   * exactement deux : les extrémités du trait ou de la flèche, ou deux coins
   * opposés du rectangle ou de l'ovale.
   */
  points: number[]
}

/** Boîte englobante, relative à la largeur de l'écran */
export interface TbiBounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export interface TbiBoard {
  background: TbiBoardBackground
  /** Taille du quadrillage, 1 pour un soixantième de la largeur de l'écran */
  gridSize: number
  strokes: TbiStroke[]
}

/** Nombre de carreaux dans la largeur de l'écran, à la taille 1 */
export const TBI_BOARD_UNIT_DIVISOR = 60
export const TBI_DEFAULT_GRID_SIZE = 1
export const TBI_GRID_MIN = 0.5
export const TBI_GRID_MAX = 3
export const TBI_GRID_STEP = 0.25

export function clampGridSize(size: number): number {
  return Math.min(TBI_GRID_MAX, Math.max(TBI_GRID_MIN, size))
}

export function isTbiBoardBackground(
  value: unknown,
): value is TbiBoardBackground {
  return TBI_BOARD_BACKGROUNDS.some((background) => background.value === value)
}

/** Vide de mesure : deux points plus proches sont fondus en un seul */
const MIN_DISTANCE = 0.0006

/** Ajoute un point à un trait, s'il s'écarte assez du précédent */
export function addStrokePoint(stroke: TbiStroke, x: number, y: number) {
  const { points } = stroke
  const lastX = points[points.length - 2]
  const lastY = points[points.length - 1]
  if (points.length === 0 || Math.hypot(x - lastX, y - lastY) >= MIN_DISTANCE) {
    points.push(x, y)
  }
}

/** Distance d'un point au segment [ab] */
function distanceToSegment(
  x: number,
  y: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax
  const dy = by - ay
  const lengthSquared = dx * dx + dy * dy
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(
          0,
          Math.min(1, ((x - ax) * dx + (y - ay) * dy) / lengthSquared),
        )
  return Math.hypot(x - (ax + t * dx), y - (ay + t * dy))
}

/** En deçà de cet écart entre ses deux points, une forme n'est pas tracée */
const MIN_SHAPE_SIZE = 0.002

/** Faux pour une forme sans étendue, née d'un simple tapotement */
export function hasShapeExtent(stroke: TbiStroke): boolean {
  const [x0, y0, x1, y1] = stroke.points
  return Math.hypot(x1 - x0, y1 - y0) >= MIN_SHAPE_SIZE
}

/** Les deux branches de la pointe d'une flèche : x, y, x, y */
export function arrowHead(stroke: TbiStroke): [number, number, number, number] {
  const [x0, y0, x1, y1] = stroke.points
  const length = Math.hypot(x1 - x0, y1 - y0)
  const headLength = Math.min(length / 2, Math.max(0.012, stroke.size * 6))
  const direction = Math.atan2(y0 - y1, x0 - x1)
  const spread = Math.PI / 6
  return [
    x1 + headLength * Math.cos(direction - spread),
    y1 + headLength * Math.sin(direction - spread),
    x1 + headLength * Math.cos(direction + spread),
    y1 + headLength * Math.sin(direction + spread),
  ]
}

/** Nombre de segments qui approchent le contour d'un ovale */
const ELLIPSE_SEGMENTS = 48

/** Contour d'un trait, en ligne brisée, pour savoir si un point le touche */
function strokeOutline(stroke: TbiStroke): number[] {
  const [x0, y0, x1, y1] = stroke.points
  switch (stroke.tool) {
    case 'arrow': {
      const [ax, ay, bx, by] = arrowHead(stroke)
      return [x0, y0, x1, y1, ax, ay, x1, y1, bx, by]
    }
    case 'rectangle':
    case 'filledRectangle':
      return [x0, y0, x1, y0, x1, y1, x0, y1, x0, y0]
    case 'ellipse':
    case 'filledEllipse': {
      const outline: number[] = []
      for (let i = 0; i <= ELLIPSE_SEGMENTS; i++) {
        const angle = (i / ELLIPSE_SEGMENTS) * 2 * Math.PI
        outline.push(
          (x0 + x1) / 2 + (Math.abs(x1 - x0) / 2) * Math.cos(angle),
          (y0 + y1) / 2 + (Math.abs(y1 - y0) / 2) * Math.sin(angle),
        )
      }
      return outline
    }
    default:
      return stroke.points
  }
}

/** Vrai si le point (x, y) est à l'intérieur d'une forme pleine */
function isInsideFilledShape(stroke: TbiStroke, x: number, y: number): boolean {
  if (!isFilledShape(stroke.tool)) return false
  const { minX, minY, maxX, maxY } = strokeBounds(stroke)
  if (stroke.tool === 'filledRectangle') {
    return x >= minX && x <= maxX && y >= minY && y <= maxY
  }
  const radiusX = (maxX - minX) / 2
  const radiusY = (maxY - minY) / 2
  if (radiusX === 0 || radiusY === 0) return false
  return (
    ((x - minX - radiusX) / radiusX) ** 2 +
      ((y - minY - radiusY) / radiusY) ** 2 <=
    1
  )
}

/** Vrai si le point (x, y) touche le trait, à `radius` près */
export function strokeTouches(
  stroke: TbiStroke,
  x: number,
  y: number,
  radius: number,
): boolean {
  if (isInsideFilledShape(stroke, x, y)) return true
  const points = strokeOutline(stroke)
  const reach = radius + stroke.size / 2
  if (points.length === 2) {
    return Math.hypot(x - points[0], y - points[1]) <= reach
  }
  for (let i = 0; i + 3 < points.length; i += 2) {
    const distance = distanceToSegment(
      x,
      y,
      points[i],
      points[i + 1],
      points[i + 2],
      points[i + 3],
    )
    if (distance <= reach) return true
  }
  return false
}

/** Gomme : retire les traits entiers touchés par le point (x, y) */
export function eraseStrokesAt(
  strokes: TbiStroke[],
  x: number,
  y: number,
  radius: number,
): TbiStroke[] {
  return strokes.filter((stroke) => !strokeTouches(stroke, x, y, radius))
}

/** Boîte englobante d'un trait, d'après ses points */
export function strokeBounds(stroke: TbiStroke): TbiBounds {
  const bounds: TbiBounds = {
    minX: Infinity,
    minY: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
  }
  const { points } = stroke
  for (let i = 0; i + 1 < points.length; i += 2) {
    bounds.minX = Math.min(bounds.minX, points[i])
    bounds.maxX = Math.max(bounds.maxX, points[i])
    bounds.minY = Math.min(bounds.minY, points[i + 1])
    bounds.maxY = Math.max(bounds.maxY, points[i + 1])
  }
  return bounds
}

/** Boîte englobante de plusieurs traits, `null` s'il n'y en a aucun */
export function strokesBounds(strokes: TbiStroke[]): TbiBounds | null {
  if (strokes.length === 0) return null
  return strokes.map(strokeBounds).reduce((all, bounds) => ({
    minX: Math.min(all.minX, bounds.minX),
    minY: Math.min(all.minY, bounds.minY),
    maxX: Math.max(all.maxX, bounds.maxX),
    maxY: Math.max(all.maxY, bounds.maxY),
  }))
}

/** Boîte de deux coins opposés quelconques */
export function boundsOfCorners(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): TbiBounds {
  return {
    minX: Math.min(x0, x1),
    minY: Math.min(y0, y1),
    maxX: Math.max(x0, x1),
    maxY: Math.max(y0, y1),
  }
}

export function isInBounds(
  bounds: TbiBounds,
  x: number,
  y: number,
  margin = 0,
): boolean {
  return (
    x >= bounds.minX - margin &&
    x <= bounds.maxX + margin &&
    y >= bounds.minY - margin &&
    y <= bounds.maxY + margin
  )
}

/** Indice du trait visible au point (x, y) : le dernier tracé, -1 si aucun */
export function strokeIndexAt(
  strokes: TbiStroke[],
  x: number,
  y: number,
  radius: number,
): number {
  return strokes.findLastIndex((stroke) => strokeTouches(stroke, x, y, radius))
}

/** Indices des traits entièrement contenus dans la boîte */
export function strokeIndicesIn(
  strokes: TbiStroke[],
  bounds: TbiBounds,
): number[] {
  return strokes.flatMap((stroke, index) => {
    const { minX, minY, maxX, maxY } = strokeBounds(stroke)
    return isInBounds(bounds, minX, minY) && isInBounds(bounds, maxX, maxY)
      ? [index]
      : []
  })
}

/** Déplace les traits désignés, sans modifier les traits d'origine */
export function translateStrokes(
  strokes: TbiStroke[],
  indices: ReadonlySet<number>,
  dx: number,
  dy: number,
): TbiStroke[] {
  return strokes.map((stroke, index) =>
    indices.has(index)
      ? {
          ...stroke,
          points: stroke.points.map((n, i) => n + (i % 2 === 0 ? dx : dy)),
        }
      : stroke,
  )
}

/**
 * Borne un déplacement pour que la boîte reste sur la page : un trait sorti de
 * la page ne pourrait plus être rattrapé. Une boîte qui dépasse déjà, la page
 * ayant rétréci, ne saute pas : on la laisse où elle est.
 */
export function clampTranslation(
  bounds: TbiBounds,
  dx: number,
  dy: number,
  pageHeight: number,
): [number, number] {
  const clamp = (delta: number, low: number, high: number) =>
    Math.max(Math.min(0, low), Math.min(Math.max(0, high), delta))
  return [
    clamp(dx, -bounds.minX, 1 - bounds.maxX),
    clamp(dy, -bounds.minY, pageHeight - bounds.maxY),
  ]
}

/**
 * Faut-il écrire avec ce pointeur ? Souris, doigt et stylet écrivent tous : de
 * nombreux TBI signalent leur stylet comme un doigt. Dès qu'un vrai stylet a
 * été vu, le toucher n'écrit plus, pour que la paume ne laisse pas de trace.
 */
export function shouldDraw(pointerType: string, hasSeenPen: boolean): boolean {
  return !(hasSeenPen && pointerType === 'touch')
}

/** Lit des traits enregistrés (déjà passés par JSON.parse) */
export function readSavedStrokes(value: unknown): TbiStroke[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item: unknown) => {
    if (typeof item !== 'object' || item === null) return []
    const { tool, color, size, points } = item as Record<string, unknown>
    const isValid =
      (tool === 'pen' || tool === 'highlighter' || isTbiShape(tool)) &&
      (color === 'ink' ||
        color === 'blue' ||
        color === 'red' ||
        color === 'green') &&
      typeof size === 'number' &&
      Number.isFinite(size) &&
      Array.isArray(points) &&
      points.length >= 2 &&
      points.length % 2 === 0 &&
      (!isTbiShape(tool) || points.length === 4) &&
      points.every((n) => typeof n === 'number' && Number.isFinite(n))
    return isValid ? [{ tool, color, size, points } as TbiStroke] : []
  })
}
