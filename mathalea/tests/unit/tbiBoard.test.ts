import { get } from 'svelte/store'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  canRedoTbiBoard,
  canUndoTbiBoard,
  commitTbiBoardStrokes,
  redoTbiBoard,
  resetTbiBoardHistory,
  undoTbiBoard,
} from '../../src/lib/stores/tbiBoardStore'
import {
  activeTbiTab,
  addTbiBoard,
  defaultTbiState,
  tbiState,
} from '../../src/lib/stores/tbiStore'
import {
  addStrokePoint,
  arrowHead,
  boundsOfCorners,
  clampTranslation,
  eraseStrokesAt,
  hasShapeExtent,
  isInBounds,
  readSavedStrokes,
  shouldDraw,
  strokeBounds,
  strokeIndexAt,
  strokeIndicesIn,
  strokesBounds,
  strokeTouches,
  translateStrokes,
  type TbiStroke,
  type TbiStrokeTool,
} from '../../src/lib/tbiBoard'

const stroke = (points: number[]): TbiStroke => ({
  tool: 'pen',
  color: 'ink',
  size: 0.002,
  points,
})

const shape = (tool: TbiStrokeTool, points: number[]): TbiStroke => ({
  ...stroke(points),
  tool,
})

describe('formes du Tableau', () => {
  it('un rectangle vide ne se touche que sur son contour', () => {
    const rectangle = shape('rectangle', [0.5, 0.5, 0.1, 0.2])
    expect(strokeTouches(rectangle, 0.3, 0.2, 0.005)).toBe(true)
    expect(strokeTouches(rectangle, 0.5, 0.35, 0.005)).toBe(true)
    expect(strokeTouches(rectangle, 0.3, 0.35, 0.005)).toBe(false)
  })

  it('un rectangle plein se touche aussi à l’intérieur', () => {
    const rectangle = shape('filledRectangle', [0.5, 0.5, 0.1, 0.2])
    expect(strokeTouches(rectangle, 0.3, 0.35, 0.005)).toBe(true)
    expect(strokeTouches(rectangle, 0.6, 0.35, 0.005)).toBe(false)
  })

  it('un ovale vide ne se touche que sur son contour', () => {
    const ellipse = shape('ellipse', [0.1, 0.1, 0.5, 0.3])
    expect(strokeTouches(ellipse, 0.3, 0.1, 0.005)).toBe(true)
    expect(strokeTouches(ellipse, 0.5, 0.2, 0.005)).toBe(true)
    expect(strokeTouches(ellipse, 0.3, 0.2, 0.005)).toBe(false)
    // le coin de sa boîte n'est pas sur l'ovale
    expect(strokeTouches(ellipse, 0.1, 0.1, 0.005)).toBe(false)
  })

  it('un ovale plein se touche à l’intérieur, pas dans les coins de sa boîte', () => {
    const ellipse = shape('filledEllipse', [0.1, 0.1, 0.5, 0.3])
    expect(strokeTouches(ellipse, 0.3, 0.2, 0.005)).toBe(true)
    expect(strokeTouches(ellipse, 0.11, 0.11, 0.005)).toBe(false)
  })

  it('la gomme retire une forme touchée', () => {
    const filled = shape('filledRectangle', [0.1, 0.1, 0.5, 0.5])
    expect(eraseStrokesAt([filled], 0.3, 0.3, 0.005)).toEqual([])
  })

  it('un trait et une flèche se touchent entre leurs extrémités', () => {
    expect(
      strokeTouches(shape('line', [0, 0, 1, 1]), 0.5, 0.5, 0.005),
    ).toBe(true)
    expect(
      strokeTouches(shape('arrow', [0, 0, 1, 0]), 0.5, 0, 0.005),
    ).toBe(true)
    expect(
      strokeTouches(shape('arrow', [0, 0, 1, 0]), 0.5, 0.2, 0.005),
    ).toBe(false)
  })

  it('la pointe d’une flèche est symétrique, en arrière de son extrémité', () => {
    const [ax, ay, bx, by] = arrowHead(shape('arrow', [0, 0.5, 1, 0.5]))
    expect(ax).toBeCloseTo(bx)
    expect(ax).toBeLessThan(1)
    expect(ay - 0.5).toBeCloseTo(0.5 - by)
    expect(ay).not.toBeCloseTo(by)
  })

  it('la pointe d’une flèche courte ne dépasse pas sa moitié', () => {
    const [ax] = arrowHead(shape('arrow', [0, 0, 0.01, 0]))
    expect(ax).toBeGreaterThanOrEqual(0.005 - 1e-9)
  })

  it('un tapotement ne laisse pas de forme', () => {
    expect(hasShapeExtent(shape('line', [0.2, 0.2, 0.2, 0.2]))).toBe(false)
    expect(hasShapeExtent(shape('line', [0.2, 0.2, 0.2, 0.3]))).toBe(true)
    // un rectangle réduit à une ligne reste visible
    expect(hasShapeExtent(shape('rectangle', [0.2, 0.2, 0.3, 0.2]))).toBe(true)
  })

  it('relit les formes enregistrées, avec exactement deux points', () => {
    const valid = shape('filledEllipse', [0.1, 0.2, 0.3, 0.4])
    expect(
      readSavedStrokes([
        valid,
        { ...valid, points: [0.1, 0.2] },
        { ...valid, points: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6] },
      ]),
    ).toEqual([valid])
  })
})

