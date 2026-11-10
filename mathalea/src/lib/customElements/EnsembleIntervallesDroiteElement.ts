import { context } from '../../modules/context'
import { bleuMathalea } from '../colors'
import type { IExercice } from '../types'
import type { IntervalleDroiteValue } from './IntervalleDroiteElement'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

export type EnsembleIntervallesDroiteValue = {
  intervals: IntervalleDroiteValue[]
  empty: boolean
}
type Options = {
  numeroExercice?: number
  questionIndex?: number
  min: number
  max: number
  labelValues: number[]
  maxIntervals?: number
}

export class EnsembleIntervallesDroiteElement extends MathaleaCustomElement {
  static readonly elementTag = 'ensemble-intervalles-droite'
  private intervals: IntervalleDroiteValue[] = []
  private openInfinityBrackets = new Set<string>()
  private pendingStart: number | null = null
  private pendingInfinityOpen = false
  private empty = false

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  static create({
    numeroExercice,
    questionIndex,
    min,
    max,
    labelValues,
    maxIntervals = 2,
  }: Options): string {
    return super.create({
      id: `${this.elementTag}Ex${numeroExercice ?? 0}Q${questionIndex ?? 0}`,
      min,
      max,
      labelValues,
      maxIntervals,
    })
  }

  static verifQuestion(exercice: IExercice, questionIndex: number) {
    const element = document.getElementById(
      `${this.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`,
    ) as EnsembleIntervallesDroiteElement | null
    const actual = element?.value ?? ''
    const expected =
      exercice.autoCorrection[questionIndex]?.valeur?.reponse?.value
    const isOk = actual === String(expected ?? '')
    exercice.answers ??= {}
    if (element != null) exercice.answers[element.id] = actual
    return {
      isOk,
      feedback: '',
      score: { nbBonnesReponses: isOk ? 1 : 0, nbReponses: 1 },
    }
  }

  static formatStudentAnswer(rawAnswer: string): string {
    const value = parseValue(rawAnswer)
    if (value == null) return rawAnswer || 'aucune réponse'
    if (value.empty) return '$\\varnothing$'
    return value.intervals.map(formatInterval).join(' $\\cup$ ')
  }

