import { context } from '../../modules/context'
import { fraction } from '../../modules/fractions'
import { bleuMathalea, parseHexColor } from '../colors'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

/**
 * @author Jean-Claude Lhote
 */

/** Hauteur commune à tous les boutons de la barre de contrôle. */
const CONTROL_HEIGHT = '2rem'

type ValeurPoint = {
  pointValue: number
  label: string
}

export type DemiDroiteInteractiveSubdivisionMode = 'axis' | 'unit'

type DemiDroiteInteractiveValue = {
  partsCount: number
  subdivisionMode: DemiDroiteInteractiveSubdivisionMode
  maxT: number
  showNegative: boolean
  points: ValeurPoint[]
  x0: number
}

type DemiDroiteInteractiveIncomingValue =
  Partial<DemiDroiteInteractiveValue> & {
    showNegative?: boolean
    showwNegative?: boolean
  }

function formatPointValue(pointValue: number, partsCount: number): string {
  const numerator = pointValue * partsCount
  if (
    !Number.isFinite(numerator) ||
    !Number.isFinite(partsCount) ||
    partsCount <= 0
  ) {
    return String(pointValue)
  }
  return fraction(numerator, partsCount).texFraction
}

function formatDecimal(value: number): string {
  return Number.isFinite(value) ? String(Number(value.toFixed(4))) : '0'
}

