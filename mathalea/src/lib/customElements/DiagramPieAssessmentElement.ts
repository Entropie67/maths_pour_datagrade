import { context } from '../../modules/context'
import { orangeMathalea } from '../colors'
import { texNombre } from '../outils/texNombre'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

/**
 * @author Jean-Claude Lhote
 */
export type PieAssessmentShape = 'pie' | 'semi-pie'
export type PieAssessmentMode = 'auto' | 'angle' | 'effectif' | 'label'
export type PieAssessmentColumn = 'label' | 'effectif' | 'angle'

export type PieAssessmentItem = {
  label: string
  effectif: number | null
  angle: number | null
}

export type PieAssessmentState = {
  version: 1
  shape: PieAssessmentShape
  mode: PieAssessmentMode
  title: string
  targetAngle: number
  tolerance: number
  infosStatus: boolean
  colorOn: boolean
  correctionOn: boolean
  hiddenColumns: PieAssessmentColumn[]
  items: PieAssessmentItem[]
}

export type PieAssessmentSerializedState = {
  version: 1
  kind: 'diagram-pie-assessment'
  shape: PieAssessmentShape
  mode: PieAssessmentMode
  targetAngle: number
  hiddenColumns?: PieAssessmentColumn[]
  infosStatus: boolean
  colorOn?: boolean
  correctionOn?: boolean
  items: Array<{
    label: string
    effectif: number | null
    angle: number | null
  }>
}

export type PieAssessmentVerificationResult = {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
}

export type PieAssessmentVerificationContext = {
  exercice: IExercice
  questionIndex: number
  element: DiagramPieAssessmentElement
  expectedRaw: unknown
  actualRaw: string
  expected: PieAssessmentExpected | null
  actual: PieAssessmentExpected
}

export type PieAssessmentVerificationCallback = (
  context: PieAssessmentVerificationContext,
) => PieAssessmentVerificationResult

export type PieAssessmentCreateOptions = {
  id?: string
  numeroExercice: number
  questionIndex: number
  title?: string
  shape?: PieAssessmentShape
  mode?: PieAssessmentMode
  targetAngle?: number
  tolerance?: number
  infosStatus?: boolean
  colorOn?: boolean
  correctionOn?: boolean
  hiddenColumns?: PieAssessmentColumn[]
  items: Array<{
    label: string
    effectif?: number | null
    angle?: number | null
  }>
  interactivityOn?: boolean
  verifyCallbackName?: string
  verifyCallback?: PieAssessmentVerificationCallback
}

type PieAssessmentExpected = {
  labels: string[]
  effectifs: number[]
  angles: number[]
}

export type PieAssessmentOptions = Omit<
  PieAssessmentCreateOptions,
  'numeroExercice' | 'questionIndex'
>

const PIE_COLORS = [
  '#2563eb',
  '#16a34a',
  '#f59e0b',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#ea580c',
  '#0f766e',
]

const DEFAULT_STATE: PieAssessmentState = {
  version: 1,
  shape: 'pie',
  mode: 'angle',
  title: '',
  targetAngle: 360,
  tolerance: 0,
  infosStatus: false,
  colorOn: true,
  correctionOn: false,
  hiddenColumns: [],
  items: [
    { label: 'A', effectif: 1, angle: null },
    { label: 'B', effectif: 1, angle: null },
  ],
}

function safeText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function safeNumber(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeAngle(value: unknown): number | null {
  if (value == null || value === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  return Math.max(0, Math.trunc(parsed))
}

function normalizeEffectif(value: unknown): number | null {
  if (value == null || value === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  return Math.max(0, parsed)
}

function sanitizeIntegerInput(rawValue: string): string {
  if (rawValue.trim() === '') return ''
  const normalized = rawValue.replace(',', '.')
  const [integerPart] = normalized.split('.')
  const digitsOnly = integerPart.replaceAll(/[^0-9]/g, '')
  return digitsOnly
}

function normalizeItems(value: unknown): PieAssessmentItem[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (item == null || typeof item !== 'object') return null
      const raw = item as {
        label?: unknown
        effectif?: unknown
        angle?: unknown
      }
      return {
        label: safeText(raw.label),
        effectif: normalizeEffectif(raw.effectif),
        angle: normalizeAngle(raw.angle),
      }
    })
    .filter((item): item is PieAssessmentItem => item != null)
}

function parseJsonAttribute<T>(raw: string | null, fallback: T): T {
  if (raw == null || raw.trim() === '') return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function parseBooleanAttribute(raw: string | null, fallback: boolean): boolean {
  if (raw == null) return fallback
  const normalized = raw.trim().toLowerCase()
  if (normalized === 'true') return true
  if (normalized === 'false') return false
  return fallback
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function effectiveTargetAngle(
  shape: PieAssessmentShape,
  configured: number,
): number {
  const fallback = shape === 'semi-pie' ? 180 : 360
  if (!Number.isFinite(configured) || configured <= 0) return fallback
  return configured
}

function stableObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((item) => stableObject(item))
  if (value == null || typeof value !== 'object') return value
  const keys = Object.keys(value as Record<string, unknown>).sort()
  const out: Record<string, unknown> = {}
  for (const key of keys) {
    out[key] = stableObject((value as Record<string, unknown>)[key])
  }
  return out
}

function stringifyStable(value: unknown): string {
  return JSON.stringify(stableObject(value))
}

function parseAngles(raw: unknown): number[] | null {
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
    items?: Array<{ angle?: unknown }>
    angles?: unknown[]
  }

  if (Array.isArray(objectValue.angles)) {
    return objectValue.angles
      .map((value) => safeNumber(value, NaN))
      .filter((n) => Number.isFinite(n))
  }

  if (Array.isArray(objectValue.items)) {
    return objectValue.items.map((item) => safeNumber(item.angle, 0))
  }

  return null
}

function parseEffectifs(raw: unknown): number[] | null {
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
    items?: Array<{ effectif?: unknown }>
    effectifs?: unknown[]
  }

  if (Array.isArray(objectValue.effectifs)) {
    return objectValue.effectifs
      .map((value) => safeNumber(value, NaN))
      .filter((n) => Number.isFinite(n))
  }

  if (Array.isArray(objectValue.items)) {
    return objectValue.items.map((item) => safeNumber(item.effectif, 0))
  }

  return null
}

function parseLabels(raw: unknown): string[] | null {
  if (Array.isArray(raw)) {
    return raw.map((value) => safeText(value))
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
    items?: Array<{ label?: unknown }>
    labels?: unknown[]
  }

  if (Array.isArray(objectValue.labels)) {
    return objectValue.labels.map((value) => safeText(value))
  }

  if (Array.isArray(objectValue.items)) {
    return objectValue.items.map((item) => safeText(item.label))
  }

  return null
}

