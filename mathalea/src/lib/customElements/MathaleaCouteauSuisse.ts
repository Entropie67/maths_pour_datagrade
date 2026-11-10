import { context } from '../../modules/context'
import type { IExercice, InteractivityType } from '../types'
import MathaleaCustomElement, {
  mathaleaCustomElementsRegistry,
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

export type MathaleaCouteauSuisseChild = {
  formatInteractif: InteractivityType
  autoCorrection?: unknown
  /** Index utilisé par l'identifiant DOM de l'enfant, lorsqu'il diffère de celui du parent. */
  questionIndex?: number
}

export type MathaleaCouteauSuisseOptions = {
  id?: string
  numeroExercice: number
  questionIndex: number
  elements: MathaleaCouteauSuisseChild[]
  contenu: string
  interactivityOn?: boolean
}

type VerificationResult = {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
}
/**
 * @author Jean-Claude Lhote
 * Permet d'agréger autant d'éléments interactifs que l'on veut dans un seul élément.
 * Chaque élément interactif est rendu dans le DOM et peut être manipulé
 * indépendamment des autres.
 * La vérification de la question se fait en appelant la fonction `verifQuestion`
 * de chaque élément interactif contenu dans le couteau suisse.
 * Le résultat final est une agrégation des résultats de chaque élément.
 * L'élément couteau suisse est utile pour créer des questions complexes qui
 * nécessitent plusieurs types d'interactions, comme par exemple un QCM suivi
 * d'un champ à remplir.
 */
export class MathaleaCouteauSuisseElement extends MathaleaCustomElement {
  static readonly elementTag = 'mathalea-couteau-suisse'

  static create({
    id,
    numeroExercice,
    questionIndex,
    elements,
    contenu,
    interactivityOn = true,
  }: MathaleaCouteauSuisseOptions): string {
    if (!context.isHtml || context.isTypst) return contenu
    const computedId =
      id ??
      `${MathaleaCouteauSuisseElement.elementTag}Ex${numeroExercice}Q${questionIndex}`
    const attrs = this.buildAttributes({
      id: computedId,
      numeroExercice,
      questionIndex,
      elements,
      interactivityOn,
    })
    return `<${this.elementTag}${attrs}>${contenu}</${this.elementTag}>`
  }

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): VerificationResult {
    const ac = exercice.autoCorrection?.[questionIndex]
    const elements = parseElements(
      (ac as { elements?: unknown } | undefined)?.elements ??
        document
          .getElementById(
            `${MathaleaCouteauSuisseElement.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`,
          )
          ?.getAttribute('elements'),
    )

    const originalAutoCorrectionLength = exercice.autoCorrection.length
    const originalAutoCorrections = new Map<number, unknown>()
    const results: VerificationResult[] = []

    try {
      for (const element of elements) {
        const elementClass = mathaleaCustomElementsRegistry.get(
          element.formatInteractif,
        )
        if (elementClass == null) {
          throw Error(
            `mathalea-couteau-suisse : élément inconnu '${element.formatInteractif}'`,
          )
        }
        const childQuestionIndex = Number.isInteger(element.questionIndex)
          ? Number(element.questionIndex)
          : questionIndex
        if (!originalAutoCorrections.has(childQuestionIndex)) {
          originalAutoCorrections.set(
            childQuestionIndex,
            exercice.autoCorrection[childQuestionIndex],
          )
        }
        exercice.autoCorrection[childQuestionIndex] = {
          ...((exercice.autoCorrection[questionIndex] ?? {}) as Record<
            string,
            unknown
          >),
          ...((element.autoCorrection ?? {}) as Record<string, unknown>),
          formatInteractif: element.formatInteractif,
        }
        results.push(elementClass.verifQuestion(exercice, childQuestionIndex))
      }
    } finally {
      for (const [index, original] of originalAutoCorrections) {
        if (original == null && index !== questionIndex) {
          delete exercice.autoCorrection[index]
        } else {
          exercice.autoCorrection[index] =
            original as IExercice['autoCorrection'][number]
        }
      }
      exercice.autoCorrection.length = originalAutoCorrectionLength
    }

    const score = results.reduce(
      (acc, result) => ({
        nbBonnesReponses: acc.nbBonnesReponses + result.score.nbBonnesReponses,
        nbReponses: acc.nbReponses + result.score.nbReponses,
      }),
      { nbBonnesReponses: 0, nbReponses: 0 },
    )

    const wrapper = document.getElementById(
      `${MathaleaCouteauSuisseElement.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`,
    ) as MathaleaCouteauSuisseElement | null
    if (wrapper != null) {
      wrapper.interactivityOn = false
      exercice.answers ??= {}
      exercice.answers[wrapper.id] = wrapper.value
    }

    return {
      isOk: results.length > 0 && results.every((result) => result.isOk),
      feedback: results
        .map((result) => result.feedback)
        .filter(Boolean)
        .join('<br>'),
      score:
        score.nbReponses > 0 ? score : { nbBonnesReponses: 0, nbReponses: 1 },
    }
  }

  /**
   * Barème : la somme des points maximum des enfants, chacun lu avec son
   * `autoCorrection` installée temporairement comme dans `verifQuestion()`.
   */
  static pointsMaxQuestion(exercice: IExercice, questionIndex: number): number {
    const ac = exercice.autoCorrection?.[questionIndex]
    const elements = parseElements(
      (ac as { elements?: unknown } | undefined)?.elements,
    )
    if (elements.length === 0) return 1
    const originalAutoCorrectionLength = exercice.autoCorrection.length
    const originalAutoCorrections = new Map<number, unknown>()
    let total = 0
    try {
      for (const element of elements) {
        const elementClass = mathaleaCustomElementsRegistry.get(
          element.formatInteractif,
        )
        if (elementClass == null) continue
        const childQuestionIndex = Number.isInteger(element.questionIndex)
          ? Number(element.questionIndex)
          : questionIndex
        if (!originalAutoCorrections.has(childQuestionIndex)) {
          originalAutoCorrections.set(
            childQuestionIndex,
            exercice.autoCorrection[childQuestionIndex],
          )
        }
        exercice.autoCorrection[childQuestionIndex] = {
          ...((exercice.autoCorrection[questionIndex] ?? {}) as Record<
            string,
            unknown
          >),
          ...((element.autoCorrection ?? {}) as Record<string, unknown>),
          formatInteractif: element.formatInteractif,
        }
        total += elementClass.pointsMaxQuestion(exercice, childQuestionIndex)
      }
    } finally {
      for (const [index, original] of originalAutoCorrections) {
        if (original == null && index !== questionIndex) {
          delete exercice.autoCorrection[index]
        } else {
          exercice.autoCorrection[index] =
            original as IExercice['autoCorrection'][number]
        }
      }
      exercice.autoCorrection.length = originalAutoCorrectionLength
    }
    return Math.max(total, 1)
  }

  render(): string | void {
    this.hydrateCommonAttributes()
    this.onInteractivityChanged(this.interactivityOn)
    return ''
  }

  get value(): string {
    const values: Record<string, unknown> = {}
    this.querySelectorAll<HTMLElement>('*').forEach((element) => {
      const tag = element.tagName.toLowerCase()
      if (!mathaleaCustomElementsRegistry.has(tag) || !('value' in element))
        return
      const id = element.id || tag
      values[id] = (element as HTMLElement & { value: unknown }).value
    })
    return JSON.stringify(values)
  }

  set value(serializedValues: string) {
    this.update(serializedValues)
  }

  update(serializedValues: string | Record<string, unknown>): void {
    let values: Record<string, unknown>
    if (typeof serializedValues === 'string') {
      try {
        const parsed = JSON.parse(serializedValues)
        if (
          parsed == null ||
          typeof parsed !== 'object' ||
          Array.isArray(parsed)
        )
          return
        values = parsed as Record<string, unknown>
      } catch {
        return
      }
    } else {
      values = serializedValues
    }

    for (const [id, value] of Object.entries(values)) {
      const element = Array.from(
        this.querySelectorAll<HTMLElement>('[id]'),
      ).find((candidate) => candidate.id === id)
      if (element != null && 'value' in element) {
        ;(element as HTMLElement & { value: unknown }).value = value
      }
    }
  }

  protected onInteractivityChanged(isOn: boolean): void {
    this.querySelectorAll<HTMLElement>('*').forEach((element) => {
      const tag = element.tagName.toLowerCase()
      if (!mathaleaCustomElementsRegistry.has(tag)) return
      if ('interactivityOn' in element) {
        ;(
          element as HTMLElement & { interactivityOn: boolean }
        ).interactivityOn = isOn
      } else {
        element.setAttribute('interactivity-on', isOn ? 'true' : 'false')
      }
    })
  }
}

