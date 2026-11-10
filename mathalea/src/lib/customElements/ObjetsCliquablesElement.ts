import { context } from '../../modules/context'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

type SvgPoint = { x: number; y: number }

type ObjetCliquableBase = {
  id: string
  etat: boolean
}

export type PointObjetCliquableData = ObjetCliquableBase & {
  type: 'point'
  x: number
  y: number
}

export type SegmentObjetCliquableData = ObjetCliquableBase & {
  type: 'segment' | 'droite'
  x1: number
  y1: number
  x2: number
  y2: number
}

export type CercleObjetCliquableData = ObjetCliquableBase & {
  type: 'cercle'
  x: number
  y: number
  r: number
}

export type PolygoneObjetCliquableData = ObjetCliquableBase & {
  type: 'polygone'
  points: SvgPoint[]
}

export type PolylineObjetCliquableData = ObjetCliquableBase & {
  type: 'polyline'
  points: SvgPoint[]
}

export type ObjetCliquableData =
  | PointObjetCliquableData
  | SegmentObjetCliquableData
  | CercleObjetCliquableData
  | PolygoneObjetCliquableData
  | PolylineObjetCliquableData

export type ObjetsCliquablesVerificationResult = {
  isOk: boolean
  feedback?: string
  score?: { nbBonnesReponses: number; nbReponses: number }
}

export type ObjetsCliquablesVerificationContext = {
  exercice: IExercice
  questionIndex: number
  element: ObjetsCliquablesElement
  expectedObjects: ObjetCliquableData[]
  studentObjects: ObjetCliquableData[]
}

export type ObjetsCliquablesVerificationCallback = (
  context: ObjetsCliquablesVerificationContext,
) => ObjetsCliquablesVerificationResult

export type ObjetsCliquablesOptions = {
  id?: string
  figureId: string
  objets: ObjetCliquableData[]
  pixelsParCm?: number
  hitWidth?: number
  pointRadius?: number
  selectedWidth?: number
  selectedColor?: string
  hoverColor?: string
  interactivityOn?: boolean
  verifyCallbackName?: string
  verifyCallback?: ObjetsCliquablesVerificationCallback
}

type ObjetsCliquablesCreateOptions = ObjetsCliquablesOptions & {
  numeroExercice: number
  questionIndex: number
}

type ObjetCliquableSvgElement = SVGGElement & {
  objetCliquableId?: string
}

const svgNS = 'http://www.w3.org/2000/svg'
const hiddenOpacity = '0'
const hoverOpacity = '0.45'
const selectedOpacity = '0.75'
/**
 * @author Jean-Claude Lhote
 */
export class ObjetsCliquablesElement extends MathaleaCustomElement {
  static readonly elementTag = 'objets-cliquables'
  private static readonly verificationCallbacks = new Map<
    string,
    ObjetsCliquablesVerificationCallback
  >()

  private figureId = ''
  private objets: ObjetCliquableData[] = []
  private pixelsParCm = 20
  private hitWidth = 12
  private pointRadius = 0.2
  private selectedWidth = 4
  private selectedColor = '#f15929'
  private hoverColor = '#1DA962'

