import Hms from '../../modules/Hms'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import Horloge from '../2d/horloge'
import { orangeMathalea } from '../colors'
import { uniformiseResults } from '../interactif/gestionInteractif'
import { formatMinute } from '../outils/texNombre'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'
export type ClockDataOptions = {
  hour?: number
  minute?: number
  second?: number
  interactivityOn?: boolean
  showHands?: boolean
  showSecond?: boolean
  id?: string
}

export type InteractiveClockCreateOptions = ClockDataOptions & {
  numeroExercice?: number
  questionIndex?: number
}

type ClockValueInput =
  | string
  | {
      hour?: number
      minute?: number
      second?: number
    }

function formatNumber(value: number): string {
  return Number.isFinite(value) ? String(Number(value.toFixed(4))) : '0'
}

function typstStringLiteral(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}
/**
 * Horloge interactive
 * @author Rémi Angot
 * Refactorisé par Jean-Claude Lhote pour suivre le modèle MathaleaCustomElement + quelques ajustements
 * @attr {number} hour - L'heure initiale de l'horloge (0-12)
 * @attr {number} minute - La minute initiale de l'horloge (0-59)
 * @attr {number} [second=0] - La seconde initiale de l'horloge (0-59)
 * @attr {boolean} [interactivityOn=true] - Indique si l'horloge est interactive
 * @attr {boolean} [showHands=true] - Indique si les aiguilles de l'horloge doivent être affichées
 * @attr {boolean} [showSecond=true] - Indique si l'aiguille des secondes doit être affichée
 */
export class InteractiveClock extends MathaleaCustomElement {
  static readonly elementTag = 'interactive-clock'

  /** La valeur stockée est un JSON `{hour, minute, second}` : on affiche « h h m ». */
  static formatStudentAnswer(rawAnswer: string): string {
    try {
      const { hour, minute } = JSON.parse(rawAnswer) as {
        hour: number
        minute: number
      }
      return `$${hour}$ h $${minute}$`
    } catch {
      return rawAnswer
    }
  }

  /** L'horloge interactive ne doit pas apparaître dans la liste des corrections. */
  static stripFromQuestionHtml(questionHtml: string): string {
    return questionHtml
      .replace(/<interactive-clock[^>]*\/>/g, '')
      .replace(/<interactive-clock[^>]*>[^]*?<\/interactive-clock>/g, '')
  }

  static readonly BASE_RENDER_SIZE_EM = 12.5
  svgHandHour!: SVGElement
  svgHandMinute!: SVGElement
  svgHandSecond!: SVGElement
  radius = 200
  showHands = true
  showSecond = false
  draggingHand: boolean
  previousMinute = 0
  previousSecond = 0
  private previousHour = 12
  private _currentAction?: 'hour' | 'minute' | 'second'
  private _svgElement?: SVGSVGElement
  private _preventDefaultHandler?: (event: PointerEvent | TouchEvent) => void
  private _pointerDownHandler?: (event: PointerEvent | TouchEvent) => void
  private _pointerUpHandler?: () => void
  private _pointerMoveHandler?: (event: PointerEvent) => void
  private _touchStartHandler?: (event: TouchEvent) => void
  private _touchEndHandler?: () => void
  private _touchMoveHandler?: (event: TouchEvent) => void
  private _hourPointerDownHandler?: (event: PointerEvent) => void
  private _hourPointerUpHandler?: () => void
  private _minutePointerDownHandler?: (event: PointerEvent) => void
  private _minutePointerUpHandler?: () => void
  private _secondPointerDownHandler?: (event: PointerEvent) => void
  private _secondPointerUpHandler?: () => void

