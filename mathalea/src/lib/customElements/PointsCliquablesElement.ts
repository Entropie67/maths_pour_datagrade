import { context } from '../../modules/context'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

export type PointCliquableData = {
  x: number
  y: number
  id: string
  etat: boolean
}
/**
 * @author Jean-Claude Lhote
 */
export type PointsCliquablesOptions = {
  id?: string
  numeroExercice: number
  questionIndex: number
  figureId: string
  points: PointCliquableData[]
  pixelsParCm?: number
  radius?: number
  width?: number
  size?: number
  color?: string
  interactivityOn?: boolean
}

type PointCliquableSvgElement = SVGGElement & {
  pointId?: string
}

const svgNS = 'http://www.w3.org/2000/svg'
const selectedOpacity = '0.7'
const hoverOpacity = '0.5'
const hiddenOpacity = '0'

export class PointsCliquablesElement extends MathaleaCustomElement {
  static readonly elementTag = 'points-cliquables'

  private points: PointCliquableData[] = []
  private figureId = ''
  private pixelsParCm = 20
  private radius = 0.2
  private width = 2
  private size = 5
  private color = 'red'

  static create({
    id,
    numeroExercice,
    questionIndex,
    figureId,
    points,
    pixelsParCm = 20,
    radius = 0.2,
    width = 2,
    size = 5,
    color = 'red',
    interactivityOn = true,
  }: PointsCliquablesOptions): string {
    const elementHtml = super.create({
      id:
        id ??
        `${PointsCliquablesElement.elementTag}Ex${numeroExercice}Q${questionIndex}`,
      numeroExercice,
      questionIndex,
      figureId,
      points,
      pixelsParCm,
      radius,
      width,
      size,
      color,
      interactivityOn,
    })
    if (elementHtml === '') return ''
    return `${elementHtml}<span id="resultatCheckEx${numeroExercice}Q${questionIndex}"></span><div id="feedbackEx${numeroExercice}Q${questionIndex}"></div>`
  }

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    const selector = `#${PointsCliquablesElement.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`
    const element = document.querySelector(
      selector,
    ) as PointsCliquablesElement | null
    const result = element?.verify(exercice, questionIndex) ?? 'KO'
    return {
      isOk: result === 'OK',
      feedback: '',
      score: {
        nbBonnesReponses: result === 'OK' ? 1 : 0,
        nbReponses: 1,
      },
    }
  }

  static formatStudentAnswer(rawAnswer: string): string {
    const points = parsePoints(rawAnswer)
    if (points.length === 0) return 'aucun'
    const selected = points
      .filter((point) => point.etat)
      .map((point) => point.id)
    return selected.length === 0 ? 'aucun' : selected.join(' ; ')
  }

  disconnectedCallback(): void {
    this.detachListeners()
  }

  render(): string | void {
    if (!context.isHtml || context.isTypst) return this.renderLatex()
    this.hydrateAttributes()
    this.injectPoints()
  }

  get value(): string {
    return JSON.stringify(this.points)
  }

  set value(nextValue: string | PointCliquableData[]) {
    const nextPoints = parsePoints(nextValue)
    if (nextPoints.length > 0) {
      const stateById = new Map(
        nextPoints.map((point) => [point.id, point.etat]),
      )
      this.points = this.points.map((point) => ({
        ...point,
        etat: stateById.get(point.id) ?? point.etat,
      }))
      this.paintAll()
    }
  }

  verify(exercice: IExercice, questionIndex: number): 'OK' | 'KO' {
    exercice.answers ??= {}
    const expectedPoints = parsePoints(
      exercice.autoCorrection[questionIndex]?.valeur?.reponse?.value,
    )
    const expectedById = new Map(
      expectedPoints.map((point) => [point.id, point.etat]),
    )
    const isOk =
      expectedById.size > 0 &&
      this.points.every((point) => point.etat === expectedById.get(point.id))
    exercice.answers[this.id] = this.value
    this.interactivityOn = false
    const resultatCheck = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${questionIndex}`,
    )
    if (resultatCheck != null) resultatCheck.innerHTML = isOk ? '😎' : '☹️'
    return isOk ? 'OK' : 'KO'
  }

  protected onInteractivityChanged(isOn: boolean): void {
    if (!isOn) this.detachListeners()
    this.applyInteractivityState()
  }

  private hydrateAttributes(): void {
    this.figureId = this.getAttribute('figure-id') ?? ''
    this.points = parsePoints(this.getAttribute('points'))
    this.pixelsParCm = readNumberAttribute(this, 'pixels-par-cm', 20)
    this.radius = readNumberAttribute(this, 'radius', 0.2)
    this.width = readNumberAttribute(this, 'width', 2)
    this.size = readNumberAttribute(this, 'size', 5)
    this.color = this.getAttribute('color') ?? 'red'
  }

  private injectPoints(): void {
    const figure = document.getElementById(this.figureId)
    if (!(figure instanceof SVGSVGElement)) return
    for (const point of this.points) {
      const group = this.createOrUpdatePointGroup(figure, point)
      this.paintPoint(group, point.etat)
    }
    this.applyInteractivityState()
  }

  private createOrUpdatePointGroup(
    figure: SVGSVGElement,
    point: PointCliquableData,
  ): PointCliquableSvgElement {
    const pointId = this.getSvgPointId(point.id)
    const existing = figure.querySelector(
      `#${cssEscape(pointId)}`,
    ) as PointCliquableSvgElement | null
    const group = (existing ??
      document.createElementNS(svgNS, 'g')) as PointCliquableSvgElement
    group.id = pointId
    group.pointId = point.id
    group.dataset.pointsCliquablesHost = this.id
    group.replaceChildren(...this.createCross(point), this.createHitZone(point))
    if (existing == null) figure.appendChild(group)
    return group
  }

  private createCross(point: PointCliquableData): SVGLineElement[] {
    const x = this.toSvgX(point.x)
    const y = this.toSvgY(point.y)
    const size = this.size
    const first = document.createElementNS(svgNS, 'line')
    first.setAttribute('x1', String(x - size))
    first.setAttribute('y1', String(y - size))
    first.setAttribute('x2', String(x + size))
    first.setAttribute('y2', String(y + size))
    const second = document.createElementNS(svgNS, 'line')
    second.setAttribute('x1', String(x - size))
    second.setAttribute('y1', String(y + size))
    second.setAttribute('x2', String(x + size))
    second.setAttribute('y2', String(y - size))
    for (const line of [first, second]) {
      line.setAttribute('stroke', this.color)
      line.setAttribute('stroke-width', String(this.width))
      line.setAttribute('stroke-linecap', 'round')
    }
    return [first, second]
  }

  private createHitZone(point: PointCliquableData): SVGCircleElement {
    const circle = document.createElementNS(svgNS, 'circle')
    circle.setAttribute('cx', String(this.toSvgX(point.x)))
    circle.setAttribute('cy', String(this.toSvgY(point.y)))
    circle.setAttribute('r', String(this.radius * this.pixelsParCm))
    circle.setAttribute('fill', 'none')
    circle.setAttribute('pointer-events', 'visible')
    return circle
  }

  private attachListeners(): void {
    if (!this.interactivityOn) return
    this.detachListeners()
    for (const group of this.getPointGroups()) {
      group.addEventListener('mouseenter', this.onMouseEnter)
      group.addEventListener('mouseleave', this.onMouseLeave)
      group.addEventListener('click', this.onClick)
    }
  }

  private detachListeners(): void {
    for (const group of this.getPointGroups()) {
      group.removeEventListener('mouseenter', this.onMouseEnter)
      group.removeEventListener('mouseleave', this.onMouseLeave)
      group.removeEventListener('click', this.onClick)
    }
  }

  private applyInteractivityState(): void {
    for (const group of this.getPointGroups()) {
      group.style.cursor = this.interactivityOn ? 'pointer' : 'default'
      const hitZone = group.querySelector('circle')
      hitZone?.setAttribute(
        'pointer-events',
        this.interactivityOn ? 'visible' : 'none',
      )
    }
    if (this.interactivityOn) this.attachListeners()
    else this.detachListeners()
    this.paintAll()
  }

  private paintAll(): void {
    for (const point of this.points) {
      const group = document.getElementById(
        this.getSvgPointId(point.id),
      ) as PointCliquableSvgElement | null
      if (group != null) this.paintPoint(group, point.etat)
    }
  }

  private paintPoint(group: SVGElement, isSelected: boolean): void {
    group.style.opacity = isSelected ? selectedOpacity : hiddenOpacity
  }

  private getPointGroups(): PointCliquableSvgElement[] {
    return Array.from(
      document.querySelectorAll(
        `[data-points-cliquables-host="${cssEscape(this.id)}"]`,
      ),
    ) as PointCliquableSvgElement[]
  }

  private getSvgPointId(pointId: string): string {
    return `${this.id}-${pointId}`
  }

  private toSvgX(x: number): number {
    return Number((x * this.pixelsParCm).toFixed(1))
  }

  private toSvgY(y: number): number {
    return Number((-y * this.pixelsParCm).toFixed(1))
  }

  private onMouseEnter = (event: MouseEvent): void => {
    const group = event.currentTarget as PointCliquableSvgElement
    const point = this.points.find((item) => item.id === group.pointId)
    if (point?.etat) return
    group.style.opacity = hoverOpacity
  }

  private onMouseLeave = (event: MouseEvent): void => {
    const group = event.currentTarget as PointCliquableSvgElement
    const point = this.points.find((item) => item.id === group.pointId)
    if (point == null) return
    this.paintPoint(group, point.etat)
  }

  private onClick = (event: MouseEvent): void => {
    const group = event.currentTarget as PointCliquableSvgElement
    const point = this.points.find((item) => item.id === group.pointId)
    if (point == null) return
    point.etat = !point.etat
    this.paintPoint(group, point.etat)
  }
}