export function addMathaleaCouteauSuisse(
  exercice: IExercice,
  questionIndex: number,
  options: Omit<
    MathaleaCouteauSuisseOptions,
    'numeroExercice' | 'questionIndex'
  >,
): string {
  exercice.autoCorrection[questionIndex] ??= {}
  const ac = exercice.autoCorrection[questionIndex] as {
    formatInteractif?: InteractivityType
    elements?: MathaleaCouteauSuisseChild[]
  }
  ac.formatInteractif = MathaleaCouteauSuisseElement.elementTag
  ac.elements = options.elements
  return MathaleaCouteauSuisseElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
  })
}

function parseElements(value: unknown): MathaleaCouteauSuisseChild[] {
  if (Array.isArray(value)) return value.filter(isChild)
  if (typeof value !== 'string' || value.trim() === '') return []
  try {
    const decoded = value.includes('%') ? decodeURIComponent(value) : value
    const parsed = JSON.parse(decoded)
    return Array.isArray(parsed) ? parsed.filter(isChild) : []
  } catch {
    return []
  }
}

function isChild(value: unknown): value is MathaleaCouteauSuisseChild {
  return (
    value != null &&
    typeof value === 'object' &&
    typeof (value as { formatInteractif?: unknown }).formatInteractif ===
      'string'
  )
}

registerMathaleaCustomElement(MathaleaCouteauSuisseElement)

export default MathaleaCouteauSuisseElement