  static create({
    id,
    numeroExercice,
    questionIndex,
    figureId,
    objets,
    pixelsParCm = 20,
    hitWidth = 12,
    pointRadius = 0.2,
    selectedWidth = 4,
    selectedColor = '#f15929',
    hoverColor = '#1DA962',
    interactivityOn = true,
    verifyCallbackName,
    verifyCallback,
  }: ObjetsCliquablesCreateOptions): string {
    const computedId =
      id ??
      `${ObjetsCliquablesElement.elementTag}Ex${numeroExercice}Q${questionIndex}`
    const computedCallbackName =
      verifyCallbackName ??
      (verifyCallback == null ? undefined : `${computedId}-verification`)
    if (verifyCallback != null && computedCallbackName != null) {
      ObjetsCliquablesElement.registerVerificationCallback(
        computedCallbackName,
        verifyCallback,
      )
    }
    const elementHtml = super.create({
      id: computedId,
      numeroExercice,
      questionIndex,
      figureId,
      objets,
      pixelsParCm,
      hitWidth,
      pointRadius,
      selectedWidth,
      selectedColor,
      hoverColor,
      interactivityOn,
      verifyCallbackName: computedCallbackName,
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
    const element = document.querySelector(
      `#${ObjetsCliquablesElement.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`,
    ) as ObjetsCliquablesElement | null
    if (element == null) {
      return {
        isOk: false,
        feedback: 'Élément objets-cliquables introuvable.',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }
    return element.verify(exercice, questionIndex)
  }

  static formatStudentAnswer(rawAnswer: string): string {
    const objets = parseObjets(rawAnswer)
    const selectedIds = objets
      .filter((objet) => objet.etat)
      .map((objet) => objet.id)
    return selectedIds.length === 0 ? 'aucun' : selectedIds.join(' ; ')
  }

  static registerVerificationCallback(
    name: string,
    callback: ObjetsCliquablesVerificationCallback,
  ): void {
    if (name.trim().length === 0) {
      throw new Error(
        'Le nom du vérificateur objets-cliquables ne peut pas être vide',
      )
    }
    ObjetsCliquablesElement.verificationCallbacks.set(name, callback)
  }

  static unregisterVerificationCallback(name: string): void {
    ObjetsCliquablesElement.verificationCallbacks.delete(name)
  }

  disconnectedCallback(): void {
    this.detachListeners()
  }

  render(): string | void {
    if (!context.isHtml || context.isTypst) return this.renderLatex()
    this.hydrateAttributes()
    this.injectObjets()
  }

  get value(): string {
    return JSON.stringify(this.objets)
  }

  set value(nextValue: string | ObjetCliquableData[]) {
    this.update(nextValue)
  }

  update(nextValue: string | ObjetCliquableData[]): void {
    const nextObjets = parseObjets(nextValue)
    if (nextObjets.length === 0) return
    const stateById = new Map(nextObjets.map((objet) => [objet.id, objet.etat]))
    this.objets = this.objets.map((objet) => ({
      ...objet,
      etat: stateById.get(objet.id) ?? objet.etat,
    }))
    this.paintAll()
  }

  verify(
    exercice: IExercice,
    questionIndex: number,
  ): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    exercice.answers ??= {}
    const expectedObjects = parseObjets(
      exercice.autoCorrection[questionIndex]?.valeur?.reponse?.value,
    )
    const callbackName = this.getAttribute('verify-callback-name')
    const callback =
      callbackName == null
        ? null
        : ObjetsCliquablesElement.verificationCallbacks.get(callbackName)
    const result =
      callback == null
        ? this.defaultVerify(expectedObjects)
        : this.normalizeCallbackResult(
            callback({
              exercice,
              questionIndex,
              element: this,
              expectedObjects,
              studentObjects: this.objets,
            }),
          )
    exercice.answers[this.id] = this.value
    this.interactivityOn = false
    this.displayResult(exercice, questionIndex, result)
    return result
  }

  protected onInteractivityChanged(isOn: boolean): void {
    if (!isOn) this.detachListeners()
    this.applyInteractivityState()
  }

  private hydrateAttributes(): void {
    this.figureId = this.getAttribute('figure-id') ?? ''
    this.objets = parseObjets(this.getAttribute('objets'))
    this.pixelsParCm = readNumberAttribute(this, 'pixels-par-cm', 20)
    this.hitWidth = readNumberAttribute(this, 'hit-width', 12)
    this.pointRadius = readNumberAttribute(this, 'point-radius', 0.2)
    this.selectedWidth = readNumberAttribute(this, 'selected-width', 4)
    this.selectedColor = this.getAttribute('selected-color') ?? '#f15929'
    this.hoverColor = this.getAttribute('hover-color') ?? '#1DA962'
  }

  private injectObjets(): void {
    const figure = document.getElementById(this.figureId)
    if (!(figure instanceof SVGSVGElement)) return
    for (const objet of this.objets) {
      const group = this.createOrUpdateObjetGroup(figure, objet)
      this.paintObjet(group, objet.etat)
    }
    this.applyInteractivityState()
  }

  private createOrUpdateObjetGroup(
    figure: SVGSVGElement,
    objet: ObjetCliquableData,
  ): ObjetCliquableSvgElement {
    const svgId = this.getSvgObjetId(objet.id)
    const existing = figure.querySelector(
      `#${cssEscape(svgId)}`,
    ) as ObjetCliquableSvgElement | null
    const group = (existing ??
      document.createElementNS(svgNS, 'g')) as ObjetCliquableSvgElement
    group.id = svgId
    group.objetCliquableId = objet.id
    group.dataset.objetsCliquablesHost = this.id
    group.replaceChildren(
      this.createSelectionShape(figure, objet),
      this.createHitZone(figure, objet),
    )
    if (existing == null) figure.appendChild(group)
    return group
  }

  private createSelectionShape(
    figure: SVGSVGElement,
    objet: ObjetCliquableData,
  ): SVGElement {
    const shape = this.createShape(figure, objet)
    shape.classList.add('objet-cliquable-selection')
    this.styleShape(shape, {
      stroke: this.selectedColor,
      strokeWidth: this.selectedWidth,
      fill: objet.type === 'polygone' ? this.selectedColor : 'none',
      fillOpacity: objet.type === 'polygone' ? '0.15' : '0',
    })
    return shape
  }

  private createHitZone(
    figure: SVGSVGElement,
    objet: ObjetCliquableData,
  ): SVGElement {
    const hitZone = this.createShape(figure, objet)
    hitZone.classList.add('objet-cliquable-hit-zone')
    this.styleShape(hitZone, {
      stroke: 'transparent',
      strokeWidth: this.hitWidth,
      fill: objet.type === 'polygone' ? 'transparent' : 'none',
      fillOpacity: '0',
    })
    hitZone.setAttribute(
      'pointer-events',
      objet.type === 'polygone' ? 'all' : 'stroke',
    )
    return hitZone
  }

  private createShape(
    figure: SVGSVGElement,
    objet: ObjetCliquableData,
  ): SVGElement {
    switch (objet.type) {
      case 'point':
        return this.createCircleShape(objet.x, objet.y, this.pointRadius)
      case 'segment':
        return this.createLineShape(objet.x1, objet.y1, objet.x2, objet.y2)
      case 'droite':
        return this.createLineShape(...this.clipLineToFigure(figure, objet))
      case 'cercle':
        return this.createCircleShape(objet.x, objet.y, objet.r)
      case 'polygone':
        return this.createPolygonShape(objet.points)
      case 'polyline':
        return this.createPolylineShape(objet.points)
    }
  }

  private createLineShape(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): SVGLineElement {
    const line = document.createElementNS(svgNS, 'line')
    line.setAttribute('x1', String(this.toSvgX(x1)))
    line.setAttribute('y1', String(this.toSvgY(y1)))
    line.setAttribute('x2', String(this.toSvgX(x2)))
    line.setAttribute('y2', String(this.toSvgY(y2)))
    line.setAttribute('stroke-linecap', 'round')
    return line
  }

  private createCircleShape(
    x: number,
    y: number,
    radius: number,
  ): SVGCircleElement {
    const circle = document.createElementNS(svgNS, 'circle')
    circle.setAttribute('cx', String(this.toSvgX(x)))
    circle.setAttribute('cy', String(this.toSvgY(y)))
    circle.setAttribute('r', String(radius * this.pixelsParCm))
    return circle
  }

  private createPolygonShape(points: SvgPoint[]): SVGPolygonElement {
    const polygon = document.createElementNS(svgNS, 'polygon')
    polygon.setAttribute(
      'points',
      points
        .map((point) => `${this.toSvgX(point.x)},${this.toSvgY(point.y)}`)
        .join(' '),
    )
    polygon.setAttribute('stroke-linejoin', 'round')
    return polygon
  }

  private createPolylineShape(points: SvgPoint[]): SVGPolylineElement {
    const polyline = document.createElementNS(svgNS, 'polyline')
    polyline.setAttribute(
      'points',
      points
        .map((point) => `${this.toSvgX(point.x)},${this.toSvgY(point.y)}`)
        .join(' '),
    )
    polyline.setAttribute('stroke-linejoin', 'round')
    polyline.setAttribute('stroke-linecap', 'round')
    return polyline
  }

  private styleShape(
    shape: SVGElement,
    {
      stroke,
      strokeWidth,
      fill,
      fillOpacity,
    }: {
      stroke: string
      strokeWidth: number
      fill: string
      fillOpacity: string
    },
  ): void {
    shape.setAttribute('stroke', stroke)
    shape.setAttribute('stroke-width', String(strokeWidth))
    shape.setAttribute('fill', fill)
    shape.setAttribute('fill-opacity', fillOpacity)
  }

  private attachListeners(): void {
    if (!this.interactivityOn) return
    this.detachListeners()
    for (const group of this.getObjetGroups()) {
      group.addEventListener('mouseenter', this.onMouseEnter)
      group.addEventListener('mouseleave', this.onMouseLeave)
      group.addEventListener('click', this.onClick)
    }
  }

  private detachListeners(): void {
    for (const group of this.getObjetGroups()) {
      group.removeEventListener('mouseenter', this.onMouseEnter)
      group.removeEventListener('mouseleave', this.onMouseLeave)
      group.removeEventListener('click', this.onClick)
    }
  }

  private applyInteractivityState(): void {
    for (const group of this.getObjetGroups()) {
      group.style.cursor = this.interactivityOn ? 'pointer' : 'default'
      const hitZone = group.querySelector('.objet-cliquable-hit-zone')
      hitZone?.setAttribute(
        'pointer-events',
        this.interactivityOn
          ? hitZone.tagName.toLowerCase() === 'polygon'
            ? 'all'
            : 'stroke'
          : 'none',
      )
    }
    if (this.interactivityOn) this.attachListeners()
    else this.detachListeners()
    this.paintAll()
  }

  private paintAll(): void {
    for (const objet of this.objets) {
      const group = document.getElementById(
        this.getSvgObjetId(objet.id),
      ) as ObjetCliquableSvgElement | null
      if (group != null) this.paintObjet(group, objet.etat)
    }
  }

  private paintObjet(group: SVGElement, isSelected: boolean): void {
    const shape = group.querySelector<SVGElement>('.objet-cliquable-selection')
    if (shape == null) return
    shape.style.opacity = isSelected ? selectedOpacity : hiddenOpacity
    shape.setAttribute('stroke', this.selectedColor)
    if (shape.tagName.toLowerCase() === 'polygon') {
      shape.setAttribute('fill', this.selectedColor)
    }
  }

  private paintHover(group: SVGElement): void {
    const shape = group.querySelector<SVGElement>('.objet-cliquable-selection')
    if (shape == null) return
    shape.style.opacity = hoverOpacity
    shape.setAttribute('stroke', this.hoverColor)
    if (shape.tagName.toLowerCase() === 'polygon') {
      shape.setAttribute('fill', this.hoverColor)
    }
  }

  private getObjetGroups(): ObjetCliquableSvgElement[] {
    return Array.from(
      document.querySelectorAll(
        `[data-objets-cliquables-host="${cssEscape(this.id)}"]`,
      ),
    ) as ObjetCliquableSvgElement[]
  }

  private getSvgObjetId(objetId: string): string {
    return `${this.id}-${objetId}`
  }

  private toSvgX(x: number): number {
    return Number((x * this.pixelsParCm).toFixed(1))
  }

  private toSvgY(y: number): number {
    return Number((-y * this.pixelsParCm).toFixed(1))
  }

  private clipLineToFigure(
    figure: SVGSVGElement,
    objet: SegmentObjetCliquableData,
  ): [number, number, number, number] {
    const viewBox = figure.viewBox.baseVal
    if (viewBox.width === 0 || viewBox.height === 0) {
      return [objet.x1, objet.y1, objet.x2, objet.y2]
    }
    const p1 = { x: this.toSvgX(objet.x1), y: this.toSvgY(objet.y1) }
    const p2 = { x: this.toSvgX(objet.x2), y: this.toSvgY(objet.y2) }
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    if (dx === 0 && dy === 0) return [objet.x1, objet.y1, objet.x2, objet.y2]
    const xMin = viewBox.x
    const xMax = viewBox.x + viewBox.width
    const yMin = viewBox.y
    const yMax = viewBox.y + viewBox.height
    const intersections: SvgPoint[] = []
    const pushIfInside = (point: SvgPoint) => {
      if (
        point.x >= xMin - 0.1 &&
        point.x <= xMax + 0.1 &&
        point.y >= yMin - 0.1 &&
        point.y <= yMax + 0.1 &&
        !intersections.some(
          (existing) =>
            Math.abs(existing.x - point.x) < 0.1 &&
            Math.abs(existing.y - point.y) < 0.1,
        )
      ) {
        intersections.push(point)
      }
    }
    if (dx !== 0) {
      const tLeft = (xMin - p1.x) / dx
      pushIfInside({ x: xMin, y: p1.y + tLeft * dy })
      const tRight = (xMax - p1.x) / dx
      pushIfInside({ x: xMax, y: p1.y + tRight * dy })
    }
    if (dy !== 0) {
      const tTop = (yMin - p1.y) / dy
      pushIfInside({ x: p1.x + tTop * dx, y: yMin })
      const tBottom = (yMax - p1.y) / dy
      pushIfInside({ x: p1.x + tBottom * dx, y: yMax })
    }
    if (intersections.length < 2)
      return [objet.x1, objet.y1, objet.x2, objet.y2]
    return [
      intersections[0].x / this.pixelsParCm,
      -intersections[0].y / this.pixelsParCm,
      intersections[1].x / this.pixelsParCm,
      -intersections[1].y / this.pixelsParCm,
    ]
  }

  private defaultVerify(expectedObjects: ObjetCliquableData[]): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    const expectedById = new Map(
      expectedObjects.map((objet) => [objet.id, objet.etat]),
    )
    const isOk =
      expectedById.size > 0 &&
      this.objets.every((objet) => objet.etat === expectedById.get(objet.id))
    return {
      isOk,
      feedback: '',
      score: { nbBonnesReponses: isOk ? 1 : 0, nbReponses: 1 },
    }
  }

  private normalizeCallbackResult(
    result: ObjetsCliquablesVerificationResult | null | undefined,
  ): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    const isOk = result?.isOk === true
    return {
      isOk,
      feedback: result?.feedback ?? '',
      score: result?.score ?? {
        nbBonnesReponses: isOk ? 1 : 0,
        nbReponses: 1,
      },
    }
  }