  constructor() {
    super()
    this.hour = this.getAttribute('hour')
      ? Number(this.getAttribute('hour'))
      : 12
    this.minute = this.getAttribute('minute')
      ? Number(this.getAttribute('minute'))
      : 0
    this.second = this.getAttribute('second')
      ? Number(this.getAttribute('second'))
      : 0
    this.svgHandHour = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'line',
    )
    this.svgHandMinute = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'line',
    )
    this.svgHandSecond = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'line',
    )
    this.showHands = !(this.getAttribute('showHands') === 'false')
    this.showSecond = this.hasAttribute('showSecond')
      ? !(this.getAttribute('showSecond') === 'false')
      : false
    this.draggingHand = false
  }

  /**
   * Méthode appelée lorsque l'élément est ajouté au DOM
   */
  connectedCallback() {
    this.render()
  }

  static verifQuestion(
    exercice: IExercice,
    i: number,
  ): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    const id = `interactive-clockEx${exercice.numeroExercice}Q${i}`
    const clock = document.querySelector(`#${id}`) as any
    if (clock == null) {
      return {
        isOk: false,
        feedback: "Erreur dans le programme : pas d'horloge dans la question",
        score: {
          nbBonnesReponses: 0,
          nbReponses: 1,
        },
      }
    }
    const spanResultatCheck = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${i}`,
    )
    const divFeedback = document.querySelector(
      `#feedbackEx${exercice.numeroExercice}Q${i}`,
    )
    const answer = clock.value
    clock.interactivityOn = false
    if (exercice.answers == null) exercice.answers = {}
    // Sauvegarde de la réponse pour Capytale
    exercice.answers[id] = JSON.stringify(answer)
    const goodAnswer = Hms.fromString(
      String(exercice.autoCorrection?.[i]?.valeur?.reponse?.value),
    )

    // Une horloge à aiguilles représente les heures sur un cycle de 12 heures :
    // 13 h et 1 h y ont donc la même position. Les exercices peuvent toutefois
    // attendre une heure au format 24 heures.
    const expectedHourOnClock = goodAnswer.hour % 12
    const answerHourOnClock = answer.hour % 12
    if (
      expectedHourOnClock === answerHourOnClock &&
      goodAnswer.minute === answer.minute
    ) {
      if (spanResultatCheck) {
        spanResultatCheck.innerHTML = '😎'
      }
      return uniformiseResults('OK')
    } else {
      if (spanResultatCheck) {
        spanResultatCheck.innerHTML = '☹️'
      }
      if (divFeedback) {
        divFeedback.innerHTML = `Les aiguilles indiquent ${clock.getAttribute('hour')} h ${formatMinute(clock.getAttribute('minute'))}.`
      }
      return uniformiseResults('KO')
    }
  }

  static create({
    id,
    numeroExercice,
    questionIndex,
    hour = 0,
    minute = 0,
    second = 0,
    interactivityOn = true,
    showHands = true,
    showSecond = false,
  }: InteractiveClockCreateOptions): string {
    const computedId =
      id ??
      `${InteractiveClock.elementTag}Ex${numeroExercice ?? 0}Q${questionIndex ?? 0}`
    const createElementForStaticRender = () => {
      const clock = new InteractiveClock()
      clock.applyOptions({
        id: computedId,
        hour,
        minute,
        second,
        interactivityOn,
        showHands,
        showSecond,
      })
      return clock
    }

    if (context.isTypst) {
      return `<mathalea-typst>${createElementForStaticRender().renderTypst()}</mathalea-typst>`
    }

    if (!context.isHtml) return createElementForStaticRender().renderLatex()

    return `<interactive-clock id="${computedId}" hour="${hour}" minute="${minute}" second="${second}" interactivity-on="${interactivityOn}" showHands="${showHands}" showSecond="${showSecond}"></interactive-clock>`
  }

  private applyOptions({
    id,
    hour = 0,
    minute = 0,
    second = 0,
    interactivityOn = true,
    showHands = true,
    showSecond = false,
  }: ClockDataOptions): void {
    if (id != null) this.id = id
    this.hour = hour
    this.minute = minute
    this.second = second
    this.interactivityOn = interactivityOn
    this.showHands = showHands
    this.showSecond = showSecond
  }

  protected renderLatex(): string {
    const horloge = new Horloge(
      0,
      0,
      2,
      this.showHands
        ? new Hms({ hour: this.hour, minute: this.minute, second: this.second })
        : undefined,
    )
    return mathalea2d(
      {
        xmin: -3,
        ymin: -3,
        xmax: 3,
        ymax: 3,
        scale: 0.6,
        center: true,
      },
      horloge,
    )
  }

  protected renderTypst(): string {
    return `#image(bytes(${typstStringLiteral(this.renderStaticSvg())}), format: "svg", width: 115pt)`
  }

  private renderStaticSvg(): string {
    const size = 420
    const center = size / 2
    const radius = 190
    const lines = [
      `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`,
      `<circle cx="${center}" cy="${center}" r="${radius}" stroke="black" stroke-opacity="0.8" fill="none" stroke-width="2"/>`,
      `<circle cx="${center}" cy="${center}" r="10" stroke="black" fill="black"/>`,
    ]

    for (let i = 1; i <= 12; i++) {
      const angle = (i / 12) * 2 * Math.PI
      const x = center + Math.sin(angle) * 152
      const y = center - Math.cos(angle) * 152
      lines.push(
        `<text x="${formatNumber(x)}" y="${formatNumber(y + 7)}" text-anchor="middle" font-family="serif" font-size="22">${i}</text>`,
      )
    }

    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * 2 * Math.PI
      const isHourTick = i % 5 === 0
      const innerRadius = isHourTick ? 170 : 180
      const outerRadius = 190
      const x1 = center + Math.sin(angle) * innerRadius
      const y1 = center - Math.cos(angle) * innerRadius
      const x2 = center + Math.sin(angle) * outerRadius
      const y2 = center - Math.cos(angle) * outerRadius
      lines.push(
        `<line x1="${formatNumber(x1)}" y1="${formatNumber(y1)}" x2="${formatNumber(x2)}" y2="${formatNumber(y2)}" stroke="black" stroke-width="${isHourTick ? 5 : 1.5}" stroke-linecap="round"/>`,
      )
    }

    if (this.showHands) {
      const hand = (
        value: number,
        total: number,
        length: number,
        width: number,
        color = 'black',
      ) => {
        const angle = (value / total) * 2 * Math.PI
        const x = center + Math.sin(angle) * length
        const y = center - Math.cos(angle) * length
        return `<line x1="${center}" y1="${center}" x2="${formatNumber(x)}" y2="${formatNumber(y)}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`
      }
      lines.push(hand((this.hour % 12) + this.minute / 60, 12, 95, 12))
      lines.push(hand(this.minute + this.second / 60, 60, 145, 8))
      if (this.showSecond) lines.push(hand(this.second, 60, 165, 3, 'red'))
    }

    lines.push('</svg>')
    return lines.join('')
  }

  render() {
    this.cleanupInteractiveListeners()
    this.innerHTML = ''

    const container = document.createElement('div')
    container.className = 'flex flex-wrap items-center'

    const svgContainer = document.createElement('div')
    svgContainer.className = 'flex-1 flex justify-center items-center p-8'

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    this._svgElement = svg
    svgContainer.appendChild(svg)
    svg.setAttribute(
      'width',
      `${InteractiveClock.BASE_RENDER_SIZE_EM.toString()}em`,
    )
    svg.setAttribute(
      'height',
      `${InteractiveClock.BASE_RENDER_SIZE_EM.toString()}em`,
    )
    svg.setAttribute('viewBox', '-200 -200 400 400')
    svg.style.maxWidth = '100%'
    svg.style.height = 'auto'

    const circle = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle',
    )
    circle.setAttribute('cx', '0')
    circle.setAttribute('cy', '0')
    circle.setAttribute('r', '200')
    circle.setAttribute('stroke', 'black')
    circle.setAttribute('stroke-opacity', '0.8')
    circle.setAttribute('fill', 'none')
    svg.appendChild(circle)

    const circleCentral = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle',
    )
    circleCentral.setAttribute('cx', '0')
    circleCentral.setAttribute('cy', '0')
    circleCentral.setAttribute('r', '10')
    circleCentral.setAttribute('stroke', 'black')
    circleCentral.setAttribute('fill', 'black')
    svg.appendChild(circleCentral)

    // Ajouter les nombres de 1 à 12
    for (let i = 1; i <= 12; i++) {
      const angle = (i / 12) * 2 * Math.PI
      const x = Math.sin(angle) * 160
      const y = -Math.cos(angle) * 160
      const text = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text',
      )
      text.setAttribute('x', x.toString())
      text.setAttribute('y', y.toString())
      text.setAttribute('text-anchor', 'middle')
      text.setAttribute('alignment-baseline', 'middle')
      text.setAttribute('font-size', '20')
      text.textContent = i.toString()
      text.setAttribute('pointer-events', 'none')
      text.style.userSelect = 'none'
      text.style.webkitUserSelect = 'none'
      svg.appendChild(text)
    }

    // Ajouter les petits traits pour chaque graduation
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * 2 * Math.PI
      let x1 = Math.sin(angle) * 190
      let y1 = -Math.cos(angle) * 190
      const x2 = Math.sin(angle) * 200
      const y2 = -Math.cos(angle) * 200
      if (i % 5 === 0) {
        x1 = Math.sin(angle) * 180
        y1 = -Math.cos(angle) * 180
      }

      const line = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'line',
      )
      line.setAttribute('x1', x1.toString())
      line.setAttribute('y1', y1.toString())
      line.setAttribute('x2', x2.toString())
      line.setAttribute('y2', y2.toString())
      line.setAttribute('stroke', 'black')
      if (i % 5 === 0) {
        line.setAttribute('stroke-width', '5')
      }
      svg.appendChild(line)
    }

    // Ajouter les aiguilles
    if (this.showHands) {
      this.svgHandHour = this.createHand(100, 'hour')
      this.svgHandMinute = this.createHand(150, 'minute')
      if (this.showSecond) {
        this.svgHandSecond = this.createHand(170, 'second')
      }
      this.updateHandHour()
      this.updateHandMinute()
      if (this.showSecond) {
        this.updateHandSecond()
      }
      svg.appendChild(this.svgHandHour)
      svg.appendChild(this.svgHandMinute)
      if (this.showSecond) {
        svg.appendChild(this.svgHandSecond)
      }
    }

    container.appendChild(svgContainer)
    this.appendChild(container)
    const resultatCheck = document.createElement('span')
    resultatCheck.id = this.id.replace('interactive-clock', 'resultatCheck')
    container.parentElement!.appendChild(resultatCheck)
    const divFeedback = document.createElement('div')
    divFeedback.id = this.id.replace('interactive-clock', 'feedback')
    divFeedback.className =
      'ml-2 py-2 italic text-coopmaths-warn-darkest dark:text-coopmathsdark-warn-darkest'
    divFeedback.style.display = 'block'
    container.parentElement!.appendChild(divFeedback)

    if (this.interactivityOn) {
      this.currentAction = 'minute'

      this._preventDefaultHandler = (event: PointerEvent | TouchEvent) => {
        event.preventDefault()
      }

      this._pointerDownHandler = (_event: PointerEvent | TouchEvent) => {
        this.draggingHand = true
        // Empêche le défilement pendant le drag
        if (this._preventDefaultHandler) {
          svg.addEventListener('pointermove', this._preventDefaultHandler, {
            passive: false,
          })
          svg.addEventListener('touchmove', this._preventDefaultHandler, {
            passive: false,
          })
        }
      }

      this._pointerUpHandler = () => {
        this.draggingHand = false
        // Réactive le défilement après le drag
        if (this._preventDefaultHandler) {
          svg.removeEventListener('pointermove', this._preventDefaultHandler)
          svg.removeEventListener('touchmove', this._preventDefaultHandler)
        }
      }

      this._pointerMoveHandler = (event: PointerEvent) => this.dragHand(event)
      this._touchStartHandler = (event: TouchEvent) => {
        this._pointerDownHandler?.(event)
      }
      this._touchEndHandler = () => {
        this._pointerUpHandler?.()
      }
      this._touchMoveHandler = (event: TouchEvent) => this.dragHand(event)

      svg.addEventListener('pointerdown', this._pointerDownHandler)
      svg.addEventListener('pointerup', this._pointerUpHandler)
      svg.addEventListener('pointermove', this._pointerMoveHandler)

      svg.addEventListener('touchstart', this._touchStartHandler)
      svg.addEventListener('touchend', this._touchEndHandler)
      svg.addEventListener('touchmove', this._touchMoveHandler)

      this._hourPointerDownHandler = (event: PointerEvent) => {
        this.draggingHand = true
        this.currentAction = 'hour'
        this._pointerDownHandler?.(event)
      }
      this._hourPointerUpHandler = this._pointerUpHandler
      this.svgHandHour.addEventListener(
        'pointerdown',
        this._hourPointerDownHandler,
      )
      this.svgHandHour.addEventListener('pointerup', this._hourPointerUpHandler)

      this._minutePointerDownHandler = (event: PointerEvent) => {
        this.draggingHand = true
        this.currentAction = 'minute'
        this._pointerDownHandler?.(event)
      }
      this._minutePointerUpHandler = this._pointerUpHandler
      this.svgHandMinute.addEventListener(
        'pointerdown',
        this._minutePointerDownHandler,
      )
      this.svgHandMinute.addEventListener(
        'pointerup',
        this._minutePointerUpHandler,
      )

      if (this.showSecond) {
        this._secondPointerDownHandler = (event: PointerEvent) => {
          this.draggingHand = true
          this.currentAction = 'second'
          this._pointerDownHandler?.(event)
        }
        this._secondPointerUpHandler = this._pointerUpHandler
        this.svgHandSecond.addEventListener(
          'pointerdown',
          this._secondPointerDownHandler,
        )
        this.svgHandSecond.addEventListener(
          'pointerup',
          this._secondPointerUpHandler,
        )
      }
    }
  }

  /**
   * Création d'une aiguille
   */
  createHand(length: number, type: 'hour' | 'minute' | 'second') {
    const hand = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    hand.setAttribute('x1', '0')
    hand.setAttribute('y1', '0')
    hand.setAttribute('stroke', 'black')
    if (type === 'hour') {
      hand.setAttribute('stroke-width', '12')
    } else if (type === 'minute') {
      hand.setAttribute('stroke-width', '8')
    } else {
      hand.setAttribute('stroke-width', '3')
    }
    hand.setAttribute('stroke-linecap', 'round')
    hand.setAttribute('class', type + '-hand')
    return hand
  }

  updateHandHour(adaptHourHandToMinutes = true) {
    let angle = (this.hour / 12) * 2 * Math.PI
    if (adaptHourHandToMinutes) {
      angle += (this.minute / 360) * Math.PI
    }
    const x2 = Math.sin(angle) * 100
    const y2 = -Math.cos(angle) * 100
    this.svgHandHour.setAttribute('x2', x2.toString())
    this.svgHandHour.setAttribute('y2', y2.toString())
  }

  updateHandMinute() {
    const angle = (this.minute / 60) * 2 * Math.PI
    const x2 = Math.sin(angle) * 150
    const y2 = -Math.cos(angle) * 150
    this.svgHandMinute.setAttribute('x2', x2.toString())
    this.svgHandMinute.setAttribute('y2', y2.toString())
  }

  updateHandSecond() {
    const angle = (this.second / 60) * 2 * Math.PI
    const x2 = Math.sin(angle) * 170
    const y2 = -Math.cos(angle) * 170
    this.svgHandSecond.setAttribute('x2', x2.toString())
    this.svgHandSecond.setAttribute('y2', y2.toString())
  }

  dragHand(event: MouseEvent | TouchEvent) {
    if (!this.interactivityOn) return
    if (!this.draggingHand) return
    const rect = (event.target as SVGElement).getBoundingClientRect()
    const clientX =
      event instanceof MouseEvent ? event.clientX : event.touches[0].clientX
    const clientY =
      event instanceof MouseEvent ? event.clientY : event.touches[0].clientY
    const x = clientX - rect.left - rect.width / 2
    const y = clientY - rect.top - rect.height / 2
    // Ne rien faire si on est trop près du centre
    if (Math.sqrt(x * x + y * y) < 20) return
    const angle = (Math.atan2(y, x) + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI)
    const value = Math.round(
      (angle / (2 * Math.PI)) * (this.currentAction === 'hour' ? 12 : 60),
    )
    if (this.currentAction === 'hour') {
      this.hour = value
    } else if (this.currentAction === 'minute') {
      if (this.previousMinute > 50 && value < 10) {
        this.hour = (this.hour + 1) % 12
      } else if (this.previousMinute < 10 && value > 50) {
        this.hour = (this.hour + 11) % 12
      }
      this.minute = value
    } else if (this.currentAction === 'second') {
      if (this.previousSecond > 50 && value < 10) {
        this.minute = (this.minute + 1) % 60
      } else if (this.previousSecond < 10 && value > 50) {
        this.minute = (this.minute + 59) % 60
      }
      this.second = value
    }
    this.updateHandHour()
    this.updateHandMinute()
    this.updateHandSecond()
  }

  private cleanupInteractiveListeners() {
    const svg = this._svgElement
    if (!svg) return

    if (this._pointerDownHandler) {
      svg.removeEventListener('pointerdown', this._pointerDownHandler)
    }
    if (this._pointerUpHandler) {
      svg.removeEventListener('pointerup', this._pointerUpHandler)
    }
    if (this._pointerMoveHandler) {
      svg.removeEventListener('pointermove', this._pointerMoveHandler)
    }
    if (this._touchStartHandler) {
      svg.removeEventListener('touchstart', this._touchStartHandler)
    }
    if (this._touchEndHandler) {
      svg.removeEventListener('touchend', this._touchEndHandler)
    }
    if (this._touchMoveHandler) {
      svg.removeEventListener('touchmove', this._touchMoveHandler)
    }
    if (this._preventDefaultHandler) {
      svg.removeEventListener('pointermove', this._preventDefaultHandler)
      svg.removeEventListener('touchmove', this._preventDefaultHandler)
    }

    if (this._hourPointerDownHandler) {
      this.svgHandHour.removeEventListener(
        'pointerdown',
        this._hourPointerDownHandler,
      )
    }
    if (this._hourPointerUpHandler) {
      this.svgHandHour.removeEventListener(
        'pointerup',
        this._hourPointerUpHandler,
      )
    }
    if (this._minutePointerDownHandler) {
      this.svgHandMinute.removeEventListener(
        'pointerdown',
        this._minutePointerDownHandler,
      )
    }
    if (this._minutePointerUpHandler) {
      this.svgHandMinute.removeEventListener(
        'pointerup',
        this._minutePointerUpHandler,
      )
    }
    if (this._secondPointerDownHandler) {
      this.svgHandSecond.removeEventListener(
        'pointerdown',
        this._secondPointerDownHandler,
      )
    }
    if (this._secondPointerUpHandler) {
      this.svgHandSecond.removeEventListener(
        'pointerup',
        this._secondPointerUpHandler,
      )
    }

    this._svgElement = undefined
    this._preventDefaultHandler = undefined
    this._pointerDownHandler = undefined
    this._pointerUpHandler = undefined
    this._pointerMoveHandler = undefined
    this._touchStartHandler = undefined
    this._touchEndHandler = undefined
    this._touchMoveHandler = undefined
    this._hourPointerDownHandler = undefined
    this._hourPointerUpHandler = undefined
    this._minutePointerDownHandler = undefined
    this._minutePointerUpHandler = undefined
    this._secondPointerDownHandler = undefined
    this._secondPointerUpHandler = undefined
  }

  disconnectedCallback() {
    this.cleanupInteractiveListeners()
  }

  get currentAction() {
    return this._currentAction
  }

  set currentAction(val: 'hour' | 'minute' | 'second' | undefined) {
    this._currentAction = val
    if (val === 'hour') {
      this.svgHandHour.setAttribute('stroke', '#216D9A')
      this.svgHandMinute.setAttribute('stroke', orangeMathalea)
      this.svgHandSecond.setAttribute('stroke', orangeMathalea)
    } else if (val === 'minute') {
      this.svgHandHour.setAttribute('stroke', orangeMathalea)
      this.svgHandMinute.setAttribute('stroke', '#216D9A')
      this.svgHandSecond.setAttribute('stroke', orangeMathalea)
    } else if (val === 'second') {
      this.svgHandHour.setAttribute('stroke', orangeMathalea)
      this.svgHandMinute.setAttribute('stroke', orangeMathalea)
      this.svgHandSecond.setAttribute('stroke', '#216D9A')
    } else {
      this.svgHandHour.setAttribute('stroke', 'black')
      this.svgHandMinute.setAttribute('stroke', 'black')
      this.svgHandSecond.setAttribute('stroke', 'black')
    }
  }

  get hour() {
    return Number(this.getAttribute('hour'))
  }

  set hour(val: number) {
    if (val === 0) {
      val = 12
    }
    this.setAttribute('hour', val.toString())
  }

  get second() {
    return Number(this.getAttribute('second')) || 0
  }

  set second(val: number) {
    this.setAttribute('second', val.toString())
    this.previousSecond = this.second
  }

  get minute() {
    return Number(this.getAttribute('minute'))
  }

  set minute(val) {
    this.setAttribute('minute', val.toString())
    this.previousMinute = this.minute
  }

  get value() {
    return { hour: this.hour, minute: this.minute, second: this.second }
  }

  set value(value: ClockValueInput) {
    let hour: number | undefined
    let minute: number | undefined
    let second: number | undefined

    if (typeof value === 'string') {
      const trimmedValue = value.trim()
      const hmsMatch = trimmedValue.match(
        /^(\d{1,2})h(?:\s*(\d{1,2})(?:\s*min)?(?:\s*(\d{1,2})s)?)?$/i,
      )
      const colonMatch = trimmedValue.match(
        /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/,
      )
      // Ici on traite les cas où la valeur est une chaîne de caractères représentant les heures, minutes et secondes.
      // Peut être utilisée pour créer une horloge pour la correction par exemple. (on peut aussi utiliser JSON.strigify({hour:..., minute:..., second:...}) pour créer la valeur)
      if (hmsMatch) {
        hour = Number(hmsMatch[1])
        minute = hmsMatch[2] == null ? 0 : Number(hmsMatch[2])
        second = hmsMatch[3] == null ? 0 : Number(hmsMatch[3])
      } else if (colonMatch) {
        hour = Number(colonMatch[1])
        minute = colonMatch[2] == null ? 0 : Number(colonMatch[2])
        second = colonMatch[3] == null ? 0 : Number(colonMatch[3])
      } else {
        // C'est sans doute l'objet JSON {hour:..., minute:..., second:...}
        // C'est la pratique dans mathaleaWriteStudentPreviousAnswers pour injecter les réponses sauvegardées dans les customElements
        try {
          const parsedValue = JSON.parse(trimmedValue)
          if (
            typeof parsedValue === 'object' &&
            parsedValue !== null &&
            'hour' in parsedValue &&
            'minute' in parsedValue
          ) {
            hour = Number(parsedValue.hour)
            minute = Number(parsedValue.minute)
            second = 'second' in parsedValue ? Number(parsedValue.second) : 0
          }
        } catch (e) {
          // Si la chaîne n'est pas un JSON valide, on ignore l'erreur et on ne fait rien.
        }
      }
    } else {
      hour = value.hour
      minute = value.minute
      second = value.second
    }

    hour = hour == null || hour < 0 ? 0 : hour > 12 ? hour - 12 : hour
    minute = minute == null ? 0 : minute
    second = second == null ? 0 : second
    minute = minute < 0 ? 0 : minute >= 60 ? minute - 60 : minute
    second = second < 0 ? 0 : second >= 60 ? second - 60 : second
    if (
      !Number.isFinite(hour) ||
      !Number.isFinite(minute) ||
      !Number.isFinite(second)
    ) {
      return
    }

    this.hour = hour
    this.minute = minute
    this.second = second

    if (this.showHands) {
      this.updateHandHour()
      this.updateHandMinute()
      if (this.showSecond) {
        this.updateHandSecond()
      }
    }

    this.render()
  }
}

export function addInteractiveClock(
  exercice: IExercice,
  questionIndex: number,
  options: ClockDataOptions = {},
): string {
  return InteractiveClock.create({
    ...options,
    numeroExercice: exercice.numeroExercice,
    questionIndex,
  })
}

export default function handleInteractiveClock() {
  registerMathaleaCustomElement(InteractiveClock)
}