function escapeLatexText(value: string): string {
  return value.replace(/[\\{}_$#%&]/g, (character) => `\\${character}`)
}

function escapeTypstText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function escapeXmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function tikzColorDefinition(color: string) {
  const parsedColor = parseHexColor(color)
  if (parsedColor == null) {
    return { definition: '', colorName: 'black' }
  }
  return {
    definition: `\\definecolor{demiDroiteInteractivePointColor}{HTML}{${parsedColor.withoutHash}}\n`,
    colorName: 'demiDroiteInteractivePointColor',
  }
}

function typstStringLiteral(value: string) {
  return `"${escapeTypstText(value)}"`
}

class DemiDroiteInteractiveElement extends MathaleaCustomElement {
  static readonly elementTag = 'demi-droite-interactive'

  private pointsColor = bleuMathalea
  private x0 = 0
  private initialX0 = 0
  private tMax = 2
  private initialTMax = 2
  private partsCount = 1
  private initialPartsCount = 1
  private subdivisionMode: DemiDroiteInteractiveSubdivisionMode = 'axis'
  private minT = 2
  private maxT = 10
  private axisMin: number | undefined
  private showNegative = false
  private initialShowNegative = false
  private showEqualityMarks = true
  private allowMultiplePoints = false
  private points: ValeurPoint[] = []
  private initialPoints: ValeurPoint[] = []
  private isPointPlacementArmed = false
  private isPointEraseArmed = false
  private svg: SVGSVGElement | null = null
  private controls: HTMLDivElement | null = null
  id: string = ''

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    if (questionIndex === undefined)
      return {
        isOk: false,
        feedback: 'Problème dans le programme',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    const goodAnswersJson =
      exercice.autoCorrection[questionIndex].valeur?.reponse?.value
    if (goodAnswersJson == null || typeof goodAnswersJson !== 'string') {
      window.notify(
        'Il y a un problème avec cet exercice, et la question, car autoCorrection ne contient pas la réponse attendue',
        {
          uuid: exercice.uuid,
          question: questionIndex,
          autoCorrection: JSON.stringify(exercice.autoCorrection),
        },
      )
      return {
        isOk: false,
        feedback: 'Problème dans le programme',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }
    const parsed = JSON.parse(String(goodAnswersJson))
    const nbPoints = parsed.points.length

    const host = document.getElementById(
      `demi-droite-interactiveEx${exercice.numeroExercice}Q${questionIndex}`,
    ) as DemiDroiteInteractiveElement

    if (host == null) {
      window.notify(
        'Il y a un problème avec cet exercice : la question ne contient pas la demi-droite-interactive souhaitée',
        {
          uuid: exercice.uuid,
          question: exercice.listeQuestions[questionIndex],
        },
      )
      return {
        isOk: false,
        feedback: 'Problème dans le programme',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }
    host.disableControls()

    const value = host.value
    const den = host.value.partsCount
    exercice.answers ??= {}
    exercice.answers[`Ex${exercice.numeroExercice}Q${questionIndex}`] =
      JSON.stringify(value)
    const results: ('OK' | 'KO')[] = []
    let feedback = ''
    for (let j = 0; j < nbPoints; j++) {
      const attendu = parsed.points[j].pointValue
      const saisi = value.points[j]?.pointValue
      const ok = saisi !== undefined && Math.abs(saisi - attendu) < 1e-9
      results.push(ok ? 'OK' : 'KO')
      if (!ok) {
        const attenduTex = formatPointValue(
          parsed.points[j].pointValue,
          parsed.partsCount,
        )
        const saisiTex =
          saisi === undefined
            ? "il n'est pas placé"
            : `il est placé à l'abscisse $${formatPointValue(saisi, den)}$`
        feedback += `Le point ${parsed.points[j].label} est attendu à l'abscisse $${attenduTex}$, mais ${saisiTex}.<br>`
      }
    }
    const spanResultat = host.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${questionIndex}`,
    ) as HTMLDivElement | null
    const divFeedback = host.querySelector(
      `#feedbackEx${exercice.numeroExercice}Q${questionIndex}`,
    ) as HTMLDivElement | null
    if (spanResultat) {
      const ok = results.every((r) => r === 'OK')
      spanResultat.innerHTML = ok ? '😎' : '☹️'
      if (divFeedback) {
        divFeedback.innerHTML = feedback
        divFeedback.style.display = feedback.length > 0 ? 'block' : 'none'
      }
      return {
        isOk: ok,
        feedback,
        score: {
          nbBonnesReponses: results.filter((r) => r === 'OK').length,
          nbReponses: results.length,
        },
      }
    }
    return {
      isOk: false,
      feedback: 'Problème dans le programme',
      score: { nbBonnesReponses: 0, nbReponses: 1 },
    }
  }

  static create(
    options: DemiDroiteInteractiveOptions & {
      id?: string
      numeroExercice?: number
      questionIndex?: number
    },
  ): string {
    if (context.isTypst || !context.isHtml) {
      const element = new DemiDroiteInteractiveElement()
      element.applyOptions(options)
      if (context.isTypst) {
        return `<mathalea-typst>${element.renderTypst()}</mathalea-typst>`
      }
      return element.renderLatex()
    }

    const idAttribute = options.id
      ? ` id="${options.id}"`
      : `id="demi-droite-interactiveEx${options.numeroExercice ?? 0}Q${options.questionIndex ?? 0}"`
    const x0 = options.x0 ?? 0
    const initialT = options.initialT ?? 2
    const minT = options.minT ?? 2
    const maxT = options.maxT ?? 10
    const partsCount = options.partsCount ?? 1
    const subdivisionMode = options.subdivisionMode ?? 'axis'
    const showNegative = options.showNegative ?? false
    const showEqualityMarks = options.showEqualityMarks ?? true
    const multiplePoints = options.multiplePoints ?? false
    const interactivityOn = options.interactivityOn ?? true
    const pointsColor = options.pointsColor ?? bleuMathalea
    const pointsAttribute = escapeHtmlAttribute(
      JSON.stringify(options.points ?? []),
    )
    const axisMinAttribute =
      options.axisMin === undefined ? '' : ` axis-min="${options.axisMin}"`

    return `<demi-droite-interactive ${idAttribute} x0="${x0}"${axisMinAttribute} initial-t="${initialT}" min-t="${minT}" max-t="${maxT}" show-negative="${showNegative}" show-equality-marks="${showEqualityMarks}" multiple-points="${multiplePoints}" interactivity-on="${interactivityOn}" parts-count="${partsCount}" subdivision-mode="${subdivisionMode}" points="${pointsAttribute}" points-color="${pointsColor}"></demi-droite-interactive>`
  }

  private applyOptions(options: DemiDroiteInteractiveOptions = {}): void {
    this.pointsColor = options.pointsColor ?? bleuMathalea
    this.minT = options.minT ?? 2
    this.maxT = options.maxT ?? 10
    this.axisMin = options.axisMin
    this.initialTMax = options.initialT ?? this.minT
    this.tMax = Math.max(this.minT, Math.min(this.maxT, this.initialTMax))
    this.initialX0 = options.x0 ?? 0
    this.x0 = this.initialX0
    this.initialPartsCount = Math.max(1, options.partsCount ?? 1)
    this.partsCount = this.initialPartsCount
    this.subdivisionMode = options.subdivisionMode ?? 'axis'
    this.showNegative = options.showNegative ?? false
    this.initialShowNegative = this.showNegative
    this.showEqualityMarks = options.showEqualityMarks ?? true
    this.allowMultiplePoints = options.multiplePoints ?? false
    this.interactivityOn = options.interactivityOn ?? true
    this.initialPoints = (options.points ?? []).map((point, index) => ({
      pointValue: Number(point.pointValue),
      label:
        typeof point.label === 'string' && point.label.length > 0
          ? point.label
          : String.fromCharCode(65 + index),
    }))
    this.points = this.initialPoints.map((point) => ({ ...point }))
  }

  connectedCallback() {
    this.pointsColor = this.getAttribute('points-color') ?? bleuMathalea
    this.id = String(this.getAttribute('id'))
    this.minT = Number(this.getAttribute('min-t') ?? '2')
    this.maxT = Number(this.getAttribute('max-t') ?? '10')
    const axisMinAttribute = this.getAttribute('axis-min')
    const axisMin =
      axisMinAttribute === null || axisMinAttribute === ''
        ? Number.NaN
        : Number(axisMinAttribute)
    this.axisMin = Number.isFinite(axisMin) ? axisMin : undefined
    this.initialTMax = Number(
      this.getAttribute('initial-t') ?? String(this.minT),
    )
    this.tMax = this.initialTMax
    this.tMax = Math.max(this.minT, Math.min(this.maxT, this.tMax))
    this.initialX0 = Number(this.getAttribute('x0') ?? '0')
    this.x0 = this.initialX0
    this.initialPartsCount = Math.max(
      1,
      Number(this.getAttribute('parts-count') ?? '1'),
    )
    this.partsCount = this.initialPartsCount
    this.subdivisionMode =
      this.getAttribute('subdivision-mode') === 'unit' ? 'unit' : 'axis'
    this.showNegative = this.getAttribute('show-negative') === 'true'
    this.initialShowNegative = this.showNegative
    this.showEqualityMarks =
      this.getAttribute('show-equality-marks') !== 'false'
    this.allowMultiplePoints = this.getAttribute('multiple-points') === 'true'
    this.interactivityOn = this.getAttribute('interactivity-on') !== 'false'
    this.initialPoints = this.parsePointsAttribute(this.getAttribute('points'))
    this.points = this.initialPoints.map((point) => ({ ...point }))

    this.style.display = 'block'
    this.render()
  }

  private parsePointsAttribute(pointsAttribute: string | null): ValeurPoint[] {
    if (!pointsAttribute) return []

    try {
      const parsed = JSON.parse(pointsAttribute)
      if (!Array.isArray(parsed)) return []

      return parsed
        .filter((point) => point && Number.isFinite(Number(point.pointValue)))
        .map((point, index) => ({
          pointValue: Number(point.pointValue),
          label:
            typeof point.label === 'string' && point.label.length > 0
              ? point.label
              : String.fromCharCode(65 + index),
        }))
    } catch {
      return []
    }
  }

  public get value(): DemiDroiteInteractiveValue {
    return {
      partsCount: this.partsCount,
      subdivisionMode: this.subdivisionMode,
      maxT: this.tMax,
      showNegative: this.showNegative,
      points: this.points.map((point) => ({ ...point })),
      x0: this.x0,
    }
  }

  public set value(
    nextValue: DemiDroiteInteractiveIncomingValue | string | null,
  ) {
    if (nextValue === null) {
      this.points = []
      this.isPointPlacementArmed = false
      this.render()
      return
    }

    if (typeof nextValue === 'string') {
      try {
        const parsedValue: unknown = JSON.parse(nextValue)
        if (typeof parsedValue !== 'object' || parsedValue == null) return
        nextValue = parsedValue as DemiDroiteInteractiveIncomingValue
      } catch {
        return
      }
    }

    const maxT = Number(nextValue.maxT)
    if (Number.isFinite(maxT)) {
      this.tMax = Math.max(this.minT, Math.min(this.maxT, maxT))
    }

    const partsCount = Number(nextValue.partsCount)
    if (Number.isFinite(partsCount)) {
      this.partsCount = Math.max(1, Math.floor(partsCount))
    }

    const incomingShowNegative =
      nextValue.showNegative ?? nextValue.showwNegative
    this.showNegative = incomingShowNegative === true

    const availableValues = this.getAvailableValues()
    const valuesSet = new Set(availableValues)
    const rawPoints = Array.isArray(nextValue.points) ? nextValue.points : []
    const sanitizedPoints = rawPoints
      .filter((point) => Number.isFinite(Number(point.pointValue)))
      .map((point) => ({
        pointValue: Number(point.pointValue),
        label: typeof point.label === 'string' ? point.label : '',
      }))
      .filter((point) => valuesSet.has(point.pointValue))

    this.points = sanitizedPoints.map((point, index) => ({
      pointValue: point.pointValue,
      label: point.label || String.fromCharCode(65 + index),
    }))

    this.isPointPlacementArmed = false
    this.render()
  }

  public getValue(): DemiDroiteInteractiveValue {
    return this.value
  }

  public disableControls(): void {
    this.clearPlacementMode()
    this.interactivityOn = false
    this.render()
  }

  private getAxisStartValue(): number {
    if (this.axisMin !== undefined) {
      return this.axisMin
    }
    if (this.showNegative) {
      return -this.initialTMax
    }
    return this.x0
  }

  private getParts(): number {
    return Math.max(1, this.partsCount)
  }

  private getAvailableValues(): number[] {
    const values = new Set<number>()
    const axisStartValue = this.getAxisStartValue()
    values.add(axisStartValue)
    values.add(this.tMax)

    const integerStart = Math.ceil(axisStartValue)
    const integerEnd = Math.floor(this.tMax)
    for (
      let integerValue = integerStart;
      integerValue <= integerEnd;
      integerValue++
    ) {
      values.add(integerValue)
    }

    for (const [segmentStart, segmentEnd] of this.getSubdivisionSegments()) {
      values.add(segmentStart)
      values.add(segmentEnd)
    }

    return Array.from(values).sort((a, b) => a - b)
  }

  /**
   * Renvoie les parts égales matérialisées sur l'axe.
   * En mode `axis`, toute la portion visible est partagée (comportement
   * historique). En mode `unit`, chaque unité est partagée en `partsCount`.
   */
  private getSubdivisionSegments(): [number, number][] {
    const axisStartValue = this.getAxisStartValue()
    const axisEndValue = this.tMax
    const parts = this.getParts()
    const segments: [number, number][] = []

    if (this.subdivisionMode === 'axis') {
      for (let index = 0; index < parts; index++) {
        segments.push([
          axisStartValue + (index * (axisEndValue - axisStartValue)) / parts,
          axisStartValue +
            ((index + 1) * (axisEndValue - axisStartValue)) / parts,
        ])
      }
      return segments
    }

    const firstIndex = Math.ceil(axisStartValue * parts - 1e-9)
    const lastIndex = Math.floor(axisEndValue * parts + 1e-9)
    for (let index = firstIndex; index < lastIndex; index++) {
      const segmentStart = Math.max(axisStartValue, index / parts)
      const segmentEnd = Math.min(axisEndValue, (index + 1) / parts)
      if (segmentEnd - segmentStart > 1e-9) {
        segments.push([segmentStart, segmentEnd])
      }
    }
    return segments
  }

  private getStaticGeometry() {
    const width = 12
    const axisStart = 0
    const axisEnd = width
    const valuesEnd = width - 0.6
    const valuesLength = valuesEnd - axisStart
    const minValue = this.getAxisStartValue()
    const maxValue = this.tMax
    const totalAxis = maxValue - minValue
    const xForValue = (value: number) => {
      const ratio = totalAxis === 0 ? 0 : (value - minValue) / totalAxis
      return axisStart + ratio * valuesLength
    }
    return {
      axisStart,
      axisEnd,
      minValue,
      maxValue,
      xForValue,
    }
  }

  protected renderLatex(): string {
    const geometry = this.getStaticGeometry()
    const availableValues = this.getAvailableValues()
    const visiblePoints = this.interactivityOn ? [] : this.points
    const pointColor = tikzColorDefinition(this.pointsColor)
    const lines = [
      `${pointColor.definition}\\begin{tikzpicture}[baseline]`,
      `\\draw[->, line width=0.8pt] (${formatDecimal(geometry.axisStart)},0) -- (${formatDecimal(geometry.axisEnd)},0);`,
    ]
    const parts = this.getParts()
    if (this.showEqualityMarks && parts >= 2) {
      for (const [
        segmentStartValue,
        segmentEndValue,
      ] of this.getSubdivisionSegments()) {
        const markerX = geometry.xForValue(
          (segmentStartValue + segmentEndValue) / 2,
        )
        lines.push(
          `\\draw[magenta, line width=0.35pt] (${formatDecimal(markerX - 0.08)},0.12) -- (${formatDecimal(markerX)},-0.12) -- (${formatDecimal(markerX + 0.08)},0.12);`,
        )
      }
    }
    for (const value of availableValues) {
      const x = geometry.xForValue(value)
      const isIntegerValue = Number.isInteger(value)
      const tickHeight = isIntegerValue ? 0.34 : 0.24
      lines.push(
        `\\draw[line width=${isIntegerValue ? '0.8pt' : '0.55pt'}] (${formatDecimal(x)},${formatDecimal(-tickHeight / 2)}) -- (${formatDecimal(x)},${formatDecimal(tickHeight / 2)});`,
      )
      if (isIntegerValue) {
        lines.push(
          `\\node[below] at (${formatDecimal(x)},-0.2) {${formatDecimal(value)}};`,
        )
      }
    }
    for (const point of visiblePoints) {
      const x = geometry.xForValue(point.pointValue)
      lines.push(
        `\\draw[${pointColor.colorName}, line width=0.9pt] (${formatDecimal(x - 0.12)},${formatDecimal(-0.12)}) -- (${formatDecimal(x + 0.12)},${formatDecimal(0.12)}) (${formatDecimal(x - 0.12)},${formatDecimal(0.12)}) -- (${formatDecimal(x + 0.12)},${formatDecimal(-0.12)});`,
      )
      lines.push(
        `\\node[above, ${pointColor.colorName}] at (${formatDecimal(x)},0.55) {\\bfseries ${escapeLatexText(point.label)}};`,
      )
    }
    lines.push('\\end{tikzpicture}')
    return lines.join('\n')
  }

  protected renderTypst(): string {
    const svg = this.renderStaticSvg()
    return `#image(bytes(${typstStringLiteral(svg)}), format: "svg", width: 340pt)`
  }

  private renderStaticSvg(): string {
    const geometry = this.getStaticGeometry()
    const availableValues = this.getAvailableValues()
    const visiblePoints = this.interactivityOn ? [] : this.points
    const parts = this.getParts()
    const pixelsPerUnit = 40
    const marginX = 18
    const axisY = 38
    const width = geometry.axisEnd * pixelsPerUnit + marginX * 2
    const height = visiblePoints.length > 0 ? 92 : 76
    const xSvg = (x: number) => marginX + x * pixelsPerUnit
    const lines = [
      `<svg width="${formatDecimal(width)}" height="${height}" viewBox="0 0 ${formatDecimal(width)} ${height}" xmlns="http://www.w3.org/2000/svg">`,
      '<g fill="none" stroke-linecap="round" stroke-linejoin="round">',
      `<line x1="${xSvg(geometry.axisStart)}" y1="${axisY}" x2="${xSvg(geometry.axisEnd)}" y2="${axisY}" stroke="#111" stroke-width="1.6" />`,
      `<path d="M ${xSvg(geometry.axisEnd - 0.24)} ${axisY - 5} L ${xSvg(geometry.axisEnd)} ${axisY} L ${xSvg(geometry.axisEnd - 0.24)} ${axisY + 5}" stroke="#111" stroke-width="1.6" />`,
    ]
    if (this.showEqualityMarks && parts >= 2) {
      for (const [
        segmentStartValue,
        segmentEndValue,
      ] of this.getSubdivisionSegments()) {
        const markerX = geometry.xForValue(
          (segmentStartValue + segmentEndValue) / 2,
        )
        lines.push(
          `<path d="M ${formatDecimal(xSvg(markerX - 0.08))} ${axisY - 5} L ${formatDecimal(xSvg(markerX))} ${axisY + 5} L ${formatDecimal(xSvg(markerX + 0.08))} ${axisY - 5}" stroke="#f050d0" stroke-width="1" />`,
        )
      }
    }
    for (const value of availableValues) {
      const x = geometry.xForValue(value)
      const isIntegerValue = Number.isInteger(value)
      const tickHeight = isIntegerValue ? 0.34 : 0.24
      lines.push(
        `<line x1="${formatDecimal(xSvg(x))}" y1="${formatDecimal(axisY - (tickHeight * pixelsPerUnit) / 2)}" x2="${formatDecimal(xSvg(x))}" y2="${formatDecimal(axisY + (tickHeight * pixelsPerUnit) / 2)}" stroke="#111" stroke-width="${isIntegerValue ? '2' : '1.3'}" />`,
      )
      if (isIntegerValue) {
        lines.push(
          `<text x="${formatDecimal(xSvg(x))}" y="${axisY + 28}" text-anchor="middle" font-family="serif" font-size="13" fill="#222">${formatDecimal(value)}</text>`,
        )
      }
    }
    for (const point of visiblePoints) {
      const x = geometry.xForValue(point.pointValue)
      lines.push(
        `<path d="M ${formatDecimal(xSvg(x) - 5)} ${axisY - 5} L ${formatDecimal(xSvg(x) + 5)} ${axisY + 5} M ${formatDecimal(xSvg(x) - 5)} ${axisY + 5} L ${formatDecimal(xSvg(x) + 5)} ${axisY - 5}" stroke="${escapeXmlText(this.pointsColor)}" stroke-width="2" />`,
        `<text x="${formatDecimal(xSvg(x))}" y="${axisY - 24}" text-anchor="middle" font-family="serif" font-size="14" font-weight="700" fill="${escapeXmlText(this.pointsColor)}">${escapeXmlText(point.label)}</text>`,
      )
    }
    lines.push('</g>', '</svg>')
    return lines.join('')
  }

  private valueExistsOnAxis(testValue: number): boolean {
    return this.getAvailableValues().some(
      (value) => Math.abs(value - testValue) < 1e-9,
    )
  }

  private createButton(
    text: string,
    onClick: () => void,
    selected = false,
    description?: string,
  ): HTMLButtonElement {
    const button = document.createElement('button')
    button.type = 'button'
    button.innerHTML = text
    if (description) {
      button.title = description
      button.setAttribute('aria-label', description)
    }
    button.style.height = CONTROL_HEIGHT
    button.style.boxSizing = 'border-box'
    button.style.padding = '0 0.6rem'
    button.style.display = 'inline-flex'
    button.style.alignItems = 'center'
    button.style.justifyContent = 'center'
    button.style.border = '1px solid #999'
    button.style.borderRadius = '6px'
    button.style.background = selected ? '#d9e7ff' : '#fff'
    button.style.boxShadow = selected
      ? 'inset 0 1px 3px rgba(0, 0, 0, 0.18)'
      : 'none'
    button.style.transform = selected ? 'translateY(1px)' : 'none'
    button.style.cursor = 'pointer'
    button.style.fontSize = '0.92rem'
    button.addEventListener('click', onClick)
    return button
  }

  private createStepperButton(
    text: string,
    onClick: () => void,
    description: string,
  ): HTMLButtonElement {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = text
    button.title = description
    button.setAttribute('aria-label', description)
    button.style.width = '1.5rem'
    button.style.height = '1.5rem'
    button.style.padding = '0'
    button.style.lineHeight = '1'
    button.style.border = '1px solid #999'
    button.style.borderRadius = '999px'
    button.style.background = '#fff'
    button.style.cursor = 'pointer'
    button.style.fontSize = '1rem'
    button.style.display = 'inline-flex'
    button.style.alignItems = 'center'
    button.style.justifyContent = 'center'
    button.addEventListener('click', onClick)
    return button
  }

  private createGradationsControl(): HTMLDivElement {
    const group = document.createElement('div')
    group.style.display = 'inline-flex'
    group.style.alignItems = 'center'
    group.style.height = CONTROL_HEIGHT
    group.style.boxSizing = 'border-box'
    group.style.gap = '0.35rem'
    group.style.padding = '0 0.5rem'
    group.style.border = '1px solid #999'
    group.style.borderRadius = '6px'
    group.style.background = '#fff'
    group.style.fontSize = '0.92rem'

    const label = document.createElement('span')
    label.textContent =
      this.subdivisionMode === 'unit'
        ? 'Nombre de parts par unité'
        : 'Nombre de parts sur l’axe'

    const valueDisplay = document.createElement('span')
    valueDisplay.textContent = String(this.partsCount)
    valueDisplay.style.fontWeight = '700'
    valueDisplay.style.minWidth = '1.2em'
    valueDisplay.style.textAlign = 'center'

    const minus = this.createStepperButton(
      '−',
      () => {
        this.clearPlacementMode()
        if (this.partsCount > 1) {
          this.partsCount--
          this.points = this.points.filter((point) =>
            this.valueExistsOnAxis(point.pointValue),
          )
          this.render()
          this.emitChange()
        }
      },
      this.subdivisionMode === 'unit'
        ? 'Diminuer le nombre de parts par unité'
        : 'Diminuer le nombre de parts sur l’axe',
    )

    const plus = this.createStepperButton(
      '+',
      () => {
        this.clearPlacementMode()
        this.partsCount++
        this.render()
        this.emitChange()
      },
      this.subdivisionMode === 'unit'
        ? 'Augmenter le nombre de parts par unité'
        : 'Augmenter le nombre de parts sur l’axe',
    )

    group.append(label, valueDisplay, minus, plus)
    return group
  }

  private clearPlacementMode() {
    this.isPointPlacementArmed = false
    this.isPointEraseArmed = false
  }

  private resetToInitialState() {
    this.x0 = this.initialX0
    this.tMax = Math.max(this.minT, Math.min(this.maxT, this.initialTMax))
    this.partsCount = this.initialPartsCount
    this.showNegative = this.initialShowNegative
    this.points = this.initialPoints.map((point) => ({ ...point }))
    this.clearPlacementMode()
    this.render()
    this.emitChange()
  }

  private removePoint(pointValue: number, label: string) {
    const pointIndex = this.points.findIndex(
      (point) =>
        Math.abs(point.pointValue - pointValue) < 1e-9 && point.label === label,
    )
    if (pointIndex === -1) return

    this.points.splice(pointIndex, 1)
    this.render()
    this.emitChange()
  }

  private emitChange() {
    this.dispatchEvent(new CustomEvent('change', { bubbles: true }))
  }

  private nextLabel(): string {
    const charCode = 65 + this.points.length
    return String.fromCharCode(charCode)
  }

  private placePoint(pointValue: number) {
    if (this.allowMultiplePoints) {
      this.points.push({ pointValue, label: this.nextLabel() })
    } else {
      this.points = [{ pointValue, label: 'A' }]
    }
    this.render()
    this.emitChange()
  }

  render() {
    this.innerHTML = ''

    if (this.interactivityOn) {
      this.controls = document.createElement('div')
      this.controls.style.display = 'flex'
      this.controls.style.flexWrap = 'wrap'
      this.controls.style.gap = '0.5rem'
      this.controls.style.alignItems = 'center'
      this.controls.style.marginBottom = '0.6rem'
      const tMinus = this.createButton(
        'Max-',
        () => {
          this.clearPlacementMode()
          if (this.tMax > this.minT) {
            this.tMax--
            this.points = this.points.filter((point) =>
              this.valueExistsOnAxis(point.pointValue),
            )
            this.render()
            this.emitChange()
          }
        },
        false,
        'Diminuer la valeur de T',
      )
      const tPlus = this.createButton(
        'Max+',
        () => {
          this.clearPlacementMode()
          if (this.tMax < this.maxT) {
            this.tMax++
            this.render()
            this.emitChange()
          }
        },
        false,
        'Augmenter la valeur de T',
      )

      const gradationsControl = this.createGradationsControl()

      const addPoint = this.createButton(
        this.allowMultiplePoints
          ? 'Ajouter un point (A, B, ...)'
          : 'Placer le point',
        () => {
          this.isPointEraseArmed = false
          this.isPointPlacementArmed = true
          this.render()
        },
        this.isPointPlacementArmed,
        this.allowMultiplePoints
          ? 'Activer le mode ajout de points'
          : 'Activer le mode placement du point',
      )

      const deletePoints = this.createButton(
        '🗑',
        () => {
          this.clearPlacementMode()
          this.isPointEraseArmed = true
          this.render()
        },
        this.isPointEraseArmed,
        'Supprimer un point placé',
      )

      const resetAxis = this.createButton(
        '↺&nbsp;Réinitialiser la figure',
        () => {
          this.resetToInitialState()
        },
        false,
        'Réinitialiser la figure',
      )

      if (this.minT < this.maxT) {
        this.controls.append(tMinus, tPlus)
      }
      this.controls.append(gradationsControl, addPoint, deletePoints, resetAxis)
      this.appendChild(this.controls)
    }
    const resultatCheck = document.createElement('span')
    resultatCheck.id = this.id
      ? `${this.id.replace('demi-droite-interactive', 'resultatCheck')}`
      : `demi-droite-interactive-resultat`

    const width = 600
    const height = 76
    const margin = 22
    const axisY = 35
    const extensionAfterT = 24
    const arrowLength = 10
    const axisStart = margin
    const axisEnd = width - margin - arrowLength
    const valuesEnd = axisEnd - extensionAfterT
    const valuesLength = valuesEnd - axisStart
    const availableValues = this.getAvailableValues()
    const minValue = this.getAxisStartValue()
    const maxValue = this.tMax
    const totalAxis = maxValue - minValue

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    this.svg.setAttribute('width', String(width))
    this.svg.setAttribute('height', String(height))
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    this.svg.style.maxWidth = '100%'
    this.svg.style.height = 'auto'
    this.svg.style.border = '1px solid #d5d5d5'
    this.svg.style.borderRadius = '8px'
    this.svg.style.background = '#ffffff'

    const axis = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    axis.setAttribute('x1', String(axisStart))
    axis.setAttribute('y1', String(axisY))
    axis.setAttribute('x2', String(axisEnd))
    axis.setAttribute('y2', String(axisY))
    axis.setAttribute('stroke', '#111')
    axis.setAttribute('stroke-width', '2')
    this.svg.appendChild(axis)

    const parts = this.getParts()
    const subdivisionSegments = this.getSubdivisionSegments()
    if (this.showEqualityMarks && parts >= 2) {
      const markerYOffset = 0
      const markerHalfWidth = 4
      const markerHalfHeight = 5
      for (const [segmentStartValue, segmentEndValue] of subdivisionSegments) {
        const midValue = (segmentStartValue + segmentEndValue) / 2
        const ratio = totalAxis === 0 ? 0 : (midValue - minValue) / totalAxis
        const markerX = axisStart + ratio * valuesLength

        const equalityMarker1 = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'line',
        )
        const equalityMarker2 = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'line',
        )
        equalityMarker1.setAttribute('x1', String(markerX - markerHalfWidth))
        equalityMarker1.setAttribute(
          'y1',
          String(axisY - markerYOffset - markerHalfHeight),
        )
        equalityMarker1.setAttribute('x2', String(markerX))
        equalityMarker1.setAttribute(
          'y2',
          String(axisY - markerYOffset + markerHalfHeight),
        )

        equalityMarker2.setAttribute('x1', String(markerX))
        equalityMarker2.setAttribute(
          'y1',
          String(axisY - markerYOffset - markerHalfHeight),
        )
        equalityMarker2.setAttribute('x2', String(markerX + markerHalfWidth))
        equalityMarker2.setAttribute(
          'y2',
          String(axisY - markerYOffset + markerHalfHeight),
        )
        equalityMarker1.setAttribute('stroke', '#f050d0')
        equalityMarker1.setAttribute('stroke-width', '1')
        equalityMarker1.setAttribute('stroke-linecap', 'round')
        this.svg.appendChild(equalityMarker1)
        equalityMarker2.setAttribute('stroke', '#f050d0')
        equalityMarker2.setAttribute('stroke-width', '1')
        equalityMarker2.setAttribute('stroke-linecap', 'round')
        this.svg.appendChild(equalityMarker2)
      }
    }

    const arrow = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'polygon',
    )
    arrow.setAttribute(
      'points',
      `${axisEnd},${axisY} ${axisEnd - 10},${axisY - 5} ${axisEnd - 10},${axisY + 5}`,
    )
    arrow.setAttribute('fill', '#111')
    this.svg.appendChild(arrow)

    // Les « bonds » bleus matérialisent chaque part du découpage : un arc par
    // sous-intervalle, reliant deux graduations intermédiaires consécutives. La
    // chaîne d'arcs passe au-dessus des graduations principales sans s'y arrêter.
    if (parts >= 2) {
      const hopHeight = 14
      for (const [segmentStartValue, segmentEndValue] of subdivisionSegments) {
        const xA =
          axisStart +
          ((segmentStartValue - minValue) / totalAxis) * valuesLength
        const xB =
          axisStart + ((segmentEndValue - minValue) / totalAxis) * valuesLength
        const midX = (xA + xB) / 2
        const hop = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path',
        )
        hop.setAttribute(
          'd',
          `M ${xA} ${axisY} Q ${midX} ${axisY + hopHeight} ${xB} ${axisY}`,
        )
        hop.setAttribute('fill', 'none')
        hop.setAttribute('stroke', bleuMathalea)
        hop.setAttribute('stroke-width', '1.5')
        hop.setAttribute('stroke-linecap', 'round')
        hop.style.pointerEvents = 'none'
        this.svg.appendChild(hop)
      }
    }

    for (const value of availableValues) {
      const ratio = totalAxis === 0 ? 0 : (value - minValue) / totalAxis
      const x = axisStart + ratio * valuesLength
      const isIntegerValue = Number.isInteger(value)
      const tickHeight = isIntegerValue ? 18 : 12

      const tick = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line',
      )
      tick.setAttribute('x1', String(x))
      tick.setAttribute('y1', String(axisY - tickHeight / 2))
      tick.setAttribute('x2', String(x))
      tick.setAttribute('y2', String(axisY + tickHeight / 2))
      tick.setAttribute('stroke', isIntegerValue ? '#111' : '#444')
      tick.setAttribute('stroke-width', isIntegerValue ? '3' : '2')
      this.svg.appendChild(tick)

      if (isIntegerValue) {
        const label = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'text',
        )
        label.setAttribute('x', String(x))
        label.setAttribute('y', String(axisY + 28))
        label.setAttribute('text-anchor', 'middle')
        label.setAttribute('font-size', '13')
        label.setAttribute('fill', '#222')
        label.textContent = String(value)
        this.svg.appendChild(label)
      }

      const clickable = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle',
      )
      clickable.setAttribute('cx', String(x))
      clickable.setAttribute('cy', String(axisY))
      clickable.setAttribute('r', '8')
      clickable.setAttribute('fill', 'transparent')
      if (this.interactivityOn) {
        clickable.style.cursor = this.isPointPlacementArmed
          ? 'crosshair'
          : 'default'
        clickable.addEventListener('click', () => {
          if (!this.isPointPlacementArmed) return
          this.placePoint(value)
        })
      }
      this.svg.appendChild(clickable)
    }

    for (const point of this.points) {
      const ratio =
        totalAxis === 0 ? 0 : (point.pointValue - minValue) / totalAxis
      const x = axisStart + ratio * valuesLength
      const cross = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      if (this.interactivityOn) {
        cross.style.cursor = this.isPointEraseArmed ? 'pointer' : 'default'
        cross.addEventListener('click', () => {
          if (!this.isPointEraseArmed) return
          this.removePoint(point.pointValue, point.label)
        })
      }

      const crossStroke = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line',
      )
      crossStroke.setAttribute('x1', String(x - 5))
      crossStroke.setAttribute('y1', String(axisY - 5))
      crossStroke.setAttribute('x2', String(x + 5))
      crossStroke.setAttribute('y2', String(axisY + 5))
      crossStroke.setAttribute('stroke', this.pointsColor)
      crossStroke.setAttribute('stroke-width', '2')
      crossStroke.setAttribute('stroke-linecap', 'round')
      cross.appendChild(crossStroke)

      const crossStrokeOpposite = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line',
      )
      crossStrokeOpposite.setAttribute('x1', String(x - 5))
      crossStrokeOpposite.setAttribute('y1', String(axisY + 5))
      crossStrokeOpposite.setAttribute('x2', String(x + 5))
      crossStrokeOpposite.setAttribute('y2', String(axisY - 5))
      crossStrokeOpposite.setAttribute('stroke', this.pointsColor)
      crossStrokeOpposite.setAttribute('stroke-width', '2')
      crossStrokeOpposite.setAttribute('stroke-linecap', 'round')
      cross.appendChild(crossStrokeOpposite)

      this.svg.appendChild(cross)

      const pLabel = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text',
      )
      pLabel.setAttribute('x', String(x))
      pLabel.setAttribute('y', String(axisY - 16))
      pLabel.setAttribute('text-anchor', 'middle')
      pLabel.setAttribute('font-size', '14')
      pLabel.setAttribute('font-weight', '700')
      pLabel.setAttribute('fill', this.pointsColor)
      pLabel.textContent = point.label
      pLabel.style.pointerEvents = 'none'
      this.svg.appendChild(pLabel)
    }

    if (this.interactivityOn && this.isPointPlacementArmed) {
      const help = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text',
      )
      help.setAttribute('x', String(width / 2))
      help.setAttribute('y', '148')
      help.setAttribute('text-anchor', 'middle')
      help.setAttribute('font-size', '12')
      help.setAttribute('fill', this.pointsColor)
      help.textContent = 'Cliquer sur une graduation pour y placer le point.'
      this.svg.appendChild(help)
    }

    this.appendChild(this.svg)
    this.appendChild(resultatCheck)
    const divFeedback = document.createElement('div')
    divFeedback.classList.add(
      'py-2',
      'italic',
      'text-coopmaths-warn-darkest',
      'dark:text-coopmathsdark-warn-darkest',
    )
    divFeedback.id = this.id
      ? `${this.id.replace('demi-droite-interactive', 'feedback')}`
      : `demi-droite-interactive-feedback`
    this.appendChild(divFeedback)
  }
  static formatStudentAnswer(rawAnswer: string): string {
    const parsed = JSON.parse(rawAnswer)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('partsCount' in parsed) ||
      !('maxT' in parsed) ||
      !('showNegative' in parsed || 'showwNegative' in parsed) ||
      !('points' in parsed) ||
      !('x0' in parsed)
    ) {
      return rawAnswer
    }
    const { partsCount, maxT, points, x0 } = parsed
    const subdivisionMode = parsed.subdivisionMode === 'unit' ? 'unit' : 'axis'
    const axisMin = Number(parsed.axisMin ?? x0)
    const showNegative = parsed.showNegative ?? parsed.showwNegative
    if (
      !Number.isFinite(partsCount) ||
      !Number.isFinite(maxT) ||
      !Number.isFinite(axisMin) ||
      typeof showNegative !== 'boolean' ||
      !Array.isArray(points) ||
      !Number.isFinite(x0)
    ) {
      return rawAnswer
    }
    const pointsDescriptions = points.map((point: unknown) => {
      if (
        typeof point !== 'object' ||
        point === null ||
        !('pointValue' in point) ||
        !('label' in point)
      ) {
        return null
      }
      const pointRecord = point as { pointValue: unknown; label: unknown }
      const { pointValue, label } = pointRecord
      const numericPointValue = Number(pointValue)
      if (!Number.isFinite(numericPointValue) || typeof label !== 'string') {
        return null
      }
      return `${label}\\left(${fraction(numericPointValue * partsCount, partsCount).texFraction}\\right)`
    })
    const subdivisionDescription =
      subdivisionMode === 'unit'
        ? `Chaque unité de l'axe allant de $${axisMin}$ à $${maxT}$ a été partagée en $${partsCount}$ parties.`
        : `Un axe allant de $${axisMin}$ à $${maxT}$ a été partagé en $${partsCount}$ parties.`
    return `${subdivisionDescription}<br>
    ${points.length > 1 ? 'Les points suivants sont placés :' : 'Le point suivant est placé :'} $${pointsDescriptions.filter((v): v is string => !!v).join(';')}$`
  }
}

registerMathaleaCustomElement(DemiDroiteInteractiveElement)

export type DemiDroiteInteractiveOptions = {
  x0?: number
  initialT?: number
  minT?: number
  maxT?: number
  partsCount?: number
  subdivisionMode?: DemiDroiteInteractiveSubdivisionMode
  axisMin?: number
  showNegative?: boolean
  showEqualityMarks?: boolean
  multiplePoints?: boolean
  interactivityOn?: boolean
  points?: ValeurPoint[]
  id?: string
  pointsColor?: string
}

export function demiDroiteInteractive(
  exercice: IExercice,
  questionIndex: number,
  options?: DemiDroiteInteractiveOptions,
): string {
  return DemiDroiteInteractiveElement.create({
    ...options,
    // Le composant ne doit être interactif que si l'exercice l'est ET que
    // l'auteur ne l'a pas explicitement figé (ex. version correction).
    interactivityOn: exercice.interactif && (options?.interactivityOn ?? true),
    numeroExercice: exercice.numeroExercice,
    questionIndex,
  })
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

export default DemiDroiteInteractiveElement
