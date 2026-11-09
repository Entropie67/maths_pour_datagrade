import renderMathInElement from 'katex/contrib/auto-render'
import type { MathfieldElement } from 'mathlive'
import { context } from '../../modules/context'
import { courbe } from '../2d/Courbe'
import { repere } from '../2d/reperes'
import type { IExercice } from '../types'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  AddTabPropMathlive,
  type Icell,
} from '../interactif/tableaux/AjouteTableauMathlive'
import { setMathfield, setMathfieldListener } from '../interactif/setMathfield'
import { texNombre } from '../outils/texNombre'
import { optionsKatex } from '../latex/Katex'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'
import { DomReadyActionElement } from './DomReadyAction'

const curveTracerCorrectionAnimationAction =
  'traceur-de-courbe-correction-animee'

type CurveTracerCorrectionAnimationPayload = {
  graphId: string
  points: Array<{ x: number; y: number }>
  intermediatePoints: Array<{ x: number; y: number }>
  imageLabel: string
  expressionLatex: string
}

let curveTracerCorrectionAnimationRegistered = false

function formatAnimationNumber(value: number): string {
  return Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value)
}

export function curveTracerCalculationLatex(
  expression: string,
  variable: string,
  value: number,
): string {
  const formattedValue = formatAnimationNumber(value)
  const argument =
    value < 0 ? `\\left(${formattedValue}\\right)` : formattedValue
  const variablePattern = new RegExp(
    `(?<![A-Za-z])${variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![A-Za-z])`,
    'g',
  )
  return expression.replace(variablePattern, (_match, offset) => {
    const previous = expression[offset - 1]
    return offset === 0 || ['+', '-', '('].includes(previous)
      ? argument
      : `\\times ${argument}`
  })
}

