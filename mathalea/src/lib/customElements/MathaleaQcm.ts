import { context } from '../../modules/context'
import { addFeedback } from '../../modules/messages'
import { get } from '../html/dom'
import { texteGras } from '../outils/embellissements'
import { lettreDepuisChiffre } from '../outils/outilString'
import type { IExercice, UneProposition } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

export type MathaleaQcmValue = number[]

export type MathaleaQcmOptions = {
  id?: string
  numeroExercice: number
  questionIndex: number
  propositions: UneProposition[]
  radio?: boolean
  vertical?: boolean
  format?: 'case' | 'lettre' | string
  style?: string
  interactivityOn?: boolean
}

type MathaleaQcmVerificationResult = {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
}
/**
 * @author Jean-Claude Lhote
 */
export class MathaleaQcmElement extends MathaleaCustomElement {
  static readonly elementTag = 'mathalea-qcm'

  private selectedIndexes: MathaleaQcmValue = []

  static create({
    id,
    numeroExercice,
    questionIndex,
    propositions,
    radio = false,
    vertical = false,
    format = 'case',
    style = '',
    interactivityOn = true,
  }: MathaleaQcmOptions): string {
    if (context.isTypst) {
      return MathaleaQcmElement.createStaticHtml({
        numeroExercice,
        questionIndex,
        propositions,
        radio,
        vertical,
        format,
        style,
      })
    }
    if (!context.isHtml) {
      return MathaleaQcmElement.createStaticLatex({
        propositions,
        radio,
        vertical,
        format,
      })
    }
    return super.create({
      id:
        id ??
        `${MathaleaQcmElement.elementTag}Ex${numeroExercice}Q${questionIndex}`,
      numeroExercice,
      questionIndex,
      propositions,
      radio,
      vertical,
      format,
      propositionStyle: style,
      interactivityOn,
    })
  }

  private static createStaticHtml({
    numeroExercice,
    questionIndex,
    propositions,
    radio,
    vertical,
    format,
    style,
  }: Omit<MathaleaQcmOptions, 'id' | 'interactivityOn'>): string {
    const inputType = radio ? 'radio' : 'checkbox'
    const displayClass = vertical ? '' : 'inline-block'
    const choices = propositions
      .map((proposition, propositionIndex) => {
        const inputId = `checkEx${numeroExercice}Q${questionIndex}R${propositionIndex}`
        const input =
          format === 'lettre'
            ? ''
            : `<input type="${inputType}" name="checkEx${numeroExercice}Q${questionIndex}" id="${inputId}">`
        const letter =
          format === 'case'
            ? ''
            : `<label class="ml-2" style="${style}">${texteGras(
                lettreDepuisChiffre(propositionIndex + 1),
              )}.</label>`
        return `<div class="ex${numeroExercice} ${displayClass} my-2 align-center">${input}${letter}<label id="labelEx${numeroExercice}Q${questionIndex}R${propositionIndex}" class="ml-2" for="${inputId}" style="${style}">${proposition.texte}</label></div>`
      })
      .join('')

    return `<div class="my-3">${choices}</div>`
  }

