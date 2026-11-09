import { MathfieldElement } from 'mathlive'
import { texteApresChamp } from '../outils/outilString'
import { context } from '../../modules/context'
import { fonctionComparaison } from '../interactif/comparisonFunctions'
import { nommeChampsAutourDe } from '../interactif/nomAccessibleChamp'
import { setMathfield, setMathfieldListener } from '../interactif/setMathfield'
import { renderKatex } from '../latex/renderKatex'
import type {
  AnswerType,
  IExercice,
  OptionsComparaisonType,
  SharedQcmProposition,
} from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

export type MathaleaBranchingQcmFollowup = {
  prompt: string
  expected?: AnswerType
  callback?: (
    answer: string,
    choice: MathaleaBranchingQcmChoice,
    mathfield?: MathfieldElement,
  ) => {
    isOk: boolean
    feedback?: string
  }
  points?: number
  placeholder?: string
  dataKeyboard?: string
  texteAvant?: string
  texteApres?: string
}

export type MathaleaBranchingQcmChoice = SharedQcmProposition & {
  id?: string
  points?: number
  followup?: MathaleaBranchingQcmFollowup
}

export type MathaleaBranchingQcmData = {
  choices: MathaleaBranchingQcmChoice[]
  options?: {
    radio?: boolean
    vertical?: boolean
  }
}

export type MathaleaBranchingQcmOptions = MathaleaBranchingQcmData & {
  id?: string
  numeroExercice: number
  questionIndex: number
  interactivityOn?: boolean
}

type BranchingQcmState = {
  selectedIndex: number | null
  followupAnswer: string
}

type BranchingQcmVerificationResult = {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
}
/**
 * @author Jean-Claude Lhote
 */
export class MathaleaBranchingQcmElement extends MathaleaCustomElement {
  static readonly elementTag = 'mathalea-branching-qcm'

  private selectedIndex: number | null = null
  private followupAnswer = ''

