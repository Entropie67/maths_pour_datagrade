import { context } from '../../modules/context'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

/**
 * @author Jean-Claude Lhote
 */
export type DiagramType = 'pie' | 'semi-pie' | 'bar' | 'histogram' | 'cartesian'

export type DiagramItem = {
  label: string
  value: number
}

export type HistogramBin = {
  from: number
  to: number
  value: number
}

export type CartesianPoint = {
  x: number
  y: number
}

export type DiagramBuilderState = {
  version: 1
  type: DiagramType
  title: string
  items: DiagramItem[]
  bins: HistogramBin[]
  points: CartesianPoint[]
}

type DiagramBuilderSerializedState = {
  version: 1
  type: DiagramType
  title: string
  items?: DiagramItem[]
  bins?: HistogramBin[]
  points?: CartesianPoint[]
}

export type DiagramBuilderVerificationResult = {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
}

export type DiagramBuilderVerificationContext = {
  exercice: IExercice
  questionIndex: number
  element: DiagramBuilderElement
  expectedRaw: unknown
  actualRaw: string
  expectedState: DiagramBuilderState | null
  actualState: DiagramBuilderState | null
}

export type DiagramBuilderVerificationCallback = (
  context: DiagramBuilderVerificationContext,
) => DiagramBuilderVerificationResult

export type DiagramBuilderCreateOptions = {
  id?: string
  numeroExercice: number
  questionIndex: number
  initialState?: Partial<DiagramBuilderState>
  interactivityOn?: boolean
  verifyCallbackName?: string
  verifyCallback?: DiagramBuilderVerificationCallback
}

export type DiagramBuilderOptions = Omit<
  DiagramBuilderCreateOptions,
  'numeroExercice' | 'questionIndex'
>

const DEFAULT_STATE: DiagramBuilderState = {
  version: 1,
  type: 'pie',
  title: '',
  items: [
    { label: 'A', value: 1 },
    { label: 'B', value: 1 },
  ],
  bins: [
    { from: 0, to: 10, value: 1 },
    { from: 10, to: 20, value: 1 },
  ],
  points: [
    { x: 0, y: 0 },
    { x: 1, y: 1 },
  ],
}

const DIAGRAM_COLORS = [
  '#2563eb',
  '#16a34a',
  '#f59e0b',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#ea580c',
  '#0f766e',
]

function parseNumber(value: string | null, fallback: number): number {
  if (value == null) return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function safeText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function parseItems(value: unknown): DiagramItem[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (item == null || typeof item !== 'object') return null
      const label = safeText((item as { label?: unknown }).label)
      const numericValue = Number((item as { value?: unknown }).value)
      return {
        label,
        value: Number.isFinite(numericValue) ? numericValue : 0,
      }
    })
    .filter((item): item is DiagramItem => item != null)
}

function parseBins(value: unknown): HistogramBin[] {
  if (!Array.isArray(value)) return []
  return value
    .map((bin) => {
      if (bin == null || typeof bin !== 'object') return null
      const from = Number((bin as { from?: unknown }).from)
      const to = Number((bin as { to?: unknown }).to)
      const numericValue = Number((bin as { value?: unknown }).value)
      return {
        from: Number.isFinite(from) ? from : 0,
        to: Number.isFinite(to) ? to : 0,
        value: Number.isFinite(numericValue) ? numericValue : 0,
      }
    })
    .filter((bin): bin is HistogramBin => bin != null)
}

function parsePoints(value: unknown): CartesianPoint[] {
  if (!Array.isArray(value)) return []
  return value
    .map((point) => {
      if (point == null || typeof point !== 'object') return null
      const x = Number((point as { x?: unknown }).x)
      const y = Number((point as { y?: unknown }).y)
      return {
        x: Number.isFinite(x) ? x : 0,
        y: Number.isFinite(y) ? y : 0,
      }
    })
    .filter((point): point is CartesianPoint => point != null)
}

function normalizeState(input: unknown): DiagramBuilderState | null {
  if (input == null || typeof input !== 'object') return null
  const partial = input as Partial<DiagramBuilderState>
  const type = partial.type
  const allowed: DiagramType[] = [
    'pie',
    'semi-pie',
    'bar',
    'histogram',
    'cartesian',
  ]
  const normalizedType = allowed.includes(type as DiagramType) ? type : 'pie'
  return {
    version: 1,
    type: normalizedType as DiagramType,
    title: safeText(partial.title),
    items: parseItems(partial.items),
    bins: parseBins(partial.bins),
    points: parsePoints(partial.points),
  }
}