export function addPointsCliquables({
  numeroExercice,
  questionIndex,
  figureId,
  points,
  pixelsParCm,
  radius,
  width,
  size,
  color,
}: PointsCliquablesOptions): string {
  return PointsCliquablesElement.create({
    numeroExercice,
    questionIndex,
    figureId,
    points,
    pixelsParCm,
    radius,
    width,
    size,
    color,
  })
}

function parsePoints(value: unknown): PointCliquableData[] {
  if (typeof value === 'string') {
    if (value.trim() === '') return []
    try {
      return parsePoints(JSON.parse(value))
    } catch {
      return []
    }
  }
  if (!Array.isArray(value)) return []
  return value.filter(
    (point): point is PointCliquableData =>
      typeof point === 'object' &&
      point !== null &&
      typeof point.x === 'number' &&
      typeof point.y === 'number' &&
      typeof point.id === 'string' &&
      typeof point.etat === 'boolean',
  )
}

function readNumberAttribute(
  element: HTMLElement,
  attribute: string,
  fallback: number,
): number {
  const raw = element.getAttribute(attribute)
  if (raw == null) return fallback
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

function cssEscape(value: string): string {
  return globalThis.CSS?.escape?.(value) ?? value.replaceAll('"', '\\"')
}

registerMathaleaCustomElement(PointsCliquablesElement)