  static create({
    id,
    numeroExercice,
    questionIndex,
    choices,
    options,
    interactivityOn = true,
  }: MathaleaBranchingQcmOptions): string {
    return super.create({
      id:
        id ??
        `${MathaleaBranchingQcmElement.elementTag}Ex${numeroExercice}Q${questionIndex}`,
      numeroExercice,
      questionIndex,
      choices: choices.map((choice) => ({
        id: choice.id,
        texte: choice.texte,
        statut: choice.statut,
        feedback: choice.feedback,
        points: choice.points,
        followup:
          choice.followup == null
            ? undefined
            : {
                prompt: choice.followup.prompt,
                points: choice.followup.points,
                placeholder: choice.followup.placeholder,
                dataKeyboard: choice.followup.dataKeyboard,
                texteAvant: choice.followup.texteAvant,
                texteApres: choice.followup.texteApres,
              },
      })),
      radio: options?.radio ?? true,
      vertical: options?.vertical ?? true,
      interactivityOn,
    })
  }

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): BranchingQcmVerificationResult {
    const element = document.querySelector(
      `#${MathaleaBranchingQcmElement.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`,
    ) as MathaleaBranchingQcmElement | null
    const data = getBranchingQcmData(exercice, questionIndex)
    if (element == null || data == null) return emptyResult()

    const state = element.readStateFromDom()
    const selectedChoice =
      state.selectedIndex == null ? null : data.choices[state.selectedIndex]
    const maxPoints = MathaleaBranchingQcmElement.pointsMaxQuestion(
      exercice,
      questionIndex,
    )
    let earnedPoints = 0
    const feedback: string[] = []

    if (selectedChoice == null) {
      feedback.push('Vous devez choisir une proposition.')
    } else if (selectedChoice.statut === true) {
      earnedPoints += selectedChoice.points ?? 1
    } else {
      feedback.push(
        selectedChoice.feedback ?? 'Le choix initial est incorrect.',
      )
    }

    if (selectedChoice?.followup != null) {
      const followupResult = verifyFollowup(
        state.followupAnswer,
        selectedChoice,
        element.querySelector('math-field') as MathfieldElement | null,
      )
      if (followupResult.isOk) {
        earnedPoints += selectedChoice.followup.points ?? 3
      } else {
        feedback.push(
          followupResult.feedback ?? 'La justification est incorrecte.',
        )
      }
    }

    element.writeCorrectionState(data, state)
    exercice.answers ??= {}
    exercice.answers[element.id] = JSON.stringify(state)

    return {
      isOk: earnedPoints === maxPoints,
      feedback: feedback.join('<br>'),
      score: {
        nbBonnesReponses: earnedPoints,
        nbReponses: maxPoints,
      },
    }
  }

  static pointsMaxQuestion(exercice: IExercice, i: number): number {
    const data = getBranchingQcmData(exercice, i)
    if (data == null) return 1
    const correctChoices = data.choices.filter((choice) => choice.statut)
    const referenceChoices =
      correctChoices.length > 0 ? correctChoices : data.choices
    return Math.max(
      1,
      ...referenceChoices.map(
        (choice) => (choice.points ?? 1) + (choice.followup?.points ?? 0),
      ),
    )
  }

  static formatStudentAnswer(rawAnswer: string, questionHtml?: string): string {
    const state = parseState(rawAnswer)
    if (state == null) return rawAnswer
    const selected =
      state.selectedIndex == null
        ? 'aucun choix'
        : `choix ${state.selectedIndex + 1}`
    const answer = state.followupAnswer.trim()
    return answer === ''
      ? selected
      : `${selected} ; justification : $${answer}$`
  }

  render(): string | void {
    const choices = parseChoices(this.getAttribute('choices'))
    const numeroExercice = Number(this.getAttribute('numero-exercice') ?? 0)
    const questionIndex = Number(this.getAttribute('question-index') ?? 0)
    const vertical = this.getAttribute('vertical') !== 'false'

    this.replaceChildren()
    const container = document.createElement('div')
    container.className = 'my-3'

    choices.forEach((choice, index) => {
      const row = document.createElement('div')
      row.className = vertical ? 'my-2' : 'inline-block my-2'
      const input = document.createElement('input')
      input.type = 'radio'
      input.name = `branchingQcmEx${numeroExercice}Q${questionIndex}`
      input.id = `branchingQcmEx${numeroExercice}Q${questionIndex}R${index}`
      input.checked = this.selectedIndex === index
      input.disabled = !this.interactivityOn
      input.addEventListener('change', () => {
        this.selectedIndex = index
        this.render()
      })
      row.append(input)

      const label = document.createElement('label')
      label.id = `labelBranchingQcmEx${numeroExercice}Q${questionIndex}R${index}`
      label.htmlFor = input.id
      label.className = 'ml-2'
      label.innerHTML = choice.texte
      row.append(label)
      container.append(row)
    })

    const selectedChoice =
      this.selectedIndex == null ? null : choices[this.selectedIndex]
    if (selectedChoice?.followup != null) {
      const followup = document.createElement('div')
      followup.className = 'my-3'
      const prompt = document.createElement('div')
      prompt.innerHTML = selectedChoice.followup.prompt
      followup.append(prompt)
      const fieldRow = document.createElement('div')
      fieldRow.className = 'my-2'
      if (selectedChoice.followup.texteAvant != null) {
        const label = document.createElement('label')
        label.htmlFor = `${this.id}-followup`
        label.innerHTML = selectedChoice.followup.texteAvant
        fieldRow.append(label)
      }
      const mathfield = new MathfieldElement()
      mathfield.id = `${this.id}-followup`
      mathfield.value = this.followupAnswer
      mathfield.readOnly = !this.interactivityOn
      mathfield.setAttribute(
        'data-keyboard',
        selectedChoice.followup.dataKeyboard ?? '',
      )
      mathfield.setAttribute('virtual-keyboard-mode', 'manual')
      const placeholder = selectedChoice.followup.placeholder
      if (placeholder != null)
        mathfield.setAttribute('placeholder', placeholder)
      mathfield.addEventListener('input', () => {
        this.followupAnswer = mathfield.value
      })
      fieldRow.append(mathfield)
      if (mathfield.isConnected) {
        setMathfield(mathfield)
      } else {
        mathfield.addEventListener('mount', setMathfieldListener, {
          once: true,
        })
      }
      if (selectedChoice.followup.texteApres != null) {
        const texteApres = document.createElement('span')
        texteApres.innerHTML = texteApresChamp(
          selectedChoice.followup.texteApres,
        )
        fieldRow.append(texteApres)
      }
      followup.append(fieldRow)
      container.append(followup)
    }

    const result = document.createElement('div')
    result.id = `resultatCheckEx${numeroExercice}Q${questionIndex}`
    result.className = 'm-2'
    container.append(result)
    const feedback = document.createElement('div')
    feedback.id = `feedbackEx${numeroExercice}Q${questionIndex}`
    feedback.style.display = 'none'
    container.append(feedback)
    this.append(container)
    try {
      renderKatex(this)
    } catch (error) {
      window.notify('Erreur lors du rendu KaTeX du QCM ramifié.', { error })
    }
    nommeChampsAutourDe(this)
  }

  get value(): string {
    return JSON.stringify(this.readStateFromDom())
  }

  set value(nextValue: string | BranchingQcmState) {
    const state =
      typeof nextValue === 'string' ? parseState(nextValue) : nextValue
    if (state == null) return
    this.selectedIndex = state.selectedIndex
    this.followupAnswer = state.followupAnswer
    this.render()
  }

  protected onInteractivityChanged(isOn: boolean): void {
    this.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
      input.disabled = !isOn
      input.tabIndex = isOn ? 0 : -1
    })
    this.querySelectorAll<MathfieldElement>('math-field').forEach((field) => {
      field.readOnly = !isOn
    })
  }

  private readStateFromDom(): BranchingQcmState {
    const checked = Array.from(
      this.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
    ).findIndex((input) => input.checked)
    const mathfield = this.querySelector(
      'math-field',
    ) as MathfieldElement | null
    this.selectedIndex = checked >= 0 ? checked : this.selectedIndex
    this.followupAnswer = mathfield?.value ?? this.followupAnswer
    return {
      selectedIndex: this.selectedIndex,
      followupAnswer: this.followupAnswer,
    }
  }

  private writeCorrectionState(
    data: MathaleaBranchingQcmData,
    state: BranchingQcmState,
  ): void {
    this.interactivityOn = false
    data.choices.forEach((choice, index) => {
      const label = document.querySelector(
        `#labelBranchingQcmEx${this.getAttribute('numero-exercice')}Q${this.getAttribute('question-index')}R${index}`,
      )
      if (choice.statut === true) {
        label?.classList.add('bg-coopmaths-warn-100', 'rounded-lg', 'p-1')
      } else if (state.selectedIndex === index) {
        label?.classList.add('bg-coopmaths-action-200', 'rounded-lg', 'p-1')
      }
    })
    const result = this.querySelector(
      `#resultatCheckEx${this.getAttribute('numero-exercice')}Q${this.getAttribute('question-index')}`,
    )
    const selectedChoice =
      state.selectedIndex == null ? null : data.choices[state.selectedIndex]
    const followupOk =
      selectedChoice?.followup == null
        ? true
        : verifyFollowup(
            state.followupAnswer,
            selectedChoice,
            this.querySelector('math-field') as MathfieldElement | null,
          ).isOk
    if (result != null) {
      result.innerHTML =
        selectedChoice?.statut === true && followupOk
          ? '<span class="qcm-feedback-face">😎</span>'
          : '<span class="qcm-feedback-face">☹️</span>'
      ;(result as HTMLDivElement).style.fontSize = 'large'
    }
  }
}