function toSerializableState(
  state: DiagramBuilderState,
): DiagramBuilderSerializedState {
  const base = {
    version: 1 as const,
    type: state.type,
    title: state.title,
  }

  switch (state.type) {
    case 'pie':
    case 'semi-pie':
    case 'bar':
      return { ...base, items: state.items }
    case 'histogram':
      return { ...base, bins: state.bins }
    case 'cartesian':
      return { ...base, points: state.points }
  }
}

function stableObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => stableObject(item))
  if (value == null || typeof value !== 'object') return value
  const sortedKeys = Object.keys(value as Record<string, unknown>).sort()
  const out: Record<string, unknown> = {}
  for (const key of sortedKeys) {
    out[key] = stableObject((value as Record<string, unknown>)[key])
  }
  return out
}

function stringifyStable(value: unknown): string {
  return JSON.stringify(stableObject(value))
}

function parseSerializedState(raw: unknown): DiagramBuilderState | null {
  if (typeof raw === 'string') {
    if (raw.trim() === '') return null
    try {
      return normalizeState(JSON.parse(raw))
    } catch {
      return null
    }
  }
  return normalizeState(raw)
}

function toVerificationResult(
  isOk: boolean,
  feedback: string,
): DiagramBuilderVerificationResult {
  return {
    isOk,
    feedback,
    score: { nbBonnesReponses: isOk ? 1 : 0, nbReponses: 1 },
  }
}

export class DiagramBuilderElement extends MathaleaCustomElement {
  static readonly elementTag = 'diagram-builder'

  private static readonly verificationCallbacks = new Map<
    string,
    DiagramBuilderVerificationCallback
  >()

  private state: DiagramBuilderState = structuredClone(DEFAULT_STATE)

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  static create({
    id,
    numeroExercice,
    questionIndex,
    initialState,
    interactivityOn = true,
    verifyCallbackName,
    verifyCallback,
  }: DiagramBuilderCreateOptions): string {
    const callbackName =
      verifyCallbackName ??
      (verifyCallback == null
        ? undefined
        : `${DiagramBuilderElement.elementTag}Ex${numeroExercice}Q${questionIndex}-verification`)
    if (verifyCallback != null && callbackName != null) {
      DiagramBuilderElement.registerVerificationCallback(
        callbackName,
        verifyCallback,
      )
    }
    return super.create({
      id:
        id ??
        `${DiagramBuilderElement.elementTag}Ex${numeroExercice}Q${questionIndex}`,
      numeroExercice,
      questionIndex,
      initialState: initialState ?? DEFAULT_STATE,
      interactivityOn,
      verifyCallbackName: callbackName,
    })
  }

  static registerVerificationCallback(
    name: string,
    callback: DiagramBuilderVerificationCallback,
  ): void {
    if (name.trim() === '') {
      throw new Error(
        'Le nom de callback de verification du diagramme ne peut pas etre vide',
      )
    }
    DiagramBuilderElement.verificationCallbacks.set(name, callback)
  }

