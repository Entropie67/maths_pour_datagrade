import { context } from '../../modules/context'
import { coopmathsActionLight, coopmathsActionLightest } from '../colors'
import type { ClickFigures, IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

export type FigureClicable = HTMLElement & {
  etat: boolean
  hasMathaleaListener: boolean
}

export type CliqueFigureOptions = {
  id?: string
  numeroExercice: number
  questionIndex: number
  figures: ClickFigures
  interactivityOn?: boolean
}

type CliqueFigureVerificationResult = {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
}

const figureLabels = new WeakMap<FigureClicable, string>()
/**
 * @author Jean-Claude Lhote
 */
export class CliqueFigureElement extends MathaleaCustomElement {
  static readonly elementTag = 'clique-figure'

  private figures: FigureClicable[] = []

  static create({
    id,
    numeroExercice,
    questionIndex,
    figures,
    interactivityOn = true,
  }: CliqueFigureOptions): string {
    return super.create({
      id:
        id ??
        `${CliqueFigureElement.elementTag}Ex${numeroExercice}Q${questionIndex}`,
      numeroExercice,
      questionIndex,
      figures,
      interactivityOn,
    })
  }

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): CliqueFigureVerificationResult {
    if ('callback' in exercice && typeof exercice.callback === 'function') {
      ;(exercice.callback as (exercice: IExercice, i: number) => void)(
        exercice,
        questionIndex,
      )
    }
    let element = document.querySelector(
      `#${CliqueFigureElement.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`,
    ) as CliqueFigureElement | null
    if (element == null) {
      addCliqueFigureElementToQuestion(exercice, questionIndex)
      element = document.querySelector(
        `#${CliqueFigureElement.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`,
      ) as CliqueFigureElement | null
    }

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
    const value = parseCliqueFigureValue(rawAnswer)
    if (value == null) return rawAnswer
    if (value.length === 0) return 'aucune'
    return value.join(' ; ')
  }

  connectedCallback(): void {
    super.connectedCallback()
  }

  disconnectedCallback(): void {
    this.detachListeners()
  }

  render(): string | void {
    if (!context.isHtml || context.isTypst) return this.renderLatex()
    this.figures = this.getConfiguredFigures().sort(documentPositionComparator)
    this.figures.forEach((figure, index) => {
      prepareFigureAccessibility(figure, index)
      this.prepareFigure(figure)
      figure.setAttribute('aria-disabled', String(!this.interactivityOn))
      figure.setAttribute('tabindex', this.interactivityOn ? '0' : '-1')
    })
  }

  get value(): string {
    return JSON.stringify(this.getSelectedFigureIds())
  }

  set value(nextValue: string | string[]) {
    this.update(nextValue)
  }

  update(nextValue: string | string[]): void {
    const selectedIds = new Set(parseCliqueFigureValue(nextValue) ?? [])
    this.figures = this.getConfiguredFigures()
    this.figures.forEach((figure) => {
      figure.etat = selectedIds.has(figure.id)
      this.paintFigure(figure)
    })
  }

  protected onInteractivityChanged(isOn: boolean): void {
    if (isOn) {
      this.render()
      return
    }
    this.detachListeners()
  }

  verify(exercice: IExercice, questionIndex: number): 'OK' | 'KO' {
    exercice.answers ??= {}
    const feedback = this.ensureResultElement(exercice, questionIndex)
    feedback.innerHTML = ''
    feedback.style.marginBottom = '20px'

    let hasError = false
    let selectedCount = 0
    const figures = this.getConfiguredObjects(exercice, questionIndex)

    for (const figureConfig of figures) {
      const figure = document.getElementById(
        figureConfig.id,
      ) as FigureClicable | null
      if (figure == null) continue
      if (figure.etat) {
        selectedCount++
        exercice.answers[figureConfig.id] = '1'
      }
      if (figure.etat !== figureConfig.solution) hasError = true
    }

    exercice.answers[this.id] = this.value
    this.interactivityOn = false

    const result = selectedCount > 0 && !hasError ? 'OK' : 'KO'
    feedback.innerHTML = result === 'OK' ? '😎' : '☹️'
    feedback.setAttribute(
      'aria-label',
      result === 'OK' ? 'Bonne réponse.' : 'Réponse incorrecte.',
    )
    feedback.style.fontSize = 'large'
    return result
  }

  private prepareFigure(figure: FigureClicable): void {
    if (!this.interactivityOn) return
    if (figure.hasMathaleaListener) return
    figure.addEventListener('mouseenter', mouseOverSvgEffect)
    figure.addEventListener('mouseleave', mouseOutSvgEffect)
    figure.addEventListener('click', mouseSvgClick)
    figure.addEventListener('keydown', keyboardSvgToggle)
    figure.style.cursor = 'pointer'
    if (figure.etat !== true) figure.etat = false
    figure.setAttribute('aria-checked', String(figure.etat))
    figure.hasMathaleaListener = true
  }

  private detachListeners(): void {
    for (const figure of this.getConfiguredFigures()) {
      figure.removeEventListener('mouseenter', mouseOverSvgEffect)
      figure.removeEventListener('mouseleave', mouseOutSvgEffect)
      figure.removeEventListener('click', mouseSvgClick)
      figure.removeEventListener('keydown', keyboardSvgToggle)
      figure.setAttribute('aria-disabled', 'true')
      figure.setAttribute('tabindex', '-1')
      figure.style.cursor = ''
      figure.style.filter = ''
      figure.hasMathaleaListener = false
    }
  }

  private getSelectedFigureIds(): string[] {
    return this.getConfiguredFigures()
      .filter((figure) => figure.etat)
      .map((figure) => figure.id)
  }

  private getConfiguredFigures(): FigureClicable[] {
    return this.getConfiguredObjects().flatMap((figure) => {
      const element = document.getElementById(figure.id)
      return element == null ? [] : [element as FigureClicable]
    })
  }

  private getConfiguredObjects(
    exercice?: IExercice,
    questionIndex?: number,
  ): ClickFigures {
    if (
      exercice?.cliqueFiguresArray != null &&
      questionIndex != null &&
      Array.isArray(exercice.cliqueFiguresArray[questionIndex])
    ) {
      return exercice.cliqueFiguresArray[questionIndex]
    }
    return parseFigures(this.getAttribute('figures'))
  }

  private ensureResultElement(
    exercice: IExercice,
    questionIndex: number,
  ): HTMLElement {
    const id = `resultatCheckEx${exercice.numeroExercice}Q${questionIndex}`
    const existing = document.getElementById(id)
    if (existing != null) return existing

    const container = document.getElementById(
      `exercice${exercice.numeroExercice}`,
    )
    const feedback = document.createElement('div')
    feedback.id = id
    container?.appendChild(feedback)
    return feedback
  }

  private paintFigure(figure: FigureClicable): void {
    figure.style.filter = ''
    paintFigureOutline(figure, figure.etat ? coopmathsActionLight : null)
  }
}