function registerCurveTracerCorrectionAnimation(): void {
  if (curveTracerCorrectionAnimationRegistered) return
  curveTracerCorrectionAnimationRegistered = true
  DomReadyActionElement.registerCallback<CurveTracerCorrectionAnimationPayload>(
    curveTracerCorrectionAnimationAction,
    ({ element, payload }) => {
      const svg = document.getElementById(payload.graphId)
      if (!(svg instanceof SVGSVGElement)) return
      const points = [
        ...svg.querySelectorAll<SVGGElement>('.curve-tracer-point'),
      ]
      const studentCurve = svg.querySelector<SVGPolylineElement>(
        '.curve-tracer-student',
      )
      const expectedCurve = svg.querySelector<SVGPolylineElement>(
        '.curve-tracer-expected',
      )
      const layout = svg.closest<HTMLElement>('.curve-tracer-layout')
      if (layout == null) return
      const timers = new Set<number>()
      let runId = 0
      const wait = (duration: number) =>
        new Promise<void>((resolve) => {
          const timer = window.setTimeout(() => {
            timers.delete(timer)
            resolve()
          }, duration)
          timers.add(timer)
        })
      const resetFigure = () => {
        svg
          .querySelectorAll('.curve-tracer-intermediate-point')
          .forEach((point) => point.remove())
        points.forEach((point) => {
          point.style.opacity = '0'
        })
        if (studentCurve != null) studentCurve.style.opacity = '0'
        if (expectedCurve != null) {
          expectedCurve.style.transition = 'none'
          expectedCurve.style.opacity = '0'
          expectedCurve.style.strokeDasharray = ''
          expectedCurve.style.strokeDashoffset = ''
        }
      }
      const status = document.createElement('div')
      status.className = 'min-h-6 font-semibold text-coopmaths-struct'
      status.setAttribute('aria-live', 'polite')
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = "Voir l'animation"
      button.className =
        'mt-2 rounded-md border border-coopmaths-action px-3 py-1 text-sm font-semibold text-coopmaths-action hover:bg-coopmaths-action hover:text-white disabled:cursor-wait disabled:opacity-60'
      const animationPanel = document.createElement('div')
      animationPanel.className = 'curve-tracer-animation-panel'
      animationPanel.append(status, button)
      layout.insertBefore(animationPanel, svg)

      const showCalculation = (point: { x: number; y: number }) => {
        const x = formatAnimationNumber(point.x)
        const y = formatAnimationNumber(point.y)
        const functionName = payload.imageLabel.match(/^([^([]+)\(/)?.[1]
        const variable = payload.imageLabel.match(/\(([^)]+)\)/)?.[1] ?? 'x'
        const substitutedExpression = curveTracerCalculationLatex(
          payload.expressionLatex,
          variable,
          point.x,
        )
        status.innerHTML =
          functionName == null
            ? `Pour $x=${x}$, l’image est $${y}$.`
            : `$${functionName}(${x})=${substitutedExpression}=${y}$`
        renderMathInElement(status, optionsKatex as never)
      }

      const playAnimation = async () => {
        const currentRun = ++runId
        timers.forEach((timer) => window.clearTimeout(timer))
        timers.clear()
        resetFigure()
        button.disabled = true
        animationPanel.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
        for (let index = 0; index < payload.points.length; index++) {
          if (currentRun !== runId) return
          showCalculation(payload.points[index])
          await wait(1100)
          if (currentRun !== runId) return
          if (points[index] != null) points[index].style.opacity = '1'
          await wait(700)
        }
        if (currentRun !== runId) return
        status.textContent =
          'Entre ces valeurs, calculer très rapidement beaucoup d’autres images : la courbe est formée d’une infinité de points obtenus de cette façon.'
        await wait(5000)
        if (currentRun !== runId) return
        if (expectedCurve != null) {
          const coordinates = (expectedCurve.getAttribute('points') ?? '')
            .trim()
            .split(/\s+/)
            .map((pair) => pair.split(',').map(Number))
            .filter(
              (point): point is [number, number] =>
                point.length === 2 && point.every(Number.isFinite),
            )
          const intermediateMarkers: SVGGElement[] = []
          const intermediateCount = payload.intermediatePoints.length
          for (let index = 0; index < intermediateCount; index++) {
            if (currentRun !== runId) return
            const coordinateIndex = Math.round(
              (index * (coordinates.length - 1)) /
                Math.max(1, intermediateCount - 1),
            )
            const [x, y] = coordinates[coordinateIndex]
            showCalculation(payload.intermediatePoints[index])
            const marker = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'g',
            )
            marker.classList.add('curve-tracer-intermediate-point')
            const radius = 3
            marker.innerHTML = `<line x1="${x - radius}" y1="${y - radius}" x2="${x + radius}" y2="${y + radius}"/><line x1="${x - radius}" y1="${y + radius}" x2="${x + radius}" y2="${y - radius}"/>`
            expectedCurve.before(marker)
            intermediateMarkers.push(marker)
            await wait(40)
          }
          if (currentRun !== runId) return
          status.textContent =
            'Tracer alors la courbe passant par tous ces points.'
          await wait(2000)
          const length = coordinates.slice(1).reduce((sum, point, index) => {
            const previous = coordinates[index]
            return (
              sum + Math.hypot(point[0] - previous[0], point[1] - previous[1])
            )
          }, 0)
          expectedCurve.style.opacity = '1'
          expectedCurve.style.strokeDasharray = `${length}`
          expectedCurve.style.strokeDashoffset = `${length}`
          expectedCurve.getBoundingClientRect()
          expectedCurve.style.transition = 'stroke-dashoffset 1.5s ease'
          expectedCurve.style.strokeDashoffset = '0'
          await wait(1500)
          intermediateMarkers.forEach((point) => {
            point.style.opacity = '0'
          })
        }
        if (currentRun !== runId) return
        status.textContent = 'La courbe est tracée.'
        button.textContent = "Revoir l'animation"
        button.disabled = false
      }
      button.addEventListener('click', playAnimation)
      element.style.display = 'none'
      resetFigure()

      return () => {
        runId++
        timers.forEach((timer) => window.clearTimeout(timer))
        button.removeEventListener('click', playAnimation)
        animationPanel.remove()
        element.style.removeProperty('display')
      }
    },
  )
}

export type CurveTracerPoint = { x: number | null; y: number | null }

export function parseCurveTracerNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null
  let source = value.trim().replaceAll(',', '.').replaceAll('−', '-')
  if (source === '') return null
  source = source.replace(/^\$|\$$/g, '')
  const fraction = source.match(/^([+-]?)\\(?:d?frac)\{([^{}]+)\}\{([^{}]+)\}$/)
  if (fraction != null) {
    const numerator = Number(`${fraction[1]}${fraction[2]}`)
    const denominator = Number(fraction[3])
    return Number.isFinite(numerator) &&
      Number.isFinite(denominator) &&
      denominator !== 0
      ? numerator / denominator
      : null
  }
  const slash = source.match(
    /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*\/\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))$/,
  )
  if (slash != null) {
    const denominator = Number(slash[2])
    return denominator === 0 ? null : Number(slash[1]) / denominator
  }
  const result = Number(source)
  return Number.isFinite(result) ? result : null
}

export function sortCurveTracerPoints(
  points: CurveTracerPoint[],
): CurveTracerPoint[] {
  return [...points].sort((a, b) => {
    if (a.x == null) return b.x == null ? 0 : 1
    if (b.x == null) return -1
    return a.x - b.x
  })
}

export function addCurveTracerColumn(
  points: CurveTracerPoint[],
): CurveTracerPoint[] {
  return [...points, { x: null, y: null }]
}

export function removeCurveTracerColumn(
  points: CurveTracerPoint[],
  minimumColumns: number,
): CurveTracerPoint[] {
  return points.length > minimumColumns ? points.slice(0, -1) : [...points]
}

export function sampleFunction(
  fn: (x: number) => number,
  xMin: number,
  xMax: number,
  step: number,
): Array<{ x: number; y: number }> {
  if (!(xMax > xMin) || !(step > 0)) return []
  const count = Math.ceil((xMax - xMin) / step)
  const result: Array<{ x: number; y: number }> = []
  for (let index = 0; index <= count; index++) {
    const x = index === count ? xMax : Math.min(xMax, xMin + index * step)
    const y = fn(x)
    if (Number.isFinite(y)) result.push({ x, y })
  }
  return result
}

