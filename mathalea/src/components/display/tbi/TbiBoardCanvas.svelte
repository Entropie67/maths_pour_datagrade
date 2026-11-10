<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { darkMode } from '../../../lib/stores/generalStore'
  import {
    commitTbiBoardStrokes,
    tbiBoardPen,
    tbiInkColor,
  } from '../../../lib/stores/tbiBoardStore'
  import {
    addStrokePoint,
    arrowHead,
    boundsOfCorners,
    clampTranslation,
    eraseStrokesAt,
    hasShapeExtent,
    isFilledShape,
    isInBounds,
    isTbiShape,
    shouldDraw,
    strokeIndexAt,
    strokeIndicesIn,
    strokesBounds,
    translateStrokes,
    type TbiBoard,
    type TbiBounds,
    type TbiStroke,
  } from '../../../lib/tbiBoard'
  import { tbiWriting } from '../../../lib/tbiControls'

  /**
   * Encre d'un onglet : toute la page, au-dessus des exercices et sous les outils.
   * Elle défile avec le contenu. Le pointeur n'écrit qu'en mode écriture ; le
   * reste du temps, elle reste affichée et laisse passer les touchers vers les
   * exercices. Souris, doigt et stylet écrivent ; dès qu'un stylet a été vu, le
   * toucher n'écrit plus (voir `shouldDraw`).
   *
   * L'outil Déplacer prend le trait touché, ou tout ce qui est entouré quand le
   * geste part d'une zone vide : une écriture à la main compte beaucoup de traits.
   */
  interface Props {
    tabId: string
    board: TbiBoard
  }

  let { tabId, board }: Props = $props()

  /** Rayon de la gomme, relatif à la largeur de l'écran */
  const ERASER_RADIUS = 0.008
  /** Rayon de prise de l'outil Déplacer : plus large, pour viser au doigt */
  const MOVE_RADIUS = 0.012
  /** En deçà de cet écart, un toucher qui tremble ne déplace rien */
  const MOVE_THRESHOLD = 0.003
  /** Densité du tracé : au moins 2 pour rester net sur un grand écran */
  const MIN_PIXEL_RATIO = 2
  /** Plus grand côté de canvas accepté partout par les navigateurs (px) */
  const MAX_CANVAS_SIDE = 16000

  let canvas: HTMLCanvasElement
  let width = $state(0)
  let height = $state(0)
  let hasSeenPen = false
  let activePointer: number | null = null
  let beforeGesture: TbiStroke[] = []
  /** Traits pendant le geste, avant d'être versés à l'état de la séance */
  let liveStrokes: TbiStroke[] | null = null
  let liveStroke: TbiStroke | null = null
  /** Traits sélectionnés : une sélection périmée (annulation, onglet) s'efface d'elle-même */
  let selection = new Set<TbiStroke>()
  let moveGesture:
    | {
        kind: 'drag'
        fromX: number
        fromY: number
        indices: Set<number>
        bounds: TbiBounds
        hasStarted: boolean
      }
    | { kind: 'select'; fromX: number; fromY: number; x: number; y: number }
    | null = null

  function positionOf(event: PointerEvent): [number, number] {
    const rect = canvas.getBoundingClientRect()
    return [
      (event.clientX - rect.left) / rect.width,
      (event.clientY - rect.top) / rect.width,
    ]
  }

  /** Chemin d'une forme, d'après ses deux points */
  function traceShape(context: CanvasRenderingContext2D, stroke: TbiStroke) {
    const [x0, y0, x1, y1] = stroke.points.map((n) => n * width)
    if (stroke.tool === 'rectangle' || stroke.tool === 'filledRectangle') {
      context.rect(x0, y0, x1 - x0, y1 - y0)
    } else if (stroke.tool === 'ellipse' || stroke.tool === 'filledEllipse') {
      context.ellipse(
        (x0 + x1) / 2,
        (y0 + y1) / 2,
        Math.abs(x1 - x0) / 2,
        Math.abs(y1 - y0) / 2,
        0,
        0,
        2 * Math.PI,
      )
    } else {
      context.moveTo(x0, y0)
      context.lineTo(x1, y1)
      if (stroke.tool === 'arrow') {
        const [ax, ay, bx, by] = arrowHead(stroke).map((n) => n * width)
        context.moveTo(ax, ay)
        context.lineTo(x1, y1)
        context.lineTo(bx, by)
      }
    }
  }

  /** Chemin d'un trait à main levée, lissé entre ses points */
  function traceFreehand(context: CanvasRenderingContext2D, points: number[]) {
    context.moveTo(points[0] * width, points[1] * width)
    if (points.length === 2) {
      context.lineTo(points[0] * width + 0.01, points[1] * width)
    }
    for (let i = 2; i + 3 < points.length; i += 2) {
      context.quadraticCurveTo(
        points[i] * width,
        points[i + 1] * width,
        ((points[i] + points[i + 2]) / 2) * width,
        ((points[i + 1] + points[i + 3]) / 2) * width,
      )
    }
    if (points.length > 2) {
      context.lineTo(
        points[points.length - 2] * width,
        points[points.length - 1] * width,
      )
    }
  }

  /** Cadre en pointillés de la sélection, ou du geste qui la trace */
  function drawSelectionFrame(
    context: CanvasRenderingContext2D,
    bounds: TbiBounds,
    margin: number,
  ) {
    const { minX, minY, maxX, maxY } = bounds
    context.save()
    context.lineWidth = 2
    context.setLineDash([10, 8])
    context.strokeStyle = tbiInkColor('blue', $darkMode.isActive)
    context.strokeRect(
      (minX - margin) * width,
      (minY - margin) * width,
      (maxX - minX + 2 * margin) * width,
      (maxY - minY + 2 * margin) * width,
    )
    context.restore()
  }

  function draw() {
    const context = canvas?.getContext('2d')
    if (!context || width === 0) return
    const ratio = canvas.width / width
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    context.clearRect(0, 0, width, height)
    context.lineCap = 'round'
    context.lineJoin = 'round'
    const strokes = liveStrokes ?? board.strokes
    for (const stroke of strokes) {
      const color = tbiInkColor(stroke.color, $darkMode.isActive)
      context.globalAlpha = stroke.tool === 'highlighter' ? 0.32 : 1
      context.lineWidth =
        stroke.size * width * (stroke.tool === 'highlighter' ? 5 : 1)
      context.strokeStyle = color
      context.beginPath()
      if (isTbiShape(stroke.tool)) {
        traceShape(context, stroke)
        if (isFilledShape(stroke.tool)) {
          context.fillStyle = color
          context.fill()
        }
      } else {
        traceFreehand(context, stroke.points)
      }
      context.stroke()
    }
    context.globalAlpha = 1
    if (moveGesture?.kind === 'select') {
      const { fromX, fromY, x, y } = moveGesture
      drawSelectionFrame(context, boundsOfCorners(fromX, fromY, x, y), 0)
    } else {
      const { indices } = moveGesture ?? {}
      const selected = strokesBounds(
        indices
          ? strokes.filter((_, index) => indices.has(index))
          : strokes.filter((stroke) => selection.has(stroke)),
      )
      if (selected) drawSelectionFrame(context, selected, MOVE_RADIUS / 2)
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0) return
    width = rect.width
    height = rect.height
    const ratio = Math.min(
      Math.max(window.devicePixelRatio || 1, MIN_PIXEL_RATIO),
      MAX_CANVAS_SIDE / Math.max(width, height),
    )
    canvas.width = width * ratio
    canvas.height = height * ratio
    draw()
  }

  $effect(() => {
    // redessin à chaque changement des traits ou du thème
    void board.strokes
    void $darkMode.isActive
    if (!$tbiWriting || $tbiBoardPen.tool !== 'move') selection = new Set()
    draw()
  })

  /** Début d'un geste de l'outil Déplacer : dans la sélection, sur un trait ou à vide */
  function startMove(x: number, y: number) {
    const strokes = board.strokes
    const selected = strokes.flatMap((stroke, index) =>
      selection.has(stroke) ? [index] : [],
    )
    const selectedBounds = strokesBounds(selected.map((i) => strokes[i]))
    const isOnSelection =
      selectedBounds !== null && isInBounds(selectedBounds, x, y, MOVE_RADIUS)
    const hit = isOnSelection ? -1 : strokeIndexAt(strokes, x, y, MOVE_RADIUS)
    const indices = isOnSelection ? selected : hit >= 0 ? [hit] : []
    const bounds = strokesBounds(indices.map((i) => strokes[i]))
    selection = new Set(indices.map((i) => strokes[i]))
    moveGesture = bounds
      ? {
          kind: 'drag',
          fromX: x,
          fromY: y,
          indices: new Set(indices),
          bounds,
          hasStarted: false,
        }
      : { kind: 'select', fromX: x, fromY: y, x, y }
  }

  function continueMove(x: number, y: number) {
    if (moveGesture?.kind === 'select') {
      moveGesture.x = x
      moveGesture.y = y
    } else if (moveGesture?.kind === 'drag') {
      const offsetX = x - moveGesture.fromX
      const offsetY = y - moveGesture.fromY
      if (Math.hypot(offsetX, offsetY) >= MOVE_THRESHOLD) {
        moveGesture.hasStarted = true
      }
      if (!moveGesture.hasStarted) return
      const [dx, dy] = clampTranslation(
        moveGesture.bounds,
        offsetX,
        offsetY,
        height / width,
      )
      liveStrokes = translateStrokes(beforeGesture, moveGesture.indices, dx, dy)
    }
  }

  /** Fin du geste : la sélection suit les traits déplacés, ou ce qui a été entouré */
  function endMove(next: TbiStroke[]) {
    if (moveGesture?.kind === 'select') {
      const { fromX, fromY, x, y } = moveGesture
      const indices = strokeIndicesIn(next, boundsOfCorners(fromX, fromY, x, y))
      selection = new Set(indices.map((i) => next[i]))
    } else if (moveGesture?.kind === 'drag') {
      const { indices } = moveGesture
      selection = new Set(next.filter((_, index) => indices.has(index)))
    }
    moveGesture = null
  }

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === 'pen') hasSeenPen = true
    if (
      activePointer !== null ||
      !shouldDraw(event.pointerType, hasSeenPen) ||
      (event.pointerType === 'mouse' && event.button !== 0)
    ) {
      return
    }
    event.preventDefault()
    activePointer = event.pointerId
    canvas.setPointerCapture(event.pointerId)
    beforeGesture = board.strokes
    liveStrokes = [...board.strokes]
    const [x, y] = positionOf(event)
    const { tool, color, size } = $tbiBoardPen
    if (tool === 'eraser') {
      liveStrokes = eraseStrokesAt(liveStrokes, x, y, ERASER_RADIUS)
    } else if (tool === 'move') {
      startMove(x, y)
    } else {
      liveStroke = {
        tool,
        color,
        size,
        points: isTbiShape(tool) ? [x, y, x, y] : [x, y],
      }
      liveStrokes.push(liveStroke)
    }
    draw()
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerId !== activePointer || liveStrokes === null) return
    const events = event.getCoalescedEvents?.() ?? []
    for (const sample of events.length > 0 ? events : [event]) {
      const [x, y] = positionOf(sample)
      if (moveGesture) {
        continueMove(x, y)
      } else if (liveStroke && isTbiShape(liveStroke.tool)) {
        liveStroke.points[2] = x
        liveStroke.points[3] = y
      } else if (liveStroke) {
        addStrokePoint(liveStroke, x, y)
      } else {
        liveStrokes = eraseStrokesAt(liveStrokes, x, y, ERASER_RADIUS)
      }
    }
    draw()
  }

  function onPointerEnd(event: PointerEvent) {
    if (event.pointerId !== activePointer || liveStrokes === null) return
    activePointer = null
    // une forme née d'un simple tapotement n'est pas gardée
    const next =
      liveStroke && isTbiShape(liveStroke.tool) && !hasShapeExtent(liveStroke)
        ? liveStrokes.filter((stroke) => stroke !== liveStroke)
        : liveStrokes
    const hasChanged =
      next.length !== beforeGesture.length ||
      next.some((stroke, index) => stroke !== beforeGesture[index])
    endMove(next)
    liveStroke = null
    liveStrokes = null
    if (hasChanged) commitTbiBoardStrokes(tabId, beforeGesture, next)
    else draw()
  }

  // la page grandit et rétrécit avec son contenu
  let observer: ResizeObserver | undefined

  onMount(() => {
    observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
  })

  onDestroy(() => observer?.disconnect())
</script>

<canvas
  bind:this={canvas}
  data-tbi-board
  class="absolute inset-0 w-full h-full z-20 print-hidden {$tbiWriting
    ? 'tbi-ink-writing'
    : 'pointer-events-none'} {$tbiBoardPen.tool === 'move'
    ? 'tbi-ink-moving'
    : ''}"
  aria-label="Zone d'écriture"
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerEnd}
  onpointercancel={onPointerEnd}
></canvas>

<style>
  .tbi-ink-writing {
    touch-action: none;
    cursor: crosshair;
  }
  .tbi-ink-writing.tbi-ink-moving {
    cursor: move;
  }
</style>