export function addCliqueFigure(
  exercice: IExercice,
  questionIndex: number,
  options: Partial<
    Omit<CliqueFigureOptions, 'numeroExercice' | 'questionIndex'>
  > = {},
): string {
  if (!context.isHtml) return ''
  const figures =
    options.figures ?? exercice.cliqueFiguresArray?.[questionIndex] ?? []
  exercice.autoCorrection[questionIndex] ??= {}
  exercice.autoCorrection[questionIndex].formatInteractif =
    CliqueFigureElement.elementTag
  return CliqueFigureElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
    figures,
  })
}

export function prepareCliqueFigure(exercice: IExercice): void {
  for (let i = 0; i < exercice.nbQuestions; i++) {
    const selector = `#${CliqueFigureElement.elementTag}Ex${exercice.numeroExercice}Q${i}`
    if (document.querySelector(selector) != null) continue
    addCliqueFigureElementToQuestion(exercice, i)
  }
}

export function addCliqueFigureElementToQuestion(
  exercice: IExercice,
  questionIndex: number,
): void {
  const figures = exercice.cliqueFiguresArray?.[questionIndex]
  if (!Array.isArray(figures)) return
  // La préparation peut précéder l'insertion de l'énoncé dans le DOM.
  // Ne pas créer un hôte orphelin qui masquerait ensuite le vrai composant.
  const firstFigure = figures
    .map((figure) => document.getElementById(figure.id))
    .find((figure) => figure != null)
  if (firstFigure == null) return
  const host = document.createElement(CliqueFigureElement.elementTag)
  host.id = `${CliqueFigureElement.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`
  host.setAttribute('numero-exercice', String(exercice.numeroExercice ?? 0))
  host.setAttribute('question-index', String(questionIndex))
  host.setAttribute('figures', JSON.stringify(figures))
  document
    .getElementById(
      `resultatCheckEx${exercice.numeroExercice}Q${questionIndex}`,
    )
    ?.before(host)
  if (!host.isConnected) firstFigure.after(host)
}

export function questionCliqueFigure(figSvg: FigureClicable, index = 0): void {
  if (figSvg.hasMathaleaListener) return
  figSvg.etat = false
  prepareFigureAccessibility(figSvg, index)
  figSvg.addEventListener('mouseenter', mouseOverSvgEffect)
  figSvg.addEventListener('mouseleave', mouseOutSvgEffect)
  figSvg.addEventListener('click', mouseSvgClick)
  figSvg.addEventListener('keydown', keyboardSvgToggle)
  figSvg.hasMathaleaListener = true
}