describe('déplacer des tracés', () => {
  it('prend le trait visible : le dernier tracé', () => {
    const below = shape('filledRectangle', [0, 0, 1, 1])
    const above = stroke([0, 0.5, 1, 0.5])
    expect(strokeIndexAt([below, above], 0.5, 0.5, 0.005)).toBe(1)
    expect(strokeIndexAt([below, above], 0.5, 0.2, 0.005)).toBe(0)
    expect(strokeIndexAt([above], 0.5, 0.2, 0.005)).toBe(-1)
  })

  it('ne sélectionne que les traits entièrement dans la boîte', () => {
    const inside = stroke([0.2, 0.2, 0.3, 0.3])
    const across = stroke([0.2, 0.2, 0.9, 0.9])
    const rectangle = shape('rectangle', [0.4, 0.4, 0.25, 0.25])
    expect(
      strokeIndicesIn(
        [inside, across, rectangle],
        boundsOfCorners(0.5, 0.5, 0.1, 0.1),
      ),
    ).toEqual([0, 2])
  })

  it('déplace les seuls traits désignés, sans toucher aux originaux', () => {
    const moved = stroke([0.1, 0.2, 0.3, 0.4])
    const still = stroke([0.5, 0.5])
    const next = translateStrokes([moved, still], new Set([0]), 0.1, -0.1)
    expect(next[0].points[0]).toBeCloseTo(0.2)
    expect(next[0].points[1]).toBeCloseTo(0.1)
    expect(next[0].points[2]).toBeCloseTo(0.4)
    expect(next[0].points[3]).toBeCloseTo(0.3)
    expect(next[1]).toBe(still)
    expect(moved.points).toEqual([0.1, 0.2, 0.3, 0.4])
  })

  it('calcule la boîte d’un ou de plusieurs traits', () => {
    const first = stroke([0.3, 0.1, 0.2, 0.4])
    const second = shape('rectangle', [0.6, 0.5, 0.5, 0.05])
    expect(strokeBounds(first)).toEqual({
      minX: 0.2,
      minY: 0.1,
      maxX: 0.3,
      maxY: 0.4,
    })
    expect(strokesBounds([first, second])).toEqual({
      minX: 0.2,
      minY: 0.05,
      maxX: 0.6,
      maxY: 0.5,
    })
    expect(strokesBounds([])).toBeNull()
    expect(isInBounds(strokeBounds(first), 0.25, 0.2)).toBe(true)
    expect(isInBounds(strokeBounds(first), 0.31, 0.2)).toBe(false)
    expect(isInBounds(strokeBounds(first), 0.31, 0.2, 0.02)).toBe(true)
  })

  it('garde les traits déplacés sur la page', () => {
    const bounds = { minX: 0.2, minY: 0.2, maxX: 0.4, maxY: 0.4 }
    expect(clampTranslation(bounds, 0.1, 0.1, 0.6)).toEqual([0.1, 0.1])
    const [left, top] = clampTranslation(bounds, -0.5, -0.5, 0.6)
    expect(left).toBeCloseTo(-0.2)
    expect(top).toBeCloseTo(-0.2)
    const [right, bottom] = clampTranslation(bounds, 0.9, 0.9, 0.6)
    expect(right).toBeCloseTo(0.6)
    expect(bottom).toBeCloseTo(0.2)
  })

  it('ne fait pas sauter un trait qui dépasse déjà de la page', () => {
    const bounds = { minX: 0.2, minY: 0.5, maxX: 0.4, maxY: 0.9 }
    expect(clampTranslation(bounds, 0, 0, 0.6)).toEqual([0, 0])
    // il ne peut que remonter
    expect(clampTranslation(bounds, 0, 0.1, 0.6)).toEqual([0, 0])
    expect(clampTranslation(bounds, 0, -0.1, 0.6)).toEqual([0, -0.1])
  })
})