export function curveTracerYBounds(samples: Array<{ y: number }>): {
  yMin: number
  yMax: number
} {
  if (samples.length === 0) return { yMin: -1, yMax: 1 }
  let min = Math.min(0, ...samples.map(({ y }) => y))
  let max = Math.max(0, ...samples.map(({ y }) => y))
  const padding = Math.max((max - min) * 0.1, 0.5)
  min -= padding
  max += padding
  return { yMin: min, yMax: max }
}

export type CurveTracerAssessment = {
  validPoints: boolean
  incomplete: boolean
  invalidPointIndexes: number[]
  representative: boolean
  relativeAreaError: number
}

export function formatCurveTracerInvalidPoints(indexes: number[]): string {
  const numbers = indexes.map((index) => index + 1)
  if (numbers.length === 0) return ''
  if (numbers.length === 1)
    return `Le point n°${numbers[0]} n’est pas sur la courbe.`
  const enumeration = `${numbers.slice(0, -1).join(', ')} et ${numbers.at(-1)}`
  return `Les points n°${enumeration} ne sont pas sur la courbe.`
}

/**
 * Attribue de 0 à 4 points à la précision du tracé. Le seuil configuré
 * correspond au premier niveau réussi ; les trois autres paliers demandent
 * une erreur d'aire respectivement deux, quatre et huit fois plus petite.
 */
export function curveTracerPrecisionScore(
  relativeAreaError: number,
  maxRelativeAreaError: number,
): number {
  if (
    !Number.isFinite(relativeAreaError) ||
    !(maxRelativeAreaError > 0) ||
    relativeAreaError > maxRelativeAreaError
  ) {
    return 0
  }
  if (relativeAreaError <= maxRelativeAreaError / 8) return 4
  if (relativeAreaError <= maxRelativeAreaError / 4) return 3
  if (relativeAreaError <= maxRelativeAreaError / 2) return 2
  return 1
}

export function assessCurveTracer(
  points: CurveTracerPoint[],
  fn: (x: number) => number,
  options: {
    xMin: number
    xMax: number
    step: number
    epsilon: number
    maxRelativeAreaError: number
  },
): CurveTracerAssessment {
  const sorted = sortCurveTracerPoints(points)
  const complete = sorted.filter(
    (point): point is { x: number; y: number } =>
      point.x != null && point.y != null,
  )
  const incomplete = complete.length !== points.length
  const invalidPointIndexes = sorted.flatMap((point, index) => {
    if (point.x == null || point.y == null) return []
    return point.x < options.xMin ||
      point.x > options.xMax ||
      Math.abs(point.y - fn(point.x)) > options.epsilon
      ? [index]
      : []
  })
  if (incomplete || invalidPointIndexes.length > 0 || complete.length < 2) {
    return {
      validPoints: false,
      incomplete,
      invalidPointIndexes,
      representative: false,
      relativeAreaError: Infinity,
    }
  }
  let errorArea = 0
  let referenceArea = 0
  const samples = sampleFunction(fn, options.xMin, options.xMax, options.step)
  for (const sample of samples) {
    const first = complete[0]
    const last = complete[complete.length - 1]
    if (sample.x < first.x || sample.x > last.x) {
      errorArea += Math.abs(sample.y) * options.step
    } else if (sample.x === first.x) {
      errorArea += Math.abs(sample.y - first.y) * options.step
    } else {
      const right = complete.findIndex(({ x }) => x >= sample.x)
      const a = complete[right - 1]
      const b = complete[right]
      const interpolated =
        a.x === b.x ? b.y : a.y + ((sample.x - a.x) / (b.x - a.x)) * (b.y - a.y)
      errorArea += Math.abs(sample.y - interpolated) * options.step
    }
    referenceArea += Math.abs(sample.y) * options.step
  }
  const relativeAreaError =
    errorArea /
    Math.max(
      referenceArea,
      (options.xMax - options.xMin) * options.epsilon,
      1e-9,
    )
  return {
    validPoints: true,
    incomplete: false,
    invalidPointIndexes: [],
    representative: relativeAreaError <= options.maxRelativeAreaError,
    relativeAreaError,
  }
}

export type TraceurDeCourbeExpected = {
  value: (x: number) => number
  pgfplotsExpression?: string
}

export type TraceurDeCourbeOptions = {
  id?: string
  rowLabels?: [string, string]
  columns?: number
  xMin: number
  xMax: number
  step: number
  epsilon?: number
  maxRelativeAreaError?: number
  interactivityOn?: boolean
  showExpected?: boolean
  joinPoints?: boolean
  animateCorrection?: boolean
  functionLabel?: string
  calculationExpression?: string
  target: (x: number) => number
  pgfplotsExpression?: string
}

type CreateOptions = TraceurDeCourbeOptions & {
  numeroExercice: number
  questionIndex: number
}

export type CurveTracerFocusTarget = {
  id: string
  row: number
  index: number
}
type State = { version: 1; points: CurveTracerPoint[] }

const targets = new Map<string, (x: number) => number>()
const format = (value: number) => Number(value.toPrecision(8)).toString()
export const formatFrenchLatexNumber = (value: number) =>
  format(value).replace('.', ',')