  private displayResult(
    exercice: IExercice,
    questionIndex: number,
    result: {
      isOk: boolean
      feedback: string
      score: { nbBonnesReponses: number; nbReponses: number }
    },
  ): void {
    const resultatCheck = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${questionIndex}`,
    )
    if (resultatCheck != null) {
      resultatCheck.innerHTML = result.isOk ? '😎' : '☹️'
    }
    const feedback = document.querySelector<HTMLElement>(
      `#feedbackEx${exercice.numeroExercice}Q${questionIndex}`,
    )
    if (feedback != null) {
      feedback.innerHTML = result.feedback
      feedback.style.display = result.feedback === '' ? 'none' : 'block'
    }
  }

  private onMouseEnter = (event: MouseEvent): void => {
    const group = event.currentTarget as ObjetCliquableSvgElement
    const objet = this.objets.find((item) => item.id === group.objetCliquableId)
    if (objet?.etat) return
    this.paintHover(group)
  }

  private onMouseLeave = (event: MouseEvent): void => {
    const group = event.currentTarget as ObjetCliquableSvgElement
    const objet = this.objets.find((item) => item.id === group.objetCliquableId)
    if (objet == null) return
    this.paintObjet(group, objet.etat)
  }

  private onClick = (event: MouseEvent): void => {
    const group = event.currentTarget as ObjetCliquableSvgElement
    const objet = this.objets.find((item) => item.id === group.objetCliquableId)
    if (objet == null) return
    objet.etat = !objet.etat
    this.paintObjet(group, objet.etat)
  }
}

