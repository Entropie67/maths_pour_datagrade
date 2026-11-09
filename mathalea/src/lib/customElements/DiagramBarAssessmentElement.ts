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
export type BarAssessmentItem = {
  label: string
  effectif: number | null
  height: number | null
}

export type BarAssessmentMode = 'hauteur' | 'effectif' | 'label'
export type BarAssessmentLabelValueKind = 'hauteur' | 'effectif'
type BarAssessmentLegacyMode = 'height'
type BarAssessmentLegacyLabelValueKind = 'height'
type BarAssessmentStaticColumn = 'label' | 'effectif' | 'hauteur'

export type BarAssessmentState = {
  version: 1
  mode: BarAssessmentMode
  labelValueKind: BarAssessmentLabelValueKind
  title: string
  infosStatus: boolean
  colorOn: boolean
  correctionOn: boolean
  unitLabel: string
  unitValue: number
  tolerance: number
  yMax: number | null
  items: BarAssessmentItem[]
}

export type BarAssessmentSerializedState = {
  version: 1
  kind: 'diagram-bar-assessment'
  mode: BarAssessmentMode | BarAssessmentLegacyMode
  labelValueKind:
    BarAssessmentLabelValueKind | BarAssessmentLegacyLabelValueKind
  infosStatus: boolean
  colorOn?: boolean
  correctionOn?: boolean
  unitValue: number
  items: Array<{
    label: string
    effectif: number | null
    height: number | null
  }>
}

export type BarAssessmentVerificationResult = {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
}

export type BarAssessmentVerificationContext = {
  exercice: IExercice
  questionIndex: number
  element: DiagramBarAssessmentElement
  expectedRaw: unknown
  actualRaw: string
  mode: BarAssessmentMode
  expectedHeights: number[]
  actualHeights: number[]
  expectedEffectifs: number[]
  actualEffectifs: number[]
  expectedLabels: string[]
  actualLabels: string[]
}

export type BarAssessmentVerificationCallback = (
  context: BarAssessmentVerificationContext,
) => BarAssessmentVerificationResult

export type BarAssessmentCreateOptions = {
  id?: string
  numeroExercice: number
  questionIndex: number
  mode?: BarAssessmentMode | BarAssessmentLegacyMode
  labelValueKind?:
    BarAssessmentLabelValueKind | BarAssessmentLegacyLabelValueKind
  title?: string
  infosStatus?: boolean
  colorOn?: boolean
  correctionOn?: boolean
  unitLabel?: string
  unitValue: number
  tolerance?: number
  yMax?: number
  items: Array<{
    label: string
    effectif?: number | null
    height?: number | null
  }>
  interactivityOn?: boolean
  verifyCallbackName?: string
  verifyCallback?: BarAssessmentVerificationCallback
}

export type BarAssessmentOptions = Omit<
  BarAssessmentCreateOptions,
  'numeroExercice' | 'questionIndex'
>

const BAR_COLORS = [
  '#2563eb',
  '#16a34a',
  '#f59e0b',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#ea580c',
  '#0f766e',
]

const DEFAULT_STATE: BarAssessmentState = {
  version: 1,
  mode: 'hauteur',
  labelValueKind: 'effectif',
  title: '',
  infosStatus: false,
  colorOn: true,
  correctionOn: false,
  unitLabel: 'unité',
  unitValue: 1,
  tolerance: 0,
  yMax: null,
  items: [
    { label: 'A', effectif: 1, height: null },
    { label: 'B', effectif: 1, height: null },
  ],
}

function safeText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function safeNumber(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeHeight(value: unknown): number | null {
  if (value == null || value === '') return null
  const parsed = Number(String(value).replace(',', '.'))
  if (!Number.isFinite(parsed)) return null
  return parsed
}

function normalizeItems(value: unknown): BarAssessmentItem[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (item == null || typeof item !== 'object') return null
      const raw = item as {
        label?: unknown
        effectif?: unknown
        height?: unknown
      }
      const parsedEffectif = normalizeHeight(raw.effectif)
      return {
        label: safeText(raw.label),
        effectif: parsedEffectif == null ? null : Math.max(0, parsedEffectif),
        height: normalizeHeight(raw.height),
      }
    })
    .filter((item): item is BarAssessmentItem => item != null)
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
    items?: Array<{ height?: unknown }>
  }

  if (Array.isArray(objectValue.heights)) {
    return objectValue.heights
      .map((value) => safeNumber(value, NaN))
      .filter((n) => Number.isFinite(n))
  }

  if (Array.isArray(objectValue.items)) {
    return objectValue.items.map((item) => safeNumber(item.height, 0))
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
    effectifs?: unknown[]
    items?: Array<{ effectif?: unknown }>
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
    labels?: unknown[]
    items?: Array<{ label?: unknown }>
  }

  if (Array.isArray(objectValue.labels)) {
    return objectValue.labels.map((value) => safeText(value))
  }

  if (Array.isArray(objectValue.items)) {
    return objectValue.items.map((item) => safeText(item.label))
  }

  return null
}

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase()
}

function normalizeMode(value: unknown): BarAssessmentMode {
  if (value === 'effectif' || value === 'label' || value === 'hauteur') {
    return value
  }
  if (value === 'height') {
    return 'hauteur'
  }
  return 'hauteur'
}

function normalizeLabelValueKind(value: unknown): BarAssessmentLabelValueKind {
  if (value === 'effectif' || value === 'hauteur') {
    return value
  }
  if (value === 'height') {
    return 'hauteur'
  }
  return 'effectif'
}

export class DiagramBarAssessmentElement extends MathaleaCustomElement {
  static readonly elementTag = 'diagram-bar-assessment'

  private static readonly verificationCallbacks = new Map<
    string,
    BarAssessmentVerificationCallback
  >()

  private state: BarAssessmentState = structuredClone(DEFAULT_STATE)
  private studentLabels: string[] = []
  private studentEffectifs: Array<number | null> = []
  private studentHeights: Array<number | null> = []

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  private static createStaticElement({
    mode,
    labelValueKind,
    title,
    infosStatus,
    colorOn,
    correctionOn,
    unitLabel,
    unitValue,
    tolerance,
    yMax,
    items,
    interactivityOn,
  }: {
    mode: BarAssessmentMode | BarAssessmentLegacyMode
    labelValueKind:
      BarAssessmentLabelValueKind | BarAssessmentLegacyLabelValueKind
    title: string
    infosStatus: boolean
    colorOn: boolean
    correctionOn: boolean
    unitLabel: string
    unitValue: number
    tolerance: number
    yMax?: number
    items: BarAssessmentCreateOptions['items']
    interactivityOn: boolean
  }): DiagramBarAssessmentElement {
    const element = new DiagramBarAssessmentElement()
    element.setAttribute('interactivity-on', interactivityOn ? 'true' : 'false')
    element.state = {
      ...structuredClone(DEFAULT_STATE),
      mode: normalizeMode(mode),
      labelValueKind: normalizeLabelValueKind(labelValueKind),
      title,
      infosStatus,
      colorOn,
      correctionOn,
      unitLabel,
      unitValue: Math.max(1, unitValue),
      tolerance,
      yMax: yMax == null ? null : Math.max(0, yMax),
      items: normalizeItems(items),
    }
    return element
  }