function parseHiddenColumns(raw: string | null): PieAssessmentColumn[] {
  if (raw == null || raw.trim() === '') return []

  const candidates: unknown = raw.trim().startsWith('[')
    ? parseJsonAttribute<unknown>(raw, [])
    : raw.split(',').map((value) => value.trim())

  if (!Array.isArray(candidates)) return []

  return candidates
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(
      (value): value is PieAssessmentColumn =>
        value === 'label' || value === 'effectif' || value === 'angle',
    )
}

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase()
}

export class DiagramPieAssessmentElement extends MathaleaCustomElement {
  static readonly elementTag = 'diagram-pie-assessment'

  private static readonly verificationCallbacks = new Map<
    string,
    PieAssessmentVerificationCallback
  >()

  private state: PieAssessmentState = structuredClone(DEFAULT_STATE)

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  private static createStaticElement({
    title,
    shape,
    mode,
    targetAngle,
    tolerance,
    infosStatus,
    colorOn,
    correctionOn,
    hiddenColumns,
    items,
    interactivityOn,
  }: {
    title: string
    shape: PieAssessmentShape
    mode: PieAssessmentMode
    targetAngle: number
    tolerance: number
    infosStatus: boolean
    colorOn: boolean
    correctionOn: boolean
    hiddenColumns: PieAssessmentColumn[]
    items: PieAssessmentCreateOptions['items']
    interactivityOn: boolean
  }): DiagramPieAssessmentElement {
    const element = new DiagramPieAssessmentElement()
    element.setAttribute('interactivity-on', interactivityOn ? 'true' : 'false')
    element.state = {
      ...structuredClone(DEFAULT_STATE),
      title,
      shape,
      mode,
      targetAngle,
      tolerance,
      infosStatus,
      colorOn,
      correctionOn,
      hiddenColumns,
      items: normalizeItems(items),
    }
    return element
  }

  static get observedAttributes(): string[] {
    return [
      'title',
      'shape',
      'mode',
      'target-angle',
      'tolerance',
      'infos-status',
      'color-on',
      'correction-on',
      'hidden-columns',
      'items',
      'interactivity-on',
    ]
  }

  static create({
    id,
    numeroExercice,
    questionIndex,
    title = '',
    shape = 'pie',
    mode = 'angle',
    targetAngle,
    tolerance = 0,
    infosStatus = false,
    colorOn = true,
    correctionOn = false,
    hiddenColumns = [],
    items,
    interactivityOn = true,
    verifyCallbackName,
    verifyCallback,
  }: PieAssessmentCreateOptions): string {
    const callbackName =
      verifyCallbackName ??
      (verifyCallback == null
        ? undefined
        : `${DiagramPieAssessmentElement.elementTag}Ex${numeroExercice}Q${questionIndex}-verification`)

    if (verifyCallback != null && callbackName != null) {
      DiagramPieAssessmentElement.registerVerificationCallback(
        callbackName,
        verifyCallback,
      )
    }

    const target = targetAngle ?? (shape === 'semi-pie' ? 180 : 360)

    if (context.isTypst) {
      const element = DiagramPieAssessmentElement.createStaticElement({
        title,
        shape,
        mode,
        targetAngle: target,
        tolerance,
        infosStatus,
        colorOn,
        correctionOn,
        hiddenColumns,
        items,
        interactivityOn,
      })
      return `<mathalea-typst>${element.renderTypst()}</mathalea-typst>`
    }

    if (!context.isHtml) {
      const element = DiagramPieAssessmentElement.createStaticElement({
        title,
        shape,
        mode,
        targetAngle: target,
        tolerance,
        infosStatus,
        colorOn,
        correctionOn,
        hiddenColumns,
        items,
        interactivityOn,
      })
      return element.renderLatex()
    }

    return super.create({
      id:
        id ??
        `${DiagramPieAssessmentElement.elementTag}Ex${numeroExercice}Q${questionIndex}`,
      numeroExercice,
      questionIndex,
      title,
      shape,
      mode,
      targetAngle: target,
      tolerance,
      infosStatus,
      colorOn,
      correctionOn,
      hiddenColumns,
      items,
      interactivityOn,
      verifyCallbackName: callbackName,
    })
  }

  static registerVerificationCallback(
    name: string,
    callback: PieAssessmentVerificationCallback,
  ): void {
    if (name.trim() === '') {
      throw new Error(
        'Le nom du callback de verification ne peut pas etre vide',
      )
    }
    DiagramPieAssessmentElement.verificationCallbacks.set(name, callback)
  }

