import type { Shape2D } from '../2d/Figures2D'
import { listeShapes2DInfos } from '../2d/figures2d/shapes2d'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

export type Shape2DGridCell = {
  x: number
  y: number
  shape: string
  rotate?: number
  scale?: number
}
export type Shape2DGridState = {
  version: 1
  grid: number
  cells: Shape2DGridCell[]
}
export type Shape2DGridEditorCreateOptions = {
  id?: string
  numeroExercice: number
  questionIndex: number
  /** Formes proposées comme tampons, dans l'ordre de la palette. */
  shapes: readonly Shape2D[]
  initialState?: Shape2DGridState
  grid?: number
  interactivityOn?: boolean
}
export type Shape2DGridEditorOptions = Omit<
  Shape2DGridEditorCreateOptions,
  'numeroExercice' | 'questionIndex'
> & { expectedState?: Shape2DGridState }
type Stamp = {
  id: string
  name: string
  codeSvg: string
  definitionSvg: string
  rotate: number
  scale: number
}

const DEFAULT_GRID = 12
const CELL_SIZE = 32
const isInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value)
const isHalfInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value * 2)
const normalizedNumber = (value: number) =>
  Object.is(value, -0) ? 0 : Math.round(value * 1e9) / 1e9
const normalizedAngle = (value: number) =>
  normalizedNumber(((value % 360) + 360) % 360)
const cellKey = ({ x, y, shape, rotate = 0, scale = 1 }: Shape2DGridCell) =>
  `${normalizedNumber(x)},${normalizedNumber(y)},${shape},${normalizedAngle(rotate)},${normalizedNumber(scale)}`

export function parseShape2DGridState(value: unknown): Shape2DGridState | null {
  if (typeof value === 'string') {
    try {
      return parseShape2DGridState(JSON.parse(value))
    } catch {
      return null
    }
  }
  if (value == null || typeof value !== 'object') return null
  const candidate = value as Partial<Shape2DGridState>
  if (!Array.isArray(candidate.cells)) return null
  const grid =
    isInteger(candidate.grid) && candidate.grid > 0
      ? candidate.grid
      : DEFAULT_GRID
  const cells = new Map<string, Shape2DGridCell>()
  for (const raw of candidate.cells) {
    if (raw == null || typeof raw !== 'object') return null
    const cell = raw as Partial<Shape2DGridCell>
    if (
      !isHalfInteger(cell.x) ||
      !isHalfInteger(cell.y) ||
      typeof cell.shape !== 'string' ||
      cell.shape === ''
    )
      return null
    const rotate = typeof cell.rotate === 'number' ? cell.rotate : 0
    const scale =
      typeof cell.scale === 'number' && cell.scale > 0 ? cell.scale : 1
    const key = `${cell.x},${cell.y},${cell.shape},${rotate},${scale}`
    cells.set(key, {
      x: cell.x,
      y: cell.y,
      shape: cell.shape,
      ...(rotate === 0 ? {} : { rotate }),
      ...(scale === 1 ? {} : { scale }),
    })
  }
  return { version: 1, grid, cells: [...cells.values()] }
}

function canonicalCells(cells: Shape2DGridCell[]): string {
  if (cells.length === 0) return ''
  const minX = Math.min(...cells.map(({ x }) => x))
  const minY = Math.min(...cells.map(({ y }) => y))
  return cells
    .map(
      ({ x, y, shape, rotate = 0, scale = 1 }) =>
        `${normalizedNumber(x - minX)},${normalizedNumber(y - minY)},${shape},${normalizedAngle(rotate)},${normalizedNumber(scale)}`,
    )
    .sort()
    .join(';')
}

export type Shape2DGridDifference = {
  missing: Shape2DGridCell[]
  extra: Shape2DGridCell[]
}