  static get observedAttributes(): string[] {
    return [
      'title',
      'infos-status',
      'color-on',
      'correction-on',
      'mode',
      'label-value-kind',
      'unit-label',
      'unit-value',
      'tolerance',
      'y-max',
      'items',
      'interactivity-on',
    ]
  }

  static create({
    id,
    numeroExercice,
    questionIndex,
    mode = 'hauteur',
    labelValueKind = 'effectif',
    title = '',
    infosStatus = false,
    colorOn = true,
    correctionOn = false,
    unitLabel = 'unité',
    unitValue,
    tolerance = 0,
    yMax,
    items,
    interactivityOn = true,
    verifyCallbackName,
    verifyCallback,
  }: BarAssessmentCreateOptions): string {
    const callbackName =
      verifyCallbackName ??
      (verifyCallback == null
        ? undefined
        : `${DiagramBarAssessmentElement.elementTag}Ex${numeroExercice}Q${questionIndex}-verification`)

    if (verifyCallback != null && callbackName != null) {
      DiagramBarAssessmentElement.registerVerificationCallback(
        callbackName,
        verifyCallback,
      )
    }

    if (context.isTypst) {
      const element = DiagramBarAssessmentElement.createStaticElement({
        mode,
        labelValueKind,
        title,
        infosStatus,
        colorOn,
        correctionOn,
        unitLabel,
        unitValue,
        tolerance,
        yMax,
        items,
        interactivityOn,
      })
      return `<mathalea-typst>${element.renderTypst()}</mathalea-typst>`
    }

    if (!context.isHtml) {
      const element = DiagramBarAssessmentElement.createStaticElement({
        mode,
        labelValueKind,
        title,
        infosStatus,
        colorOn,
        correctionOn,
        unitLabel,
        unitValue,
        tolerance,
        yMax,
        items,
        interactivityOn,
      })
      return element.renderLatex()
    }

    return super.create({
      id:
        id ??
        `${DiagramBarAssessmentElement.elementTag}Ex${numeroExercice}Q${questionIndex}`,
      numeroExercice,
      questionIndex,
      mode,
      labelValueKind,
      title,
      infosStatus,
      colorOn,
      correctionOn,
      unitLabel,
      unitValue,
      tolerance,
      yMax,
      items,
      interactivityOn,
      verifyCallbackName: callbackName,
    })
  }

  static registerVerificationCallback(
    name: string,
    callback: BarAssessmentVerificationCallback,
  ): void {
    if (name.trim() === '') {
      throw new Error(
        'Le nom du callback de verification ne peut pas etre vide',
      )
    }
    DiagramBarAssessmentElement.verificationCallbacks.set(name, callback)
  }