describe('écriture du Tableau', () => {
  it('fond deux points trop proches', () => {
    const line = stroke([0.1, 0.1])
    addStrokePoint(line, 0.1001, 0.1001)
    expect(line.points).toHaveLength(2)
    addStrokePoint(line, 0.2, 0.2)
    expect(line.points).toEqual([0.1, 0.1, 0.2, 0.2])
  })

  it('touche un trait entre ses points, et pas à côté', () => {
    const line = stroke([0, 0, 1, 0])
    expect(strokeTouches(line, 0.5, 0.001, 0.005)).toBe(true)
    expect(strokeTouches(line, 0.5, 0.1, 0.005)).toBe(false)
    // un point isolé
    expect(strokeTouches(stroke([0.5, 0.5]), 0.5, 0.5, 0.005)).toBe(true)
  })

  it('la gomme retire les traits entiers touchés', () => {
    const near = stroke([0, 0, 1, 0])
    const far = stroke([0, 0.5, 1, 0.5])
    expect(eraseStrokesAt([near, far], 0.5, 0, 0.01)).toEqual([far])
  })

  it('souris, doigt et stylet écrivent, puis le stylet seul quand il est là', () => {
    expect(shouldDraw('mouse', false)).toBe(true)
    expect(shouldDraw('touch', false)).toBe(true)
    expect(shouldDraw('pen', false)).toBe(true)
    // la paume ne laisse pas de trace à côté d'un stylet
    expect(shouldDraw('touch', true)).toBe(false)
    expect(shouldDraw('pen', true)).toBe(true)
    expect(shouldDraw('mouse', true)).toBe(true)
  })

  it('écarte les traits enregistrés invalides', () => {
    const valid = stroke([0.1, 0.2])
    expect(
      readSavedStrokes([
        valid,
        { ...valid, tool: 'marteau' },
        { ...valid, color: 'violet' },
        { ...valid, points: [0.1] },
        { ...valid, points: [0.1, 'x'] },
        { ...valid, size: Infinity },
        null,
      ]),
    ).toEqual([valid])
    expect(readSavedStrokes('rien')).toEqual([])
  })
})

describe('annuler et rétablir sur un Tableau', () => {
  let tabId: string
  const strokes = () => activeTbiTab(get(tbiState)).board?.strokes ?? []

  beforeEach(() => {
    tbiState.set(defaultTbiState())
    resetTbiBoardHistory()
    tabId = get(tbiState).activeTabId
    addTbiBoard(tabId)
  })

  it('annule et rétablit les traits dans l’ordre', () => {
    const first = stroke([0.1, 0.1])
    const second = stroke([0.2, 0.2])
    commitTbiBoardStrokes(tabId, [], [first])
    commitTbiBoardStrokes(tabId, [first], [first, second])
    expect(canUndoTbiBoard(tabId)).toBe(true)
    expect(canRedoTbiBoard(tabId)).toBe(false)
    undoTbiBoard(tabId, strokes())
    expect(strokes()).toEqual([first])
    undoTbiBoard(tabId, strokes())
    expect(strokes()).toEqual([])
    expect(canUndoTbiBoard(tabId)).toBe(false)
    redoTbiBoard(tabId, strokes())
    expect(strokes()).toEqual([first])
    redoTbiBoard(tabId, strokes())
    expect(strokes()).toEqual([first, second])
  })

  it('un nouveau trait efface ce qui pouvait être rétabli', () => {
    const first = stroke([0.1, 0.1])
    commitTbiBoardStrokes(tabId, [], [first])
    undoTbiBoard(tabId, strokes())
    commitTbiBoardStrokes(tabId, [], [stroke([0.3, 0.3])])
    expect(canRedoTbiBoard(tabId)).toBe(false)
  })
})