export function curveTracerTicks(min: number, max: number): number[] {
  const roughStep = (max - min) / 8
  const power = 10 ** Math.floor(Math.log10(roughStep))
  const normalized = roughStep / power
  const factor =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  const step = factor * power
  const first = Math.ceil(min / step) * step
  const ticks: number[] = []
  for (let value = first; value <= max + step * 1e-9; value += step) {
    ticks.push(Number(value.toPrecision(12)))
  }
  return ticks
}

export function curveTracerLatexTickDistance(min: number, max: number): number {
  const roughStep = (max - min) / 10
  if (!(roughStep > 0) || !Number.isFinite(roughStep)) return 1
  const power = 10 ** Math.floor(Math.log10(roughStep))
  const normalized = roughStep / power
  const factor =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return factor * power
}

const formatSvgNumber = (value: number) =>
  Intl.NumberFormat('fr-FR', { maximumFractionDigits: 6 }).format(value)

function typstStringLiteral(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

function expectedFunction(raw: unknown): ((x: number) => number) | null {
  if (typeof raw === 'function') return raw as (x: number) => number
  if (raw != null && typeof raw === 'object') {
    const object = raw as { value?: unknown; target?: unknown }
    if (typeof object.value === 'function')
      return object.value as (x: number) => number
    if (typeof object.target === 'function')
      return object.target as (x: number) => number
  }
  return null
}

export class TraceurDeCourbeElement extends MathaleaCustomElement {
  static readonly elementTag = 'traceur-de-courbe'
  static get observedAttributes(): string[] {
    return ['join-points']
  }
  private points: CurveTracerPoint[] = []
  private rowLabels: [string, string] = ['x', 'f(x)']
  private columns = 5
  private minimumColumns = 5
  private xMin = -5
  private xMax = 5
  private step = 0.1
  private epsilon = 0.01
  private maxRelativeAreaError = 0.15
  private target: ((x: number) => number) | null = null
  private pgfplotsExpression = ''
  private showExpected = false
  private joinPoints = true
  private renderGeneration = 0
  private pendingPointerFocus: CurveTracerFocusTarget | null = null

  constructor() {
    super()
    // Le `change` du champ quitté reconstruit le tableau avant que le
    // navigateur ne puisse donner le focus au champ qui vient d'être touché.
    // MathLive émet ce `change` pendant son propre `pointerdown` : on écoute en
    // phase de capture pour connaître la cible avant la reconstruction.
    this.addEventListener(
      'pointerdown',
      (event) => {
        const field = event
          .composedPath()
          .find(
            (target): target is MathfieldElement =>
              target instanceof HTMLElement && target.tagName === 'MATH-FIELD',
          )
        const focusTarget =
          field == null
            ? null
            : {
                id: field.id,
                row: Number(field.dataset.row),
                index: Number(field.dataset.index),
              }
        this.pendingPointerFocus = focusTarget
        if (field != null) {
          // Ne pas conserver une cible obsolète si ce pointerdown n'a provoqué
          // aucune reconstruction immédiate.
          setTimeout(() => {
            if (this.pendingPointerFocus === focusTarget) {
              this.pendingPointerFocus = null
            }
          }, 0)
        }
      },
      true,
    )
  }

  static create(options: CreateOptions): string {
    const id =
      options.id ??
      `${this.elementTag}Ex${options.numeroExercice}Q${options.questionIndex}`
    if (context.isTypst)
      return `<mathalea-typst>${this.renderTypstFrom(options)}</mathalea-typst>`
    if (!context.isHtml) return this.renderLatexFrom(options)
    targets.set(id, options.target)
    return super.create({
      ...options,
      id,
      joinPoints: options.joinPoints ?? true,
      animateCorrection: options.animateCorrection ?? false,
      target: undefined,
    })
  }

  private static samples(options: TraceurDeCourbeOptions) {
    return sampleFunction(
      options.target,
      options.xMin,
      options.xMax,
      options.step,
    )
  }

  private static renderLatexFrom(options: TraceurDeCourbeOptions): string {
    const labels = options.rowLabels ?? ['x', 'f(x)']
    const columns = Math.max(2, Math.floor(options.columns ?? 5))
    const samples = this.samples(options)
    const { yMin, yMax } = curveTracerYBounds(samples)
    const cells = Array.from(
      { length: columns },
      () => '\\rule{1.4cm}{0pt}',
    ).join(' & ')
    const r = repere({ xMin: options.xMin, xMax: options.xMax, yMin, yMax })
    const targetCurve =
      options.showExpected === true
        ? courbe(options.target, {
            repere: r,
            xMin: options.xMin,
            xMax: options.xMax,
            yMin,
            yMax,
            step: options.step,
            color: 'blue',
            usePgfplots: options.pgfplotsExpression != null,
            fLatex: options.pgfplotsExpression,
          })
        : null
    const xTickDistance = curveTracerLatexTickDistance(
      options.xMin,
      options.xMax,
    )
    const yTickDistance = curveTracerLatexTickDistance(yMin, yMax)
    const graph = mathalea2d(
      {
        xmin: options.xMin,
        xmax: options.xMax,
        ymin: yMin,
        ymax: yMax,
        usePgfplots: options.pgfplotsExpression != null,
        centerLatex: true,
        pgfplotsXTickDistance: xTickDistance,
        pgfplotsYTickDistance: yTickDistance,
        pgfplotsMinorXTickNum: 1,
        pgfplotsMinorYTickNum: 1,
      },
      targetCurve == null ? [r] : [r, targetCurve],
    )
    return `\\begin{center}
\\begin{tabular}{|c|${'c|'.repeat(columns)}}\\hline
${labels[0]} & ${cells} \\\\ \\hline
${labels[1]} & ${cells} \\\\ \\hline
\\end{tabular}

${graph}
\\end{center}`
  }

  private static renderTypstFrom(options: TraceurDeCourbeOptions): string {
    const labels = options.rowLabels ?? ['x', 'f(x)']
    const columns = Math.max(2, Math.floor(options.columns ?? 5))
    const emptyCells = Array.from({ length: columns }, () => '[]').join(', ')
    const columnWidths = `(${['auto', ...Array.from({ length: columns }, () => '1.4cm')].join(', ')})`
    const staticElement = document.createElement(
      this.elementTag,
    ) as TraceurDeCourbeElement
    staticElement.rowLabels = labels
    staticElement.columns = columns
    staticElement.minimumColumns = columns
    staticElement.xMin = options.xMin
    staticElement.xMax = options.xMax
    staticElement.step = options.step
    staticElement.target = options.target
    staticElement.showExpected = options.showExpected === true
    staticElement.interactivityOn = false
    staticElement.joinPoints = options.joinPoints ?? true
    staticElement.points = Array.from({ length: columns }, () => ({
      x: null,
      y: null,
    }))
    staticElement.render()
    const svgElement = staticElement.querySelector('svg')
    const styles = staticElement.querySelector('style')?.textContent ?? ''
    if (svgElement != null && styles !== '') {
      svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      svgElement.insertAdjacentHTML('afterbegin', `<style>${styles}</style>`)
    }
    const svg = svgElement?.outerHTML ?? ''
    return `#align(left)[#table(columns: ${columnWidths}, stroke: .5pt, inset: 5pt, [${labels[0]}], ${emptyCells}, [${labels[1]}], ${emptyCells})]\n#v(8pt)\n#align(left)[#image(bytes(${typstStringLiteral(svg)}), format: "svg", width: 375pt)]`
  }

  connectedCallback(): void {
    this.readAttributes()
    super.connectedCallback()
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ): void {
    if (name !== 'join-points' || oldValue === newValue) return
    this.joinPoints = newValue !== 'false'
    if (this.isConnected) this.render()
  }

  private readAttributes(): void {
    const labels = this.getAttribute('row-labels')
    try {
      if (labels) this.rowLabels = JSON.parse(labels)
    } catch {
      /* attribut invalide */
    }
    this.minimumColumns = Math.max(2, Number(this.getAttribute('columns')) || 5)
    this.columns = Math.max(this.minimumColumns, this.points.length)
    this.xMin = Number(this.getAttribute('x-min'))
    this.xMax = Number(this.getAttribute('x-max'))
    this.step = Number(this.getAttribute('step')) || 0.1
    this.epsilon = Number(this.getAttribute('epsilon')) || 0.01
    this.maxRelativeAreaError =
      Number(this.getAttribute('max-relative-area-error')) || 0.15
    this.pgfplotsExpression = this.getAttribute('pgfplots-expression') ?? ''
    this.showExpected = this.getAttribute('show-expected') === 'true'
    this.joinPoints = this.getAttribute('join-points') !== 'false'
    this.target = targets.get(this.id) ?? null
    if (this.points.length !== this.columns)
      this.points = Array.from({ length: this.columns }, () => ({
        x: null,
        y: null,
      }))
    if (
      this.showExpected &&
      this.target != null &&
      this.points.every((point) => point.x == null && point.y == null)
    ) {
      this.points = Array.from({ length: this.columns }, (_, index) => {
        const x =
          this.xMin + (index * (this.xMax - this.xMin)) / (this.columns - 1)
        return { x, y: this.target?.(x) ?? null }
      })
    }
  }

  render(): void {
    if (!context.isHtml) return
    const renderGeneration = ++this.renderGeneration
    const complete = this.points.filter(
      (p): p is { x: number; y: number } => p.x != null && p.y != null,
    )
    const targetSamples = this.target
      ? sampleFunction(this.target, this.xMin, this.xMax, this.step)
      : []
    const bounds = curveTracerYBounds([...targetSamples, ...complete])
    const padX = Math.max((this.xMax - this.xMin) * 0.05, 0.5)
    const view = {
      xMin: Math.min(this.xMin, ...complete.map((p) => p.x)) - padX,
      xMax: Math.max(this.xMax, ...complete.map((p) => p.x)) + padX,
      ...bounds,
    }
    const W = 500,
      H = 350,
      pad = 34
    const sx = (x: number) =>
      pad + ((x - view.xMin) / (view.xMax - view.xMin)) * (W - 2 * pad)
    const sy = (y: number) =>
      H - pad - ((y - view.yMin) / (view.yMax - view.yMin)) * (H - 2 * pad)
    const xTicks = curveTracerTicks(view.xMin, view.xMax)
    const yTicks = curveTracerTicks(view.yMin, view.yMax)
    const grid = `${xTicks
      .map(
        (x) =>
          `<line class="curve-tracer-grid" x1="${sx(x)}" y1="${sy(view.yMin)}" x2="${sx(x)}" y2="${sy(view.yMax)}"/>`,
      )
      .join('')}${yTicks
      .map(
        (y) =>
          `<line class="curve-tracer-grid" x1="${sx(view.xMin)}" y1="${sy(y)}" x2="${sx(view.xMax)}" y2="${sy(y)}"/>`,
      )
      .join('')}`
    const graduations = `${xTicks
      .map(
        (x) =>
          `<line class="curve-tracer-tick" x1="${sx(x)}" y1="${sy(0) - 4}" x2="${sx(x)}" y2="${sy(0) + 4}"/><text class="curve-tracer-label" x="${sx(x)}" y="${sy(0) + 17}" text-anchor="middle">${formatSvgNumber(x)}</text>`,
      )
      .join('')}${yTicks
      .filter((y) => Math.abs(y) > 1e-12)
      .map(
        (y) =>
          `<line class="curve-tracer-tick" x1="${sx(0) - 4}" y1="${sy(y)}" x2="${sx(0) + 4}" y2="${sy(y)}"/><text class="curve-tracer-label" x="${sx(0) - 7}" y="${sy(y) + 4}" text-anchor="end">${formatSvgNumber(y)}</text>`,
      )
      .join('')}`
    const polyline = [...complete]
      .sort((a, b) => a.x - b.x)
      .map((p) => `${sx(p.x)},${sy(p.y)}`)
      .join(' ')
    const expected =
      this.showExpected && targetSamples.length
        ? `<polyline class="expected" points="${targetSamples.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ')}"/>`
        : ''
    const makeLine = (row: 0 | 1): Icell[] => [
      {
        texte: this.rowLabels[row],
        latex: true,
        gras: true,
        color: 'black',
      },
      ...this.points.map((point) => ({
        texte:
          !this.interactivityOn && point[row === 0 ? 'x' : 'y'] != null
            ? texNombre(point[row === 0 ? 'x' : 'y'] as number, 2)
            : '',
        latex: !this.interactivityOn,
        gras: false,
        color: 'black',
      })),
    ]
    const questionIndex = Number(this.getAttribute('question-index')) || 0
    const table = AddTabPropMathlive.create(
      Number(this.getAttribute('numero-exercice')) || 0,
      this.showExpected ? questionIndex + 10000 : questionIndex,
      {
        nbColonnes: this.columns + 1,
        ligne1: makeLine(0),
        ligne2: makeLine(1),
      },
      'clavierDeBaseAvecFraction',
      this.interactivityOn,
      {},
    ).output.replace(/<div id="feedbackEx[^>]+><\/div>/, '')
    const columnButtons = this.interactivityOn
      ? `<div class="curve-tracer-column-buttons"><button class="curve-tracer-add-column" type="button">Ajouter une colonne</button>${this.columns > this.minimumColumns ? '<button class="curve-tracer-remove-column" type="button">Retirer une colonne</button>' : ''}</div>`
      : ''
    this.innerHTML = `<style>traceur-de-courbe{display:block;margin:.75rem 0}.curve-tracer-layout{display:grid;gap:1rem;justify-items:start}.curve-tracer-table{display:grid;gap:.5rem;justify-items:start;max-width:100%}.curve-tracer-layout tableau-mathlive{display:block;max-width:100%;overflow-x:auto}.curve-tracer-column-buttons{display:flex;gap:.5rem;flex-wrap:wrap}.curve-tracer-column-buttons button{padding:.35rem .75rem;border:1px solid #64748b;border-radius:.375rem;background:#fff;color:#334155;cursor:pointer}.curve-tracer-column-buttons button:hover{background:#f1f5f9}.curve-tracer-animation-panel{box-sizing:border-box;width:min(100%,500px);min-height:5.5rem;padding:.75rem 1rem;border-left:4px solid #f15929;border-radius:.375rem;background:#fff7ed}.curve-tracer-graph{border:1px solid #cbd5e1;background:white;width:min(100%,500px);height:auto}.curve-tracer-grid{stroke:#94a3b8;stroke-width:.7;opacity:.35}.curve-tracer-axis{stroke:#334155;stroke-width:1.5}.curve-tracer-tick{stroke:#334155;stroke-width:1}.curve-tracer-label{fill:#334155;font:12px sans-serif}.curve-tracer-student{fill:none;stroke:#2563eb;stroke-width:2}.curve-tracer-expected{fill:none;stroke:#16a34a;stroke-width:2}.curve-tracer-intermediate-point{stroke:#16a34a;stroke-width:1.5;transition:opacity .35s ease}.curve-tracer-point{stroke:#2563eb;stroke-width:2}traceur-de-courbe[animate-correction="true"] .curve-tracer-point,traceur-de-courbe[animate-correction="true"] .curve-tracer-student,traceur-de-courbe[animate-correction="true"] .curve-tracer-expected{opacity:0}</style><div class="curve-tracer-layout"><div class="curve-tracer-table">${table}${columnButtons}</div><svg id="${this.id}-graph" class="curve-tracer-graph" viewBox="0 0 ${W} ${H}" role="img" aria-label="Repère gradué et représentation graphique">${grid}<line class="curve-tracer-axis" x1="${sx(view.xMin)}" y1="${sy(0)}" x2="${sx(view.xMax)}" y2="${sy(0)}"/><line class="curve-tracer-axis" x1="${sx(0)}" y1="${sy(view.yMin)}" x2="${sx(0)}" y2="${sy(view.yMax)}"/>${graduations}${expected.replace('class="expected"', 'class="curve-tracer-expected"')}<polyline class="curve-tracer-student" points="${polyline}"/>${complete
      .map((p) => {
        const x = sx(p.x)
        const y = sy(p.y)
        const radius = 5
        return `<g class="curve-tracer-point"><line x1="${x - radius}" y1="${y - radius}" x2="${x + radius}" y2="${y + radius}"/><line x1="${x - radius}" y1="${y + radius}" x2="${x + radius}" y2="${y - radius}"/></g>`
      })
      .join('')}</svg></div>`
    if (!this.joinPoints) {
      this.querySelector('.curve-tracer-student')?.remove()
    }
    this.querySelectorAll<MathfieldElement>('math-field').forEach(
      (field, index) => {
        const row = index < this.columns ? 0 : 1
        const column = index % this.columns
        field.dataset.row = String(row)
        field.dataset.index = String(column)
        const value = this.points[column]?.[row === 0 ? 'x' : 'y']
        field.value = value == null ? '' : formatFrenchLatexNumber(value)
        if (field.dataset.listenerAdded !== 'true') {
          if (field.isConnected) {
            setMathfield(field)
          } else {
            field.addEventListener('mount', setMathfieldListener, {
              once: true,
            })
          }
        }
      },
    )
    this.querySelectorAll<MathfieldElement>('math-field').forEach((field) =>
      field.addEventListener('change', () => {
        // MathLive peut émettre un second événement après que le tri a
        // reconstruit le tableau. L'ancien indice ne doit alors plus servir.
        if (
          renderGeneration !== this.renderGeneration ||
          !field.isConnected ||
          field.closest(TraceurDeCourbeElement.elementTag) !== this
        ) {
          return
        }
        const index = Number(field.dataset.index),
          key = field.dataset.row === '0' ? 'x' : 'y'
        const editedPoint = this.points[index]
        this.points[index][key] = parseCurveTracerNumber(field.value)
        const focusTarget = this.pendingPointerFocus
        this.pendingPointerFocus = null
        if (key === 'x') {
          this.points = sortCurveTracerPoints(this.points)
          if (focusTarget?.row === 1 && focusTarget.index === index) {
            focusTarget.index = this.points.indexOf(editedPoint)
          }
        }
        this.render()
        restoreCurveTracerFocus(this, focusTarget)
        this.dispatchEvent(new Event('change', { bubbles: true }))
      }),
    )
    this.querySelector<HTMLButtonElement>(
      '.curve-tracer-add-column',
    )?.addEventListener('click', () => {
      this.points = addCurveTracerColumn(this.points)
      this.columns = this.points.length
      this.render()
      this.dispatchEvent(new Event('change', { bubbles: true }))
    })
    this.querySelector<HTMLButtonElement>(
      '.curve-tracer-remove-column',
    )?.addEventListener('click', () => {
      this.points = removeCurveTracerColumn(this.points, this.minimumColumns)
      this.columns = this.points.length
      this.render()
      this.dispatchEvent(new Event('change', { bubbles: true }))
    })
  }

  get value(): string {
    return JSON.stringify({
      version: 1,
      points: this.points,
    } satisfies State)
  }
  set value(value: string) {
    this.update(value)
  }
  update(value: string | State): void {
    try {
      const state =
        typeof value === 'string' ? (JSON.parse(value) as State) : value
      if (Array.isArray(state.points)) {
        this.columns = Math.max(this.columns, state.points.length)
        this.points = Array.from(
          { length: this.columns },
          (_, i) => state.points[i] ?? { x: null, y: null },
        )
      }
      this.render()
    } catch {
      /* ancienne réponse illisible */
    }
  }
  protected onInteractivityChanged(): void {
    this.render()
  }

  static verifQuestion(exercice: IExercice, questionIndex: number) {
    const id = `${this.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`
    const element = document.getElementById(id) as TraceurDeCourbeElement | null
    const raw = exercice.autoCorrection[questionIndex]?.valeur?.reponse?.value
    const target =
      expectedFunction(raw) ??
      (element ? (targets.get(element.id) ?? null) : null)
    if (!element || !target)
      return {
        isOk: false,
        feedback: 'Traceur de courbe ou fonction cible introuvable.',
        score: { nbBonnesReponses: 0, nbReponses: 5 },
      }
    const assessment = assessCurveTracer(element.points, target, {
      xMin: element.xMin,
      xMax: element.xMax,
      step: element.step,
      epsilon: element.epsilon,
      maxRelativeAreaError: element.maxRelativeAreaError,
    })
    exercice.answers ??= {}
    exercice.answers[element.id] = element.value
    element.target = target
    element.showExpected = true
    element.interactivityOn = false
    const pointFeedback = [
      assessment.incomplete ? 'Le tableau n’est pas entièrement rempli.' : '',
      formatCurveTracerInvalidPoints(assessment.invalidPointIndexes),
      !assessment.incomplete && assessment.validPoints
        ? 'Les couples de valeurs sont valides.'
        : '',
    ]
      .filter(Boolean)
      .join('<br>')
    const precisionScore = assessment.validPoints
      ? curveTracerPrecisionScore(
          assessment.relativeAreaError,
          element.maxRelativeAreaError,
        )
      : 0
    const sampleFeedback =
      precisionScore === 4
        ? 'La courbe obtenue est très précise.'
        : precisionScore === 3
          ? 'La courbe obtenue est précise.'
          : precisionScore === 2
            ? 'L’échantillon de valeurs permet une bonne représentation.'
            : precisionScore === 1
              ? 'La représentation est acceptable, mais elle peut encore être affinée en ajoutant des valeurs.'
              : 'Les valeurs ne sont pas assez bien choisies pour représenter la fonction.'
    const feedback = `${pointFeedback}<br>${sampleFeedback}`
    const good = Number(assessment.validPoints) + precisionScore
    document
      .querySelector(
        `#resultatCheckEx${exercice.numeroExercice}Q${questionIndex}`,
      )
      ?.replaceChildren(document.createTextNode(good === 5 ? '😎' : '☹️'))
    const feedbackDiv = document.querySelector(
      `#feedbackEx${exercice.numeroExercice}Q${questionIndex}`,
    ) as HTMLElement | null
    if (feedbackDiv) {
      feedbackDiv.innerHTML = feedback
      feedbackDiv.style.display = 'block'
    }
    return {
      isOk: good === 5,
      feedback,
      score: { nbBonnesReponses: good, nbReponses: 5 },
    }
  }
  static pointsMaxQuestion(): number {
    return 5
  }
  static formatStudentAnswer(raw: string): string {
    try {
      return (
        (JSON.parse(raw) as State).points
          .filter((p) => p.x != null || p.y != null)
          .map((p) => `(${p.x ?? '?'} ; ${p.y ?? '?'})`)
          .join(' ; ') || 'aucun point'
      )
    } catch {
      return raw
    }
  }
}

export function restoreCurveTracerFocus(
  root: ParentNode,
  focusTarget: CurveTracerFocusTarget | null,
): void {
  if (focusTarget == null) return
  queueMicrotask(() => {
    Array.from(root.querySelectorAll<HTMLElement>('[data-row][data-index]'))
      .find(
        (candidate) =>
          Number(candidate.dataset.row) === focusTarget.row &&
          Number(candidate.dataset.index) === focusTarget.index,
      )
      ?.focus()
  })
}

export function addTraceurDeCourbe(
  exercice: IExercice,
  questionIndex: number,
  options: TraceurDeCourbeOptions,
): string {
  exercice.autoCorrection[questionIndex] ??= {}
  exercice.autoCorrection[questionIndex].formatInteractif =
    TraceurDeCourbeElement.elementTag
  const elementHtml = TraceurDeCourbeElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
  })
  if (
    context.isHtml &&
    !context.isTypst &&
    options.animateCorrection === true &&
    options.showExpected === true
  ) {
    registerCurveTracerCorrectionAnimation()
    const columns = Math.max(2, Math.floor(options.columns ?? 5))
    const points = Array.from({ length: columns }, (_, index) => {
      const x =
        options.xMin + (index * (options.xMax - options.xMin)) / (columns - 1)
      return { x, y: options.target(x) }
    })
    const samples = sampleFunction(
      options.target,
      options.xMin,
      options.xMax,
      options.step,
    )
    const intermediateCount = Math.min(50, samples.length)
    const intermediatePoints = Array.from(
      { length: intermediateCount },
      (_, index) =>
        samples[
          Math.round(
            (index * (samples.length - 1)) / Math.max(1, intermediateCount - 1),
          )
        ],
    )
    const id =
      options.id ??
      `${TraceurDeCourbeElement.elementTag}Ex${exercice.numeroExercice ?? 0}Q${questionIndex}`
    return `${elementHtml}${DomReadyActionElement.create({
      action: curveTracerCorrectionAnimationAction,
      payload: {
        graphId: `${id}-graph`,
        points,
        intermediatePoints,
        imageLabel: options.functionLabel ?? '',
        expressionLatex: options.calculationExpression ?? '',
      } satisfies CurveTracerCorrectionAnimationPayload,
    })}`
  }
  if (
    !context.isHtml ||
    context.isTypst ||
    elementHtml === '' ||
    options.id != null
  )
    return elementHtml
  return `${elementHtml}<span id="resultatCheckEx${exercice.numeroExercice ?? 0}Q${questionIndex}"></span><div id="feedbackEx${exercice.numeroExercice ?? 0}Q${questionIndex}"></div>`
}

registerMathaleaCustomElement(TraceurDeCourbeElement)
