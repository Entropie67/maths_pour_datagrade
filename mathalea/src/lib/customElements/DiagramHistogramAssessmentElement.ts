import { context } from '../../modules/context'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

/**
 * @author Jean-Claude Lhote
 * élément non finalisé (draft)
 */
export type HistogramAssessmentBin = {
  from: number
  to: number
  height: number | null
}

export type HistogramAssessmentState = {
  version: 1
  title: string
  tolerance: number
  yMax: number | null
  bins: HistogramAssessmentBin[]
}

export type HistogramAssessmentSerializedState = {
  version: 1
  kind: 'diagram-histogram-assessment'
  bins: HistogramAssessmentBin[]
}

export type HistogramAssessmentVerificationResult = {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
}

export type HistogramAssessmentVerificationContext = {
  exercice: IExercice
  questionIndex: number
  element: DiagramHistogramAssessmentElement
  expectedRaw: unknown
  actualRaw: string
  expectedHeights: number[]
  actualHeights: number[]
}

export type HistogramAssessmentVerificationCallback = (
  context: HistogramAssessmentVerificationContext,
) => HistogramAssessmentVerificationResult

export type HistogramAssessmentCreateOptions = {
  id?: string
  numeroExercice: number
  questionIndex: number
  title?: string
  tolerance?: number
  yMax?: number
  bins: Array<{ from: number; to: number; height?: number | null }>
  interactivityOn?: boolean
  verifyCallbackName?: string
  verifyCallback?: HistogramAssessmentVerificationCallback
}

export type HistogramAssessmentOptions = Omit<
  HistogramAssessmentCreateOptions,
  'numeroExercice' | 'questionIndex'
>

const DEFAULT_STATE: HistogramAssessmentState = {
  version: 1,
  title: '',
  tolerance: 0,
  yMax: null,
  bins: [
    { from: 0, to: 10, height: null },
    { from: 10, to: 20, height: null },
  ],
}

const HISTOGRAM_COLOR = '#16a34a'

