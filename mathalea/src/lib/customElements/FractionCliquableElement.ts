import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

type FractionCliquableStyle = Record<string, string>

export type FractionCliquablePartData = {
  id: string
  etat: boolean
  cliquable: boolean
  out: FractionCliquableStyle
  over: FractionCliquableStyle
  click: FractionCliquableStyle
}

type FractionCliquableConfig = {
  id: string
  numeroExercice?: number
  questionIndex?: number
  parts: FractionCliquablePartData[]
}

const fractionCliquableConfigs = new Map<string, FractionCliquableConfig>()
const pendingFractionCliquableIds: string[] = []
/**
 * @author Jean-Claude Lhote
 */
export class FractionCliquableElement extends MathaleaCustomElement {
  static readonly elementTag = 'fraction-cliquable'

  private fractionId = ''
  private parts: FractionCliquablePartData[] = []
  private groups = new Map<string, SVGElement>()
  private setupFrame: number | null = null

  connectedCallback(): void {
    this.hydrateCommonAttributes()
    this.fractionId = this.getAttribute('fraction-id') ?? ''
    const config = fractionCliquableConfigs.get(this.fractionId)
    if (!config) return
    this.parts = config.parts.map((part) => ({ ...part }))
    this.setupFrame = window.requestAnimationFrame(() => {
      this.setupFrame = null
      if (this.isConnected) this.setup()
    })
  }

  disconnectedCallback(): void {
    if (this.setupFrame != null) {
      window.cancelAnimationFrame(this.setupFrame)
      this.setupFrame = null
    }
    this.teardown()
    fractionCliquableConfigs.delete(this.fractionId)
  }

  get value(): string {
    return JSON.stringify(
      this.parts.map(({ id, etat }) => ({
        id,
        etat,
      })),
    )
  }

  set value(nextValue: string | Array<{ id: string; etat: boolean }>) {
    const nextParts = parseFractionCliquableValue(nextValue)
    if (nextParts.length === 0) return
    const stateById = new Map(nextParts.map((part) => [part.id, part.etat]))
    this.parts = this.parts.map((part) => ({
      ...part,
      etat: stateById.get(part.id) ?? part.etat,
    }))
    this.paintAll()
  }

  protected onInteractivityChanged(): void {
    this.setup()
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
      `${FractionCliquableElement.elementTag}[numero-exercice="${exercice.numeroExercice}"][question-index="${questionIndex}"]`,
    ) as FractionCliquableElement | null
    if (!element) {
      return {
        isOk: false,
        feedback: 'Élément fraction-cliquable introuvable.',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }
    exercice.answers ??= {}
    exercice.answers[element.id] = element.value
    const expectedParts = parseFractionCliquableValue(
      exercice.autoCorrection[questionIndex]?.valeur?.reponse?.value,
    )
    if (expectedParts.length === 0) {
      return {
        isOk: true,
        feedback: '',
        score: { nbBonnesReponses: 0, nbReponses: 0 },
      }
    }
    const expectedById = new Map(
      expectedParts.map((part) => [part.id, part.etat]),
    )
    const isOk = element.parts.every(
      (part) => part.etat === expectedById.get(part.id),
    )
    return {
      isOk,
      feedback: isOk
        ? ''
        : 'Certaines parts ne sont pas correctement coloriées.',
      score: { nbBonnesReponses: isOk ? 1 : 0, nbReponses: 1 },
    }
  }

  static formatStudentAnswer(rawAnswer: string): string {
    const selected = parseFractionCliquableValue(rawAnswer)
      .filter((part) => part.etat)
      .map((part) => part.id)
    return selected.length === 0 ? 'aucune part' : selected.join(' ; ')
  }

  private setup(): void {
    this.teardown()
    this.parts.forEach((part) => {
      const group = document.getElementById(part.id)
      if (!group) return
      this.groups.set(part.id, group as unknown as SVGElement)
      this.paintPart(part)
      if (!part.cliquable || !this.interactivityOn) return
      group.style.cursor = 'pointer'
      group.addEventListener('mouseover', this.mouseOverEffect)
      group.addEventListener('mouseout', this.mouseOutEffect)
      group.addEventListener('click', this.mouseClick)
    })
  }

  private teardown(): void {
    this.groups.forEach((group) => {
      group.removeEventListener('mouseover', this.mouseOverEffect)
      group.removeEventListener('mouseout', this.mouseOutEffect)
      group.removeEventListener('click', this.mouseClick)
      group.style.cursor = ''
    })
    this.groups.clear()
  }

  private readonly mouseOverEffect = (event: Event) => {
    const part = this.findPart(event.currentTarget)
    if (!part || part.etat) return
    this.applyStyle(part.id, part.over)
  }

  private readonly mouseOutEffect = (event: Event) => {
    const part = this.findPart(event.currentTarget)
    if (!part) return
    this.paintPart(part)
  }

  private readonly mouseClick = (event: Event) => {
    const part = this.findPart(event.currentTarget)
    if (!part) return
    part.etat = !part.etat
    this.paintPart(part)
  }

  private findPart(
    target: EventTarget | null,
  ): FractionCliquablePartData | null {
    if (!(target instanceof Element)) return null
    return this.parts.find((part) => part.id === target.id) ?? null
  }

  private paintAll(): void {
    this.parts.forEach((part) => this.paintPart(part))
  }

  private paintPart(part: FractionCliquablePartData): void {
    this.applyStyle(part.id, part.etat ? part.click : part.out)
  }

  private applyStyle(id: string, style: FractionCliquableStyle): void {
    const group = this.groups.get(id)
    if (!group) return
    Object.entries(style).forEach(([key, value]) => {
      group.style.setProperty(toCssProperty(key), value)
    })
  }
}

export function registerFractionCliquable({
  id,
  parts,
}: FractionCliquableConfig): void {
  fractionCliquableConfigs.set(id, { id, parts })
  pendingFractionCliquableIds.push(id)
}

export function fractionCliquableInteractionMarkup(): string {
  if (pendingFractionCliquableIds.length === 0) return ''
  const ids = pendingFractionCliquableIds.splice(0)
  return ids
    .map((fractionId) =>
      FractionCliquableElement.create({
        id: fractionId,
        fractionId,
        numeroExercice:
          fractionCliquableConfigs.get(fractionId)?.numeroExercice,
        questionIndex: fractionCliquableConfigs.get(fractionId)?.questionIndex,
      }),
    )
    .join('')
}

function parseFractionCliquableValue(
  value: unknown,
): Array<{ id: string; etat: boolean }> {
  let raw: unknown
  try {
    raw = typeof value === 'string' ? JSON.parse(value) : value
  } catch {
    return []
  }
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (part): part is { id: string; etat: boolean } =>
      typeof part?.id === 'string' && typeof part.etat === 'boolean',
  )
}

function toCssProperty(property: string): string {
  return property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
}

registerMathaleaCustomElement(FractionCliquableElement)