  private static createStaticLatex({
    propositions,
    vertical,
    format,
  }: Pick<
    MathaleaQcmOptions,
    'propositions' | 'radio' | 'vertical' | 'format'
  >): string {
    if (context.isAmc || propositions.length === 0) return ''
    const cols = vertical ? 1 : propositions.length
    const caseOption = format === 'lettre' ? '' : ', case'
    const contenuTasks = propositions
      .map((proposition) => `  \\task ${proposition.texte}`)
      .join('\n')
    return `\n\\begin{qcmprop}[cols=${cols}${caseOption}]\n${contenuTasks}\n\\end{qcmprop}\n`
  }

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): MathaleaQcmVerificationResult {
    const qcm = document.querySelector(
      `#${MathaleaQcmElement.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`,
    ) as MathaleaQcmElement | null

    if (qcm != null) {
      exercice.answers ??= {}
      exercice.answers[qcm.id] = qcm.value
      qcm.interactivityOn = false
    }
    const resultat = verifQuestionQcm(exercice, questionIndex)

    return {
      isOk: resultat === 'OK',
      feedback: '',
      score: {
        nbBonnesReponses: resultat === 'OK' ? 1 : 0,
        nbReponses: 1,
      },
    }
  }

  static formatStudentAnswer(rawAnswer: string, questionHtml?: string): string {
    const parsedValue = parseSerializedQcmValue(rawAnswer)
    // Les copies Capytale antérieures stockent le texte lisible de la réponse.
    if (parsedValue == null) return rawAnswer
    const indexes = parsedValue
    if (indexes.length === 0) return 'aucune'
    if (questionHtml == null || typeof document === 'undefined') {
      return indexes.map((index) => lettreDepuisChiffre(index + 1)).join(' ; ')
    }

    const template = document.createElement('template')
    template.innerHTML = questionHtml
    const qcm = template.content.querySelector(MathaleaQcmElement.elementTag)
    const propositions = parsePropositions(qcm?.getAttribute('propositions'))
    return indexes
      .map(
        (index) => propositions[index]?.texte ?? lettreDepuisChiffre(index + 1),
      )
      .join(' ; ')
  }

  render(): string | void {
    const propositions = parsePropositions(this.getAttribute('propositions'))
    const selectedIndexes = new Set(this.selectedIndexes)
    const numeroExercice = Number(this.getAttribute('numero-exercice') ?? 0)
    const questionIndex = Number(this.getAttribute('question-index') ?? 0)
    const radio = this.getAttribute('radio') === 'true'
    const vertical = this.getAttribute('vertical') === 'true'
    const format = this.getAttribute('format') ?? 'case'
    const propositionStyle = this.getAttribute('proposition-style') ?? ''

    // Le contenu est composé de blocs : un élément inline ferait justifier
    // la dernière ligne de l'énoncé qui le précède (text-justify de la vue élève).
    this.style.display = 'block'
    this.replaceChildren()
    const propositionsContainer = document.createElement('div')
    const figures =
      !vertical &&
      propositions.some((proposition) =>
        /<svg\b[^>]*\bmathalea2d\b/.test(proposition.texte ?? ''),
      )
    propositionsContainer.className = figures
      ? 'mb-3 flex flex-wrap justify-between gap-x-4'
      : 'my-3'

    propositions.forEach((proposition, propositionIndex) => {
      const propositionContainer = document.createElement('div')
      propositionContainer.className = [
        `ex${numeroExercice}`,
        vertical ? '' : 'inline-block',
        'my-2',
        'align-center',
      ]
        .filter(Boolean)
        .join(' ')

      const inputId = `checkEx${numeroExercice}Q${questionIndex}R${propositionIndex}`
      if (format !== 'lettre') {
        const input = document.createElement('input')
        input.type = radio ? 'radio' : 'checkbox'
        input.name = `checkEx${numeroExercice}Q${questionIndex}`
        input.id = inputId
        input.tabIndex = this.interactivityOn ? 0 : -1
        input.className = 'disabled:cursor-default'
        input.style.height = '1rem'
        input.style.width = '1rem'
        input.checked = selectedIndexes.has(propositionIndex)
        input.disabled = !this.interactivityOn
        input.addEventListener('change', () => this.syncValueFromInputs())
        propositionContainer.appendChild(input)
      }

      if (format !== 'case') {
        const letterLabel = document.createElement('label')
        letterLabel.className = 'ml-2'
        letterLabel.style.cssText = propositionStyle
        letterLabel.innerHTML = `${texteGras(
          lettreDepuisChiffre(propositionIndex + 1),
        )}.`
        propositionContainer.appendChild(letterLabel)
      }

      const propositionLabel = document.createElement('label')
      propositionLabel.id = `labelEx${numeroExercice}Q${questionIndex}R${propositionIndex}`
      propositionLabel.className = 'ml-2'
      if (this.interactivityOn) propositionLabel.htmlFor = inputId
      propositionLabel.style.cssText = propositionStyle
      propositionLabel.style.cursor = this.interactivityOn ? '' : 'default'
      propositionLabel.innerHTML = proposition.texte
      propositionContainer.appendChild(propositionLabel)
      if (!figures) propositionContainer.append('\u2003')
      propositionsContainer.appendChild(propositionContainer)
    })

    this.appendChild(propositionsContainer)
    const result = document.createElement('div')
    result.className = 'm-2'
    result.id = `resultatCheckEx${numeroExercice}Q${questionIndex}`
    this.appendChild(result)
    this.syncValueFromInputs()
  }

  get value(): string {
    this.syncValueFromInputs()
    return JSON.stringify(this.selectedIndexes)
  }

  set value(nextValue: string | MathaleaQcmValue) {
    this.update(nextValue)
  }

  update(nextValue: string | MathaleaQcmValue): void {
    this.selectedIndexes = parseQcmValue(nextValue)
    const selectedIndexes = new Set(this.selectedIndexes)
    this.querySelectorAll<HTMLInputElement>('input').forEach((input, index) => {
      input.checked = selectedIndexes.has(index)
    })
  }

  protected onInteractivityChanged(isOn: boolean): void {
    this.render()
    this.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
      if (isOn) input.disabled = false
      input.style.pointerEvents = isOn ? '' : 'none'
      input.tabIndex = isOn ? 0 : -1
      input.setAttribute('aria-disabled', isOn ? 'false' : 'true')
      if (!isOn && input.type === 'radio' && input.checked) {
        input.classList.add('qcm-locked-checked')
      } else {
        input.classList.remove('qcm-locked-checked')
      }
    })
  }

  private syncValueFromInputs(): void {
    this.selectedIndexes = Array.from(
      this.querySelectorAll<HTMLInputElement>('input'),
    )
      .map((input, index) => ({ input, index }))
      .filter(({ input }) => input.checked)
      .map(({ index }) => index)
  }
}