export function addMathaleaBranchingQcm(
  exercice: IExercice,
  questionIndex: number,
  data: MathaleaBranchingQcmData,
  options: Omit<
    MathaleaBranchingQcmOptions,
    'numeroExercice' | 'questionIndex' | 'choices'
  > = {},
): string {
  if (!context.isHtml) return ''
  exercice.autoCorrection[questionIndex] ??= {}
  exercice.autoCorrection[questionIndex].formatInteractif =
    MathaleaBranchingQcmElement.elementTag
  ;(
    exercice.autoCorrection[questionIndex] as {
      branchingQcm?: MathaleaBranchingQcmData
    }
  ).branchingQcm = data
  return MathaleaBranchingQcmElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
    choices: data.choices,
    options: data.options,
  })
}

function getBranchingQcmData(
  exercice: IExercice,
  questionIndex: number,
): MathaleaBranchingQcmData | null {
  const autoCorrection = exercice.autoCorrection?.[questionIndex] as
    { branchingQcm?: MathaleaBranchingQcmData } | undefined
  return autoCorrection?.branchingQcm ?? null
}

function verifyFollowup(
  answer: string,
  choice: MathaleaBranchingQcmChoice,
  mathfield: MathfieldElement | null = null,
): { isOk: boolean; feedback?: string } {
  const followup = choice.followup
  if (followup == null) return { isOk: true }
  if (typeof followup.callback === 'function') {
    return followup.callback(answer, choice, mathfield ?? undefined)
  }
  const expected = followup.expected
  if (expected == null) return { isOk: answer.trim().length > 0 }
  const compare = expected.compare ?? fonctionComparaison
  const expectedValues = Array.isArray(expected.value)
    ? expected.value
    : [expected.value]
  let feedback = ''
  for (const value of expectedValues) {
    const result = compare(
      answer,
      String(value),
      expected.options as OptionsComparaisonType | undefined,
    )
    if (result.isOk) return { isOk: true, feedback: result.feedback }
    if (result.feedback) feedback = result.feedback
  }
  return { isOk: false, feedback }
}

function parseChoices(value: string | null): MathaleaBranchingQcmChoice[] {
  if (value == null || value === '') return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter(
          (choice): choice is MathaleaBranchingQcmChoice =>
            typeof choice === 'object' &&
            choice != null &&
            typeof choice.texte === 'string',
        )
      : []
  } catch {
    return []
  }
}

function parseState(value: string): BranchingQcmState | null {
  try {
    const parsed = JSON.parse(value)
    if (typeof parsed !== 'object' || parsed == null) return null
    const selectedIndex = (parsed as { selectedIndex?: unknown }).selectedIndex
    return {
      selectedIndex:
        typeof selectedIndex === 'number' &&
        Number.isInteger(selectedIndex) &&
        selectedIndex >= 0
          ? selectedIndex
          : null,
      followupAnswer:
        typeof (parsed as BranchingQcmState).followupAnswer === 'string'
          ? (parsed as BranchingQcmState).followupAnswer
          : '',
    }
  } catch {
    return null
  }
}

function emptyResult(): BranchingQcmVerificationResult {
  return {
    isOk: false,
    feedback: 'erreur dans le programme',
    score: { nbBonnesReponses: 0, nbReponses: 1 },
  }
}

registerMathaleaCustomElement(MathaleaBranchingQcmElement)