function prepareFigureAccessibility(figure: FigureClicable, index: number) {
  if (!figureLabels.has(figure)) {
    figureLabels.set(figure, figure.getAttribute('aria-label') ?? '')
  }
  const description = figureLabels.get(figure)
  figure.setAttribute('data-clique-figure', '')
  figure.setAttribute('role', 'checkbox')
  figure.setAttribute('tabindex', '0')
  figure.setAttribute('aria-disabled', 'false')
  figure.setAttribute('aria-checked', String(figure.etat === true))
  figure.setAttribute(
    'aria-label',
    `Figure ${index + 1}.${description ? ` ${description}` : ''}`,
  )
}

function keyboardSvgToggle(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  if (event.repeat) return
  // Suivre le même chemin que la souris, y compris les écouteurs des vues CAN.
  ;(event.currentTarget as FigureClicable).dispatchEvent(
    new MouseEvent('click', { bubbles: true }),
  )
}

export function indexQuestionCliqueFigure(exercice: IExercice, i: number) {
  const elementArray = (exercice.cliqueFiguresArray?.[i] ?? [])
    .map((figure) => document.getElementById(figure.id))
    .filter((elt): elt is HTMLElement => elt !== null)

  const figs = elementArray.sort(documentPositionComparator)
  const numbs = []
  for (let j = 0; j < figs.length; j++) {
    if ((figs[j] as FigureClicable).etat) numbs.push((j + 1).toString())
  }
  return numbs.join(';')
}

export function verifQuestionCliqueFigure(
  exercice: IExercice,
  i: number,
): 'OK' | 'KO' {
  const selector = `#${CliqueFigureElement.elementTag}Ex${exercice.numeroExercice}Q${i}`
  let element = document.querySelector(selector) as CliqueFigureElement | null
  if (element == null) {
    addCliqueFigureElementToQuestion(exercice, i)
    element = document.querySelector(selector) as CliqueFigureElement | null
  }
  return element?.verify(exercice, i) ?? 'KO'
}

function mouseOverSvgEffect(event: MouseEvent) {
  const elt = event.currentTarget as FigureClicable
  if (!elt.etat)
    elt.style.filter = `drop-shadow(0 0 2px ${coopmathsActionLightest})`
}

function mouseOutSvgEffect(event: MouseEvent) {
  const elt = event.currentTarget as FigureClicable
  elt.style.filter = ''
}

function mouseSvgClick(event: MouseEvent) {
  toggleFigure(event.currentTarget as FigureClicable)
}

function toggleFigure(elt: FigureClicable) {
  if (elt.etat) {
    elt.etat = false
    paintFigureOutline(elt, null)
    elt.style.filter = `drop-shadow(0 0 2px ${coopmathsActionLightest})`
    elt.addEventListener('mouseenter', mouseOverSvgEffect)
    elt.addEventListener('mouseleave', mouseOutSvgEffect)
  } else {
    elt.etat = true
    elt.removeEventListener('mouseenter', mouseOverSvgEffect)
    elt.removeEventListener('mouseleave', mouseOutSvgEffect)
    paintFigureOutline(elt, coopmathsActionLight)
    elt.style.filter = ''
  }
}

function paintFigureOutline(figure: FigureClicable, color: string | null) {
  figure.setAttribute('aria-checked', String(figure.etat === true))
  figure.style.outline = color == null ? 'none' : `3px solid ${color}`
  figure.style.outlineOffset = '-3px'
}

function parseFigures(value: string | null): ClickFigures {
  if (value == null || value === '') return []
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (figure): figure is ClickFigures[number] =>
        typeof figure === 'object' &&
        figure != null &&
        typeof figure.id === 'string' &&
        typeof figure.solution === 'boolean',
    )
  } catch {
    return []
  }
}

function parseCliqueFigureValue(value: unknown): string[] | null {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }
  if (typeof value !== 'string') return null
  if (value.trim() === '') return []
  try {
    const parsed = JSON.parse(value)
    return parseCliqueFigureValue(parsed)
  } catch {
    return null
  }
}

function documentPositionComparator(
  a: HTMLElement,
  b: HTMLElement,
): 0 | 1 | -1 {
  if (a === b) return 0
  const position = a.compareDocumentPosition(b) as number

  if (
    position & Node.DOCUMENT_POSITION_FOLLOWING ||
    position & Node.DOCUMENT_POSITION_CONTAINED_BY
  ) {
    return -1
  }
  if (
    position & Node.DOCUMENT_POSITION_PRECEDING ||
    position & Node.DOCUMENT_POSITION_CONTAINS
  ) {
    return 1
  }
  return 0
}

registerMathaleaCustomElement(CliqueFigureElement)