/** Aligne au mieux le motif attendu sur la réponse et décrit leurs différences. */
export function shape2DGridDifference(
  expectedValue: Shape2DGridState | string,
  actualValue: Shape2DGridState | string,
): Shape2DGridDifference | null {
  const expected = parseShape2DGridState(expectedValue)
  const actual = parseShape2DGridState(actualValue)
  if (expected == null || actual == null) return null
  const translations = new Map<string, [number, number]>()
  const addTranslation = (dx: number, dy: number) => {
    const normalized: [number, number] = [
      normalizedNumber(dx),
      normalizedNumber(dy),
    ]
    translations.set(normalized.join(','), normalized)
  }
  if (expected.cells.length > 0 && actual.cells.length > 0) {
    addTranslation(
      Math.min(...actual.cells.map(({ x }) => x)) -
        Math.min(...expected.cells.map(({ x }) => x)),
      Math.min(...actual.cells.map(({ y }) => y)) -
        Math.min(...expected.cells.map(({ y }) => y)),
    )
    for (const expectedCell of expected.cells) {
      for (const actualCell of actual.cells) {
        addTranslation(
          actualCell.x - expectedCell.x,
          actualCell.y - expectedCell.y,
        )
      }
    }
  } else {
    addTranslation(0, 0)
  }
  const actualKeys = new Set(actual.cells.map(cellKey))
  let alignedExpected = expected.cells
  let bestMatches = -1
  for (const [dx, dy] of translations.values()) {
    const candidate = expected.cells.map((cell) => ({
      ...cell,
      x: normalizedNumber(cell.x + dx),
      y: normalizedNumber(cell.y + dy),
    }))
    const matches = candidate.filter((cell) =>
      actualKeys.has(cellKey(cell)),
    ).length
    if (matches > bestMatches) {
      bestMatches = matches
      alignedExpected = candidate
    }
  }
  const expectedKeys = new Set(alignedExpected.map(cellKey))
  return {
    missing: alignedExpected.filter((cell) => !actualKeys.has(cellKey(cell))),
    extra: actual.cells.filter((cell) => !expectedKeys.has(cellKey(cell))),
  }
}

/** Compare les cellules et leurs formes modulo une translation dans la grille. */
export function areShape2DGridsCongruent(
  first: Shape2DGridState | string,
  second: Shape2DGridState | string,
): boolean {
  const a = parseShape2DGridState(first)
  const b = parseShape2DGridState(second)
  return (
    a != null &&
    b != null &&
    a.cells.length === b.cells.length &&
    canonicalCells(a.cells) === canonicalCells(b.cells)
  )
}

function stampsFromShapes(shapes: readonly Shape2D[]): Stamp[] {
  const stamps = shapes.map((shape, index) => {
    const entry = Object.entries(listeShapes2DInfos).find(
      ([, infos]) =>
        infos.shape2D === shape || infos.shape2D.codeSvg === shape.codeSvg,
    )
    if (entry == null)
      throw new Error(
        `Shape2DGridEditorElement : la forme ${shape.name || index + 1} n'appartient pas à listeShapes2DInfos.`,
      )
    const [name, infos] = entry
    const rotate = shape.angle || 0
    const scale = shape.scale.x || 1
    return {
      id: shape2DStampId(name, rotate, scale),
      name,
      codeSvg: shape.codeSvg,
      definitionSvg: infos.shapeDef.svg?.(20) ?? '',
      rotate,
      scale,
    }
  })
  return [...new Map(stamps.map((stamp) => [stamp.id, stamp])).values()]
}

export function shape2DStampId(name: string, rotate = 0, scale = 1): string {
  return `${name}|${rotate}|${scale}`
}

export class Shape2DGridEditorElement extends MathaleaCustomElement {
  static readonly elementTag = 'shape-2d-grid-editor'
  private state: Shape2DGridState = {
    version: 1,
    grid: DEFAULT_GRID,
    cells: [],
  }
  private stamps: Stamp[] = []
  private selectedStampId = ''
  private erasing = false
  private selecting = false
  private selected = new Set<string>()
  private missingFeedback: Shape2DGridCell[] = []
  private extraFeedback = new Set<string>()
  private correctionFeedbackMessage = ''

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  static create({
    id,
    numeroExercice,
    questionIndex,
    shapes,
    initialState = { version: 1, grid: DEFAULT_GRID, cells: [] },
    grid = initialState.grid,
    interactivityOn = true,
  }: Shape2DGridEditorCreateOptions): string {
    return super.create({
      id: id ?? `${this.elementTag}Ex${numeroExercice}Q${questionIndex}`,
      numeroExercice,
      questionIndex,
      stamps: stampsFromShapes(shapes),
      initialState: { ...initialState, grid },
      interactivityOn,
    })
  }