function safeNumber(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeHeight(value: unknown): number | null {
  if (value == null || value === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  return parsed
}

function normalizeBins(value: unknown): HistogramAssessmentBin[] {
  if (!Array.isArray(value)) return []
  return value
    .map((bin) => {
      if (bin == null || typeof bin !== 'object') return null
      const raw = bin as { from?: unknown; to?: unknown; height?: unknown }
      return {
        from: safeNumber(raw.from, 0),
        to: safeNumber(raw.to, 0),
        height: normalizeHeight(raw.height),
      }
    })
    .filter((bin): bin is HistogramAssessmentBin => bin != null)
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

function parseHeights(raw: unknown): number[] | null {
  if (Array.isArray(raw)) {
    return raw
      .map((value) => safeNumber(value, NaN))
      .filter((n) => Number.isFinite(n))
  }

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

  const objectValue = parsed as {
    heights?: unknown[]
    bins?: Array<{ height?: unknown }>
    items?: Array<{ height?: unknown }>
  }

  if (Array.isArray(objectValue.heights)) {
    return objectValue.heights
      .map((value) => safeNumber(value, NaN))
      .filter((n) => Number.isFinite(n))
  }

  if (Array.isArray(objectValue.bins)) {
    return objectValue.bins.map((bin) => safeNumber(bin.height, 0))
  }

  if (Array.isArray(objectValue.items)) {
    return objectValue.items.map((item) => safeNumber(item.height, 0))
  }

  return null
}

export class DiagramHistogramAssessmentElement extends MathaleaCustomElement {
  static readonly elementTag = 'diagram-histogram-assessment'

  private static readonly verificationCallbacks = new Map<
    string,
    HistogramAssessmentVerificationCallback
  >()

  private state: HistogramAssessmentState = structuredClone(DEFAULT_STATE)

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  static get observedAttributes(): string[] {
    return ['title', 'tolerance', 'y-max', 'bins', 'interactivity-on']
  }

  static create({
    id,
    numeroExercice,
    questionIndex,
    title = '',
    tolerance = 0,
    yMax,
    bins,
    interactivityOn = true,
    verifyCallbackName,
    verifyCallback,
  }: HistogramAssessmentCreateOptions): string {
    const callbackName =
      verifyCallbackName ??
      (verifyCallback == null
        ? undefined
        : `${DiagramHistogramAssessmentElement.elementTag}Ex${numeroExercice}Q${questionIndex}-verification`)

    if (verifyCallback != null && callbackName != null) {
      DiagramHistogramAssessmentElement.registerVerificationCallback(
        callbackName,
        verifyCallback,
      )
    }

    return super.create({
      id:
        id ??
        `${DiagramHistogramAssessmentElement.elementTag}Ex${numeroExercice}Q${questionIndex}`,
      numeroExercice,
      questionIndex,
      title,
      tolerance,
      yMax,
      bins,
      interactivityOn,
      verifyCallbackName: callbackName,
    })
  }

  static registerVerificationCallback(
    name: string,
    callback: HistogramAssessmentVerificationCallback,
  ): void {
    if (name.trim() === '') {
      throw new Error(
        'Le nom du callback de verification ne peut pas etre vide',
      )
    }
    DiagramHistogramAssessmentElement.verificationCallbacks.set(name, callback)
  }

  static unregisterVerificationCallback(name: string): void {
    DiagramHistogramAssessmentElement.verificationCallbacks.delete(name)
  }

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): HistogramAssessmentVerificationResult {
    const id = `${DiagramHistogramAssessmentElement.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`
    const element = document.getElementById(
      id,
    ) as DiagramHistogramAssessmentElement | null

    const spanResult = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${questionIndex}`,
    )
    const feedbackDiv = document.querySelector(
      `#feedbackEx${exercice.numeroExercice}Q${questionIndex}`,
    ) as HTMLElement | null

    if (element == null) {
      const feedback = 'Histogramme interactif introuvable.'
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
    const expectedHeights = parseHeights(expectedRaw)
    const actualHeights = element.getStudentHeights()
    const actualRaw = element.value

    exercice.answers ??= {}
    exercice.answers[element.id] = actualRaw
    element.interactivityOn = false

    const callbackName = element.getAttribute('verify-callback-name')
    if (callbackName != null) {
      const callback =
        DiagramHistogramAssessmentElement.verificationCallbacks.get(
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
          expectedHeights: expectedHeights ?? [],
          actualHeights,
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

    if (expectedHeights == null) {
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

    if (expectedHeights.length !== actualHeights.length) {
      const feedback = "Le nombre d'intervalles saisis ne correspond pas."
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

    const tolerance = this.parseToleranceFromElement(element)

    const mismatches = expectedHeights
      .map((expected, index) => ({
        expected,
        actual: actualHeights[index] ?? 0,
      }))
      .filter((entry) => Math.abs(entry.expected - entry.actual) > tolerance)

    const isOk = mismatches.length === 0
    const feedback = isOk
      ? ''
      : `Hauteur incorrecte pour ${mismatches.length} intervalle(s).`

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

  private static parseToleranceFromElement(
    element: DiagramHistogramAssessmentElement,
  ): number {
    return clamp(safeNumber(element.getAttribute('tolerance'), 0), 0, 1000)
  }

  static formatStudentAnswer(rawAnswer: string): string {
    const heights = parseHeights(rawAnswer)
    if (heights == null) return rawAnswer
    return heights.map((value, index) => `I${index + 1}: ${value}`).join(' ; ')
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
          height: 230px;
          display: block;
          background: #fff;
        }
      </style>
      <div class="grid">
        <div class="meta">
          <div>Tolérance: ${this.state.tolerance}</div>
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

  update(nextValue: string | HistogramAssessmentSerializedState): void {
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
    const raw = parsed as Partial<HistogramAssessmentSerializedState>
    if (!Array.isArray(raw.bins)) return

    this.state.bins = this.state.bins.map((bin, index) => {
      const incoming = raw.bins?.[index]
      if (incoming == null) return bin
      return {
        from: Number.isFinite(Number(incoming.from))
          ? Number(incoming.from)
          : bin.from,
        to: Number.isFinite(Number(incoming.to)) ? Number(incoming.to) : bin.to,
        height: normalizeHeight(incoming.height),
      }
    })

    this.render()
  }

  protected onInteractivityChanged(_isOn: boolean): void {
    this.render()
  }

  getStudentHeights(): number[] {
    return this.state.bins.map((bin) => Math.max(0, bin.height ?? 0))
  }

  private syncStateFromAttributes(): void {
    this.state.title = this.getAttribute('title') ?? ''

    this.state.tolerance = clamp(
      safeNumber(this.getAttribute('tolerance'), 0),
      0,
      1000,
    )

    const configuredYMax = normalizeHeight(this.getAttribute('y-max'))
    this.state.yMax =
      configuredYMax == null ? null : Math.max(0, configuredYMax)

    const bins = normalizeBins(
      parseJsonAttribute<unknown[]>(this.getAttribute('bins'), []),
    )

    this.state.bins =
      bins.length > 0 ? bins : structuredClone(DEFAULT_STATE.bins)
  }

  private renderTable(disableAttr: string): string {
    return `
      <table>
        <thead>
          <tr>
            <th>Intervalle</th>
            <th>Hauteur élève</th>
          </tr>
        </thead>
        <tbody>
          ${this.state.bins
            .map((bin, index) => {
              const displayHeight = bin.height ?? ''
              return `
                <tr>
                  <td>[${bin.from}; ${bin.to}[</td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      data-kind="height"
                      data-index="${index}"
                      value="${displayHeight}"
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

    this.shadowRoot
      .querySelectorAll<HTMLInputElement>('input[data-kind="height"]')
      .forEach((input) => {
        input.addEventListener('input', () => {
          const index = safeNumber(input.dataset.index, -1)
          if (!Number.isInteger(index) || index < 0) return
          if (this.state.bins[index] == null) return
          this.state.bins[index].height = normalizeHeight(input.value)
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

    const heights = this.getStudentHeights()
    const yMaxFromData = heights.reduce((acc, value) => Math.max(acc, value), 0)
    const yMax = Math.max(1, this.state.yMax ?? yMaxFromData)

    const width = 340
    const height = 230
    const axisLeft = 34
    const axisBottom = 180
    const axisTop = 20
    const axisWidth = 280
    const axisHeight = axisBottom - axisTop

    const first = this.state.bins[0]
    const last = this.state.bins[this.state.bins.length - 1]
    const minX = first?.from ?? 0
    const maxX = last?.to ?? minX + 1
    const rangeX = maxX - minX === 0 ? 1 : maxX - minX

    const bars = this.state.bins
      .map((bin, index) => {
        const x = axisLeft + ((bin.from - minX) / rangeX) * axisWidth
        const w = Math.max(2, ((bin.to - bin.from) / rangeX) * axisWidth)
        const studentHeight = heights[index] ?? 0
        const h = Math.max(0, (studentHeight / yMax) * axisHeight)
        const y = axisBottom - h
        const tooltip = `[${bin.from}; ${bin.to}[ : ${studentHeight}`
        return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${HISTOGRAM_COLOR}" opacity="0.85"><title>${this.escapeText(tooltip)}</title></rect>`
      })
      .join('')

    const xTicks = this.state.bins
      .map((bin) => {
        const x = axisLeft + ((bin.from - minX) / rangeX) * axisWidth
        return `<line x1="${x}" y1="${axisBottom}" x2="${x}" y2="${axisBottom + 4}" stroke="#475569"/><text x="${x}" y="198" text-anchor="middle" font-size="10" fill="#64748b">${bin.from}</text>`
      })
      .join('')

    const lastTickX = axisLeft + axisWidth
    const lastTickLabel = `<line x1="${lastTickX}" y1="${axisBottom}" x2="${lastTickX}" y2="${axisBottom + 4}" stroke="#475569"/><text x="${lastTickX}" y="198" text-anchor="middle" font-size="10" fill="#64748b">${maxX}</text>`

    const yTicks = this.renderYTicks(axisLeft, axisBottom, axisWidth, yMax)

    const svg = `<svg viewBox="0 0 ${width} ${height}"><line x1="${axisLeft}" y1="${axisBottom}" x2="${axisLeft + axisWidth}" y2="${axisBottom}" stroke="#475569"/><line x1="${axisLeft}" y1="${axisTop}" x2="${axisLeft}" y2="${axisBottom}" stroke="#475569"/>${yTicks}${bars}${xTicks}${lastTickLabel}</svg>`

    preview.innerHTML = `${svg}<div class="status">Chaque hauteur est saisie par l'élève pour son intervalle.</div>`
  }

  private renderYTicks(
    axisLeft: number,
    axisBottom: number,
    axisWidth: number,
    yMax: number,
  ): string {
    const ticksCount = 4
    let out = ''
    for (let i = 0; i <= ticksCount; i++) {
      const ratio = i / ticksCount
      const y = axisBottom - ratio * (axisBottom - 20)
      const value = Math.round((ratio * yMax + Number.EPSILON) * 10) / 10
      out += `<line x1="${axisLeft}" y1="${y}" x2="${axisLeft + axisWidth}" y2="${y}" stroke="#e2e8f0"/><text x="${axisLeft - 6}" y="${y + 4}" text-anchor="end" font-size="10" fill="#64748b">${value}</text>`
    }
    return out
  }

  private toSerializedState(): HistogramAssessmentSerializedState {
    return {
      version: 1,
      kind: 'diagram-histogram-assessment',
      bins: this.state.bins.map((bin) => ({
        from: bin.from,
        to: bin.to,
        height: bin.height,
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

export function addDiagramHistogramAssessment(
  exercice: IExercice,
  questionIndex: number,
  options: HistogramAssessmentOptions,
): string {
  if (!context.isHtml) return ''
  if (exercice.autoCorrection[questionIndex] == null) {
    exercice.autoCorrection[questionIndex] = {}
  }
  exercice.autoCorrection[questionIndex].formatInteractif =
    DiagramHistogramAssessmentElement.elementTag

  return DiagramHistogramAssessmentElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
  })
}

registerMathaleaCustomElement(DiagramHistogramAssessmentElement)
