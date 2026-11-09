import { context } from '../../modules/context'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

/**
 * @author Jean-Claude Lhote
 * élément non finalisé (draft)
 */
export type CartesianAssessmentPoint = {
  label: string
  x: number | null
  y: number | null
}

export type CartesianAssessmentState = {
  version: 1
  title: string
  tolerance: number
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  xScale: number | null
  yScale: number | null
  points: CartesianAssessmentPoint[]
}

export type CartesianAssessmentSerializedState = {
  version: 1
  kind: 'diagram-cartesian-assessment'
  xScale: number | null
  yScale: number | null
  points: CartesianAssessmentPoint[]
}

export type CartesianAssessmentVerificationResult = {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
}

export type CartesianAssessmentVerificationContext = {
  exercice: IExercice
  questionIndex: number
  element: DiagramCartesianAssessmentElement
  expectedRaw: unknown
  actualRaw: string
  expectedXScale: number | null
  expectedYScale: number | null
  expectedPoints: CartesianAssessmentPoint[]
  actualXScale: number | null
  actualYScale: number | null
  actualPoints: CartesianAssessmentPoint[]
}

export type CartesianAssessmentVerificationCallback = (
  context: CartesianAssessmentVerificationContext,
) => CartesianAssessmentVerificationResult

export type CartesianAssessmentCreateOptions = {
  id?: string
  numeroExercice: number
  questionIndex: number
  title?: string
  tolerance?: number
  xMin?: number
  xMax?: number
  yMin?: number
  yMax?: number
  points: Array<{ label: string; x?: number | null; y?: number | null }>
  interactivityOn?: boolean
  verifyCallbackName?: string
  verifyCallback?: CartesianAssessmentVerificationCallback
}

export type CartesianAssessmentOptions = Omit<
  CartesianAssessmentCreateOptions,
  'numeroExercice' | 'questionIndex'
>

const DEFAULT_STATE: CartesianAssessmentState = {
  version: 1,
  title: '',
  tolerance: 0,
  xMin: -10,
  xMax: 10,
  yMin: -10,
  yMax: 10,
  xScale: null,
  yScale: null,
  points: [
    { label: 'A', x: null, y: null },
    { label: 'B', x: null, y: null },
  ],
}