  static verifQuestion(exercice: IExercice, questionIndex: number) {
    const id = `${this.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`
    const element = document.getElementById(
      id,
    ) as Shape2DGridEditorElement | null
    const result = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${questionIndex}`,
    )
    const feedback = document.querySelector(
      `#feedbackEx${exercice.numeroExercice}Q${questionIndex}`,
    ) as HTMLElement | null
    const expected =
      exercice.autoCorrection?.[questionIndex]?.valeur?.reponse?.value
    const actual = element?.value ?? ''
    const isOk =
      element != null && areShape2DGridsCongruent(expected as string, actual)
    const difference =
      element == null ? null : shape2DGridDifference(expected as string, actual)
    const message =
      element == null
        ? "L'éditeur de motif est introuvable."
        : isOk
          ? ''
          : difference == null
            ? "La réponse n'a pas pu être comparée au motif attendu."
            : [
                difference.missing.length > 0
                  ? `${difference.missing.length} forme${difference.missing.length > 1 ? 's sont attendues' : ' est attendue'} aux repères orange (+).`
                  : '',
                difference.extra.length > 0
                  ? `${difference.extra.length} forme${difference.extra.length > 1 ? 's sont en trop ou incorrectes' : ' est en trop ou incorrecte'} aux repères rouges (×).`
                  : '',
              ]
                .filter(Boolean)
                .join(' ')
    if (element != null) {
      element.showCorrectionFeedback(expected as string, message)
      exercice.answers ??= {}
      exercice.answers[element.id] = actual
      element.interactivityOn = false
    }
    if (result != null) result.innerHTML = isOk ? '😎' : '☹️'
    if (feedback != null) {
      feedback.textContent = message
      feedback.style.display = message === '' ? 'none' : 'block'
    }
    return {
      isOk,
      feedback: message,
      score: { nbBonnesReponses: isOk ? 1 : 0, nbReponses: 1 },
    }
  }

  static formatStudentAnswer(rawAnswer: string): string {
    const state = parseShape2DGridState(rawAnswer)
    return state == null
      ? rawAnswer
      : `${state.cells.length} forme${state.cells.length > 1 ? 's' : ''}`
  }

  connectedCallback(): void {
    this.hydrateCommonAttributes()
    const initial = parseShape2DGridState(this.getAttribute('initial-state'))
    if (initial != null) this.state = initial
    this.stamps = this.parseStamps(this.getAttribute('stamps'))
    this.selectedStampId = this.stamps[0]?.id ?? ''
    this.render()
  }

  render(): string | void {
    if (this.shadowRoot == null) return ''
    const size = this.state.grid * CELL_SIZE
    const disabled = this.interactivityOn ? '' : 'disabled'
    const definitions = this.stamps
      .map(({ definitionSvg }) => definitionSvg)
      .join('')
    const cells = this.state.cells
      .map((cell) => {
        const stamp = this.stamps.find(
          ({ id }) =>
            id ===
            shape2DStampId(cell.shape, cell.rotate ?? 0, cell.scale ?? 1),
        )
        if (stamp == null) return ''
        const selection = this.selected.has(cellKey(cell))
          ? `<rect x="-${CELL_SIZE / 2 - 2}" y="-${CELL_SIZE / 2 - 2}" width="${CELL_SIZE - 4}" height="${CELL_SIZE - 4}" fill="#facc1533" stroke="#ca8a04" stroke-width="2"/>`
          : ''
        const extra = this.extraFeedback.has(cellKey(cell))
          ? `<rect class="feedback-extra" x="-${CELL_SIZE / 2 - 2}" y="-${CELL_SIZE / 2 - 2}" width="${CELL_SIZE - 4}" height="${CELL_SIZE - 4}"/><text class="feedback-symbol extra" x="0" y="6">×</text>`
          : ''
        return `<g transform="translate(${cell.x * CELL_SIZE + CELL_SIZE / 2} ${cell.y * CELL_SIZE + CELL_SIZE / 2})">${selection}<g transform="scale(${CELL_SIZE / 20}) rotate(${-stamp.rotate}) scale(${stamp.scale})">${stamp.codeSvg}</g>${extra}</g>`
      })
      .join('')
    const missingCells = this.missingFeedback
      .map(
        (cell) =>
          `<g transform="translate(${cell.x * CELL_SIZE + CELL_SIZE / 2} ${cell.y * CELL_SIZE + CELL_SIZE / 2})"><rect class="feedback-missing" x="-${CELL_SIZE / 2 - 2}" y="-${CELL_SIZE / 2 - 2}" width="${CELL_SIZE - 4}" height="${CELL_SIZE - 4}"/><text class="feedback-symbol missing" x="0" y="6">+</text></g>`,
      )
      .join('')
    const hitCells = Array.from({ length: this.state.grid ** 2 }, (_, i) => {
      const x = i % this.state.grid
      const y = Math.floor(i / this.state.grid)
      const isSelected = this.state.cells.some(
        (cell) =>
          cell.x === x && cell.y === y && this.selected.has(cellKey(cell)),
      )
      return `<rect class="hit${isSelected ? ' selected' : ''}" data-x="${x}" data-y="${y}" x="${x * CELL_SIZE}" y="${y * CELL_SIZE}" width="${CELL_SIZE}" height="${CELL_SIZE}"/>`
    }).join('')
    const palette = this.stamps
      .map(
        (stamp) =>
          `<button type="button" data-stamp="${stamp.id}" class="${!this.erasing && !this.selecting && stamp.id === this.selectedStampId ? 'active' : ''}" title="Tampon ${stamp.name}${stamp.rotate === 0 ? '' : ` tourné de ${stamp.rotate}°`}" ${disabled}><svg viewBox="-24 -24 48 48" aria-hidden="true">${definitions}<g transform="rotate(${-stamp.rotate}) scale(${stamp.scale})">${stamp.codeSvg}</g></svg><span>${stamp.name}${stamp.rotate === 0 ? '' : ` ${stamp.rotate}°`}</span></button>`,
      )
      .join('')
    const moves = this.selecting
      ? `<span class="moves" aria-label="Déplacer la sélection par demi-pas"><button data-move-x="-0.5" data-move-y="0" title="Déplacer vers la gauche" ${disabled || this.selected.size === 0 ? 'disabled' : ''}>←</button><button data-move-x="0.5" data-move-y="0" title="Déplacer vers la droite" ${disabled || this.selected.size === 0 ? 'disabled' : ''}>→</button><button data-move-x="0" data-move-y="-0.5" title="Déplacer vers le haut" ${disabled || this.selected.size === 0 ? 'disabled' : ''}>↑</button><button data-move-x="0" data-move-y="0.5" title="Déplacer vers le bas" ${disabled || this.selected.size === 0 ? 'disabled' : ''}>↓</button></span>`
      : ''
    const correctionFeedback = this.correctionFeedbackMessage
      ? `<div class="correction-feedback" role="status">${this.correctionFeedbackMessage}</div>`
      : ''
    this.shadowRoot.innerHTML = `<style>:host{display:block;max-width:720px;margin:.5rem 0;color:#1f2937;font-family:system-ui,sans-serif}.editor{overflow:hidden;border:1px solid #cbd5e1;border-radius:.6rem;background:#f8fafc}.toolbar{display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;padding:.55rem;background:white;border-bottom:1px solid #e2e8f0}.moves{display:flex;gap:.2rem;padding-left:.2rem;border-left:1px solid #cbd5e1}button{display:flex;align-items:center;gap:.3rem;padding:.3rem .55rem;border:1px solid #94a3b8;border-radius:.35rem;background:white;cursor:pointer}button svg{width:1.8rem;height:1.8rem}button.active{color:white;background:#2563eb;border-color:#2563eb}button:disabled{cursor:default;opacity:.55}.count{margin-left:auto;font-size:.9rem}.grid-wrap{padding:.7rem;overflow:auto}.grid{display:block;max-width:100%;height:auto;margin:auto;background:white;border:1px solid #64748b;touch-action:none}.hit{fill:transparent;stroke:#cbd5e1;stroke-width:1}.hit.selected{fill:#facc1555;stroke:#ca8a04;stroke-width:2}.grid.interactive .hit:hover{fill:#dbeafe88}.grid.interactive .hit.selected:hover{fill:#facc1588}.grid:not(.interactive) .hit{pointer-events:none}.feedback-extra{fill:#ef444433;stroke:#dc2626;stroke-width:2}.feedback-missing{fill:#f59e0b22;stroke:#d97706;stroke-width:2;stroke-dasharray:4 3}.feedback-symbol{font:bold 22px system-ui;text-anchor:middle;pointer-events:none}.feedback-symbol.extra{fill:#dc2626}.feedback-symbol.missing{fill:#b45309}.correction-feedback{padding:.55rem .7rem;color:#991b1b;background:#fef2f2;border-top:1px solid #fecaca;font-size:.9rem}.hint{padding:.4rem .6rem;font-size:.8rem;background:white;border-top:1px solid #e2e8f0}</style><div class="editor"><div class="toolbar" role="toolbar" aria-label="Tampons du motif">${palette}<button type="button" data-erase="true" class="${this.erasing ? 'active' : ''}" ${disabled}>Effacer</button><button type="button" data-select="true" class="${this.selecting ? 'active' : ''}" ${disabled}>Sélectionner</button>${moves}<span class="count">${this.state.cells.length} forme${this.state.cells.length > 1 ? 's' : ''}</span></div><div class="grid-wrap"><svg class="grid${this.interactivityOn ? ' interactive' : ''}" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-label="Grille carrée de dessin du motif">${definitions}${cells}${missingCells}${hitCells}</svg></div>${correctionFeedback}<div class="hint">Choisir un tampon puis cliquer sur la grille. Le mode « Sélectionner » permet de déplacer les formes choisies par demi-pas.</div></div>`
    this.bindEvents()
  }

  get value(): string {
    return JSON.stringify({
      version: 1,
      grid: this.state.grid,
      cells: [...this.state.cells].sort(
        (a, b) =>
          a.y - b.y ||
          a.x - b.x ||
          a.shape.localeCompare(b.shape) ||
          (a.rotate ?? 0) - (b.rotate ?? 0) ||
          (a.scale ?? 1) - (b.scale ?? 1),
      ),
    })
  }
  set value(nextValue: string) {
    this.update(nextValue)
  }
  update(nextValue: string | Shape2DGridState): void {
    const parsed = parseShape2DGridState(nextValue)
    if (parsed == null) return
    this.state = parsed
    this.selected.clear()
    this.render()
  }
  showCorrectionFeedback(
    expectedValue: Shape2DGridState | string,
    message = '',
  ): Shape2DGridDifference | null {
    const difference = shape2DGridDifference(expectedValue, this.state)
    this.missingFeedback = difference?.missing ?? []
    this.extraFeedback = new Set((difference?.extra ?? []).map(cellKey))
    this.correctionFeedbackMessage = message
    this.render()
    return difference
  }
  protected onInteractivityChanged(): void {
    this.render()
  }

  private parseStamps(raw: string | null): Stamp[] {
    if (raw == null) return []
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed)
        ? parsed.filter(
            (stamp): stamp is Stamp =>
              stamp != null &&
              typeof stamp.name === 'string' &&
              typeof stamp.id === 'string' &&
              typeof stamp.codeSvg === 'string' &&
              typeof stamp.definitionSvg === 'string' &&
              typeof stamp.rotate === 'number' &&
              typeof stamp.scale === 'number',
          )
        : []
    } catch {
      return []
    }
  }

  private bindEvents(): void {
    this.shadowRoot
      ?.querySelectorAll<HTMLButtonElement>('[data-stamp]')
      .forEach((button) =>
        button.addEventListener('click', () => {
          this.selectedStampId = button.dataset.stamp ?? ''
          this.erasing = false
          this.selecting = false
          this.render()
        }),
      )
    this.shadowRoot
      ?.querySelector<HTMLButtonElement>('[data-erase]')
      ?.addEventListener('click', () => {
        this.erasing = true
        this.selecting = false
        this.render()
      })
    this.shadowRoot
      ?.querySelector<HTMLButtonElement>('[data-select]')
      ?.addEventListener('click', () => {
        this.selecting = true
        this.erasing = false
        this.render()
      })
    this.shadowRoot
      ?.querySelectorAll<HTMLButtonElement>('[data-move-x]')
      .forEach((button) =>
        button.addEventListener('click', () => {
          this.moveSelection(
            Number(button.dataset.moveX),
            Number(button.dataset.moveY),
          )
        }),
      )
    const grid = this.shadowRoot?.querySelector<SVGSVGElement>('.grid')
    grid?.addEventListener('click', (event) => {
      if (!this.interactivityOn) return
      this.paint(event)
    })
  }

  private paint(event: Event): void {
    const target = (event.target as Element | null)?.closest<SVGRectElement>(
      '.hit',
    )
    if (target == null) return
    let x = Number(target.dataset.x)
    let y = Number(target.dataset.y)
    if (this.selecting && event instanceof MouseEvent) {
      const grid = target.ownerSVGElement
      if (grid != null) {
        const rect = grid.getBoundingClientRect()
        const scaleX = grid.viewBox.baseVal.width / rect.width
        const scaleY = grid.viewBox.baseVal.height / rect.height
        x =
          Math.round(
            (((event.clientX - rect.left) * scaleX) / CELL_SIZE - 0.5) * 2,
          ) / 2
        y =
          Math.round(
            (((event.clientY - rect.top) * scaleY) / CELL_SIZE - 0.5) * 2,
          ) / 2
      }
      const keys = this.state.cells
        .filter((cell) => cell.x === x && cell.y === y)
        .map(cellKey)
      if (keys.length === 0) return
      const shouldSelect = keys.some((key) => !this.selected.has(key))
      keys.forEach((key) =>
        shouldSelect ? this.selected.add(key) : this.selected.delete(key),
      )
      this.render()
      return
    }
    if (this.erasing) {
      const cells = this.state.cells.filter(
        (cell) => cell.x !== x || cell.y !== y,
      )
      if (cells.length === this.state.cells.length) return
      this.state.cells = cells
    } else {
      const stamp = this.stamps.find(({ id }) => id === this.selectedStampId)
      if (stamp == null) return
      const alreadyPresent = this.state.cells.some(
        (cell) =>
          cell.x === x &&
          cell.y === y &&
          shape2DStampId(cell.shape, cell.rotate ?? 0, cell.scale ?? 1) ===
            stamp.id,
      )
      if (alreadyPresent) return
      this.state.cells.push({
        x,
        y,
        shape: stamp.name,
        ...(stamp.rotate === 0 ? {} : { rotate: stamp.rotate }),
        ...(stamp.scale === 1 ? {} : { scale: stamp.scale }),
      })
    }
    this.render()
  }

  private moveSelection(dx: number, dy: number): void {
    if (this.selected.size === 0) return
    const movedByKey = new Map<string, Shape2DGridCell>()
    for (const cell of this.state.cells) {
      if (!this.selected.has(cellKey(cell))) continue
      movedByKey.set(cellKey(cell), { ...cell, x: cell.x + dx, y: cell.y + dy })
    }
    const unselectedKeys = new Set(
      this.state.cells
        .filter((cell) => !this.selected.has(cellKey(cell)))
        .map(cellKey),
    )
    const moved = [...movedByKey.values()]
    if (
      moved.some(
        (cell) =>
          cell.x < 0 ||
          cell.y < 0 ||
          cell.x > this.state.grid - 1 ||
          cell.y > this.state.grid - 1 ||
          unselectedKeys.has(cellKey(cell)),
      )
    )
      return
    this.state.cells = this.state.cells.map(
      (cell) => movedByKey.get(cellKey(cell)) ?? cell,
    )
    this.selected = new Set(moved.map(cellKey))
    this.render()
  }
}

export function addShape2DGridEditor(
  exercice: IExercice,
  questionIndex: number,
  { expectedState, ...options }: Shape2DGridEditorOptions,
): string {
  exercice.autoCorrection[questionIndex] ??= {}
  exercice.autoCorrection[questionIndex].formatInteractif =
    Shape2DGridEditorElement.elementTag
  if (expectedState != null)
    exercice.autoCorrection[questionIndex].valeur = {
      reponse: { value: JSON.stringify(expectedState) },
    }
  return Shape2DGridEditorElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
  })
}

registerMathaleaCustomElement(Shape2DGridEditorElement)