  static unregisterVerificationCallback(name: string): void {
    DiagramPieAssessmentElement.verificationCallbacks.delete(name)
  }

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): PieAssessmentVerificationResult {
    const id = `${DiagramPieAssessmentElement.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`
    const element = document.getElementById(
      id,
    ) as DiagramPieAssessmentElement | null
    const spanResult = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${questionIndex}`,
    )
    const feedbackDiv = document.querySelector(
      `#feedbackEx${exercice.numeroExercice}Q${questionIndex}`,
    ) as HTMLElement | null

    if (element == null) {
      const feedback = 'Diagramme circulaire interactif introuvable.'
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
    const actualRaw = element.value
    const expected: PieAssessmentExpected | null = {
      labels: parseLabels(expectedRaw) ?? [],
      effectifs: parseEffectifs(expectedRaw) ?? [],
      angles: parseAngles(expectedRaw) ?? [],
    }
    const actual: PieAssessmentExpected = {
      labels: element.getStudentLabels(),
      effectifs: element.getStudentEffectifs(),
      angles: element.getStudentAngles(),
    }

    exercice.answers ??= {}
    exercice.answers[element.id] = actualRaw
    element.interactivityOn = false

    const callbackName = element.getAttribute('verify-callback-name')
    if (callbackName != null) {
      const callback =
        DiagramPieAssessmentElement.verificationCallbacks.get(callbackName)
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
          expected,
          actual,
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

    if (
      expected == null ||
      (expected.labels.length === 0 &&
        expected.effectifs.length === 0 &&
        expected.angles.length === 0)
    ) {
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
    const mode = element.state.mode

    let isOk = false
    let feedback = ''

    if (mode === 'label') {
      if (expected.labels.length !== actual.labels.length) {
        feedback = 'Le nombre de catégories saisies ne correspond pas.'
      } else {
        const mismatches = expected.labels
          .map((label, index) => ({
            expected: normalizeLabel(label),
            actual: normalizeLabel(actual.labels[index] ?? ''),
          }))
          .filter((entry) => entry.expected !== entry.actual)
        isOk = mismatches.length === 0
        if (!isOk) {
          feedback = `Catégories incorrectes pour ${mismatches.length} secteur${mismatches.length > 1 ? 's' : ''}.`
        }
      }
    } else if (mode === 'effectif') {
      if (expected.effectifs.length !== actual.effectifs.length) {
        feedback = 'Le nombre de secteurs saisis ne correspond pas.'
      } else {
        const mismatches = expected.effectifs
          .map((value, index) => ({
            expected: value,
            actual: actual.effectifs[index] ?? 0,
          }))
          .filter(
            (entry) => Math.abs(entry.expected - entry.actual) > tolerance,
          )
        isOk = mismatches.length === 0
        if (!isOk) {
          feedback = `Effectifs incorrects pour ${mismatches.length} secteur${mismatches.length > 1 ? 's' : ''}.`
        }
      }
    } else {
      if (expected.angles.length !== actual.angles.length) {
        feedback = 'Le nombre de secteurs saisis ne correspond pas.'
      } else {
        const mismatches = expected.angles
          .map((value, index) => ({
            expected: value,
            actual: actual.angles[index] ?? 0,
          }))
          .filter(
            (entry) => Math.abs(entry.expected - entry.actual) > tolerance,
          )
        isOk = mismatches.length === 0
        if (!isOk) {
          feedback = `Angles incorrects pour ${mismatches.length} secteur${mismatches.length > 1 ? 's' : ''}.`
        }
      }
    }

    if (feedback !== '') isOk = false

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
    const angles = parseAngles(rawAnswer)
    if (angles == null) return rawAnswer
    return angles.map((value, index) => `S${index + 1}: ${value}°`).join(' ; ')
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
    if (context.isTypst) {
      return this.renderTypst()
    }
    if (!context.isHtml) {
      return this.renderLatex()
    }
    if (this.shadowRoot == null) return

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
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          align-items: start;
        }
        table {
          border-collapse: collapse;
          table-layout: auto;
        }
        th,
        td {
          border: 1px solid #e5e7eb;
          padding: 5px;
          text-align: left;
        }
        .static-conversion-table {
          border: 2.5px solid #334155;
          border-collapse: collapse;
          background: #ffffff;
        }
        .static-conversion-table th {
          border: 2px solid #64748b;
          border-bottom: 4px solid #334155;
          padding: 8px 10px;
          background: #cbd5e1;
          color: #0f172a;
          font-weight: 700;
          text-align: center;
        }
        .static-conversion-table td {
          border: 1.5px solid #64748b;
          padding: 8px 10px;
          background: #ffffff;
          color: #000000;
        }
        .static-conversion-table tbody tr:nth-child(even) td {
          background: #f1f5f9;
        }
        .static-conversion-table thead th {
          border-bottom: 4px solid #334155;
        }
        .static-conversion-table thead th:first-child,
        .static-conversion-table tbody td:first-child,
        .static-conversion-table .category-header,
        .static-conversion-table .category-cell {
          border-right: 4px solid #334155;
          text-align: center;
        }
        td input {
          width: 100%;
          box-sizing: border-box;
        }
        td input:disabled {
          display: block;
          width: 100%;
          color: #000000;
          opacity: 1;
          background: #e2e8f0;
          border: 1px solid #94a3b8;
          border-radius: 3px;
          padding: 2px 6px;
        }
        td input[type="number"]:disabled {
          text-align: center;
        }
        td.correction-value-cell,
        td.correction-value-cell input:disabled {
          color: ${orangeMathalea};
          font-weight: 700;
        }
        .numeric-cell {
          text-align: center;
        }
        .static-empty-cell {
          color: transparent;
          height: 2.4rem;
          text-align: center;
          vertical-align: bottom;
        }
        .static-empty-cell::before {
          content: "";
          display: block;
          width: 4rem;
          max-width: 100%;
          margin: 1.2rem auto 0;
          border-bottom: 1px dotted #64748b;
        }
        .numeric-header {
          text-align: center;
        }
        .preview {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 6px;
          background: #f8fafc;
        }
        .title {
          grid-column: 1 / -1;
        }
        .status {
          font-size: 0.9rem;
          color: #334155;
        }
        .status.warning {
          color: #b45309;
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
          font-size: 0.95rem;
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
          height: 220px;
          display: block;
          background: #fff;
        }
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
      <div class="grid">
        ${
          this.state.title.trim() === ''
            ? ''
            : `<div class="title">${this.escapeText(this.state.title.trim())}</div>`
        }
        ${this.renderTable()}
        <div class="preview" id="preview"></div>
      </div>
    `

    this.renderPreview()
    this.bindEvents()
  }

  protected renderLatex(): string {
    const title = this.state.title.trim()
    const titleLatex =
      title === '' ? '' : `\\textbf{${this.escapeLatex(title)}}\\\\[0.4em]\n`
    const diagram = this.renderEmptyPieTikz()
    const renderedDiagram =
      !this.interactivityOn && this.state.correctionOn
        ? this.renderFilledPieTikz()
        : diagram
    const legend = this.interactivityOn ? '' : `\n${this.renderLatexLegend()}`
    return `\\begin{center}
${titleLatex}\\begin{minipage}[t]{0.48\\linewidth}
\\vspace{0pt}
\\centering
${this.renderLatexTable()}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.48\\linewidth}
\\vspace{0pt}
\\centering
${renderedDiagram}${legend}
\\end{minipage}
\\end{center}`
  }

  protected renderTypst(): string {
    const title = this.state.title.trim()
    const titleTypst =
      title === '' ? '' : `#strong[${this.escapeTypst(title)}]\n#v(0.4em)\n`
    const diagram =
      !this.interactivityOn && this.state.correctionOn
        ? this.renderFilledPieTypst()
        : this.renderEmptyPieTypst()
    const diagramWithLegend = this.interactivityOn
      ? diagram
      : this.renderTypstDiagramWithLegend(diagram)

    return `#align(center)[
${titleTypst}#grid(
  columns: (auto, auto),
  gutter: 14pt,
  align: top,
  [#align(center)[${this.renderTypstTable()}]],
  [#align(center)[${diagramWithLegend}]],
)
]`
  }

  get value(): string {
    return JSON.stringify(this.toSerializedState())
  }

  set value(nextValue: string) {
    this.update(nextValue)
  }

  update(nextValue: string | PieAssessmentSerializedState): void {
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
    const raw = parsed as Partial<PieAssessmentSerializedState>

    const itemsByIndex = Array.isArray(raw.items) ? raw.items : []
    this.state.items = this.state.items.map((item, index) => {
      const incoming = itemsByIndex[index]
      if (incoming == null) return item
      const effectif =
        'effectif' in incoming
          ? normalizeEffectif(incoming.effectif)
          : item.effectif
      return {
        label: safeText(incoming.label) || item.label,
        effectif,
        angle: normalizeAngle(incoming.angle),
      }
    })

    if (raw.shape === 'pie' || raw.shape === 'semi-pie') {
      this.state.shape = raw.shape
    }
    if (raw.mode === 'angle' || raw.mode === 'auto') {
      this.state.mode = raw.mode
    }
    if (raw.mode === 'effectif' || raw.mode === 'label') {
      this.state.mode = raw.mode
    }

    if (Array.isArray(raw.hiddenColumns)) {
      this.state.hiddenColumns = raw.hiddenColumns.filter(
        (column): column is PieAssessmentColumn =>
          column === 'label' || column === 'effectif' || column === 'angle',
      )
    }

    if (typeof raw.infosStatus === 'boolean') {
      this.state.infosStatus = raw.infosStatus
    }
    if (typeof raw.colorOn === 'boolean') {
      this.state.colorOn = raw.colorOn
    }
    if (typeof raw.correctionOn === 'boolean') {
      this.state.correctionOn = raw.correctionOn
    }

    this.state.targetAngle = effectiveTargetAngle(
      this.state.shape,
      safeNumber(raw.targetAngle, this.state.targetAngle),
    )

    this.render()
  }

  protected onInteractivityChanged(_isOn: boolean): void {
    this.render()
  }

  getStudentAngles(): number[] {
    return this.state.items.map((item, index) =>
      this.itemAngleForDisplay(item, index),
    )
  }

  getStudentEffectifs(): number[] {
    return this.state.items.map((item) => Math.max(0, item.effectif ?? 0))
  }

  getStudentLabels(): string[] {
    return this.state.items.map((item) => item.label)
  }

  private syncStateFromAttributes(): void {
    const shapeAttr = this.getAttribute('shape')
    const modeAttr = this.getAttribute('mode')

    this.state.shape = shapeAttr === 'semi-pie' ? 'semi-pie' : 'pie'
    this.state.mode =
      modeAttr === 'auto' ||
      modeAttr === 'angle' ||
      modeAttr === 'effectif' ||
      modeAttr === 'label'
        ? modeAttr
        : 'angle'
    this.state.title = this.getAttribute('title') ?? ''
    this.state.infosStatus = parseBooleanAttribute(
      this.getAttribute('infos-status'),
      DEFAULT_STATE.infosStatus,
    )
    this.state.colorOn = parseBooleanAttribute(
      this.getAttribute('color-on'),
      DEFAULT_STATE.colorOn,
    )
    this.state.correctionOn = parseBooleanAttribute(
      this.getAttribute('correction-on'),
      DEFAULT_STATE.correctionOn,
    )
    this.state.hiddenColumns = parseHiddenColumns(
      this.getAttribute('hidden-columns'),
    )

    const items = normalizeItems(
      parseJsonAttribute<unknown[]>(this.getAttribute('items'), []),
    )
    this.state.items =
      items.length > 0 ? items : structuredClone(DEFAULT_STATE.items)

    const targetConfigured = safeNumber(
      this.getAttribute('target-angle'),
      this.state.shape === 'semi-pie' ? 180 : 360,
    )
    this.state.targetAngle = effectiveTargetAngle(
      this.state.shape,
      targetConfigured,
    )

    this.state.tolerance = clamp(
      safeNumber(this.getAttribute('tolerance'), 0),
      0,
      180,
    )
  }

  private renderTable(): string {
    const showLabel = this.isTableColumnVisible('label')
    const showEffectif = this.isTableColumnVisible('effectif')
    const showAngle = this.isTableColumnVisible('angle')

    const columns: string[] = []
    if (showLabel) columns.push('<th class="category-header">Catégorie</th>')
    if (showEffectif) columns.push('<th class="numeric-header">Effectifs</th>')
    if (showAngle) columns.push('<th class="numeric-header">Angles (°)</th>')

    const noColumnMessage =
      !showLabel && !showEffectif && !showAngle
        ? '<div>Aucune colonne à afficher.</div>'
        : ''

    if (noColumnMessage !== '') return noColumnMessage
    const tableClass = this.interactivityOn
      ? ''
      : ' class="static-conversion-table"'

    return `
      <table${tableClass}>
        <thead>
          <tr>
            ${columns.join('')}
          </tr>
        </thead>
        <tbody>
          ${this.state.items
            .map((item, index) => {
              const angleInputDisabled =
                this.interactivityOn && this.state.mode === 'angle'
                  ? ''
                  : 'disabled'
              const effectifInputDisabled =
                this.interactivityOn && this.state.mode === 'effectif'
                  ? ''
                  : 'disabled'
              const labelInputDisabled =
                this.interactivityOn && this.state.mode === 'label'
                  ? ''
                  : 'disabled'
              return `
                <tr>
                  ${
                    showLabel
                      ? this.renderTableCell(
                          item,
                          index,
                          'label',
                          labelInputDisabled,
                        )
                      : ''
                  }
                  ${
                    showEffectif
                      ? this.renderTableCell(
                          item,
                          index,
                          'effectif',
                          effectifInputDisabled,
                        )
                      : ''
                  }
                  ${
                    showAngle
                      ? this.renderTableCell(
                          item,
                          index,
                          'angle',
                          angleInputDisabled,
                        )
                      : ''
                  }
                </tr>
              `
            })
            .join('')}
        </tbody>
      </table>
    `
  }

  private renderTableCell(
    item: PieAssessmentItem,
    index: number,
    column: PieAssessmentColumn,
    inputDisabled: string,
  ): string {
    const displayedAngle = this.itemAngleForDisplay(item, index)

    if (!this.interactivityOn && !this.state.correctionOn) {
      if (this.state.mode === column) {
        return this.renderStaticEmptyTableCell()
      }

      if (column === 'label') {
        return `<td class="category-cell">${this.escapeText(item.label)}</td>`
      }
      if (column === 'effectif') {
        if (item.effectif == null) return this.renderStaticEmptyTableCell()
        return `<td class="numeric-cell">${this.escapeText(this.formatHtmlNumber(item.effectif))}</td>`
      }
      if (this.state.mode === 'effectif' && item.angle == null) {
        return this.renderStaticEmptyTableCell()
      }
      return `<td class="numeric-cell">${this.escapeText(this.formatHtmlNumber(displayedAngle))}</td>`
    }

    if (column === 'label') {
      return `<td class="category-cell${this.correctionValueClass(column)}"><input type="text" data-kind="label" data-index="${index}" value="${this.escapeText(item.label)}" ${inputDisabled} /></td>`
    }
    if (column === 'effectif') {
      return `<td class="numeric-cell${this.correctionValueClass(column)}"><input type="number" step="1" data-kind="effectif" data-index="${index}" value="${item.effectif ?? ''}" ${inputDisabled} /></td>`
    }
    return `<td class="numeric-cell${this.correctionValueClass(column)}"><input type="number" step="1" inputmode="numeric" data-kind="angle" data-index="${index}" value="${Number.isFinite(displayedAngle) ? displayedAngle : 0}" ${inputDisabled} /></td>`
  }

  private correctionValueClass(column: PieAssessmentColumn): string {
    return this.state.correctionOn && this.state.mode === column
      ? ' correction-value-cell'
      : ''
  }

  private renderStaticEmptyTableCell(): string {
    return '<td class="static-empty-cell" aria-label="cellule à compléter"></td>'
  }

  private bindEvents(): void {
    if (this.shadowRoot == null) return

    this.shadowRoot
      .querySelectorAll<HTMLInputElement>('input[data-kind="angle"]')
      .forEach((input) => {
        input.addEventListener('input', () => {
          const sanitizedValue = sanitizeIntegerInput(input.value)
          if (sanitizedValue !== input.value) {
            input.value = sanitizedValue
          }

          const index = safeNumber(input.dataset.index, -1)
          if (!Number.isInteger(index) || index < 0) return
          if (this.state.mode !== 'angle') return
          if (this.state.items[index] == null) return
          this.state.items[index].angle = normalizeAngle(input.value)
          this.renderPreview()
        })

        input.addEventListener('change', () => {
          this.dispatchChangeEvents()
        })
      })

    this.shadowRoot
      .querySelectorAll<HTMLInputElement>('input[data-kind="effectif"]')
      .forEach((input) => {
        input.addEventListener('input', () => {
          const index = safeNumber(input.dataset.index, -1)
          if (!Number.isInteger(index) || index < 0) return
          if (this.state.mode !== 'effectif') return
          if (this.state.items[index] == null) return
          this.state.items[index].effectif = normalizeEffectif(input.value)
          this.renderPreview()
        })

        input.addEventListener('change', () => {
          this.dispatchChangeEvents()
        })
      })

    this.shadowRoot
      .querySelectorAll<HTMLInputElement>('input[data-kind="label"]')
      .forEach((input) => {
        input.addEventListener('input', () => {
          const index = safeNumber(input.dataset.index, -1)
          if (!Number.isInteger(index) || index < 0) return
          if (this.state.mode !== 'label') return
          if (this.state.items[index] == null) return
          this.state.items[index].label = input.value
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

    if (!this.interactivityOn && !this.state.correctionOn) {
      preview.innerHTML = `${this.renderEmptyPieSvg()}${this.renderLegend()}`
      return
    }

    const { svg, usedAngle } = this.renderPieSvg()
    const remaining = this.state.targetAngle - usedAngle
    const statusText =
      remaining > 0
        ? `Somme des angles: ${usedAngle.toFixed(0)}° / ${this.state.targetAngle}° (incomplet)`
        : `Somme des angles: ${usedAngle.toFixed(0)}° / ${this.state.targetAngle}°`

    const statusClass = remaining > 0 ? 'status warning' : 'status'
    preview.innerHTML = this.state.infosStatus
      ? `${svg}<div class="${statusClass}">${statusText}</div>${this.renderLegend()}`
      : `${svg}${this.renderLegend()}`
  }

  private renderPieSvg(): { svg: string; usedAngle: number } {
    const width = 320
    const height = 220
    const margin = 12
    const isSemi = this.state.shape === 'semi-pie'
    const cx = width / 2
    const cy = isSemi ? height - 20 : height / 2
    const radius = isSemi
      ? Math.min(width / 2 - margin, height - 34)
      : Math.min(width, height) / 2 - margin

    const target = this.state.targetAngle
    const maxAngle = target
    let usedAngle = 0
    let startDeg = isSemi ? 180 : -90

    const slices: string[] = []
    const defs = this.shouldRenderLegendColors()
      ? ''
      : `<defs>${this.state.items
          .map((_item, index) => this.renderSvgHatchPattern(index))
          .join('')}</defs>`

    this.state.items.forEach((item, index) => {
      const requested = Math.max(0, this.itemAngleForDisplay(item, index))
      if (requested <= 0) return

      const remaining = Math.max(0, maxAngle - usedAngle)
      if (remaining <= 0) return

      const drawn = Math.min(requested, remaining)
      const endDeg = startDeg + drawn
      const path = this.arcPath(cx, cy, radius, startDeg, endDeg)
      const tooltip = `${item.label} : ${requested.toFixed(1)}°`
      const fill = this.shouldRenderLegendColors()
        ? this.colorForIndex(index)
        : `url(#${this.svgHatchPatternId(index)})`
      slices.push(
        `<path d="${path}" fill="${fill}" stroke="#334155" stroke-width="0.5"><title>${this.escapeText(tooltip)}</title></path>`,
      )
      usedAngle += drawn
      startDeg = endDeg
    })

    const frame = isSemi
      ? `<path d="${this.arcPath(cx, cy, radius, 180, 360)}" fill="none" stroke="#94a3b8" stroke-width="1"/>`
      : `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#94a3b8" stroke-width="1"/>`

    const svg = `<svg viewBox="0 0 ${width} ${height}">${defs}${frame}${slices.join('')}</svg>`

    return { svg, usedAngle }
  }

  private renderEmptyPieSvg(): string {
    const width = 320
    const height = 220
    const margin = 12
    const isSemi = this.state.shape === 'semi-pie'
    const cx = width / 2
    const cy = isSemi ? height - 20 : height / 2
    const radius = isSemi
      ? Math.min(width / 2 - margin, height - 34)
      : Math.min(width, height) / 2 - margin
    const frame = isSemi
      ? `<path d="${this.arcPath(cx, cy, radius, 180, 360)}" fill="none" stroke="#94a3b8" stroke-width="1"/>`
      : `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#94a3b8" stroke-width="1"/>`

    return `<svg viewBox="0 0 ${width} ${height}">${frame}${this.renderSvgCenterCross(cx, cy)}</svg>`
  }

  private renderSvgCenterCross(cx: number, cy: number): string {
    const size = 5
    return `<line x1="${cx - size}" y1="${cy}" x2="${cx + size}" y2="${cy}" stroke="#0f172a" stroke-width="1.4"/><line x1="${cx}" y1="${cy - size}" x2="${cx}" y2="${cy + size}" stroke="#0f172a" stroke-width="1.4"/>`
  }

  private renderSvgHatchPattern(index: number): string {
    const id = this.svgHatchPatternId(index)
    const rotation = [45, -45, 0, 90][index % 4]
    return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(${rotation})"><rect width="8" height="8" fill="#fff"/><path d="M 0 0 L 0 8" stroke="#334155" stroke-width="1.2"/></pattern>`
  }

  private svgHatchPatternId(index: number): string {
    return `mathalea-pie-hatch-${index}`
  }

  private renderLatexTable(): string {
    const columns: PieAssessmentColumn[] = []
    if (this.isTableColumnVisible('label')) columns.push('label')
    if (this.isTableColumnVisible('effectif')) columns.push('effectif')
    if (this.isTableColumnVisible('angle')) columns.push('angle')

    if (columns.length === 0) return '\\emph{Aucune colonne à afficher.}'

    const headers: Record<PieAssessmentColumn, string> = {
      label: 'Catégorie',
      effectif: 'Effectifs',
      angle: 'Angles ($^\\circ$)',
    }
    const columnSpec = `|${columns.map(() => 'c').join('|')}|`
    const headerRow = columns.map((column) => headers[column]).join(' & ')
    const rows = this.state.items
      .map((item, index) =>
        columns
          .map((column) => this.renderLatexTableCell(item, index, column))
          .join(' & '),
      )
      .map((row) => `${row} \\\\ \\hline`)
      .join('\n')

    return `\\begin{tabular}{${columnSpec}}
\\hline
${headerRow} \\\\ \\hline
${rows}
\\end{tabular}`
  }

  private renderLatexTableCell(
    item: PieAssessmentItem,
    index: number,
    column: PieAssessmentColumn,
  ): string {
    if (!this.state.correctionOn && this.state.mode === column) {
      return column === 'label'
        ? '\\makebox[3cm]{\\dotfill}'
        : '\\makebox[1.8cm]{\\dotfill}'
    }

    if (column === 'label') {
      return this.formatLatexCorrectionValue(
        this.escapeLatex(item.label),
        column,
      )
    }
    if (column === 'effectif') {
      const value =
        item.effectif == null
          ? '\\makebox[1.8cm]{\\dotfill}'
          : this.formatLatexNumber(item.effectif)
      return this.formatLatexCorrectionValue(value, column)
    }
    if (
      !this.interactivityOn &&
      this.state.mode === 'effectif' &&
      item.angle == null
    ) {
      return '\\makebox[1.8cm]{\\dotfill}'
    }
    return this.formatLatexCorrectionValue(
      this.formatLatexNumber(this.itemAngleForDisplay(item, index)),
      column,
    )
  }

  private formatLatexCorrectionValue(
    value: string,
    column: PieAssessmentColumn,
  ): string {
    if (!this.state.correctionOn || this.state.mode !== column) return value
    return `\\textcolor[HTML]{${orangeMathalea.slice(1)}}{\\textbf{${value}}}`
  }

  private renderEmptyPieTikz(): string {
    const radius = 2
    const colorDefinitions = this.renderLatexColorDefinitions()
    const frame =
      this.state.shape === 'semi-pie'
        ? `\\draw[thick] (-${radius},0) arc[start angle=0,end angle=180,radius=${radius}] -- cycle;`
        : `\\draw[thick] (0,0) circle (${radius});`

    return `${colorDefinitions}
\\begin{tikzpicture}
${frame}
${this.renderTikzCenterCross()}
\\end{tikzpicture}`
  }

  private renderTikzCenterCross(): string {
    const size = 0.08
    return `\\draw[thick] (-${size},0) -- (${size},0);
\\draw[thick] (0,-${size}) -- (0,${size});`
  }

  private renderFilledPieTikz(): string {
    const radius = 2
    const isSemi = this.state.shape === 'semi-pie'
    const target = this.state.targetAngle
    let usedAngle = 0
    let startDeg = isSemi ? 0 : -90
    const colorDefinitions = this.renderLatexColorDefinitions()
    const slices: string[] = []

    this.state.items.forEach((item, index) => {
      const requested = Math.max(0, this.itemAngleForDisplay(item, index))
      if (requested <= 0) return

      const remaining = Math.max(0, target - usedAngle)
      if (remaining <= 0) return

      const drawn = Math.min(requested, remaining)
      const endDeg = startDeg + drawn
      const style = this.renderLatexSectorStyle(index)
      slices.push(
        `\\filldraw[${style}] (0,0) -- (${this.formatTikzNumber(startDeg)}:${radius}) arc[start angle=${this.formatTikzNumber(startDeg)}, end angle=${this.formatTikzNumber(endDeg)}, radius=${radius}] -- cycle;`,
      )
      usedAngle += drawn
      startDeg = endDeg
    })

    const frame = isSemi
      ? `\\draw[thick] (${radius},0) arc[start angle=0,end angle=180,radius=${radius}] -- cycle;`
      : `\\draw[thick] (0,0) circle (${radius});`

    return `${colorDefinitions}
\\begin{tikzpicture}
${slices.join('\n')}
${frame}
\\end{tikzpicture}`
  }

  private renderLatexLegend(): string {
    if (this.state.items.length === 0) return ''

    const rows = this.state.items
      .map((item, index) => {
        const label = item.label.trim() === '' ? `S${index + 1}` : item.label
        return `${this.renderLatexLegendSwatch(index)} & ${this.escapeLatex(label)} \\\\`
      })
      .join('\n')

    return `\\begin{tabular}{@{}cl@{}}
${rows}
\\end{tabular}`
  }

  private renderLatexColorDefinitions(): string {
    return this.state.items
      .map(
        (_item, index) =>
          `\\definecolor{${this.tikzColorName(index)}}{HTML}{${this.colorForIndex(index).slice(1)}}`,
      )
      .join('\n')
  }

  private renderLatexLegendSwatch(index: number): string {
    if (!this.state.colorOn && this.state.correctionOn) {
      return `\\tikz\\filldraw[${this.renderLatexSectorStyle(index)}] (0,0) rectangle (0.25,0.25);`
    }
    if (!this.shouldRenderLegendColors()) {
      return '\\tikz\\draw[draw=black] (0,0) rectangle (0.25,0.25);'
    }
    return `\\tikz\\fill[fill=${this.tikzColorName(index)}] (0,0) rectangle (0.25,0.25);`
  }

  private renderLatexSectorStyle(index: number): string {
    if (this.state.colorOn) {
      return `fill=${this.tikzColorName(index)}, draw=white`
    }
    const patterns = [
      'north east lines',
      'north west lines',
      'horizontal lines',
      'vertical lines',
      'grid',
      'crosshatch',
    ]
    return `pattern=${patterns[index % patterns.length]}, pattern color=black, draw=black`
  }

  private renderTypstTable(): string {
    const columns: PieAssessmentColumn[] = []
    if (this.isTableColumnVisible('label')) columns.push('label')
    if (this.isTableColumnVisible('effectif')) columns.push('effectif')
    if (this.isTableColumnVisible('angle')) columns.push('angle')

    if (columns.length === 0) return '#emph[Aucune colonne à afficher.]'

    const headers: Record<PieAssessmentColumn, string> = {
      label: 'Catégorie',
      effectif: 'Effectifs',
      angle: 'Angles (°)',
    }
    const cells = [
      ...columns.map((column) => `[${this.escapeTypst(headers[column])}]`),
      ...this.state.items.flatMap((item, index) =>
        columns.map(
          (column) => `[${this.renderTypstTableCell(item, index, column)}]`,
        ),
      ),
    ]

    return `#table(
  columns: ${columns.length},
  stroke: 0.6pt + luma(70%),
  inset: 4pt,
  ${cells.join(',\n  ')},
)`
  }

  private renderTypstTableCell(
    item: PieAssessmentItem,
    index: number,
    column: PieAssessmentColumn,
  ): string {
    if (!this.state.correctionOn && this.state.mode === column) {
      return '#text(fill: luma(55%))[........]'
    }

    if (column === 'label') {
      return this.formatTypstCorrectionValue(
        this.escapeTypst(item.label),
        column,
      )
    }
    if (column === 'effectif') {
      const value =
        item.effectif == null
          ? '#text(fill: luma(55%))[........]'
          : this.formatTypstNumber(item.effectif)
      return this.formatTypstCorrectionValue(value, column)
    }
    if (
      !this.interactivityOn &&
      this.state.mode === 'effectif' &&
      item.angle == null
    ) {
      return '#text(fill: luma(55%))[........]'
    }
    return this.formatTypstCorrectionValue(
      this.formatTypstNumber(this.itemAngleForDisplay(item, index)),
      column,
    )
  }

  private formatTypstCorrectionValue(
    value: string,
    column: PieAssessmentColumn,
  ): string {
    if (!this.state.correctionOn || this.state.mode !== column) return value
    return `#text(fill: rgb("${orangeMathalea}"), weight: "bold")[${value}]`
  }

  private renderEmptyPieTypst(): string {
    const size = 140
    const radius = 62
    const center = {
      x: size / 2,
      y: this.state.shape === 'semi-pie' ? 122 : size / 2,
    }
    const frame =
      this.state.shape === 'semi-pie'
        ? `  #place(top + left, dx: ${this.pt(center.x - radius)}, dy: ${this.pt(center.y)}, line(start: (0pt, 0pt), end: (${this.pt(radius * 2)}, 0pt), stroke: 1pt + luma(35%)))
  ${this.renderTypstArc(center.x, center.y, radius, 180, 360, 'none', 'luma(35%)')}`
        : `  #place(top + left, dx: ${this.pt(center.x - radius)}, dy: ${this.pt(center.y - radius)}, circle(radius: ${this.pt(radius)}, stroke: 1pt + luma(35%), fill: none))`

    return `#block(width: ${this.pt(size)}, height: ${this.pt(size)})[
${frame}
${this.renderTypstCenterCross(center.x, center.y)}
]`
  }

  private renderTypstCenterCross(cx: number, cy: number): string {
    const size = 4
    return `  #place(top + left, line(start: (${this.pt(cx - size)}, ${this.pt(cy)}), end: (${this.pt(cx + size)}, ${this.pt(cy)}), stroke: 1pt + luma(10%)))
  #place(top + left, line(start: (${this.pt(cx)}, ${this.pt(cy - size)}), end: (${this.pt(cx)}, ${this.pt(cy + size)}), stroke: 1pt + luma(10%)))`
  }

  private renderFilledPieTypst(): string {
    const size = 140
    const radius = 62
    const isSemi = this.state.shape === 'semi-pie'
    const center = { x: size / 2, y: isSemi ? 122 : size / 2 }
    const target = this.state.targetAngle
    let usedAngle = 0
    let startDeg = isSemi ? 180 : -90
    const slices: string[] = []

    this.state.items.forEach((item, index) => {
      const requested = Math.max(0, this.itemAngleForDisplay(item, index))
      if (requested <= 0) return

      const remaining = Math.max(0, target - usedAngle)
      if (remaining <= 0) return

      const drawn = Math.min(requested, remaining)
      const endDeg = startDeg + drawn
      slices.push(
        this.renderTypstSector(
          center.x,
          center.y,
          radius,
          startDeg,
          endDeg,
          index,
        ),
      )
      usedAngle += drawn
      startDeg = endDeg
    })

    const frame = isSemi
      ? `  #place(top + left, dx: ${this.pt(center.x - radius)}, dy: ${this.pt(center.y)}, line(start: (0pt, 0pt), end: (${this.pt(radius * 2)}, 0pt), stroke: 1pt + luma(35%)))
  ${this.renderTypstArc(center.x, center.y, radius, 180, 360, 'none', 'luma(35%)')}`
      : `  #place(top + left, dx: ${this.pt(center.x - radius)}, dy: ${this.pt(center.y - radius)}, circle(radius: ${this.pt(radius)}, stroke: 1pt + luma(35%), fill: none))`

    return `#block(width: ${this.pt(size)}, height: ${this.pt(size)})[
${slices.join('\n')}
${frame}
]`
  }

  private renderTypstSector(
    cx: number,
    cy: number,
    radius: number,
    startDeg: number,
    endDeg: number,
    index: number,
  ): string {
    const points = [
      `(${this.pt(cx)}, ${this.pt(cy)})`,
      ...this.arcPoints(cx, cy, radius, startDeg, endDeg).map(
        (point) => `(${this.pt(point.x)}, ${this.pt(point.y)})`,
      ),
    ]
    const fill = this.state.colorOn
      ? `rgb("${this.colorForIndex(index)}")`
      : `luma(${90 - (index % 5) * 10}%)`
    return `  #place(top + left, polygon(${points.join(', ')}, fill: ${fill}, stroke: 0.5pt + ${this.state.colorOn ? 'white' : 'black'}))`
  }

  private renderTypstArc(
    cx: number,
    cy: number,
    radius: number,
    startDeg: number,
    endDeg: number,
    fill: string,
    stroke: string,
  ): string {
    const points = this.arcPoints(cx, cy, radius, startDeg, endDeg).map(
      (point) => `(${this.pt(point.x)}, ${this.pt(point.y)})`,
    )
    return `#place(top + left, polygon(${points.join(', ')}, fill: ${fill}, stroke: 1pt + ${stroke}))`
  }

  private arcPoints(
    cx: number,
    cy: number,
    radius: number,
    startDeg: number,
    endDeg: number,
  ): Array<{ x: number; y: number }> {
    const steps = Math.max(6, Math.ceil(Math.abs(endDeg - startDeg) / 8))
    return Array.from({ length: steps + 1 }, (_, index) => {
      const deg = startDeg + ((endDeg - startDeg) * index) / steps
      const rad = (deg * Math.PI) / 180
      return {
        x: cx + radius * Math.cos(rad),
        y: cy + radius * Math.sin(rad),
      }
    })
  }

  private renderTypstLegend(): string {
    if (this.state.items.length === 0) return ''

    const rows = this.state.items
      .map((item, index) => {
        const label = item.label.trim() === '' ? `S${index + 1}` : item.label
        return `  ${this.renderTypstLegendSwatch(index)}, [${this.escapeTypst(label)}]`
      })
      .join(',\n')

    return `#grid(
  columns: (auto, auto),
  gutter: 4pt,
${rows},
)`
  }

  private renderTypstDiagramWithLegend(diagram: string): string {
    return `#grid(
  columns: (auto, auto),
  gutter: 6pt,
  align: horizon,
  [${diagram}],
  [${this.renderTypstLegend()}],
)`
  }

  private renderTypstLegendSwatch(index: number): string {
    if (!this.state.colorOn && this.state.correctionOn) {
      return `rect(width: 7pt, height: 7pt, fill: luma(${90 - (index % 5) * 10}%), stroke: 0.7pt + black)`
    }
    return this.shouldRenderLegendColors()
      ? `rect(width: 7pt, height: 7pt, fill: rgb("${this.colorForIndex(index)}"), stroke: none)`
      : 'rect(width: 7pt, height: 7pt, fill: none, stroke: 0.7pt + luma(20%))'
  }

  private arcPath(
    cx: number,
    cy: number,
    r: number,
    startDeg: number,
    endDeg: number,
  ): string {
    const startRad = (startDeg * Math.PI) / 180
    const endRad = (endDeg * Math.PI) / 180
    const startX = cx + r * Math.cos(startRad)
    const startY = cy + r * Math.sin(startRad)
    const endX = cx + r * Math.cos(endRad)
    const endY = cy + r * Math.sin(endRad)
    const delta = Math.abs(endDeg - startDeg)
    const largeArc = delta > 180 ? 1 : 0
    return `M ${cx} ${cy} L ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY} Z`
  }

  private renderLegend(): string {
    return `<div class="legend">${this.state.items
      .map((item, index) => {
        const tooltip = `${item.label}: ${this.itemAngleForDisplay(item, index).toFixed(1)}°`
        const colorStyle = this.renderHtmlLegendSwatchStyle(index)
        return `<div class="legend-item" title="${this.escapeText(tooltip)}"><span class="legend-color" style="${colorStyle}"></span><span>${this.escapeText(item.label)}</span></div>`
      })
      .join('')}</div>`
  }

  private renderHtmlLegendSwatchStyle(index: number): string {
    if (!this.state.colorOn && this.state.correctionOn) {
      const rotation = [45, -45, 0, 90][index % 4]
      return `background:repeating-linear-gradient(${rotation}deg,#fff 0,#fff 3px,#334155 3px,#334155 4px);border:1px solid #334155;`
    }
    return this.shouldRenderLegendColors()
      ? `background:${this.colorForIndex(index)};`
      : 'background:#ffffff;border:1px solid #334155;'
  }

  private itemAngleForDisplay(item: PieAssessmentItem, _index: number): number {
    if (this.state.mode === 'angle') {
      return Math.max(0, item.angle ?? 0)
    }

    const total = this.totalEffectif()
    if (total <= 0) return 0
    const ratio = (item.effectif ?? 0) / total
    const angle = ratio * this.state.targetAngle
    if (!Number.isFinite(angle)) return 0

    // Arrondi léger pour garder un affichage stable sans bruit décimal.
    return Math.round(angle * 10) / 10
  }

  private totalEffectif(): number {
    return this.state.items.reduce(
      (sum, item) => sum + Math.max(0, item.effectif ?? 0),
      0,
    )
  }

  private toSerializedState(): PieAssessmentSerializedState {
    const serialized = {
      version: 1 as const,
      kind: 'diagram-pie-assessment' as const,
      shape: this.state.shape,
      mode: this.state.mode,
      targetAngle: this.state.targetAngle,
      infosStatus: this.state.infosStatus,
      colorOn: this.state.colorOn,
      correctionOn: this.state.correctionOn,
      hiddenColumns: this.state.hiddenColumns,
      items: this.state.items.map((item, index) => ({
        label: item.label,
        effectif: item.effectif,
        angle:
          this.state.mode === 'angle'
            ? this.itemAngleForDisplay(item, index)
            : item.angle,
      })),
    }

    // Comparaison stable pour rester robuste aux variations d'ordre de clés.
    return JSON.parse(
      stringifyStable(serialized),
    ) as PieAssessmentSerializedState
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

  private colorForIndex(index: number): string {
    return PIE_COLORS[index % PIE_COLORS.length]
  }

  private tikzColorName(index: number): string {
    return `mathaleaPieColor${index}`
  }

  private shouldRenderLegendColors(): boolean {
    return this.interactivityOn || this.state.colorOn
  }

  private formatLatexNumber(value: number): string {
    return texNombre(value, Number.isInteger(value) ? 0 : 1)
  }

  private formatTikzNumber(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(1)
  }

  private formatTypstNumber(value: number): string {
    const rounded = Number.isInteger(value) ? String(value) : value.toFixed(1)
    return rounded.replace('.', ',')
  }

  private formatHtmlNumber(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(1)
  }

  private pt(value: number): string {
    return `${Number(value.toFixed(2))}pt`
  }

  private isColumnVisible(column: PieAssessmentColumn): boolean {
    if (this.state.hiddenColumns.includes(column)) return false
    if (this.state.mode === 'angle' && column === 'effectif') return false
    if (this.state.mode === 'effectif' && column === 'angle') return false
    return true
  }

  private isTableColumnVisible(column: PieAssessmentColumn): boolean {
    if (this.state.hiddenColumns.includes(column)) return false
    if (!this.interactivityOn) return true
    return this.isColumnVisible(column)
  }

  private escapeText(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
  }

  private escapeLatex(value: string): string {
    return value
      .replaceAll('\\', '\\textbackslash{}')
      .replaceAll('&', '\\&')
      .replaceAll('%', '\\%')
      .replaceAll('$', '\\$')
      .replaceAll('#', '\\#')
      .replaceAll('_', '\\_')
      .replaceAll('{', '\\{')
      .replaceAll('}', '\\}')
      .replaceAll('~', '\\textasciitilde{}')
      .replaceAll('^', '\\textasciicircum{}')
  }

  private escapeTypst(value: string): string {
    return value.replace(/[\\#$[\]*_`<>@~]/g, (character) => `\\${character}`)
  }
}

export function addDiagramPieAssessment(
  exercice: IExercice,
  questionIndex: number,
  options: PieAssessmentOptions,
): string {
  if (exercice.autoCorrection[questionIndex] == null) {
    exercice.autoCorrection[questionIndex] = {}
  }
  exercice.autoCorrection[questionIndex].formatInteractif =
    DiagramPieAssessmentElement.elementTag
  return DiagramPieAssessmentElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
  })
}

registerMathaleaCustomElement(DiagramPieAssessmentElement)