  static unregisterVerificationCallback(name: string): void {
    DiagramBuilderElement.verificationCallbacks.delete(name)
  }

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): DiagramBuilderVerificationResult {
    const elementId = `${DiagramBuilderElement.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`
    const element = document.getElementById(
      elementId,
    ) as DiagramBuilderElement | null
    const resultSpan = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${questionIndex}`,
    )
    const feedbackDiv = document.querySelector(
      `#feedbackEx${exercice.numeroExercice}Q${questionIndex}`,
    ) as HTMLElement | null

    if (element == null) {
      const missing = 'Constructeur de diagramme introuvable.'
      if (resultSpan) resultSpan.innerHTML = '☹️'
      if (feedbackDiv) {
        feedbackDiv.innerHTML = missing
        feedbackDiv.style.display = 'block'
      }
      return toVerificationResult(false, missing)
    }

    const expectedRaw =
      exercice.autoCorrection?.[questionIndex]?.valeur?.reponse?.value
    const actualRaw = element.value
    const expectedState = parseSerializedState(expectedRaw)
    const actualState = parseSerializedState(actualRaw)

    exercice.answers ??= {}
    exercice.answers[element.id] = actualRaw
    element.interactivityOn = false

    const callbackName = element.getAttribute('verify-callback-name')
    if (callbackName != null) {
      const callback =
        DiagramBuilderElement.verificationCallbacks.get(callbackName)
      if (callback == null) {
        const message = `Vérificateur de diagramme introuvable: ${callbackName}`
        if (resultSpan) resultSpan.innerHTML = '☹️'
        if (feedbackDiv) {
          feedbackDiv.innerHTML = message
          feedbackDiv.style.display = 'block'
        }
        return toVerificationResult(false, message)
      }
      try {
        const callbackResult = callback({
          exercice,
          questionIndex,
          element,
          expectedRaw,
          actualRaw,
          expectedState,
          actualState,
        })
        if (resultSpan) resultSpan.innerHTML = callbackResult.isOk ? '😎' : '☹️'
        if (feedbackDiv) {
          feedbackDiv.innerHTML = callbackResult.feedback
          feedbackDiv.style.display =
            callbackResult.feedback === '' ? 'none' : 'block'
        }
        return callbackResult
      } catch (error) {
        const message = `Erreur dans le vérificateur de diagramme ${callbackName}`
        if (resultSpan) resultSpan.innerHTML = '☹️'
        if (feedbackDiv) {
          feedbackDiv.innerHTML = message
          feedbackDiv.style.display = 'block'
        }
        window.notify(message, { error, callbackName })
        return toVerificationResult(false, message)
      }
    }

    if (expectedState == null || actualState == null) {
      const message = 'Réponse attendue ou réponse eleve invalide.'
      if (resultSpan) resultSpan.innerHTML = '☹️'
      if (feedbackDiv) {
        feedbackDiv.innerHTML = message
        feedbackDiv.style.display = 'block'
      }
      return toVerificationResult(false, message)
    }

    const isOk =
      stringifyStable(toSerializableState(expectedState)) ===
      stringifyStable(toSerializableState(actualState))
    if (resultSpan) resultSpan.innerHTML = isOk ? '😎' : '☹️'
    if (feedbackDiv) {
      feedbackDiv.innerHTML = isOk
        ? ''
        : 'Le diagramme produit ne correspond pas a la reponse attendue.'
      feedbackDiv.style.display = isOk ? 'none' : 'block'
    }

    return toVerificationResult(
      isOk,
      isOk
        ? ''
        : 'Le diagramme produit ne correspond pas a la reponse attendue.',
    )
  }

  static formatStudentAnswer(rawAnswer: string): string {
    const state = parseSerializedState(rawAnswer)
    if (state == null) return rawAnswer
    switch (state.type) {
      case 'pie':
      case 'semi-pie':
      case 'bar':
        return `${state.type}: ${state.items.map((item) => `${item.label}:${item.value}`).join(' ; ')}`
      case 'histogram':
        return `histogram: ${state.bins.map((bin) => `[${bin.from};${bin.to}[=${bin.value}`).join(' ; ')}`
      case 'cartesian':
        return `cartesian: ${state.points.map((point) => `(${point.x};${point.y})`).join(' ; ')}`
    }
  }

  connectedCallback(): void {
    super.connectedCallback()
    const initial = this.getAttribute('initial-state')
    const parsedInitial = parseSerializedState(initial)
    if (parsedInitial != null) {
      this.state = parsedInitial
    }
    this.render()
  }

  render(): string | void {
    if (!context.isHtml || context.isTypst) {
      return this.renderLatex()
    }
    if (this.shadowRoot == null) return

    const disableAttr = this.interactivityOn ? '' : 'disabled'
    const title = this.state.title

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
        .diagram-builder-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          align-items: start;
        }
        .row {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
          grid-column: 1 / -1;
        }
        .row label {
          font-size: 0.9rem;
        }
        .row input,
        .row select,
        .row button {
          font-size: 0.9rem;
          padding: 4px 6px;
        }
        table {
          border-collapse: collapse;
          table-layout: auto;
        }
        #table-container {
          min-width: 0;
        }
        th,
        td {
          border: 1px solid #e5e7eb;
          padding: 4px;
          text-align: left;
        }
        .preview {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 6px;
          background: #f8fafc;
          min-height: 160px;
          cursor: zoom-in;
        }
        .preview:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }
        .legend {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 6px;
          margin-top: 8px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.98rem;
          color: #334155;
        }
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          flex-shrink: 0;
        }
        svg {
          width: 100%;
          height: 160px;
          display: block;
          background: #fff;
        }
        .bar-chart-svg {
          height: 220px;
        }
        dialog {
          width: 100vw;
          height: 100vh;
          max-width: none;
          max-height: none;
          margin: 0;
          padding: 0;
          border: 0;
          background: rgba(15, 23, 42, 0.74);
        }
        dialog::backdrop {
          background: rgba(15, 23, 42, 0.55);
        }
        .modal-panel {
          min-height: 100vh;
          box-sizing: border-box;
          display: grid;
          grid-template-rows: auto 1fr;
          gap: 12px;
          padding: 16px;
          background: #ffffff;
        }
        .modal-header {
          display: flex;
          justify-content: flex-end;
        }
        .modal-close {
          font-size: 0.95rem;
          padding: 6px 10px;
        }
        .modal-diagram {
          min-height: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 12px;
        }
        .modal-title {
          text-align: center;
          font-size: 1.2rem;
          font-weight: 600;
          color: #0f172a;
        }
        .modal-diagram svg {
          height: min(70vh, 720px);
        }
        .modal-diagram .bar-chart-svg {
          height: min(70vh, 720px);
        }
        @media (max-width: 768px) {
          .diagram-builder-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
      <div class="diagram-builder-grid">
        <div class="row">
          <label for="diagram-title">Titre</label>
          <input id="diagram-title" type="text" value="${this.escapeText(title)}" ${disableAttr} />
        </div>
        <div class="row">
          <label for="diagram-type">Type</label>
          <select id="diagram-type" ${disableAttr}>
            <option value="pie" ${this.state.type === 'pie' ? 'selected' : ''}>Diagramme circulaire</option>
            <option value="semi-pie" ${this.state.type === 'semi-pie' ? 'selected' : ''}>Diagramme semi-circulaire</option>
            <option value="bar" ${this.state.type === 'bar' ? 'selected' : ''}>Diagramme en batons</option>
            <option value="histogram" ${this.state.type === 'histogram' ? 'selected' : ''}>Histogramme</option>
            <option value="cartesian" ${this.state.type === 'cartesian' ? 'selected' : ''}>Diagramme cartesien</option>
          </select>
          <button id="add-row" type="button" ${disableAttr}>Ajouter une ligne</button>
        </div>
        <div id="table-container"></div>
        <div class="preview" id="preview-container" role="button" tabindex="0" aria-label="Agrandir le diagramme"></div>
      </div>
      <dialog id="diagram-modal" aria-label="Diagramme agrandi">
        <div class="modal-panel">
          <div class="modal-header">
            <button class="modal-close" id="close-diagram-modal" type="button">Fermer</button>
          </div>
          <div class="modal-diagram" id="modal-diagram-container"></div>
        </div>
      </dialog>
    `

    this.renderTable()
    this.renderPreview()
    this.bindEvents()
  }

  protected renderLatex(): string {
    return ''
  }

  get value(): string {
    return JSON.stringify(toSerializableState(this.state))
  }

  set value(nextValue: string) {
    this.update(nextValue)
  }

  update(nextValue: string | DiagramBuilderState): void {
    const parsed = parseSerializedState(nextValue)
    if (parsed == null) return
    this.state = parsed
    this.render()
  }

  protected onInteractivityChanged(_isOn: boolean): void {
    this.render()
  }

  private bindEvents(): void {
    if (this.shadowRoot == null) return

    const titleInput = this.shadowRoot.querySelector(
      '#diagram-title',
    ) as HTMLInputElement | null
    if (titleInput != null) {
      titleInput.addEventListener('input', () => {
        this.state.title = titleInput.value
        this.renderPreview()
      })
      titleInput.addEventListener('change', () => {
        this.emitStateChanged()
      })
    }

    const typeSelect = this.shadowRoot.querySelector(
      '#diagram-type',
    ) as HTMLSelectElement | null
    if (typeSelect != null) {
      typeSelect.addEventListener('change', () => {
        const nextType = typeSelect.value as DiagramType
        this.state.type = nextType
        this.render()
        this.emitStateChanged()
      })
    }

    const addButton = this.shadowRoot.querySelector(
      '#add-row',
    ) as HTMLButtonElement | null
    if (addButton != null) {
      addButton.addEventListener('click', () => {
        this.addRowForCurrentType()
        this.render()
        this.emitStateChanged()
      })
    }

    const preview = this.shadowRoot.querySelector(
      '#preview-container',
    ) as HTMLDivElement | null
    if (preview != null) {
      preview.addEventListener('click', () => {
        this.openDiagramModal()
      })
      preview.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        this.openDiagramModal()
      })
    }

    const modal = this.shadowRoot.querySelector(
      '#diagram-modal',
    ) as HTMLDialogElement | null
    const closeButton = this.shadowRoot.querySelector(
      '#close-diagram-modal',
    ) as HTMLButtonElement | null
    closeButton?.addEventListener('click', () => {
      modal?.close()
    })
    modal?.addEventListener('click', (event) => {
      if (event.target === modal) modal.close()
    })
  }

  private renderTable(): void {
    if (this.shadowRoot == null) return
    const tableContainer = this.shadowRoot.querySelector(
      '#table-container',
    ) as HTMLDivElement | null
    if (tableContainer == null) return

    if (
      this.state.type === 'pie' ||
      this.state.type === 'semi-pie' ||
      this.state.type === 'bar'
    ) {
      tableContainer.innerHTML = `
        <table>
          <thead><tr><th>Label</th><th>Valeur</th><th>Action</th></tr></thead>
          <tbody>
            ${this.state.items
              .map(
                (item, index) => `
                  <tr>
                    <td><input data-kind="item-label" data-index="${index}" value="${this.escapeText(item.label)}" ${this.interactivityOn ? '' : 'disabled'} /></td>
                    <td><input data-kind="item-value" data-index="${index}" type="number" value="${item.value}" ${this.interactivityOn ? '' : 'disabled'} /></td>
                    <td><button type="button" data-kind="remove-item" data-index="${index}" ${this.interactivityOn ? '' : 'disabled'}>Supprimer</button></td>
                  </tr>
                `,
              )
              .join('')}
          </tbody>
        </table>
      `
    } else if (this.state.type === 'histogram') {
      tableContainer.innerHTML = `
        <table>
          <thead><tr><th>De</th><th>A</th><th>Valeur</th><th>Action</th></tr></thead>
          <tbody>
            ${this.state.bins
              .map(
                (bin, index) => `
                  <tr>
                    <td><input data-kind="bin-from" data-index="${index}" type="number" value="${bin.from}" ${this.interactivityOn ? '' : 'disabled'} /></td>
                    <td><input data-kind="bin-to" data-index="${index}" type="number" value="${bin.to}" ${this.interactivityOn ? '' : 'disabled'} /></td>
                    <td><input data-kind="bin-value" data-index="${index}" type="number" value="${bin.value}" ${this.interactivityOn ? '' : 'disabled'} /></td>
                    <td><button type="button" data-kind="remove-bin" data-index="${index}" ${this.interactivityOn ? '' : 'disabled'}>Supprimer</button></td>
                  </tr>
                `,
              )
              .join('')}
          </tbody>
        </table>
      `
    } else {
      tableContainer.innerHTML = `
        <table>
          <thead><tr><th>X</th><th>Y</th><th>Action</th></tr></thead>
          <tbody>
            ${this.state.points
              .map(
                (point, index) => `
                  <tr>
                    <td><input data-kind="point-x" data-index="${index}" type="number" value="${point.x}" ${this.interactivityOn ? '' : 'disabled'} /></td>
                    <td><input data-kind="point-y" data-index="${index}" type="number" value="${point.y}" ${this.interactivityOn ? '' : 'disabled'} /></td>
                    <td><button type="button" data-kind="remove-point" data-index="${index}" ${this.interactivityOn ? '' : 'disabled'}>Supprimer</button></td>
                  </tr>
                `,
              )
              .join('')}
          </tbody>
        </table>
      `
    }

    this.bindTableEvents()
  }

  private bindTableEvents(): void {
    if (this.shadowRoot == null) return
    const onInput = (event: Event) => {
      const target = event.target as HTMLInputElement | null
      if (target == null) return
      const kind = target.dataset.kind
      const index = Number(target.dataset.index)
      if (!Number.isInteger(index) || index < 0) return

      if (kind === 'item-label') {
        if (this.state.items[index] == null) return
        this.state.items[index].label = target.value
      }
      if (kind === 'item-value') {
        if (this.state.items[index] == null) return
        this.state.items[index].value = parseNumber(target.value, 0)
      }
      if (kind === 'bin-from') {
        if (this.state.bins[index] == null) return
        this.state.bins[index].from = parseNumber(target.value, 0)
      }
      if (kind === 'bin-to') {
        if (this.state.bins[index] == null) return
        this.state.bins[index].to = parseNumber(target.value, 0)
      }
      if (kind === 'bin-value') {
        if (this.state.bins[index] == null) return
        this.state.bins[index].value = parseNumber(target.value, 0)
      }
      if (kind === 'point-x') {
        if (this.state.points[index] == null) return
        this.state.points[index].x = parseNumber(target.value, 0)
      }
      if (kind === 'point-y') {
        if (this.state.points[index] == null) return
        this.state.points[index].y = parseNumber(target.value, 0)
      }
      this.renderPreview()
    }

    const onChange = () => {
      this.emitStateChanged()
    }

    this.shadowRoot
      .querySelectorAll<HTMLInputElement>('input[data-kind]')
      .forEach((input) => {
        input.addEventListener('input', onInput)
        input.addEventListener('change', onChange)
      })

    this.shadowRoot
      .querySelectorAll<HTMLButtonElement>('button[data-kind^="remove-"]')
      .forEach((button) => {
        button.addEventListener('click', () => {
          const kind = button.dataset.kind
          const index = Number(button.dataset.index)
          if (!Number.isInteger(index) || index < 0) return

          if (kind === 'remove-item') this.state.items.splice(index, 1)
          if (kind === 'remove-bin') this.state.bins.splice(index, 1)
          if (kind === 'remove-point') this.state.points.splice(index, 1)

          this.render()
          this.emitStateChanged()
        })
      })
  }

  private renderPreview(): void {
    if (this.shadowRoot == null) return
    const preview = this.shadowRoot.querySelector(
      '#preview-container',
    ) as HTMLDivElement | null
    if (preview == null) return

    preview.innerHTML = this.renderDiagramContent({ centerTitle: false })

    const modal = this.shadowRoot.querySelector(
      '#diagram-modal',
    ) as HTMLDialogElement | null
    const modalContent = this.shadowRoot.querySelector(
      '#modal-diagram-container',
    ) as HTMLDivElement | null
    if (modal?.open === true && modalContent != null) {
      modalContent.innerHTML = this.renderDiagramContent({ centerTitle: true })
    }
  }

  private openDiagramModal(): void {
    if (this.shadowRoot == null) return
    const modal = this.shadowRoot.querySelector(
      '#diagram-modal',
    ) as HTMLDialogElement | null
    const modalContent = this.shadowRoot.querySelector(
      '#modal-diagram-container',
    ) as HTMLDivElement | null
    if (modal == null || modalContent == null) return

    modalContent.innerHTML = this.renderDiagramContent({ centerTitle: true })
    if (!modal.open) modal.showModal()
  }

  private renderDiagramContent({
    centerTitle,
  }: {
    centerTitle: boolean
  }): string {
    let svg = ''
    let legend = ''
    if (this.state.type === 'pie' || this.state.type === 'semi-pie') {
      svg = this.renderPieSvg(this.state.type === 'semi-pie')
      legend = this.renderItemsLegend()
    } else if (this.state.type === 'bar') {
      svg = this.renderBarSvg()
    } else if (this.state.type === 'histogram') {
      svg = this.renderHistogramSvg()
      legend = this.renderHistogramLegend()
    } else {
      svg = this.renderCartesianSvg()
    }
    const title = this.state.title.trim()
    const titleClass = centerTitle ? ' class="modal-title"' : ''
    return `${title === '' ? '' : `<div${titleClass}>${this.escapeText(title)}</div>`}${svg}${legend}`
  }

  private renderPieSvg(isSemiPie: boolean): string {
    const width = 300
    const height = 160
    const cx = width / 2
    const cy = isSemiPie ? height - 8 : height / 2
    const radius = isSemiPie
      ? Math.min(width / 2 - 8, height - 14)
      : Math.min(width, height) / 2 - 8
    const values = this.state.items.map((item) => Math.max(0, item.value))
    const sum = values.reduce((a, b) => a + b, 0)
    if (sum <= 0) return '<svg viewBox="0 0 300 160"></svg>'

    const maxAngle = isSemiPie ? Math.PI : Math.PI * 2
    let startAngle = isSemiPie ? Math.PI : -Math.PI / 2

    const paths = values
      .map((value, index) => {
        const delta = (value / sum) * maxAngle
        const endAngle = startAngle + delta
        const largeArc = delta > Math.PI ? 1 : 0
        const startX = cx + radius * Math.cos(startAngle)
        const startY = cy + radius * Math.sin(startAngle)
        const endX = cx + radius * Math.cos(endAngle)
        const endY = cy + radius * Math.sin(endAngle)
        const d = `M ${cx} ${cy} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY} Z`
        startAngle = endAngle
        return `<path d="${d}" fill="${this.colorForIndex(index)}"/>`
      })
      .join('')

    return `<svg viewBox="0 0 ${width} ${height}">${paths}</svg>`
  }

  private renderBarSvg(): string {
    const width = 300
    const height = 230
    const items = this.state.items
    const maxValue = Math.max(1, ...items.map((item) => item.value))
    const slotWidth = items.length > 0 ? 260 / items.length : 0
    const barWidth =
      items.length > 0 ? Math.max(6, Math.min(24, slotWidth * 0.55)) : 0
    const baselineY = 175
    const labelY = 198
    const bars = items
      .map((item, index) => {
        const h = Math.max(0, (item.value / maxValue) * 120)
        const x = 20 + index * slotWidth + (slotWidth - barWidth) / 2
        const y = baselineY - h
        const rawLabel = item.label.trim()
        const label = rawLabel === '' ? `S${index + 1}` : rawLabel
        const tooltip = `${label} : ${item.value}`
        return `<rect x="${x}" y="${y}" width="${barWidth}" height="${h}" fill="${this.colorForIndex(index)}"><title>${this.escapeText(tooltip)}</title></rect>`
      })
      .join('')
    const labels = items
      .map((item, index) => {
        const centerX = 20 + index * slotWidth + slotWidth / 2
        const rawLabel = item.label.trim()
        const label = rawLabel === '' ? `S${index + 1}` : rawLabel
        const truncated = label.length > 10 ? `${label.slice(0, 9)}…` : label
        return `<text x="${centerX}" y="${labelY}" text-anchor="middle" font-size="12" fill="#334155"><title>${this.escapeText(label)}</title>${this.escapeText(truncated)}</text>`
      })
      .join('')
    return `<svg class="bar-chart-svg" viewBox="0 0 ${width} ${height}"><line x1="20" y1="${baselineY}" x2="290" y2="${baselineY}" stroke="#475569"/><line x1="20" y1="20" x2="20" y2="${baselineY}" stroke="#475569"/>${bars}${labels}</svg>`
  }

  private renderItemsLegend(): string {
    const entries = this.state.items
      .map((item, index) => ({
        color: this.colorForIndex(index),
        label: item.label.trim(),
      }))
      .filter((entry) => entry.label !== '')

    if (entries.length === 0) return ''

    return `<div class="legend">${entries
      .map(
        (entry) =>
          `<div class="legend-item"><span class="legend-color" style="background:${entry.color};"></span><span>${this.escapeText(entry.label)}</span></div>`,
      )
      .join('')}</div>`
  }

  private colorForIndex(index: number): string {
    return DIAGRAM_COLORS[index % DIAGRAM_COLORS.length]
  }

  private renderHistogramSvg(): string {
    const width = 300
    const height = 190
    const axisLeft = 36
    const axisRight = 288
    const axisTop = 18
    const axisBottom = 148
    const axisWidth = axisRight - axisLeft
    const axisHeight = axisBottom - axisTop
    const bins = this.state.bins
    const maxValue = Math.max(1, ...bins.map((bin) => bin.value))
    const first = bins[0]
    const last = bins[bins.length - 1]
    const minX = first?.from ?? 0
    const maxX = last?.to ?? minX + 1
    const rangeX = maxX - minX === 0 ? 1 : maxX - minX
    const projectX = (value: number) =>
      axisLeft + ((value - minX) / rangeX) * axisWidth
    const projectY = (value: number) =>
      axisBottom - (Math.max(0, value) / maxValue) * axisHeight

    const yTickCount = 4
    const yTicks = Array.from({ length: yTickCount + 1 }, (_, index) => {
      const value = (maxValue / yTickCount) * index
      const y = projectY(value)
      const label = Number.isInteger(value) ? String(value) : value.toFixed(1)
      return `<line x1="${axisLeft - 4}" y1="${y}" x2="${axisRight}" y2="${y}" stroke="#e2e8f0"/><text x="${axisLeft - 7}" y="${y + 4}" text-anchor="end" font-size="10" fill="#475569">${label}</text>`
    }).join('')

    const xTickValues = Array.from(
      new Set(bins.flatMap((bin) => [bin.from, bin.to])),
    ).sort((a, b) => a - b)
    const xTicks = xTickValues
      .map((value) => {
        const x = projectX(value)
        const label = Number.isInteger(value) ? String(value) : value.toFixed(1)
        return `<line x1="${x}" y1="${axisBottom}" x2="${x}" y2="${axisBottom + 4}" stroke="#475569"/><text x="${x}" y="${axisBottom + 18}" text-anchor="middle" font-size="10" fill="#475569">${label}</text>`
      })
      .join('')

    const bars = bins
      .map((bin, index) => {
        const x = projectX(bin.from)
        const w = Math.max(2, projectX(bin.to) - x)
        const y = projectY(bin.value)
        const h = axisBottom - y
        const tooltip = `[${bin.from}; ${bin.to}[ : ${bin.value}`
        return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${this.colorForIndex(index)}" opacity="0.85"><title>${this.escapeText(tooltip)}</title></rect>`
      })
      .join('')

    return `<svg viewBox="0 0 ${width} ${height}">${yTicks}<line x1="${axisLeft}" y1="${axisBottom}" x2="${axisRight}" y2="${axisBottom}" stroke="#475569"/><line x1="${axisLeft}" y1="${axisTop}" x2="${axisLeft}" y2="${axisBottom}" stroke="#475569"/>${xTicks}${bars}</svg>`
  }

  private renderHistogramLegend(): string {
    const entries = this.state.bins.map((bin, index) => ({
      color: this.colorForIndex(index),
      label: `[${bin.from}; ${bin.to}[`,
    }))

    if (entries.length === 0) return ''

    return `<div class="legend">${entries
      .map(
        (entry) =>
          `<div class="legend-item"><span class="legend-color" style="background:${entry.color};"></span><span>${this.escapeText(entry.label)}</span></div>`,
      )
      .join('')}</div>`
  }

  private renderCartesianSvg(): string {
    const width = 300
    const height = 160
    const points = this.state.points
    if (points.length === 0) {
      return `<svg viewBox="0 0 ${width} ${height}"></svg>`
    }

    const xs = points.map((point) => point.x)
    const ys = points.map((point) => point.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const rangeX = maxX - minX === 0 ? 1 : maxX - minX
    const rangeY = maxY - minY === 0 ? 1 : maxY - minY

    const projectX = (x: number) => 20 + ((x - minX) / rangeX) * 260
    const projectY = (y: number) => 140 - ((y - minY) / rangeY) * 120

    const polyline = points
      .map((point) => `${projectX(point.x)},${projectY(point.y)}`)
      .join(' ')
    const circles = points
      .map(
        (point) =>
          `<circle cx="${projectX(point.x)}" cy="${projectY(point.y)}" r="3" fill="#dc2626"/>`,
      )
      .join('')

    return `<svg viewBox="0 0 ${width} ${height}"><line x1="20" y1="140" x2="290" y2="140" stroke="#475569"/><line x1="20" y1="20" x2="20" y2="140" stroke="#475569"/><polyline points="${polyline}" fill="none" stroke="#dc2626" stroke-width="2"/>${circles}</svg>`
  }

  private addRowForCurrentType(): void {
    if (
      this.state.type === 'pie' ||
      this.state.type === 'semi-pie' ||
      this.state.type === 'bar'
    ) {
      this.state.items.push({
        label: `S${this.state.items.length + 1}`,
        value: 1,
      })
      return
    }
    if (this.state.type === 'histogram') {
      const previous = this.state.bins[this.state.bins.length - 1]
      const start = previous == null ? 0 : previous.to
      this.state.bins.push({ from: start, to: start + 10, value: 1 })
      return
    }
    const previousPoint = this.state.points[this.state.points.length - 1]
    const x = previousPoint == null ? 0 : previousPoint.x + 1
    this.state.points.push({ x, y: 0 })
  }

  private emitStateChanged(): void {
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

export function addDiagramBuilder(
  exercice: IExercice,
  questionIndex: number,
  options: DiagramBuilderOptions = {},
): string {
  if (!context.isHtml) return ''
  if (exercice.autoCorrection[questionIndex] == null) {
    exercice.autoCorrection[questionIndex] = {}
  }
  exercice.autoCorrection[questionIndex].formatInteractif =
    DiagramBuilderElement.elementTag
  return DiagramBuilderElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
  })
}

registerMathaleaCustomElement(DiagramBuilderElement)