export function addObjetsCliquables(
  exercice: IExercice,
  questionIndex: number,
  options: ObjetsCliquablesOptions,
): string {
  return ObjetsCliquablesElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
  })
}

function parseObjets(value: unknown): ObjetCliquableData[] {
  if (typeof value === 'string') {
    if (value.trim() === '') return []
    try {
      return parseObjets(JSON.parse(value))
    } catch {
      return []
    }
  }
  if (!Array.isArray(value)) return []
  return value.filter(isObjetCliquableData)
}

function isObjetCliquableData(value: unknown): value is ObjetCliquableData {
  if (typeof value !== 'object' || value == null) return false
  const item = value as Partial<ObjetCliquableData>
  if (typeof item.id !== 'string' || typeof item.etat !== 'boolean')
    return false
  switch (item.type) {
    case 'point':
      return typeof item.x === 'number' && typeof item.y === 'number'
    case 'segment':
    case 'droite':
      return (
        typeof item.x1 === 'number' &&
        typeof item.y1 === 'number' &&
        typeof item.x2 === 'number' &&
        typeof item.y2 === 'number'
      )
    case 'cercle':
      return (
        typeof item.x === 'number' &&
        typeof item.y === 'number' &&
        typeof item.r === 'number'
      )
    case 'polygone':
    case 'polyline':
      return (
        Array.isArray(item.points) &&
        item.points.every(
          (point) =>
            typeof point === 'object' &&
            point !== null &&
            typeof point.x === 'number' &&
            typeof point.y === 'number',
        )
      )
    default:
      return false
  }
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

registerMathaleaCustomElement(ObjetsCliquablesElement)