  static unregisterVerificationCallback(name: string): void {
    DiagramBarAssessmentElement.verificationCallbacks.delete(name)
  }

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): BarAssessmentVerificationResult {
    const id = `${DiagramBarAssessmentElement.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`
    const element = document.getElementById(
      id,
    ) as DiagramBarAssessmentElement | null
    const spanResult = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${questionIndex}`,
    )
    const feedbackDiv = document.querySelector(
      `#feedbackEx${exercice.numeroExercice}Q${questionIndex}`,
    ) as HTMLElement | null

    if (element == null) {
      const feedback = 'Diagramme en barres interactif introuvable.'
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
    const mode = element.state.mode

    const fromAutoCorrectionHeights = parseHeights(expectedRaw)
    const expectedHeights =
      fromAutoCorrectionHeights ?? element.deriveExpectedHeightsFromUnit()
    const actualHeights = element.getStudentHeights()

    const fromAutoCorrectionEffectifs = parseEffectifs(expectedRaw)
    const expectedEffectifs =
      fromAutoCorrectionEffectifs ?? element.deriveExpectedEffectifsFromUnit()
    const actualEffectifs = element.getStudentEffectifs()

    const expectedLabels =
      parseLabels(expectedRaw) ?? element.getExpectedLabels()
    const actualLabels = element.getStudentLabels()

    exercice.answers ??= {}
    exercice.answers[element.id] = actualRaw
    element.interactivityOn = false

    const callbackName = element.getAttribute('verify-callback-name')
    if (callbackName != null) {
      const callback =
        DiagramBarAssessmentElement.verificationCallbacks.get(callbackName)
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
          mode,
          expectedHeights,
          actualHeights,
          expectedEffectifs,
          actualEffectifs,
          expectedLabels,
          actualLabels,
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

    const tolerance = element.state.tolerance
    let isOk = false
    let feedback = ''

    if (mode === 'label') {
      if (expectedLabels.length !== actualLabels.length) {
        feedback = 'Le nombre de catégories saisies ne correspond pas.'
      } else {
        const mismatches = expectedLabels
          .map((label, index) => ({
            expected: normalizeLabel(label),
            actual: normalizeLabel(actualLabels[index] ?? ''),
          }))
          .filter((entry) => entry.expected !== entry.actual)
        isOk = mismatches.length === 0
        if (!isOk) {
          feedback = `Catégorie incorrecte pour ${mismatches.length} barre${mismatches.length > 1 ? 's' : ''}.`
        }
      }
    } else if (mode === 'effectif') {
      if (expectedEffectifs.length !== actualEffectifs.length) {
        feedback = 'Le nombre de barres saisis ne correspond pas.'
      } else {
        const mismatches = expectedEffectifs
          .map((value, index) => ({
            expected: value,
            actual: actualEffectifs[index] ?? 0,
          }))
          .filter(
            (entry) => Math.abs(entry.expected - entry.actual) > tolerance,
          )
        isOk = mismatches.length === 0
        if (!isOk) {
          feedback = `Effectif incorrect pour ${mismatches.length} barre${mismatches.length > 1 ? 's' : ''}.`
        }
      }
    } else {
      if (expectedHeights.length !== actualHeights.length) {
        feedback = 'Le nombre de barres saisis ne correspond pas.'
      } else {
        const mismatches = expectedHeights
          .map((value, index) => ({
            expected: value,
            actual: actualHeights[index] ?? 0,
          }))
          .filter(
            (entry) => Math.abs(entry.expected - entry.actual) > tolerance,
          )
        isOk = mismatches.length === 0
        if (!isOk) {
          feedback = `Hauteur incorrecte pour ${mismatches.length} barre${mismatches.length > 1 ? 's' : ''}.`
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
    let mode: BarAssessmentMode = 'hauteur'
    if (rawAnswer.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(
          rawAnswer,
        ) as Partial<BarAssessmentSerializedState>
        mode = normalizeMode(parsed.mode)
      } catch {
        // no-op
      }
    }

    if (mode === 'label') {
      const labels = parseLabels(rawAnswer)
      if (labels == null) return rawAnswer
      return labels.map((value, index) => `B${index + 1}: ${value}`).join(' ; ')
    }

    if (mode === 'effectif') {
      const effectifs = parseEffectifs(rawAnswer)
      if (effectifs == null) return rawAnswer
      return effectifs
        .map((value, index) => `B${index + 1}: ${value}`)
        .join(' ; ')
    }

    const heights = parseHeights(rawAnswer)
    if (heights == null) return rawAnswer
    return heights.map((value, index) => `B${index + 1}: ${value}`).join(' ; ')
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
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          align-items: start;
          grid-template-areas: 
            "title title"
            "table preview";
        }
        .meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          font-size: 0.92rem;
          color: #334155;
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
        td.correction-value-cell input:disabled,
        .correction-value-cell .frozen-cell {
          color: ${orangeMathalea};
          font-weight: 700;
        }
        .frozen-cell {
          color: #000000;
          background: #e2e8f0;
          border: 1px solid #94a3b8;
          border-radius: 3px;
          padding: 2px 6px;
        }
        .numeric-cell,
        .numeric-header {
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
        .status.warning {
          color: #b45309;
        }
        svg {
          width: 100%;
          height: 340px;
          display: block;
          background: #fff;
        }
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: 1fr;
            grid-template-areas: 
              "title"
              "table"
              "preview";
          }
        }
      </style>
      <div class="grid">
        ${
          this.state.title.trim() === ''
            ? ''
            : `<div class="title">${this.escapeText(this.state.title.trim())}</div>`
        }
        ${this.renderTable(disableAttr)}
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
    const diagram =
      !this.interactivityOn && this.state.correctionOn
        ? this.renderFilledBarTikz()
        : this.renderEmptyBarTikz()
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
${diagram}
\\end{minipage}
\\end{center}`
  }

  protected renderTypst(): string {
    const title = this.state.title.trim()
    const titleTypst =
      title === '' ? '' : `#strong[${this.escapeTypst(title)}]\n#v(0.4em)\n`
    const diagram =
      !this.interactivityOn && this.state.correctionOn
        ? this.renderFilledBarTypst()
        : this.renderEmptyBarTypst()
    return `#align(center)[
${titleTypst}#grid(
  columns: (auto, auto),
  gutter: 14pt,
  align: top,
  [#align(center)[${this.renderTypstTable()}]],
  [#align(center)[${diagram}]],
)
]`
  }

  get value(): string {
    return JSON.stringify(this.toSerializedState())
  }

  set value(nextValue: string) {
    this.update(nextValue)
  }

  update(nextValue: string | BarAssessmentSerializedState): void {
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
    const raw = parsed as Partial<BarAssessmentSerializedState>
    const incomingMode = normalizeMode(raw.mode ?? this.state.mode)

    const incomingItems = Array.isArray(raw.items) ? raw.items : []
    this.state.items = this.state.items.map((item, index) => {
      const incoming = incomingItems[index]
      if (incoming == null) return item
      const nextLabel = safeText(incoming.label)
      if (incomingMode === 'label') {
        this.studentLabels[index] = nextLabel
      }
      if (incomingMode === 'effectif') {
        const parsedEffectif = normalizeHeight(incoming.effectif)
        this.studentEffectifs[index] =
          parsedEffectif == null ? null : Math.max(0, parsedEffectif)
      }
      if (incomingMode === 'hauteur') {
        this.studentHeights[index] = normalizeHeight(incoming.height)
      }
      return {
        // En mode label, on conserve le label attendu de l'item et on stocke la
        // réponse élève séparément dans studentLabels.
        label:
          incomingMode === 'label'
            ? item.label
            : nextLabel === ''
              ? item.label
              : nextLabel,
        // En mode effectif, on conserve l'effectif attendu et on stocke la
        // réponse élève séparément dans studentEffectifs.
        effectif:
          incomingMode === 'effectif'
            ? item.effectif
            : normalizeHeight(incoming.effectif),
        height: normalizeHeight(incoming.height),
      }
    })

    this.state.unitValue = safeNumber(raw.unitValue, this.state.unitValue)
    if (this.state.unitValue <= 0) this.state.unitValue = 1

    this.state.mode = incomingMode

    this.state.labelValueKind = normalizeLabelValueKind(raw.labelValueKind)

    if (typeof raw.infosStatus === 'boolean') {
      this.state.infosStatus = raw.infosStatus
    }
    if (typeof raw.colorOn === 'boolean') {
      this.state.colorOn = raw.colorOn
    }
    if (typeof raw.correctionOn === 'boolean') {
      this.state.correctionOn = raw.correctionOn
    }

    this.render()
  }

  protected onInteractivityChanged(_isOn: boolean): void {
    this.render()
  }

  getStudentHeights(): number[] {
    if (this.state.mode !== 'hauteur') {
      return this.state.items.map((item) => Math.max(0, item.height ?? 0))
    }
    return this.state.items.map((_, index) => {
      const value = this.studentHeights[index]
      return value == null ? 0 : Math.max(0, value)
    })
  }

  getStudentEffectifs(): number[] {
    if (this.state.mode !== 'effectif') {
      return this.state.items.map((item) => Math.max(0, item.effectif ?? 0))
    }
    return this.state.items.map((_, index) => {
      const value = this.studentEffectifs[index]
      return value == null ? 0 : Math.max(0, value)
    })
  }

  getStudentLabels(): string[] {
    if (this.state.mode !== 'label') {
      return this.state.items.map((item) => item.label)
    }
    return this.state.items.map((item, index) => {
      const value = this.studentLabels[index]
      return value == null ? '' : value
    })
  }

  getExpectedLabels(): string[] {
    return this.state.items.map((item) => item.label)
  }

  deriveExpectedHeightsFromUnit(): number[] {
    const heightsFromItems = this.state.items.map((item) => item.height)
    const hasProvidedHeights = heightsFromItems.some((value) => value != null)
    if (hasProvidedHeights) {
      return heightsFromItems.map((value) => Math.max(0, value ?? 0))
    }
    if (this.state.unitValue <= 0) return this.state.items.map(() => 0)
    return this.state.items.map((item) => {
      const effectif = item.effectif
      return effectif == null ? 0 : effectif / this.state.unitValue
    })
  }

  deriveExpectedEffectifsFromUnit(): number[] {
    const unitValue = Math.max(1, this.state.unitValue)
    const effectifsFromItems = this.state.items.map((item) => item.effectif)
    const hasProvidedEffectifs = effectifsFromItems.some(
      (value) => value != null,
    )
    if (hasProvidedEffectifs) {
      return effectifsFromItems.map((value) => Math.max(0, value ?? 0))
    }
    return this.state.items.map(
      (item) => Math.max(0, item.height ?? 0) * unitValue,
    )
  }

  private syncStateFromAttributes(): void {
    const modeAttr = this.getAttribute('mode')
    this.state.mode = normalizeMode(modeAttr)

    const labelValueKindAttr = this.getAttribute('label-value-kind')
    this.state.labelValueKind = normalizeLabelValueKind(labelValueKindAttr)

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
    this.state.unitLabel = this.getAttribute('unit-label') ?? 'unité'
    this.state.unitValue = safeNumber(this.getAttribute('unit-value'), 1)
    if (this.state.unitValue <= 0) this.state.unitValue = 1

    this.state.tolerance = clamp(
      safeNumber(this.getAttribute('tolerance'), 0),
      0,
      1000,
    )

    const configuredYMax = normalizeHeight(this.getAttribute('y-max'))
    this.state.yMax =
      configuredYMax == null ? null : Math.max(0, configuredYMax)

    const items = normalizeItems(
      parseJsonAttribute<unknown[]>(this.getAttribute('items'), []),
    )
    this.state.items =
      items.length > 0 ? items : structuredClone(DEFAULT_STATE.items)
    if (this.studentLabels.length !== this.state.items.length) {
      this.studentLabels = this.state.items.map(() => '')
    }
    if (this.studentEffectifs.length !== this.state.items.length) {
      this.studentEffectifs = this.state.items.map(() => null)
    }
    if (this.studentHeights.length !== this.state.items.length) {
      this.studentHeights = this.state.items.map(() => null)
    }
  }

  private renderTable(disableAttr: string): string {
    if (!this.interactivityOn) return this.renderStaticTable()

    const isLabelMode = this.state.mode === 'label'
    const isLabelInteractive = isLabelMode && this.interactivityOn
    const isHeightMode = this.state.mode === 'hauteur'
    const isEffectifMode = this.state.mode === 'effectif'
    const labelOptions = Array.from(
      new Set(
        this.state.items
          .map((item) => item.label.trim())
          .filter((label) => label !== ''),
      ),
    )
    const valueColumnHeader = isLabelMode
      ? this.state.labelValueKind === 'hauteur'
        ? "Hauteur (nombre d'unités)"
        : 'Effectif'
      : isHeightMode
        ? "Hauteur (nombre d'unités)"
        : 'Effectif'

    const tableClass = this.interactivityOn
      ? ''
      : ' class="static-conversion-table"'

    return `
    <div style="display: inline-grid;">
      <table${tableClass}>
        <thead>
          <tr>
            <th class="category-header">Catégories</th>
            <th class="numeric-header">${valueColumnHeader}</th>
          </tr>
        </thead>
        <tbody>
          ${this.state.items
            .map((item, index) => {
              const displayHeight = item.height ?? ''
              const displayEffectif = item.effectif ?? ''
              const displayStudentEffectif = this.studentEffectifs[index]
              const displayStudentHeight = this.studentHeights[index]
              const selectedLabel = this.studentLabels[index] ?? ''
              const labelCell = this.renderHtmlLabelCell({
                item,
                index,
                isLabelMode,
                isLabelInteractive,
                selectedLabel,
                labelOptions,
                disableAttr,
              })
              const valueCell = isLabelMode
                ? this.state.labelValueKind === 'hauteur'
                  ? displayHeight
                  : displayEffectif
                : undefined
              return `
                <tr>
                  ${labelCell}
                  <td class="numeric-cell${isHeightMode ? this.correctionValueClass('hauteur') : this.correctionValueClass('effectif')}">
                    ${
                      isLabelMode
                        ? this.renderHtmlStaticValueCellContent(valueCell ?? '')
                        : !this.interactivityOn && !this.state.correctionOn
                          ? this.renderHtmlStaticValueCellContent('')
                          : `<input
                      type="number"
                      step="${isHeightMode ? '0.1' : '1'}"
                      inputmode="decimal"
                      data-kind="${isHeightMode ? 'height' : 'effectif'}"
                      data-index="${index}"
                      value="${
                        isHeightMode
                          ? this.interactivityOn
                            ? displayStudentHeight == null
                              ? ''
                              : displayStudentHeight
                            : displayHeight
                          : isEffectifMode && this.interactivityOn
                            ? displayStudentEffectif == null
                              ? ''
                              : displayStudentEffectif
                            : displayEffectif
                      }"
                      ${disableAttr}
                    />`
                    }
                  </td>
                </tr>
              `
            })
            .join('')}
        </tbody>
      </table>
      </div>
    `
  }

  private renderStaticTable(): string {
    return `
    <div style="display: inline-grid;">
      <table class="static-conversion-table">
        <thead>
          <tr>
            <th>Catégories</th>
            <th class="numeric-header">Effectifs</th>
            <th class="numeric-header">Hauteurs</th>
          </tr>
        </thead>
        <tbody>
          ${this.state.items
            .map(
              (item, index) => `
                <tr>
                  ${this.renderStaticLabelCell(item, index)}
                  ${this.renderStaticNumberCell(item.effectif, 'effectif')}
                  ${this.renderStaticNumberCell(item.height, 'hauteur')}
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
    `
  }

  private renderStaticLabelCell(
    item: BarAssessmentItem,
    index: number,
  ): string {
    if (item.label.trim() === '') {
      return this.renderStaticEmptyTableCell()
    }
    const label =
      this.state.mode === 'label' && this.state.correctionOn
        ? item.label
        : item.label || `B${index + 1}`
    if (this.interactivityOn) {
      return `<td class="${this.correctionValueClass('label')}"><span class="frozen-cell">${this.escapeText(label)}</span></td>`
    }
    return `<td class="category-cell${this.correctionValueClass('label')}">${this.escapeText(label)}</td>`
  }

  private renderStaticNumberCell(
    value: number | null,
    column: BarAssessmentStaticColumn,
  ): string {
    if (value == null) return this.renderStaticEmptyTableCell()
    return `<td class="numeric-cell${this.correctionValueClass(column)}">${this.escapeText(this.formatHtmlNumber(value))}</td>`
  }

  private correctionValueClass(column: BarAssessmentStaticColumn): string {
    return this.state.correctionOn && this.state.mode === column
      ? ' correction-value-cell'
      : ''
  }

  private renderHtmlLabelCell({
    item,
    index,
    isLabelMode,
    isLabelInteractive,
    selectedLabel,
    labelOptions,
    disableAttr,
  }: {
    item: BarAssessmentItem
    index: number
    isLabelMode: boolean
    isLabelInteractive: boolean
    selectedLabel: string
    labelOptions: string[]
    disableAttr: string
  }): string {
    if (isLabelMode && !this.interactivityOn && !this.state.correctionOn) {
      return this.renderStaticEmptyTableCell()
    }
    if (isLabelMode && isLabelInteractive) {
      return `<td><select data-kind="label-select" data-index="${index}" ${disableAttr}><option value="" ${selectedLabel === '' ? 'selected' : ''}>Choisir...</option>${labelOptions
        .map(
          (label) =>
            `<option value="${this.escapeText(label)}" ${selectedLabel === label ? 'selected' : ''}>${this.escapeText(label)}</option>`,
        )
        .join('')}</select></td>`
    }
    const label = selectedLabel || item.label
    return `<td class="${this.correctionValueClass('label')}"><input type="text" value="${this.escapeText(label)}" disabled /></td>`
  }

  private renderHtmlStaticValueCellContent(value: number | string): string {
    if (
      !this.interactivityOn &&
      !this.state.correctionOn &&
      (value === '' || value == null)
    ) {
      return '<span class="static-empty-cell" aria-label="cellule à compléter"></span>'
    }
    return this.escapeText(String(value))
  }

  private renderStaticEmptyTableCell(): string {
    return '<td class="static-empty-cell" aria-label="cellule à compléter"></td>'
  }

  private bindEvents(): void {
    if (this.shadowRoot == null) return

    this.shadowRoot
      .querySelectorAll<HTMLInputElement>('input[data-kind]')
      .forEach((input) => {
        input.addEventListener('input', () => {
          const index = safeNumber(input.dataset.index, -1)
          const kind = safeText(input.dataset.kind)
          if (!Number.isInteger(index) || index < 0) return
          if (this.state.items[index] == null) return
          if (kind === 'height') {
            this.studentHeights[index] = normalizeHeight(input.value)
          } else if (kind === 'effectif') {
            const parsed = normalizeHeight(input.value)
            this.studentEffectifs[index] =
              parsed == null ? null : Math.max(0, parsed)
          } else if (kind === 'label') {
            this.studentLabels[index] = safeText(input.value)
          }
          this.renderPreview()
        })

        input.addEventListener('change', () => {
          this.dispatchChangeEvents()
        })
      })

    this.shadowRoot
      .querySelectorAll<HTMLSelectElement>('select[data-kind="label-select"]')
      .forEach((select) => {
        const onSelectChange = () => {
          const index = safeNumber(select.dataset.index, -1)
          if (!Number.isInteger(index) || index < 0) return
          this.studentLabels[index] = safeText(select.value)
          this.renderPreview()
          this.dispatchChangeEvents()
        }
        select.addEventListener('input', onSelectChange)
        select.addEventListener('change', onSelectChange)
      })
  }

  private renderPreview(): void {
    if (this.shadowRoot == null) return
    const preview = this.shadowRoot.querySelector(
      '#preview',
    ) as HTMLDivElement | null
    if (preview == null) return

    const unitValue = Math.max(1, this.state.unitValue)

    let heights: number[]
    if (!this.interactivityOn && !this.state.correctionOn) {
      heights = this.state.items.map(() => 0)
    } else if (this.state.mode === 'effectif') {
      heights = this.interactivityOn
        ? this.studentEffectifs.map((value) =>
            value == null ? 0 : Math.max(0, value) / unitValue,
          )
        : this.deriveExpectedHeightsFromUnit()
    } else if (this.state.mode === 'hauteur') {
      heights = this.interactivityOn
        ? this.studentHeights.map((value) => Math.max(0, value ?? 0))
        : this.deriveExpectedHeightsFromUnit()
    } else {
      heights = this.deriveExpectedHeightsFromUnit()
    }

    const maxExpectedEffectif = this.deriveExpectedEffectifsFromUnit().reduce(
      (acc, value) => Math.max(acc, Math.max(0, value)),
      0,
    )
    const maxStudentEffectif = heights.reduce(
      (acc, value) => Math.max(acc, Math.max(0, value) * unitValue),
      0,
    )
    const inferredYMax = this.roundUpToUnit(
      Math.max(maxExpectedEffectif, maxStudentEffectif),
      unitValue,
    )
    const configuredYMax =
      this.state.yMax == null
        ? inferredYMax
        : Math.max(this.state.yMax, unitValue)
    const yMax = Math.max(unitValue, configuredYMax)

    const minSlotWidth = 82
    const axisWidth = Math.max(360, this.state.items.length * minSlotWidth)
    const width = axisWidth + 92
    const height = 340
    const axisLeft = 58
    const axisBottom = 270
    const axisTop = 28
    const axisHeight = axisBottom - axisTop

    const slotWidth =
      this.state.items.length > 0
        ? axisWidth / this.state.items.length
        : axisWidth
    const barWidth =
      this.state.items.length > 0
        ? Math.max(20, Math.min(44, slotWidth * 0.62))
        : 0

    const defs = this.state.colorOn
      ? ''
      : `<defs>${this.state.items
          .map((_item, index) => this.renderSvgHatchPattern(index))
          .join('')}</defs>`
    const bars = this.state.items
      .map((item, index) => {
        const heightValue = heights[index] ?? 0
        const representedEffectif = Math.max(0, heightValue) * unitValue
        const h = Math.max(0, (representedEffectif / yMax) * axisHeight)
        const x = axisLeft + index * slotWidth + (slotWidth - barWidth) / 2
        const y = axisBottom - h
        const label = item.label.trim() === '' ? `B${index + 1}` : item.label
        const tooltip = `${label} : hauteur ${heightValue} unité${heightValue > 1 ? 's' : ''}`
        const fill = this.state.colorOn
          ? this.colorForIndex(index)
          : `url(#${this.svgHatchPatternId(index)})`
        return `<rect x="${x}" y="${y}" width="${barWidth}" height="${h}" fill="${fill}" stroke="${this.state.colorOn ? 'none' : '#334155'}" stroke-width="0.5"><title>${this.escapeText(tooltip)}</title></rect>`
      })
      .join('')

    const labels = this.state.items
      .map((item, index) => {
        const centerX = axisLeft + index * slotWidth + slotWidth / 2
        const studentLabel = safeText(this.studentLabels[index]).trim()
        const rawLabel =
          this.state.mode === 'label' && this.interactivityOn
            ? studentLabel === ''
              ? `B${index + 1}`
              : studentLabel
            : item.label.trim()
        const label = rawLabel === '' ? `B${index + 1}` : rawLabel
        const isTruncated = label.length > 12
        const truncated = isTruncated ? `${label.slice(0, 11)}...` : label
        const tooltip = isTruncated
          ? `<title>${this.escapeText(label)}</title>`
          : ''
        return `<text x="${centerX}" y="302" text-anchor="middle" font-size="15" font-weight="600" fill="#334155" ${isTruncated ? 'cursor="help"' : ''}>${tooltip}${this.escapeText(truncated)}</text>`
      })
      .join('')

    const ticks = this.renderTicks(
      axisLeft,
      axisBottom,
      axisTop,
      axisWidth,
      yMax,
      unitValue,
    )

    const svg = `<svg viewBox="0 0 ${width} ${height}">${defs}<line x1="${axisLeft}" y1="${axisBottom}" x2="${axisLeft + axisWidth}" y2="${axisBottom}" stroke="#475569"/><line x1="${axisLeft}" y1="${axisTop}" x2="${axisLeft}" y2="${axisBottom}" stroke="#475569"/>${ticks}${bars}${labels}</svg>`

    const totalHeight = heights.reduce(
      (sum, value) => sum + Math.max(0, value ?? 0),
      0,
    )
    const status =
      this.interactivityOn && this.state.infosStatus
        ? `<div class="status warning">Hauteur totale : ${this.escapeText(this.formatHtmlNumber(totalHeight))} unité${totalHeight > 1 ? 's' : ''}.</div>`
        : ''
    preview.innerHTML = `${svg}${status}`
  }

  private renderTicks(
    axisLeft: number,
    axisBottom: number,
    axisTop: number,
    axisWidth: number,
    yMax: number,
    unitValue: number,
  ): string {
    const safeYMax = Math.max(1, yMax)
    const safeUnitValue = Math.max(1, unitValue)
    let out = ''
    const values: number[] = [0]
    const fullSteps = Math.floor(safeYMax / safeUnitValue)
    for (let i = 1; i <= fullSteps; i++) {
      values.push(i * safeUnitValue)
    }
    if (values[values.length - 1] !== safeYMax) {
      values.push(safeYMax)
    }

    for (const value of values) {
      const ratio = value / safeYMax
      const y = axisBottom - ratio * (axisBottom - axisTop)
      out += `<line x1="${axisLeft}" y1="${y}" x2="${axisLeft + axisWidth}" y2="${y}" stroke="#e2e8f0"/><text x="${axisLeft - 8}" y="${y + 5}" text-anchor="end" font-size="12" font-weight="600" fill="#64748b">${value}</text>`
    }
    return out
  }

  private renderLatexTable(): string {
    if (!this.interactivityOn) return this.renderStaticLatexTable()

    const isLabelMode = this.state.mode === 'label'
    const isHeightMode = this.state.mode === 'hauteur'
    const valueColumnHeader = isLabelMode
      ? this.state.labelValueKind === 'hauteur'
        ? "Hauteur (nombre d'unités)"
        : 'Effectif'
      : isHeightMode
        ? "Hauteur (nombre d'unités)"
        : 'Effectif'

    const rows = this.state.items
      .map((item, index) => {
        const label = this.renderLatexLabelCell(item, index)
        const value = this.renderLatexValueCell(item, index)
        return `${label} & ${value} \\\\ \\hline`
      })
      .join('\n')

    return `\\begin{tabular}{|c|c|}
\\hline
Catégories & ${this.escapeLatex(valueColumnHeader)} \\\\ \\hline
${rows}
\\end{tabular}`
  }

  private renderStaticLatexTable(): string {
    const rows = this.state.items
      .map((item, index) => {
        const labelValue =
          item.label.trim() === ''
            ? '\\makebox[3cm]{\\dotfill}'
            : this.escapeLatex(item.label || `B${index + 1}`)
        const effectifValue =
          item.effectif == null
            ? '\\makebox[2cm]{\\dotfill}'
            : this.formatLatexNumber(item.effectif)
        const heightValue =
          item.height == null
            ? '\\makebox[2cm]{\\dotfill}'
            : this.formatLatexNumber(item.height)
        const label = this.formatLatexCorrectionValue(labelValue, 'label')
        const effectif = this.formatLatexCorrectionValue(
          effectifValue,
          'effectif',
        )
        const height = this.formatLatexCorrectionValue(heightValue, 'hauteur')
        return `${label} & ${effectif} & ${height} \\\\ \\hline`
      })
      .join('\n')

    return `\\begin{tabular}{|c|c|c|}
\\hline
Catégories & Effectifs & Hauteurs \\\\ \\hline
${rows}
\\end{tabular}`
  }

  private renderLatexLabelCell(item: BarAssessmentItem, index: number): string {
    if (
      this.state.mode === 'label' &&
      (this.interactivityOn || !this.state.correctionOn)
    ) {
      return '\\makebox[3cm]{\\dotfill}'
    }
    const label = item.label.trim() === '' ? `B${index + 1}` : item.label
    return this.formatLatexCorrectionValue(this.escapeLatex(label), 'label')
  }

  private renderLatexValueCell(item: BarAssessmentItem, index: number): string {
    if (
      (this.interactivityOn || !this.state.correctionOn) &&
      (this.state.mode === 'hauteur' || this.state.mode === 'effectif')
    ) {
      return '\\makebox[2cm]{\\dotfill}'
    }

    if (this.state.mode === 'label') {
      const value =
        this.state.labelValueKind === 'hauteur'
          ? item.height
          : (item.effectif ??
            this.deriveExpectedEffectifsFromUnit()[index] ??
            null)
      if (value == null) return '\\makebox[2cm]{\\dotfill}'
      return this.formatLatexNumber(value)
    }

    if (this.state.mode === 'hauteur') {
      const value = item.height ?? this.deriveExpectedHeightsFromUnit()[index]
      return value == null
        ? '\\makebox[2cm]{\\dotfill}'
        : this.formatLatexCorrectionValue(
            this.formatLatexNumber(value),
            'hauteur',
          )
    }

    const value = item.effectif ?? this.deriveExpectedEffectifsFromUnit()[index]
    return value == null
      ? '\\makebox[2cm]{\\dotfill}'
      : this.formatLatexCorrectionValue(
          this.formatLatexNumber(value),
          'effectif',
        )
  }

  private formatLatexCorrectionValue(
    value: string,
    column: BarAssessmentStaticColumn,
  ): string {
    if (!this.state.correctionOn || this.state.mode !== column) return value
    return `\\textcolor[HTML]{${orangeMathalea.slice(1)}}{\\textbf{${value}}}`
  }

  private renderEmptyBarTikz(): string {
    return this.renderBarTikz({ withBars: false })
  }

  private renderFilledBarTikz(): string {
    return this.renderBarTikz({ withBars: true })
  }

  private renderBarTikz({ withBars }: { withBars: boolean }): string {
    const unitValue = Math.max(1, this.state.unitValue)
    const yMax = this.resolveLatexYMax()
    const axisWidth = Math.max(5, this.state.items.length * 1.15)
    const axisHeight = 4.8
    const slotWidth =
      this.state.items.length > 0
        ? axisWidth / this.state.items.length
        : axisWidth
    const barWidth = Math.min(0.62, slotWidth * 0.58)
    const colorDefinitions = withBars
      ? this.state.items.map(
          (_item, index) =>
            `\\definecolor{${this.tikzColorName(index)}}{HTML}{${this.colorForIndex(index).slice(1)}}`,
        )
      : []
    const ticks = this.renderLatexTicks(axisWidth, axisHeight, yMax, unitValue)
    const labels = this.state.items
      .map((item, index) => {
        const x = index * slotWidth + slotWidth / 2
        const rawLabel =
          this.state.mode === 'label' && !withBars ? '' : item.label.trim()
        const label = rawLabel === '' ? `B${index + 1}` : rawLabel
        return `\\node[below, font=\\scriptsize] at (${this.formatTikzNumber(x)},0) {${this.escapeLatex(label)}};`
      })
      .join('\n')
    const heights = this.deriveExpectedHeightsFromUnit()
    const bars = withBars
      ? this.state.items
          .map((_item, index) => {
            const heightValue = Math.max(0, heights[index] ?? 0)
            const representedEffectif = heightValue * unitValue
            const h = Math.max(0, (representedEffectif / yMax) * axisHeight)
            const x = index * slotWidth + (slotWidth - barWidth) / 2
            return `\\filldraw[${this.renderLatexBarStyle(index)}] (${this.formatTikzNumber(x)},0) rectangle (${this.formatTikzNumber(x + barWidth)},${this.formatTikzNumber(h)});`
          })
          .join('\n')
      : ''

    return `${colorDefinitions.join('\n')}
\\begin{tikzpicture}[x=1cm,y=1cm]
${ticks}
\\draw[->, thick] (0,0) -- (${this.formatTikzNumber(axisWidth + 0.35)},0);
\\draw[->, thick] (0,0) -- (0,${this.formatTikzNumber(axisHeight + 0.35)});
${bars}
${labels}
\\end{tikzpicture}`
  }

  private renderLatexTicks(
    axisWidth: number,
    axisHeight: number,
    yMax: number,
    unitValue: number,
  ): string {
    const values: number[] = [0]
    const fullSteps = Math.floor(yMax / unitValue)
    for (let i = 1; i <= fullSteps; i++) {
      values.push(i * unitValue)
    }
    if (values[values.length - 1] !== yMax) values.push(yMax)

    return values
      .map((value) => {
        const y = (value / yMax) * axisHeight
        return `\\draw[gray!25] (0,${this.formatTikzNumber(y)}) -- (${this.formatTikzNumber(axisWidth)},${this.formatTikzNumber(y)});
\\node[left, font=\\scriptsize] at (0,${this.formatTikzNumber(y)}) {${this.formatLatexNumber(value)}};`
      })
      .join('\n')
  }

  private renderLatexLegend(): string {
    if (this.state.items.length === 0) return ''

    const rows = this.state.items
      .map((item, index) => {
        const label = item.label.trim() === '' ? `B${index + 1}` : item.label
        return `\\tikz\\fill[fill=${this.tikzColorName(index)}] (0,0) rectangle (0.25,0.25); & ${this.escapeLatex(label)} \\\\`
      })
      .join('\n')

    return `\\begin{tabular}{@{}cl@{}}
${rows}
\\end{tabular}`
  }

  private renderTypstTable(): string {
    if (!this.interactivityOn) return this.renderStaticTypstTable()

    const isLabelMode = this.state.mode === 'label'
    const isHeightMode = this.state.mode === 'hauteur'
    const valueColumnHeader = isLabelMode
      ? this.state.labelValueKind === 'hauteur'
        ? "Hauteur (nombre d'unités)"
        : 'Effectif'
      : isHeightMode
        ? "Hauteur (nombre d'unités)"
        : 'Effectif'
    const cells = [
      `[Catégories]`,
      `[${this.escapeTypst(valueColumnHeader)}]`,
      ...this.state.items.flatMap((item, index) => [
        `[${this.renderTypstLabelCell(item, index)}]`,
        `[${this.renderTypstValueCell(item, index)}]`,
      ]),
    ]

    return `#table(
  columns: 2,
  stroke: 0.6pt + luma(70%),
  inset: 4pt,
  ${cells.join(',\n  ')},
)`
  }

  private renderStaticTypstTable(): string {
    const cells = [
      '[Catégories]',
      '[Effectifs]',
      '[Hauteurs]',
      ...this.state.items.flatMap((item, index) => [
        `[${this.formatTypstCorrectionValue(item.label.trim() === '' ? '#text(fill: luma(55%))[........]' : this.escapeTypst(item.label || `B${index + 1}`), 'label')}]`,
        `[${this.formatTypstCorrectionValue(item.effectif == null ? '#text(fill: luma(55%))[........]' : this.formatTypstNumber(item.effectif), 'effectif')}]`,
        `[${this.formatTypstCorrectionValue(item.height == null ? '#text(fill: luma(55%))[........]' : this.formatTypstNumber(item.height), 'hauteur')}]`,
      ]),
    ]

    return `#table(
  columns: 3,
  stroke: 0.6pt + luma(70%),
  inset: 4pt,
  ${cells.join(',\n  ')},
)`
  }

  private renderTypstLabelCell(item: BarAssessmentItem, index: number): string {
    if (
      this.state.mode === 'label' &&
      (this.interactivityOn || !this.state.correctionOn)
    ) {
      return '#text(fill: luma(55%))[........]'
    }
    const label = item.label.trim() === '' ? `B${index + 1}` : item.label
    return this.formatTypstCorrectionValue(this.escapeTypst(label), 'label')
  }

  private renderTypstValueCell(item: BarAssessmentItem, index: number): string {
    if (
      (this.interactivityOn || !this.state.correctionOn) &&
      (this.state.mode === 'hauteur' || this.state.mode === 'effectif')
    ) {
      return '#text(fill: luma(55%))[........]'
    }

    if (this.state.mode === 'label') {
      const value =
        this.state.labelValueKind === 'hauteur'
          ? item.height
          : (item.effectif ??
            this.deriveExpectedEffectifsFromUnit()[index] ??
            null)
      if (value == null) return '#text(fill: luma(55%))[........]'
      return this.formatTypstNumber(value)
    }

    if (this.state.mode === 'hauteur') {
      const value = item.height ?? this.deriveExpectedHeightsFromUnit()[index]
      return value == null
        ? '#text(fill: luma(55%))[........]'
        : this.formatTypstCorrectionValue(
            this.formatTypstNumber(value),
            'hauteur',
          )
    }

    const value = item.effectif ?? this.deriveExpectedEffectifsFromUnit()[index]
    return value == null
      ? '#text(fill: luma(55%))[........]'
      : this.formatTypstCorrectionValue(
          this.formatTypstNumber(value),
          'effectif',
        )
  }

  private formatTypstCorrectionValue(
    value: string,
    column: BarAssessmentStaticColumn,
  ): string {
    if (!this.state.correctionOn || this.state.mode !== column) return value
    return `#text(fill: rgb("${orangeMathalea}"), weight: "bold")[${value}]`
  }

  private renderEmptyBarTypst(): string {
    return this.renderBarTypst({ withBars: false })
  }

  private renderFilledBarTypst(): string {
    return this.renderBarTypst({ withBars: true })
  }

  private renderBarTypst({ withBars }: { withBars: boolean }): string {
    const unitValue = Math.max(1, this.state.unitValue)
    const yMax = this.resolveLatexYMax()
    const axisLeft = 34
    const axisTop = 10
    const axisBottom = 128
    const axisHeight = axisBottom - axisTop
    const axisWidth = Math.max(150, this.state.items.length * 32)
    const totalWidth = axisLeft + axisWidth + 14
    const totalHeight = 170
    const slotWidth =
      this.state.items.length > 0
        ? axisWidth / this.state.items.length
        : axisWidth
    const barWidth = Math.min(18, slotWidth * 0.58)
    const ticks = this.renderTypstTicks(
      axisLeft,
      axisBottom,
      axisWidth,
      axisHeight,
      yMax,
      unitValue,
    )
    const labels = this.state.items
      .map((item, index) => {
        const x = axisLeft + index * slotWidth + slotWidth / 2
        const rawLabel =
          this.state.mode === 'label' && !withBars ? '' : item.label.trim()
        const label = rawLabel === '' ? `B${index + 1}` : rawLabel
        return `  #place(top + left, dx: ${this.pt(x - 12)}, dy: ${this.pt(axisBottom + 8)}, rotate(20deg, origin: top + center, box(width: 24pt)[#align(center)[${this.escapeTypst(label)}]]))`
      })
      .join('\n')
    const heights = this.deriveExpectedHeightsFromUnit()
    const bars = withBars
      ? this.state.items
          .map((_item, index) => {
            const heightValue = Math.max(0, heights[index] ?? 0)
            const representedEffectif = heightValue * unitValue
            const h = Math.max(0, (representedEffectif / yMax) * axisHeight)
            const x = axisLeft + index * slotWidth + (slotWidth - barWidth) / 2
            const y = axisBottom - h
            return `  #place(top + left, dx: ${this.pt(x)}, dy: ${this.pt(y)}, rect(width: ${this.pt(barWidth)}, height: ${this.pt(h)}, fill: ${this.renderTypstBarFill(index)}, stroke: ${this.state.colorOn ? 'none' : '0.5pt + black'}))`
          })
          .join('\n')
      : ''

    return `#block(width: ${this.pt(totalWidth)}, height: ${this.pt(totalHeight)})[
${ticks}
  #place(top + left, line(start: (${this.pt(axisLeft)}, ${this.pt(axisBottom)}), end: (${this.pt(axisLeft + axisWidth + 8)}, ${this.pt(axisBottom)}), stroke: 1pt + luma(35%)))
  #place(top + left, line(start: (${this.pt(axisLeft)}, ${this.pt(axisBottom)}), end: (${this.pt(axisLeft)}, ${this.pt(axisTop)}), stroke: 1pt + luma(35%)))
${bars}
${labels}
]`
  }

  private renderTypstTicks(
    axisLeft: number,
    axisBottom: number,
    axisWidth: number,
    axisHeight: number,
    yMax: number,
    unitValue: number,
  ): string {
    const values: number[] = [0]
    const fullSteps = Math.floor(yMax / unitValue)
    for (let i = 1; i <= fullSteps; i++) values.push(i * unitValue)
    if (values[values.length - 1] !== yMax) values.push(yMax)

    return values
      .map((value) => {
        const y = axisBottom - (value / yMax) * axisHeight
        return `  #place(top + left, line(start: (${this.pt(axisLeft)}, ${this.pt(y)}), end: (${this.pt(axisLeft + axisWidth)}, ${this.pt(y)}), stroke: 0.5pt + luma(85%)))
  #place(top + left, dx: 0pt, dy: ${this.pt(y - 4)}, box(width: ${this.pt(axisLeft - 5)})[#align(right)[${this.formatTypstNumber(value)}]])`
      })
      .join('\n')
  }

  private renderTypstLegend(): string {
    if (this.state.items.length === 0) return ''

    const rows = this.state.items
      .map((item, index) => {
        const label = item.label.trim() === '' ? `B${index + 1}` : item.label
        return `  rect(width: 7pt, height: 7pt, fill: rgb("${this.colorForIndex(index)}"), stroke: none), [${this.escapeTypst(label)}]`
      })
      .join(',\n')

    return `#grid(
  columns: (auto, auto),
  gutter: 4pt,
${rows},
)`
  }

  private resolveLatexYMax(): number {
    const unitValue = Math.max(1, this.state.unitValue)
    const maxExpectedEffectif = this.deriveExpectedEffectifsFromUnit().reduce(
      (acc, value) => Math.max(acc, Math.max(0, value)),
      0,
    )
    const inferredYMax = this.roundUpToUnit(maxExpectedEffectif, unitValue)
    const configuredYMax =
      this.state.yMax == null
        ? inferredYMax
        : Math.max(this.state.yMax, unitValue)
    return Math.max(unitValue, configuredYMax)
  }

  private roundUpToUnit(value: number, unitValue: number): number {
    const safeUnitValue = Math.max(1, unitValue)
    if (!Number.isFinite(value) || value <= 0) return safeUnitValue
    return Math.ceil(value / safeUnitValue) * safeUnitValue
  }

  private toSerializedState(): BarAssessmentSerializedState {
    return {
      version: 1,
      kind: 'diagram-bar-assessment',
      mode: this.state.mode,
      labelValueKind: this.state.labelValueKind,
      infosStatus: this.state.infosStatus,
      colorOn: this.state.colorOn,
      correctionOn: this.state.correctionOn,
      unitValue: this.state.unitValue,
      items: this.state.items.map((item, index) => ({
        label:
          this.state.mode === 'label'
            ? (this.studentLabels[index] ?? '')
            : item.label,
        effectif:
          this.state.mode === 'effectif'
            ? this.studentEffectifs[index] == null
              ? null
              : Math.max(0, this.studentEffectifs[index] ?? 0)
            : item.effectif,
        height:
          this.state.mode === 'hauteur'
            ? this.studentHeights[index]
            : item.height,
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

  private colorForIndex(index: number): string {
    return BAR_COLORS[index % BAR_COLORS.length]
  }

  private tikzColorName(index: number): string {
    return `mathaleaBarColor${index}`
  }

  private renderLatexBarStyle(index: number): string {
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

  private renderTypstBarFill(index: number): string {
    return this.state.colorOn
      ? `rgb("${this.colorForIndex(index)}")`
      : `luma(${90 - (index % 5) * 10}%)`
  }

  private renderSvgHatchPattern(index: number): string {
    const id = this.svgHatchPatternId(index)
    const rotation = [45, -45, 0, 90][index % 4]
    return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(${rotation})"><rect width="8" height="8" fill="#fff"/><path d="M 0 0 L 0 8" stroke="#334155" stroke-width="1.2"/></pattern>`
  }

  private svgHatchPatternId(index: number): string {
    return `mathalea-bar-hatch-${index}`
  }

  private formatLatexNumber(value: number): string {
    return texNombre(value, Number.isInteger(value) ? 0 : 1)
  }

  private formatTikzNumber(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(2)
  }

  private formatTypstNumber(value: number): string {
    const rounded = Number.isInteger(value) ? String(value) : value.toFixed(1)
    return rounded.replace('.', ',')
  }

  private formatHtmlNumber(value: number): string {
    return (Number.isInteger(value) ? String(value) : value.toFixed(1)).replace(
      '.',
      ',',
    )
  }

  private pt(value: number): string {
    return `${Number(value.toFixed(2))}pt`
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

export function addDiagramBarAssessment(
  exercice: IExercice,
  questionIndex: number,
  options: BarAssessmentOptions,
): string {
  if (exercice.autoCorrection[questionIndex] == null) {
    exercice.autoCorrection[questionIndex] = {}
  }
  exercice.autoCorrection[questionIndex].formatInteractif =
    DiagramBarAssessmentElement.elementTag
  return DiagramBarAssessmentElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
  })
}

registerMathaleaCustomElement(DiagramBarAssessmentElement)
