import { context } from '../../modules/context'
import {
  attachDragAndDropListeners,
  type DragAndDropListenerRecord,
  verifDragAndDrop,
} from '../interactif/DragAndDrop'
import { attachDragAndDropAccessibility } from '../interactif/dragAndDropAccessible'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

export type DragAndDropElementOptions = {
  id?: string
  numeroExercice: number
  questionIndex: number
  innerHtml?: string
  interactivityOn?: boolean
}
/**
 * @author Jean-Claude Lhote
 */
export class DragAndDropElement extends MathaleaCustomElement {
  static readonly elementTag = 'drag-and-drop'

  private listeners: DragAndDropListenerRecord[] = []
  private detachAccessibility: (() => void) | null = null

  static create({
    id,
    numeroExercice,
    questionIndex,
    innerHtml = '',
    interactivityOn = true,
  }: DragAndDropElementOptions): string {
    if (!context.isHtml) return ''
    const elementId =
      id ??
      `${DragAndDropElement.elementTag}Ex${numeroExercice}Q${questionIndex}`
    return `<${DragAndDropElement.elementTag} id="${elementId}" numero-exercice="${numeroExercice}" question-index="${questionIndex}" interactivity-on="${interactivityOn ? 'true' : 'false'}">${innerHtml}</${DragAndDropElement.elementTag}>`
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
      `#${DragAndDropElement.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`,
    ) as DragAndDropElement | null
    if (element == null || exercice.dragAndDrops?.[questionIndex] == null) {
      return {
        isOk: false,
        feedback: 'Un problème est survenu',
        score: { nbBonnesReponses: 0, nbReponses: 0 },
      }
    }
    const result = verifDragAndDrop(exercice, questionIndex)
    if (element != null) {
      exercice.answers ??= {}
      exercice.answers[element.id] = element.value
      element.interactivityOn = false
    }
    return result
  }

  connectedCallback(): void {
    this.hydrateCommonAttributes()
    if (this.interactivityOn) this.attachListeners()
    else this.updateInteractiveState(false)
  }

  disconnectedCallback(): void {
    this.detachListeners()
  }

  get value(): string {
    const questionIndex = Number(this.getAttribute('question-index') ?? 0)
    const numeroExercice = Number(this.getAttribute('numero-exercice') ?? 0)
    const rectangles = this.querySelectorAll<HTMLElement>(
      `#rectanglesEx${numeroExercice}Q${questionIndex} .rectangleDND`,
    )
    return JSON.stringify(
      Array.from(rectangles).map((rectangle) =>
        Array.from(rectangle.querySelectorAll<HTMLElement>('.etiquette'))
          .map((etiquette) => etiquette.id)
          .join(';'),
      ),
    )
  }

  static formatStudentAnswer(rawAnswer: string, questionHtml?: string): string {
    const values = parseDragAndDropValue(rawAnswer)
    if (values.length === 0) return rawAnswer
    if (questionHtml == null || typeof document === 'undefined') {
      return values.filter((value) => value.trim() !== '').join(' ; ')
    }

    const template = document.createElement('template')
    template.innerHTML = questionHtml
    const labels = new Map<string, string>()
    template.content
      .querySelectorAll<HTMLElement>('.etiquette')
      .forEach((el) => {
        labels.set(el.id, cleanDragAndDropLabel(el.textContent ?? ''))
      })

    return values
      .map((rawIds) =>
        rawIds
          .split(';')
          .filter((id) => id !== '')
          .map((id) => labels.get(id.split('-clone-')[0]) ?? id)
          .join(' '),
      )
      .filter((value) => value.trim() !== '')
      .join(' ; ')
  }

  set value(nextValue: string) {
    const values = parseDragAndDropValue(nextValue)
    if (values.length === 0) return

    const questionIndex = Number(this.getAttribute('question-index') ?? 0)
    const numeroExercice = Number(this.getAttribute('numero-exercice') ?? 0)
    const rectangles = Array.from(
      this.querySelectorAll<HTMLElement>(
        `#rectanglesEx${numeroExercice}Q${questionIndex} .rectangleDND`,
      ),
    )
    const etiquettesContainer = this.querySelector<HTMLElement>(
      `#etiquettesEx${numeroExercice}Q${questionIndex}`,
    )

    rectangles.forEach((rectangle) => {
      Array.from(rectangle.querySelectorAll<HTMLElement>('.etiquette')).forEach(
        (etiquette) => {
          if (etiquette.id.includes('-clone-')) {
            etiquette.remove()
            return
          }
          etiquettesContainer?.appendChild(etiquette)
        },
      )
    })

    values.forEach((rawIds, index) => {
      const rectangle = rectangles[index]
      if (rectangle == null || rawIds.trim() === '') return
      for (const id of rawIds.split(';').filter((item) => item !== '')) {
        const etiquette = this.restoreEtiquette(id)
        if (etiquette != null) rectangle.appendChild(etiquette)
      }
    })
  }

  protected onInteractivityChanged(isOn: boolean): void {
    if (isOn) this.attachListeners()
    else this.detachListeners()
    this.updateInteractiveState(isOn)
  }

  private attachListeners(): void {
    this.detachListeners()
    const numeroExercice = Number(this.getAttribute('numero-exercice') ?? 0)
    const questionIndex = Number(this.getAttribute('question-index') ?? 0)
    this.listeners = attachDragAndDropListeners({
      root: this,
      numeroExercice,
      question: questionIndex,
    })
    this.detachAccessibility = attachDragAndDropAccessibility({
      root: this,
      numeroExercice,
      question: questionIndex,
    })
  }

  private detachListeners(): void {
    for (const { element, type, listener, options } of this.listeners) {
      element.removeEventListener(type, listener, options)
    }
    this.listeners = []
    this.detachAccessibility?.()
    this.detachAccessibility = null
  }

  private updateInteractiveState(isOn: boolean): void {
    this.querySelectorAll<HTMLElement>('.etiquette').forEach((etiquette) => {
      etiquette.draggable = isOn && etiquette.classList.contains('dragOk')
      etiquette.classList.toggle('noDrag', !isOn)
    })
  }

  private restoreEtiquette(id: string): HTMLElement | null {
    const existing = this.findEtiquetteById(id)
    if (existing != null) return existing

    if (!id.includes('-clone-')) return null
    const [originalId, cloneSuffix] = id.split('-clone-')
    if (originalId == null || cloneSuffix == null) return null
    const original = this.findEtiquetteById(originalId)
    if (original == null) return null
    const clone = original.cloneNode(true) as HTMLElement
    clone.id = `${originalId}-clone-${cloneSuffix}`
    return clone
  }

  private findEtiquetteById(id: string): HTMLElement | null {
    return (
      Array.from(this.querySelectorAll<HTMLElement>('.etiquette')).find(
        (etiquette) => etiquette.id === id,
      ) ?? null
    )
  }
}

function cleanDragAndDropLabel(label: string): string {
  return label.replace(/\s*x\s*$/u, '').trim()
}

registerMathaleaCustomElement(DragAndDropElement)

function parseDragAndDropValue(rawValue: string): string[] {
  if (typeof rawValue !== 'string' || rawValue.trim() === '') return []
  try {
    const parsed = JSON.parse(rawValue) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map((value) => String(value))
  } catch {
    return []
  }
}