  render(): string | void {
    if (!context.isHtml || this.shadowRoot == null) return
    const min = Number(this.getAttribute('min'))
    const max = Number(this.getAttribute('max'))
    const labels = this.numberArrayAttribute('label-values')
    const limit = Number(this.getAttribute('max-intervals') ?? 2)
    const startX = 24,
      endX = 536,
      arrowX = 542,
      axisY = 48
    const xFor = (value: number) =>
      startX + ((value - min) / Math.max(1, max - min)) * (endX - startX)
    const points = Array.from(
      { length: Math.round(max - min) + 1 },
      (_, index) => min + index,
    )
    const drawings = this.intervals
      .map((interval) => {
        const x1 = interval.leftBracket == null ? startX : xFor(interval.start)
        const x2 = interval.rightBracket == null ? arrowX : xFor(interval.end)
        const leftBracket =
          interval.leftBracket ??
          (this.openInfinityBrackets.has(this.infinityKey(interval, 'left'))
            ? ']'
            : '[')
        const rightBracket =
          interval.rightBracket ??
          (this.openInfinityBrackets.has(this.infinityKey(interval, 'right'))
            ? '['
            : ']')
        return `<line class="colored" x1="${x1}" y1="${axisY}" x2="${x2}" y2="${axisY}" />${this.bracket(x1, axisY, leftBracket)}${this.bracket(x2, axisY, rightBracket)}`
      })
      .join('')
    const pendingInfinityBracket =
      this.pendingStart === min
        ? this.bracket(startX, axisY, this.pendingInfinityOpen ? ']' : '[')
        : this.pendingStart === max
          ? this.bracket(arrowX, axisY, this.pendingInfinityOpen ? '[' : ']')
          : ''
    const ticks = points
      .map((value) => {
        const x = xFor(value),
          labeled = labels.includes(value),
          pending = value === this.pendingStart
        const leftInfinity = this.intervals.find(
          (interval) =>
            interval.start === value && interval.leftBracket == null,
        )
        const rightInfinity = this.intervals.find(
          (interval) => interval.end === value && interval.rightBracket == null,
        )
        const targetX = rightInfinity != null ? arrowX : x
        const ariaLabel =
          leftInfinity != null || rightInfinity != null
            ? `Changer le crochet à ${leftInfinity != null ? 'moins' : 'plus'} l’infini`
            : `Valeur ${value}`
        return `<g class="point${pending ? ' pending' : ''}" data-value="${value}" role="button" tabindex="0" aria-label="${ariaLabel}">${labeled ? `<line x1="${x}" y1="39" x2="${x}" y2="57" /><text x="${x}" y="82">${value}</text>` : ''}<circle cx="${targetX}" cy="${axisY}" r="13" /></g>`
      })
      .join('')
    const rightInfinity = this.intervals.some(
      (interval) => interval.rightBracket == null,
    )
    this.shadowRoot.innerHTML = `<style>
      :host{display:block;max-width:650px}.instructions{color:${bleuMathalea};font-size:.84rem;margin:0 0 .25rem;opacity:.82}.figure{display:flex;align-items:center;gap:.5rem}svg{display:block;width:min(100%,560px);height:auto;overflow:visible}.axis{stroke:currentColor;stroke-width:2}.arrow{fill:${rightInfinity ? bleuMathalea : 'currentColor'}}.colored{stroke:${bleuMathalea};stroke-width:7;stroke-linecap:butt}.bracket{fill:none;stroke:${bleuMathalea};stroke-width:3;stroke-linecap:round;pointer-events:none}.point line{stroke:currentColor;stroke-width:1.5}.point circle{fill:transparent;stroke:transparent;cursor:pointer}.point:hover circle,.point:focus circle,.point.pending circle{fill:${bleuMathalea}24;stroke:${bleuMathalea};stroke-width:1.5}.point text{fill:currentColor;font:16px sans-serif;text-anchor:middle}button{border:1px solid ${bleuMathalea}80;border-radius:.35rem;background:transparent;color:${bleuMathalea};padding:.3rem .55rem;cursor:pointer}label{white-space:nowrap}
    </style><p class="instructions">Cliquer sur les deux extrémités de chaque intervalle. Les crochets sont fermés par défaut : cliquer sur une extrémité pour changer leur sens, y compris à l’infini.</p><div class="figure"><svg viewBox="0 0 560 115"><line class="axis" x1="${startX}" y1="${axisY}" x2="${endX}" y2="${axisY}"/><path class="arrow" d="M ${arrowX} ${axisY} l -8 -5 v 10 z"/>${drawings}${pendingInfinityBracket}${ticks}</svg><button type="button" class="reset">Réinitialiser</button></div><label><input type="checkbox" ${this.empty ? 'checked' : ''}> Ensemble vide</label>`
    this.shadowRoot.querySelectorAll<SVGGElement>('.point').forEach((point) => {
      const select = () =>
        this.select(Number(point.dataset.value), min, max, limit)
      point.addEventListener('click', select)
      point.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') select()
      })
    })
    this.shadowRoot.querySelector('.reset')?.addEventListener('click', () => {
      this.intervals = []
      this.openInfinityBrackets.clear()
      this.pendingStart = null
      this.pendingInfinityOpen = false
      this.empty = false
      this.render()
    })
    this.shadowRoot
      .querySelector('input')
      ?.addEventListener('change', (event) => {
        this.empty = (event.currentTarget as HTMLInputElement).checked
        if (this.empty) {
          this.intervals = []
          this.openInfinityBrackets.clear()
          this.pendingStart = null
          this.pendingInfinityOpen = false
        }
        this.render()
      })
  }

  get value(): string {
    if (
      !this.empty &&
      (this.pendingStart != null || this.intervals.length === 0)
    )
      return ''
    const intervals = this.intervals.map((interval) => ({
      ...interval,
      leftBracket:
        interval.leftBracket == null
          ? this.openInfinityBrackets.has(this.infinityKey(interval, 'left'))
            ? null
            : '['
          : interval.leftBracket,
      rightBracket:
        interval.rightBracket == null
          ? this.openInfinityBrackets.has(this.infinityKey(interval, 'right'))
            ? null
            : ']'
          : interval.rightBracket,
    }))
    return JSON.stringify({ intervals, empty: this.empty })
  }

  /**
   * Restaure la réponse sérialisée par le getter (reprise d'une copie Capytale, correction CAN).
   * Un crochet `null` à une extrémité de la droite graduée correspond à une borne « ouverte à l'infini ».
   */
  set value(nextValue: string) {
    const parsed = parseValue(nextValue)
    this.intervals = []
    this.openInfinityBrackets.clear()
    this.pendingStart = null
    this.pendingInfinityOpen = false
    this.empty = false
    if (parsed != null && Array.isArray(parsed.intervals)) {
      const min = Number(this.getAttribute('min'))
      const max = Number(this.getAttribute('max'))
      this.empty = parsed.empty === true
      if (!this.empty) {
        for (const {
          start,
          end,
          leftBracket,
          rightBracket,
        } of parsed.intervals) {
          const interval: IntervalleDroiteValue = {
            start,
            end,
            leftBracket: start === min ? null : (leftBracket ?? '['),
            rightBracket: end === max ? null : (rightBracket ?? ']'),
          }
          if (start === min && leftBracket == null)
            this.openInfinityBrackets.add(this.infinityKey(interval, 'left'))
          if (end === max && rightBracket == null)
            this.openInfinityBrackets.add(this.infinityKey(interval, 'right'))
          this.intervals.push(interval)
        }
        this.intervals.sort((a, b) => a.start - b.start)
      }
    }
    this.render()
  }

  private select(value: number, min: number, max: number, limit: number) {
    if (this.empty) this.empty = false
    const endpoint = this.intervals.find(
      (interval) => interval.start === value || interval.end === value,
    )
    if (this.pendingStart == null && endpoint != null) {
      if (endpoint.start === value) {
        if (value === min) {
          const key = this.infinityKey(endpoint, 'left')
          if (this.openInfinityBrackets.has(key))
            this.openInfinityBrackets.delete(key)
          else this.openInfinityBrackets.add(key)
        } else endpoint.leftBracket = endpoint.leftBracket === '[' ? ']' : '['
      }
      if (endpoint.end === value) {
        if (value === max) {
          const key = this.infinityKey(endpoint, 'right')
          if (this.openInfinityBrackets.has(key))
            this.openInfinityBrackets.delete(key)
          else this.openInfinityBrackets.add(key)
        } else endpoint.rightBracket = endpoint.rightBracket === ']' ? '[' : ']'
      }
    } else if (this.pendingStart == null) {
      if (this.intervals.length < limit) {
        this.pendingStart = value
        this.pendingInfinityOpen = false
      }
    } else if (
      value === this.pendingStart &&
      (value === min || value === max)
    ) {
      this.pendingInfinityOpen = !this.pendingInfinityOpen
    } else if (value !== this.pendingStart) {
      const start = Math.min(value, this.pendingStart),
        end = Math.max(value, this.pendingStart)
      const interval: IntervalleDroiteValue = {
        start,
        end,
        leftBracket: start === min ? null : '[',
        rightBracket: end === max ? null : ']',
      }
      this.intervals.push(interval)
      if (
        this.pendingInfinityOpen &&
        (this.pendingStart === min || this.pendingStart === max)
      ) {
        this.openInfinityBrackets.add(
          this.infinityKey(
            interval,
            this.pendingStart === min ? 'left' : 'right',
          ),
        )
      }
      this.intervals.sort((a, b) => a.start - b.start)
      this.pendingStart = null
      this.pendingInfinityOpen = false
    }
    this.render()
    this.dispatchEvent(new Event('change', { bubbles: true }))
  }

  private infinityKey(
    interval: IntervalleDroiteValue,
    side: 'left' | 'right',
  ): string {
    return `${interval.start}:${interval.end}:${side}`
  }

  private bracket(x: number, y: number, bracket: '[' | ']' | null) {
    if (bracket == null) return ''
    const direction = bracket === '[' ? 1 : -1
    return `<path class="bracket" d="M ${x + direction * 6} ${y - 16} H ${x} V ${y + 16} H ${x + direction * 6}"/>`
  }

  private numberArrayAttribute(name: string): number[] {
    try {
      const value: unknown = JSON.parse(this.getAttribute(name) ?? '[]')
      return Array.isArray(value)
        ? value.filter((item): item is number => typeof item === 'number')
        : []
    } catch {
      return []
    }
  }
}

function formatInterval(value: IntervalleDroiteValue): string {
  const left =
    value.leftBracket == null
      ? ']-\\infty'
      : `${value.leftBracket}${value.start}`
  const right =
    value.rightBracket == null
      ? '+\\infty['
      : `${value.end}${value.rightBracket}`
  return `$${left}\\,;\\,${right}$`
}
function parseValue(raw: string): EnsembleIntervallesDroiteValue | null {
  try {
    return JSON.parse(raw) as EnsembleIntervallesDroiteValue
  } catch {
    return null
  }
}

export function addEnsembleIntervallesDroite(
  exercice: IExercice,
  questionIndex: number,
  options: Omit<Options, 'numeroExercice' | 'questionIndex'>,
): string {
  exercice.autoCorrection[questionIndex] ??= {}
  exercice.autoCorrection[questionIndex].formatInteractif =
    EnsembleIntervallesDroiteElement.elementTag
  return EnsembleIntervallesDroiteElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice,
    questionIndex,
  })
}

registerMathaleaCustomElement(EnsembleIntervallesDroiteElement)