function safeText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function safeNumber(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeNullableNumber(value: unknown): number | null {
  if (value == null || value === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  return parsed
}

function normalizePoints(value: unknown): CartesianAssessmentPoint[] {
  if (!Array.isArray(value)) return []
  return value
    .map((point) => {
      if (point == null || typeof point !== 'object') return null
      const raw = point as { label?: unknown; x?: unknown; y?: unknown }
      return {
        label: safeText(raw.label),
        x: normalizeNullableNumber(raw.x),
        y: normalizeNullableNumber(raw.y),
      }
    })
    .filter((point): point is CartesianAssessmentPoint => point != null)
}

function parseJsonAttribute<T>(raw: string | null, fallback: T): T {
  if (raw == null || raw.trim() === '') return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function rangesAreValid(
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
): boolean {
  return xMax > xMin && yMax > yMin
}

type ParsedExpectedCartesian = {
  xScale: number | null
  yScale: number | null
  points: CartesianAssessmentPoint[]
}

function parseExpectedCartesian(raw: unknown): ParsedExpectedCartesian | null {
  let parsed: unknown = raw
  if (typeof raw === 'string') {
    if (raw.trim() === '') return null
    try {
      parsed = JSON.parse(raw)
    } catch {
      return null
    }
  }

  if (parsed == null || typeof parsed !== 'object') return null

  const value = parsed as {
    xScale?: unknown
    yScale?: unknown
    xStep?: unknown
    yStep?: unknown
    points?: unknown
  }

  const points = normalizePoints(value.points)
  const xScale =
    normalizeNullableNumber(value.xScale) ??
    normalizeNullableNumber(value.xStep)
  const yScale =
    normalizeNullableNumber(value.yScale) ??
    normalizeNullableNumber(value.yStep)

  if (points.length === 0) return null

  return { xScale, yScale, points }
}

export class DiagramCartesianAssessmentElement extends MathaleaCustomElement {
  static readonly elementTag = 'diagram-cartesian-assessment'

  private static readonly verificationCallbacks = new Map<
    string,
    CartesianAssessmentVerificationCallback
  >()

  private state: CartesianAssessmentState = structuredClone(DEFAULT_STATE)

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  static get observedAttributes(): string[] {
    return [
      'title',
      'tolerance',
      'x-min',
      'x-max',
      'y-min',
      'y-max',
      'points',
      'interactivity-on',
    ]
  }

  static create({
    id,
    numeroExercice,
    questionIndex,
    title = '',
    tolerance = 0,
    xMin = -10,
    xMax = 10,
    yMin = -10,
    yMax = 10,
    points,
    interactivityOn = true,
    verifyCallbackName,
    verifyCallback,
  }: CartesianAssessmentCreateOptions): string {
    const callbackName =
      verifyCallbackName ??
      (verifyCallback == null
        ? undefined
        : `${DiagramCartesianAssessmentElement.elementTag}Ex${numeroExercice}Q${questionIndex}-verification`)

    if (verifyCallback != null && callbackName != null) {
      DiagramCartesianAssessmentElement.registerVerificationCallback(
        callbackName,
        verifyCallback,
      )
    }

    return super.create({
      id:
        id ??
        `${DiagramCartesianAssessmentElement.elementTag}Ex${numeroExercice}Q${questionIndex}`,
      numeroExercice,
      questionIndex,
      title,
      tolerance,
      xMin,
      xMax,
      yMin,
      yMax,
      points,
      interactivityOn,
      verifyCallbackName: callbackName,
    })
  }

  static registerVerificationCallback(
    name: string,
    callback: CartesianAssessmentVerificationCallback,
  ): void {
    if (name.trim() === '') {
      throw new Error(
        'Le nom du callback de verification ne peut pas etre vide',
      )
    }
    DiagramCartesianAssessmentElement.verificationCallbacks.set(name, callback)
  }

  static unregisterVerificationCallback(name: string): void {
    DiagramCartesianAssessmentElement.verificationCallbacks.delete(name)
  }

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): CartesianAssessmentVerificationResult {
    const id = `${DiagramCartesianAssessmentElement.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`
    const element = document.getElementById(
      id,
    ) as DiagramCartesianAssessmentElement | null

    const spanResult = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${questionIndex}`,
    )
    const feedbackDiv = document.querySelector(
      `#feedbackEx${exercice.numeroExercice}Q${questionIndex}`,
    ) as HTMLElement | null

    if (element == null) {
      const feedback = 'Diagramme cartésien interactif introuvable.'
      if (spanResult) spanResult.innerHTML = '☹️'
      if (feedbackDiv) {
        feedbackDiv.innerHTML = feedback
        feedbackDiv.style.display = 'block'
      }
      return {
        isOk: false,
        feedback,
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }

    const expectedRaw =
      exercice.autoCorrection?.[questionIndex]?.valeur?.reponse?.value
    const expected = parseExpectedCartesian(expectedRaw)

    const actualRaw = element.value
    const actualXScale = element.state.xScale
    const actualYScale = element.state.yScale
    const actualPoints = element.getStudentPoints()

    exercice.answers ??= {}
    exercice.answers[element.id] = actualRaw
    element.interactivityOn = false

    const callbackName = element.getAttribute('verify-callback-name')
    if (callbackName != null) {
      const callback =
        DiagramCartesianAssessmentElement.verificationCallbacks.get(
          callbackName,
        )
      if (callback == null) {
        const feedback = `Vérificateur introuvable: ${callbackName}`
        if (spanResult) spanResult.innerHTML = '☹️'
        if (feedbackDiv) {
          feedbackDiv.innerHTML = feedback
          feedbackDiv.style.display = 'block'
        }
        return {
          isOk: false,
          feedback,
          score: { nbBonnesReponses: 0, nbReponses: 1 },
        }
      }

      try {
        const result = callback({
          exercice,
          questionIndex,
          element,
          expectedRaw,
          actualRaw,
          expectedXScale: expected?.xScale ?? null,
          expectedYScale: expected?.yScale ?? null,
          expectedPoints: expected?.points ?? [],
          actualXScale,
          actualYScale,
          actualPoints,
        })
        if (spanResult) spanResult.innerHTML = result.isOk ? '😎' : '☹️'
        if (feedbackDiv) {
          feedbackDiv.innerHTML = result.feedback
          feedbackDiv.style.display = result.feedback === '' ? 'none' : 'block'
        }
        return result
      } catch (error) {
        const feedback = `Erreur dans le vérificateur ${callbackName}`
        if (spanResult) spanResult.innerHTML = '☹️'
        if (feedbackDiv) {
          feedbackDiv.innerHTML = feedback
          feedbackDiv.style.display = 'block'
        }
        window.notify(feedback, { error, callbackName })
        return {
          isOk: false,
          feedback,
          score: { nbBonnesReponses: 0, nbReponses: 1 },
        }
      }
    }

    if (expected == null) {
      const feedback = 'Réponse attendue absente ou invalide.'
      if (spanResult) spanResult.innerHTML = '☹️'
      if (feedbackDiv) {
        feedbackDiv.innerHTML = feedback
        feedbackDiv.style.display = 'block'
      }
      return {
        isOk: false,
        feedback,
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }

    const tolerance = element.state.tolerance

    const xScaleOk =
      expected.xScale == null ||
      (actualXScale != null &&
        Math.abs(actualXScale - expected.xScale) <= tolerance)
    const yScaleOk =
      expected.yScale == null ||
      (actualYScale != null &&
        Math.abs(actualYScale - expected.yScale) <= tolerance)

    if (!xScaleOk || !yScaleOk) {
      const feedback = "L'échelle saisie sur les axes est incorrecte."
      if (spanResult) spanResult.innerHTML = '☹️'
      if (feedbackDiv) {
        feedbackDiv.innerHTML = feedback
        feedbackDiv.style.display = 'block'
      }
      return {
        isOk: false,
        feedback,
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }

    if (expected.points.length !== actualPoints.length) {
      const feedback = 'Le nombre de points saisis ne correspond pas.'
      if (spanResult) spanResult.innerHTML = '☹️'
      if (feedbackDiv) {
        feedbackDiv.innerHTML = feedback
        feedbackDiv.style.display = 'block'
      }
      return {
        isOk: false,
        feedback,
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }

    const mismatches = expected.points
      .map((point, index) => {
        const actual = actualPoints[index]
        return {
          dx:
            point.x == null || actual?.x == null
              ? Number.POSITIVE_INFINITY
              : Math.abs(point.x - actual.x),
          dy:
            point.y == null || actual?.y == null
              ? Number.POSITIVE_INFINITY
              : Math.abs(point.y - actual.y),
        }
      })
      .filter((entry) => entry.dx > tolerance || entry.dy > tolerance)

    const isOk = mismatches.length === 0
    const feedback = isOk
      ? ''
      : `Coordonnées incorrectes pour ${mismatches.length} point(s).`

    if (spanResult) spanResult.innerHTML = isOk ? '😎' : '☹️'
    if (feedbackDiv) {
      feedbackDiv.innerHTML = feedback
      feedbackDiv.style.display = feedback === '' ? 'none' : 'block'
    }

    return {
      isOk,
      feedback,
      score: { nbBonnesReponses: isOk ? 1 : 0, nbReponses: 1 },
    }
  }

  static formatStudentAnswer(rawAnswer: string): string {
    const expected = parseExpectedCartesian(rawAnswer)
    if (expected == null) return rawAnswer
    return expected.points
      .map((point) => {
        const x = point.x == null ? '?' : point.x
        const y = point.y == null ? '?' : point.y
        return `${point.label || 'P'}(${x};${y})`
      })
      .join(' ; ')
  }

  connectedCallback(): void {
    super.connectedCallback()
    this.syncStateFromAttributes()
    this.render()
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ): void {
    if (oldValue === newValue) return
    if (name === 'interactivity-on') {
      this.hydrateCommonAttributes()
    }
    this.syncStateFromAttributes()
    this.render()
  }

  render(): string | void {
    if (!context.isHtml || context.isTypst) {
      return this.renderLatex()
    }
    if (this.shadowRoot == null) return

    const disableAttr = this.interactivityOn ? '' : 'disabled'

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 10px;
          margin: 8px 0;
          background: #ffffff;
        }
        .grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          font-size: 0.92rem;
          color: #334155;
          align-items: center;
        }
        .scale-group {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .scale-group input {
          width: 90px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th,
        td {
          border: 1px solid #e5e7eb;
          padding: 5px;
          text-align: left;
        }
        td input {
          width: 100%;
          box-sizing: border-box;
        }
        .preview {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 6px;
          background: #f8fafc;
        }
        .status {
          font-size: 0.9rem;
          color: #334155;
          margin-top: 6px;
        }
        svg {
          width: 100%;
          height: 260px;
          display: block;
          background: #fff;
        }
      </style>
      <div class="grid">
        <div class="meta">
          <div>Fenêtre: x∈[${this.state.xMin};${this.state.xMax}] et y∈[${this.state.yMin};${this.state.yMax}]</div>
        </div>
        <div class="meta">
          <div class="scale-group">
            <label for="x-scale">Échelle X</label>
            <input id="x-scale" type="number" step="0.1" value="${this.state.xScale ?? ''}" ${disableAttr} />
          </div>
          <div class="scale-group">
            <label for="y-scale">Échelle Y</label>
            <input id="y-scale" type="number" step="0.1" value="${this.state.yScale ?? ''}" ${disableAttr} />
          </div>
        </div>
        ${
          this.state.title.trim() === ''
            ? ''
            : `<div>${this.escapeText(this.state.title.trim())}</div>`
        }
        ${this.renderTable(disableAttr)}
        <div class="preview" id="preview"></div>
      </div>
    `

    this.renderPreview()
    this.bindEvents()
  }

  protected renderLatex(): string {
    return ''
  }

  get value(): string {
    return JSON.stringify(this.toSerializedState())
  }

  set value(nextValue: string) {
    this.update(nextValue)
  }

  update(nextValue: string | CartesianAssessmentSerializedState): void {
    let parsed: unknown = nextValue
    if (typeof nextValue === 'string') {
      if (nextValue.trim() === '') return
      try {
        parsed = JSON.parse(nextValue)
      } catch {
        return
      }
    }

    if (parsed == null || typeof parsed !== 'object') return
    const raw = parsed as Partial<CartesianAssessmentSerializedState>

    this.state.xScale = normalizeNullableNumber(raw.xScale)
    this.state.yScale = normalizeNullableNumber(raw.yScale)

    if (Array.isArray(raw.points)) {
      this.state.points = this.state.points.map((point, index) => {
        const incoming = raw.points?.[index]
        if (incoming == null) return point
        return {
          label: safeText(incoming.label) || point.label,
          x: normalizeNullableNumber(incoming.x),
          y: normalizeNullableNumber(incoming.y),
        }
      })
    }

    this.render()
  }

  protected onInteractivityChanged(_isOn: boolean): void {
    this.render()
  }

  getStudentPoints(): CartesianAssessmentPoint[] {
    return this.state.points.map((point) => ({
      label: point.label,
      x: point.x,
      y: point.y,
    }))
  }

  private syncStateFromAttributes(): void {
    this.state.title = this.getAttribute('title') ?? ''

    this.state.tolerance = clamp(
      safeNumber(this.getAttribute('tolerance'), 0),
      0,
      1000,
    )

    const xMin = safeNumber(this.getAttribute('x-min'), DEFAULT_STATE.xMin)
    const xMax = safeNumber(this.getAttribute('x-max'), DEFAULT_STATE.xMax)
    const yMin = safeNumber(this.getAttribute('y-min'), DEFAULT_STATE.yMin)
    const yMax = safeNumber(this.getAttribute('y-max'), DEFAULT_STATE.yMax)

    if (rangesAreValid(xMin, xMax, yMin, yMax)) {
      this.state.xMin = xMin
      this.state.xMax = xMax
      this.state.yMin = yMin
      this.state.yMax = yMax
    }

    const points = normalizePoints(
      parseJsonAttribute<unknown[]>(this.getAttribute('points'), []),
    )

    this.state.points =
      points.length > 0 ? points : structuredClone(DEFAULT_STATE.points)
  }

  private renderTable(disableAttr: string): string {
    return `
      <table>
        <thead>
          <tr>
            <th>Point</th>
            <th>x</th>
            <th>y</th>
          </tr>
        </thead>
        <tbody>
          ${this.state.points
            .map((point, index) => {
              const displayX = point.x ?? ''
              const displayY = point.y ?? ''
              return `
                <tr>
                  <td>${this.escapeText(point.label)}</td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      data-kind="point-x"
                      data-index="${index}"
                      value="${displayX}"
                      ${disableAttr}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      data-kind="point-y"
                      data-index="${index}"
                      value="${displayY}"
                      ${disableAttr}
                    />
                  </td>
                </tr>
              `
            })
            .join('')}
        </tbody>
      </table>
    `
  }

  private bindEvents(): void {
    if (this.shadowRoot == null) return

    const xScaleInput = this.shadowRoot.querySelector(
      '#x-scale',
    ) as HTMLInputElement | null
    if (xScaleInput != null) {
      xScaleInput.addEventListener('input', () => {
        this.state.xScale = normalizeNullableNumber(xScaleInput.value)
        this.renderPreview()
      })
      xScaleInput.addEventListener('change', () => {
        this.dispatchChangeEvents()
      })
    }

    const yScaleInput = this.shadowRoot.querySelector(
      '#y-scale',
    ) as HTMLInputElement | null
    if (yScaleInput != null) {
      yScaleInput.addEventListener('input', () => {
        this.state.yScale = normalizeNullableNumber(yScaleInput.value)
        this.renderPreview()
      })
      yScaleInput.addEventListener('change', () => {
        this.dispatchChangeEvents()
      })
    }

    this.shadowRoot
      .querySelectorAll<HTMLInputElement>('input[data-kind="point-x"]')
      .forEach((input) => {
        input.addEventListener('input', () => {
          const index = safeNumber(input.dataset.index, -1)
          if (!Number.isInteger(index) || index < 0) return
          if (this.state.points[index] == null) return
          this.state.points[index].x = normalizeNullableNumber(input.value)
          this.renderPreview()
        })
        input.addEventListener('change', () => {
          this.dispatchChangeEvents()
        })
      })

    this.shadowRoot
      .querySelectorAll<HTMLInputElement>('input[data-kind="point-y"]')
      .forEach((input) => {
        input.addEventListener('input', () => {
          const index = safeNumber(input.dataset.index, -1)
          if (!Number.isInteger(index) || index < 0) return
          if (this.state.points[index] == null) return
          this.state.points[index].y = normalizeNullableNumber(input.value)
          this.renderPreview()
        })
        input.addEventListener('change', () => {
          this.dispatchChangeEvents()
        })
      })
  }

  private renderPreview(): void {
    if (this.shadowRoot == null) return
    const preview = this.shadowRoot.querySelector(
      '#preview',
    ) as HTMLDivElement | null
    if (preview == null) return

    const width = 360
    const height = 260
    const axisLeft = 40
    const axisRight = 330
    const axisTop = 20
    const axisBottom = 210
    const axisWidth = axisRight - axisLeft
    const axisHeight = axisBottom - axisTop

    const xRange = this.state.xMax - this.state.xMin
    const yRange = this.state.yMax - this.state.yMin

    const projectX = (x: number) =>
      axisLeft + ((x - this.state.xMin) / xRange) * axisWidth
    const projectY = (y: number) =>
      axisBottom - ((y - this.state.yMin) / yRange) * axisHeight

    const xZero =
      this.state.xMin <= 0 && this.state.xMax >= 0 ? projectX(0) : axisLeft
    const yZero =
      this.state.yMin <= 0 && this.state.yMax >= 0 ? projectY(0) : axisBottom

    const xTicks = this.renderTicks(
      'x',
      this.state.xScale,
      this.state.xMin,
      this.state.xMax,
      projectX,
      projectY,
      yZero,
    )
    const yTicks = this.renderTicks(
      'y',
      this.state.yScale,
      this.state.yMin,
      this.state.yMax,
      projectX,
      projectY,
      xZero,
    )

    const points = this.state.points
      .map((point) => {
        if (point.x == null || point.y == null) return ''
        const cx = projectX(point.x)
        const cy = projectY(point.y)
        if (!Number.isFinite(cx) || !Number.isFinite(cy)) return ''
        const tooltip = `${point.label} (${point.x}; ${point.y})`
        return `<g><circle cx="${cx}" cy="${cy}" r="3.5" fill="#dc2626"><title>${this.escapeText(tooltip)}</title></circle><text x="${cx + 5}" y="${cy - 5}" font-size="11" fill="#334155">${this.escapeText(point.label)}</text></g>`
      })
      .join('')

    const svg = `<svg viewBox="0 0 ${width} ${height}"><rect x="${axisLeft}" y="${axisTop}" width="${axisWidth}" height="${axisHeight}" fill="none" stroke="#e2e8f0"/><line x1="${axisLeft}" y1="${yZero}" x2="${axisRight}" y2="${yZero}" stroke="#475569"/><line x1="${xZero}" y1="${axisTop}" x2="${xZero}" y2="${axisBottom}" stroke="#475569"/>${xTicks}${yTicks}${points}</svg>`

    const status =
      this.state.xScale == null || this.state.yScale == null
        ? "Renseigner l'échelle sur X et Y pour un repère complet."
        : `Échelles saisies: X=${this.state.xScale}, Y=${this.state.yScale}`

    preview.innerHTML = `${svg}<div class="status">${this.escapeText(status)}</div>`
  }

  private renderTicks(
    axis: 'x' | 'y',
    step: number | null,
    min: number,
    max: number,
    projectX: (x: number) => number,
    projectY: (y: number) => number,
    fixedAxisPixel: number,
  ): string {
    if (step == null || step <= 0) return ''

    let out = ''
    const start = Math.ceil(min / step) * step
    const epsilon = step / 1000

    for (let value = start; value <= max + epsilon; value += step) {
      const normalized = Math.round((value + Number.EPSILON) * 1000) / 1000
      if (axis === 'x') {
        const x = projectX(normalized)
        out += `<line x1="${x}" y1="${fixedAxisPixel - 3}" x2="${x}" y2="${fixedAxisPixel + 3}" stroke="#64748b"/><text x="${x}" y="${fixedAxisPixel + 14}" text-anchor="middle" font-size="10" fill="#64748b">${normalized}</text>`
      } else {
        const y = projectY(normalized)
        out += `<line x1="${fixedAxisPixel - 3}" y1="${y}" x2="${fixedAxisPixel + 3}" y2="${y}" stroke="#64748b"/><text x="${fixedAxisPixel - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#64748b">${normalized}</text>`
      }
    }

    return out
  }

  private toSerializedState(): CartesianAssessmentSerializedState {
    return {
      version: 1,
      kind: 'diagram-cartesian-assessment',
      xScale: this.state.xScale,
      yScale: this.state.yScale,
      points: this.state.points.map((point) => ({
        label: point.label,
        x: point.x,
        y: point.y,
      })),
    }
  }

  private dispatchChangeEvents(): void {
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
    this.dispatchEvent(
      new CustomEvent('value-changed', {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    )
  }

  private escapeText(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
  }
}

export function addDiagramCartesianAssessment(
  exercice: IExercice,
  questionIndex: number,
  options: CartesianAssessmentOptions,
): string {
  if (!context.isHtml) return ''
  if (exercice.autoCorrection[questionIndex] == null) {
    exercice.autoCorrection[questionIndex] = {}
  }
  exercice.autoCorrection[questionIndex].formatInteractif =
    DiagramCartesianAssessmentElement.elementTag

  return DiagramCartesianAssessmentElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
  })
}

registerMathaleaCustomElement(DiagramCartesianAssessmentElement)