export function addMathaleaQcm(
  exercice: IExercice,
  questionIndex: number,
  options: Omit<
    MathaleaQcmOptions,
    'numeroExercice' | 'questionIndex' | 'propositions'
  > = {},
): string {
  const autoCorrection = exercice.autoCorrection[questionIndex]
  autoCorrection.formatInteractif = MathaleaQcmElement.elementTag
  return MathaleaQcmElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
    propositions: autoCorrection.propositions ?? [],
  })
}

function parseQcmValue(value: unknown): MathaleaQcmValue {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is number => Number.isInteger(item) && item >= 0,
    )
  }
  if (typeof value !== 'string' || value.trim() === '') return []
  try {
    return parseQcmValue(JSON.parse(value))
  } catch {
    return []
  }
}

function parseSerializedQcmValue(value: string): MathaleaQcmValue | null {
  if (value.trim() === '') return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parseQcmValue(parsed) : null
  } catch {
    return null
  }
}

function parsePropositions(value: string | null | undefined): UneProposition[] {
  if (value == null || value === '') return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter(
          (proposition): proposition is UneProposition =>
            typeof proposition === 'object' &&
            proposition != null &&
            typeof proposition.texte === 'string',
        )
      : []
  } catch {
    return []
  }
}

export function verifQuestionQcm(exercice: IExercice, i: number) {
  let resultat
  const feedbackItems: { texte: string; feedback: string }[] = []
  let nbBonnesReponses = 0
  let nbMauvaisesReponses = 0
  let nbBonnesReponsesAttendues = 0
  exercice.answers ??= {}
  const nbReps = exercice.autoCorrection[i].propositions?.length ?? 0
  for (let k = 0; k < nbReps; k++) {
    if (exercice.autoCorrection[i]!.propositions![k].statut) {
      nbBonnesReponsesAttendues++
    }
  }
  const divReponseLigne = document.querySelector(
    `#resultatCheckEx${exercice.numeroExercice}Q${i}`,
  ) as HTMLDivElement
  exercice.autoCorrection[i]!.propositions!.forEach((proposition, indice) => {
    const label = document.querySelector(
      `#labelEx${exercice.numeroExercice}Q${i}R${indice}`,
    ) as HTMLLabelElement
    const check = document.querySelector(
      `#checkEx${exercice.numeroExercice}Q${i}R${indice}`,
    ) as HTMLInputElement
    if (check != null) {
      if (check.checked) {
        exercice.answers![`Ex${exercice.numeroExercice}Q${i}R${indice}`] = '1'
        const propositionFeedback = proposition.feedback
        if (propositionFeedback && propositionFeedback !== '') {
          feedbackItems.push({
            texte: proposition.texte,
            feedback: propositionFeedback,
          })
        }
      } else {
        exercice.answers![`Ex${exercice.numeroExercice}Q${i}R${indice}`] = '0'
      }
      if (proposition.statut) {
        if (check.checked === true) nbBonnesReponses++
        label?.classList.add('bg-coopmaths-warn-100', 'rounded-lg', 'p-1')
      } else if (check.checked === true) {
        label?.classList.add('bg-coopmaths-action-200', 'rounded-lg', 'p-1')
        nbMauvaisesReponses++
      }
      check.style.pointerEvents = 'none'
      check.tabIndex = -1
      check.setAttribute('aria-disabled', 'true')
      if (check.type === 'radio' && check.checked) {
        check.classList.add('qcm-locked-checked')
      }
    }
  })
  let typeFeedback = 'positive'
  if (
    nbMauvaisesReponses === 0 &&
    nbBonnesReponses === nbBonnesReponsesAttendues
  ) {
    if (divReponseLigne)
      divReponseLigne.innerHTML = '<span class="qcm-feedback-face">😎</span>'
    resultat = 'OK'
  } else {
    if (divReponseLigne)
      divReponseLigne.innerHTML = '<span class="qcm-feedback-face">☹️</span>'
    typeFeedback = 'error'
    resultat = 'KO'
  }
  if (divReponseLigne) divReponseLigne.style.fontSize = 'large'
  const eltFeedback = get(`feedbackEx${exercice.numeroExercice}Q${i}`, false)
  if (eltFeedback) eltFeedback.innerHTML = ''
  if (resultat === 'KO') {
    const isRadio = exercice.autoCorrection[i].options?.radio === true
    const detailHtml = feedbackItems
      .map((item) => `${item.texte} : ${item.feedback}`)
      .join('<br>')
    const chips: { label: string; tone: 'error' | 'positive' }[] = []
    if (
      nbBonnesReponses > 0 &&
      nbMauvaisesReponses === 0 &&
      nbBonnesReponses < nbBonnesReponsesAttendues
    ) {
      chips.push({
        label: `${nbBonnesReponses} trouvée${nbBonnesReponses > 1 ? 's' : ''}`,
        tone: 'positive',
      })
    } else if (nbMauvaisesReponses > 0 && !isRadio) {
      chips.push({
        label: `${nbMauvaisesReponses} erreur${nbMauvaisesReponses > 1 ? 's' : ''}`,
        tone: 'error',
      })
    }
    if (!isRadio && nbBonnesReponsesAttendues > nbBonnesReponses) {
      const nbManquantes = nbBonnesReponsesAttendues - nbBonnesReponses
      chips.push({
        label: `${nbManquantes} réponse${nbManquantes > 1 ? 's' : ''} manquante${nbManquantes > 1 ? 's' : ''}`,
        tone: 'positive',
      })
    }
    const chipSpans = chips
      .map(
        (chip) =>
          `<span class="qcm-feedback-chip qcm-feedback-chip--${chip.tone}">${chip.label}</span>`,
      )
      .join('')
    if (divReponseLigne) {
      if (detailHtml !== '') {
        const chipsHtml =
          chips.length > 0
            ? `<div class="qcm-feedback-chips">${chipSpans}</div>`
            : ''
        const message = `<div class="qcm-feedback-detail">${detailHtml}</div>${chipsHtml}`
        const div = addFeedback(divReponseLigne, {
          message,
          type: typeFeedback,
        })
        div.classList.add(
          'qcm-feedback-msg',
          `qcm-feedback-msg--${typeFeedback}`,
        )
      } else if (chips.length > 0) {
        addFeedback(divReponseLigne, {
          message: `<div class="qcm-feedback-chips-standalone">${chipSpans}</div>`,
          type: typeFeedback,
        })
      }
    }
  }
  return resultat
}

registerMathaleaCustomElement(MathaleaQcmElement)
