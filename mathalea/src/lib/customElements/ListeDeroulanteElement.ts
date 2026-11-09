import { renderMathInElement } from 'mathlive'
import mathliveCss from 'mathlive/static.css?inline'
import { context } from '../../modules/context'
import { uniformiseResults } from '../interactif/gestionInteractif'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'
export type AllChoiceType =
  | string
  | {
      latex?: string
      image?: string
      label?: string
      value: string
      svg?: string
    }
export type AllChoicesType = AllChoiceType[]
export type ListeDeroulanteDataOptions = {
  choix0?: boolean
  className?: string
  choices?: AllChoicesType
  style?: string
}

export type ListeDeroulanteCreateOptions = {
  id?: string
  numeroExercice?: number
  questionIndex?: number
} & ListeDeroulanteDataOptions

export type ChoixDeroulantOptions = Omit<
  ListeDeroulanteDataOptions,
  'choices'
> & {
  choices: AllChoicesType
}

export type ListeDeroulanteToQcmOptions = {
  vertical?: boolean
  ordered?: boolean
  [key: string]: unknown
}

/**
 * Fonction pour créer une liste déroulante dans un exercice interactif.
 */
export function choixDeroulant(
  exercice: IExercice,
  questionIndex: number,
  options: ChoixDeroulantOptions,
) {
  if (!exercice.interactif || !context.isHtml) return ''

  const {
    choices,
    choix0 = false,
    style,
    className = 'mx-2 listeDeroulante',
  } = options

  if (
    context.isHtml &&
    exercice?.autoCorrection[questionIndex]?.formatInteractif !==
      'liste-deroulante'
  ) {
    if (exercice?.autoCorrection == null) exercice.autoCorrection = []
    if (exercice?.autoCorrection[questionIndex] == null)
      exercice.autoCorrection[questionIndex] = {}
    exercice.autoCorrection[questionIndex].formatInteractif = 'liste-deroulante'
  }

  const result = ListeDeroulanteElement.create({
    numeroExercice: exercice.numeroExercice,
    questionIndex,
    className,
    choices,
    choix0: Boolean(choix0),
    style,
  })
  return result
}

/**
 * Fonction pour transformer une liste déroulante en QCM.
 */
export function listeDeroulanteToQcm(
  exercice: IExercice,
  question: number,
  choix: AllChoicesType,
  reponse: string,
  options: ListeDeroulanteToQcmOptions,
  correction?: string,
) {
  if (correction == null) correction = ''
  if (exercice == null || choix == null || reponse == null) {
    window.notify(
      'Il manque des paramètres pour transformer la liste déroulante en qcm',
      { exercice, question, choix, reponse },
    )
    return
  }
  const choiceValue = (choice: AllChoiceType): string =>
    typeof choice === 'string' ? choice : choice.value
  if (!choix.some((el) => choiceValue(el) === reponse)) {
    window.notify('La réponse doit faire partie de la liste !', {
      choix,
      reponse,
    })
    return
  }
  const vertical = options?.vertical ?? true
  const ordered = options?.ordered ?? true
  if (
    exercice.autoCorrection == null ||
    !Array.isArray(exercice.autoCorrection)
  ) {
    exercice.autoCorrection = []
  }
  if (exercice.autoCorrection[question] == null)
    exercice.autoCorrection[question] = {}
  exercice.autoCorrection[question] = {}
  exercice.autoCorrection[question].options = { vertical, ordered, ...options }
  exercice.autoCorrection[question].propositions = []
  let feedbackAttached = false

  const getFeedback = () => {
    if (!feedbackAttached) {
      feedbackAttached = true
      return correction
    }
    return undefined
  }

  for (let j = 0; j < choix.length; j++) {
    const currentChoice = choix[j]
    const currentValue = choiceValue(currentChoice)
    if (currentValue === '') continue
    if (typeof currentChoice === 'string') {
      exercice.autoCorrection[question].propositions.push({
        texte: currentChoice,
        statut: currentValue === reponse,
        feedback: getFeedback(),
      })
    } else if (currentChoice.label != null) {
      exercice.autoCorrection[question].propositions.push({
        texte: String(currentChoice.label),
        statut: currentValue === reponse,
        feedback: getFeedback(),
      })
    } else if (currentChoice.latex != null) {
      exercice.autoCorrection[question].propositions.push({
        texte: `$${currentChoice.latex}$`,
        statut: currentValue === reponse,
        feedback: getFeedback(),
      })
    } else if (currentChoice.svg != null) {
      const body = document.querySelector('body')
      if (body == null) {
        window.notify(
          "Impossible de créer le QCM à partir de la liste déroulante car le body n'existe pas",
          {},
        )
        return
      }
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      body.appendChild(svg)
      svg.setAttribute('viewBox', '-10 -10 20 20')
      svg.classList.add('svgChoice')
      svg.style.display = 'inline-block'
      svg.style.width = '20px'
      svg.style.height = '20px'
      svg.style.verticalAlign = 'middle'
      svg.innerHTML = currentChoice.svg ?? ''
      exercice.autoCorrection[question].propositions.push({
        texte: svg.outerHTML,
        statut: currentValue === reponse,
        feedback: getFeedback(),
      })
      setTimeout(() => {
        if (svg) body.removeChild(svg)
      }, 0)
    } else if (currentChoice.image != null) {
      const image = document.createElement('img')
      image.src = currentChoice.image ?? currentValue
      image.style.width = '30px'
      image.style.height = '30px'
      exercice.autoCorrection[question].propositions.push({
        texte: image.outerHTML,
        statut: currentValue === reponse,
        feedback: getFeedback(),
      })
    } else {
      console.warn(
        'La liste déroulante à convertir en qcm contient un choix de type inconnu',
        JSON.stringify(choix[j]),
      )
    }
  }
}
/**
 * @author Jean-Claude Lhote
 */
export class ListeDeroulanteElement extends MathaleaCustomElement {
  static readonly elementTag = 'liste-deroulante'

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    const spanReponseLigne = document.getElementById(
      `resultatCheckEx${exercice.numeroExercice}Q${questionIndex}`,
    )
    if (spanReponseLigne == null) {
      window.notify(
        "l'exercice ayant appelé ListeDeroulanteElement.verifQuestion() n'a pas correctement défini le span pour le smiley",
        { exercice: JSON.stringify(exercice) },
      )
    }

    const liste = document.querySelector(
      `#liste-deroulanteEx${exercice.numeroExercice}Q${questionIndex}`,
    ) as ListeDeroulanteElement | null
    if (liste == null) {
      window.notify(
        `Liste déroulante introuvable pour la question ${questionIndex} de l'exercice ${exercice.id}`,
        { exercice: exercice.id, questionIndex },
      )
      return uniformiseResults('KO')
    }
    liste.interactivityOn = false
    const value = liste?.value
    const reponse =
      exercice.autoCorrection[questionIndex]?.valeur?.reponse?.value

    if (exercice.answers === undefined) {
      exercice.answers = {}
    }
    if (liste) {
      exercice.answers[liste.id] = value ?? ''
    }

    const resultat: 'OK' | 'KO' = value === reponse ? 'OK' : 'KO'
    if (spanReponseLigne) {
      spanReponseLigne.innerHTML = resultat === 'OK' ? '😎' : '☹️'
      ;(spanReponseLigne as HTMLElement).style.fontSize = 'large'
      ;(spanReponseLigne as HTMLElement).style.marginLeft = '0.4rem'
    }

    return uniformiseResults(resultat)
  }

  // Compatibilité temporaire avec quelques tests et usages internes historiques.
  _listeDeroulante?: { select: (index: number) => void }
  private _lastValue = ''
  private _selectedValue = ''
  private _isOpen = false
  private _repositionListener = () => this.positionList()
  private _choices: AllChoicesType = []
  private _documentClickListener?: (event: MouseEvent) => void

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  static create({
    id,
    numeroExercice,
    questionIndex,
    className,
    choices,
    choix0,
    style,
  }: ListeDeroulanteCreateOptions): string {
    const attrs: string[] = []
    attrs.push(
      `id="${id ?? `${ListeDeroulanteElement.elementTag}Ex${numeroExercice ?? 0}Q${questionIndex ?? 0}`}"`,
    )
    if (className) attrs.push(`class="${className}"`)
    if (style) attrs.push(`style="${style}"`)
    if (choices) {
      attrs.push(`choices="${encodeURIComponent(JSON.stringify(choices))}"`)
    }
    if (choix0 !== undefined) {
      attrs.push(`choix0="${choix0 ? 'true' : 'false'}"`)
    }
    return `<liste-deroulante ${attrs.join(' ')}></liste-deroulante>`
  }

  static get observedAttributes() {
    return ['choices', 'choix0']
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ) {
    if ((name === 'choices' || name === 'choix0') && oldValue !== newValue) {
      this.render()
    }
  }

  connectedCallback() {
    this.hydrateCommonAttributes()
    this._documentClickListener = (event: MouseEvent) => {
      if (event.composedPath().includes(this)) return
      this.close()
    }
    document.addEventListener('click', this._documentClickListener)
    // La liste est en position fixed : elle doit suivre sa case quand la page défile.
    window.addEventListener('scroll', this._repositionListener, true)
    window.addEventListener('resize', this._repositionListener)
    if (this.choix0 && this._selectedValue === '' && this.choices[0] != null) {
      this._selectedValue = this.choiceValue(this.choices[0])
      this._lastValue = this._selectedValue
    }
    this.render()
    const spanId = this.id.replace('liste-deroulante', 'resultatCheck')
    if (this.querySelector(`[id="${spanId}"]`) == null) {
      const resultatCheck = document.createElement('span')
      resultatCheck.id = spanId
      this.appendChild(resultatCheck)
    }
  }

  disconnectedCallback() {
    if (this._documentClickListener != null) {
      document.removeEventListener('click', this._documentClickListener)
      this._documentClickListener = undefined
    }
    window.removeEventListener('scroll', this._repositionListener, true)
    window.removeEventListener('resize', this._repositionListener)
  }

  set choices(val: AllChoicesType) {
    this._choices = val
    this.render()
  }

  get choices(): AllChoicesType {
    if (this._choices.length > 0) return this._choices
    return this.choicesFromAttribute
  }

  private emitValueChangedIfNeeded() {
    const currentValue = this.value
    if (currentValue === this._lastValue) return
    this._lastValue = currentValue
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
    this.dispatchEvent(
      new CustomEvent('value-changed', {
        detail: { value: currentValue },
        bubbles: true,
        composed: true,
      }),
    )
  }

  render() {
    if (this.shadowRoot) this.shadowRoot.innerHTML = ''

    const mathliveStyle = document.createElement('style')
    mathliveStyle.textContent = mathliveCss
    this.shadowRoot!.appendChild(mathliveStyle)

    const style = document.createElement('style')
    style.textContent = `
/* En inline, la ligne ne s'agrandit pas : le cadre (plus haut que le texte)
   venait se coller à la ligne précédente. */
:host {
  display: inline-block;
  vertical-align: middle;
}

.listeDeroulante {
  position: relative;
  margin: 4px 0;
  display: inline-flex;
  align-items: center;
  background: #fff;
  color: #111827;
  border: 2px solid #4b5563; /* contraste fort, lisible en vidéoprojection */
  border-radius: 0.5rem;
  font-size: 1rem;
  line-height: 1.5;
  transition: all 0.2s ease;
  cursor: pointer;
  padding: 2px 6px;
}

.listeDeroulante:hover {
  border-color: #3b82f6; /* bleu Tailwind */
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.listeDeroulante span.currentChoice {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  outline: none;
  min-width: 4rem;
}

.listeDeroulante .trigger {
  margin-left: auto;
  padding: 6px 8px;
  font-weight: bold;
  font-size: 0.9em;
  color: #374151;
  border-left: 2px solid #9ca3af;
  transition: color 0.2s ease;
}

.listeDeroulante .trigger:hover {
  color: #111827; /* noir doux */
}

.listeDeroulante .ok {
  color: #10b981; /* vert moderne */
}

.listeDeroulante .ko {
  color: #ef4444; /* rouge moderne */
}

/* Liste déroulante */
.listeDeroulante ul {
  position: fixed;
  width: max-content;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  margin: 4px 0 0 0;
  padding: 4px 0;
  display: none;
  z-index: 100;
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
  animation: fadeIn 0.15s ease-out;
  max-height: 60vh;
  overflow-y: auto;
}

.listeDeroulante ul.visible {
  display: block;
}

.listeDeroulante ul li {
  display: flex;
  align-items: center;
  list-style-type: none;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.95rem;
  color: #111827;
  background: #fff;
  transition: background 0.2s ease, color 0.2s ease;
  border: none;
}

.listeDeroulante ul li:hover {
  background: #f3f4f6;
  color: #1d4ed8; /* bleu accent */
}

.listeDeroulante ul li.selected {
  background: #e0f2fe;
  color: #0284c7;
  font-weight: 500;
}

.listeDeroulante.disabled {
  cursor: not-allowed;
  background: #f3f4f6;
  border-color: #4b5563;
  color: #111827;
}

.listeDeroulante.disabled .trigger {
  color: #6b7280;
}

.listeDeroulante.disabled span.currentChoice {
  pointer-events: none;
}

.listeDeroulante math-field {
  pointer-events: none;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  padding: 0 !important;
}

.listeDeroulante ul li svg.svgChoice {
  width: 1.2em;
  height: 1.2em;
  margin-right: 6px;
  flex-shrink: 0;
  fill: currentColor;
}

/* Animation d'apparition */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`
    this.shadowRoot!.appendChild(style)

    const container = document.createElement('span')
    container.className = 'listeDeroulante'
    container.classList.toggle('disabled', !this.interactivityOn)
    if (!this.interactivityOn) container.setAttribute('aria-disabled', 'true')
    const current = document.createElement('span')
    current.className = 'currentChoice'
    current.role = 'listbox'
    current.tabIndex = this.interactivityOn ? 0 : -1
    this.renderChoice(current, this.selectedChoice ?? this.initialChoice)
    if (this.value === '') {
      current.style.fontStyle = 'italic'
      current.style.color = '#4b5563'
    }
    current.addEventListener('keydown', (event) => this.handleKeydown(event))
    const trigger = document.createElement('span')
    trigger.className = 'trigger'
    trigger.textContent = '˅'
    container.addEventListener('click', (event) => {
      event.stopPropagation()
      if (!this.interactivityOn) return
      this.toggle()
    })
    const list = document.createElement('ul')
    list.classList.toggle('visible', this._isOpen)
    this.selectableChoices.forEach((choice, index) => {
      const item = document.createElement('li')
      item.role = 'option'
      item.classList.toggle('selected', this.choiceValue(choice) === this.value)
      this.renderChoice(item, choice)
      item.addEventListener('click', (event) => {
        event.stopPropagation()
        this.selectSelectableIndex(index)
      })
      list.appendChild(item)
    })
    container.append(current, trigger, list)
    this.shadowRoot!.appendChild(container)
    // Projette les enfants light DOM (notamment le span `resultatCheck…` qui
    // reçoit le smiley 😎/☹️ après vérification) : sans ce slot, ils ne sont
    // jamais rendus puisque tout l'affichage se fait dans le shadow DOM.
    this.shadowRoot!.appendChild(document.createElement('slot'))
    this.positionList()
    this._listeDeroulante = { select: (index: number) => this.select(index) }
  }

  protected onInteractivityChanged(isOn: boolean): void {
    if (!isOn) this.close()
    this.render()
  }

  get value(): string {
    return this._selectedValue
  }

  set value(val: string) {
    const normalized = val ?? ''
    if (
      normalized !== '' &&
      !this.selectableChoices.some(
        (choice) => this.choiceValue(choice) === normalized,
      )
    ) {
      return
    }
    this._selectedValue = normalized
    this.render()
    this.emitValueChangedIfNeeded()
  }

  select(index: number): void {
    const selectableIndex = index - this.offset
    this.selectSelectableIndex(selectableIndex)
  }

  private selectSelectableIndex(index: number): void {
    const choice = this.selectableChoices[index]
    if (choice == null) return
    this._selectedValue = this.choiceValue(choice)
    this.close()
    this.render()
    this.emitValueChangedIfNeeded()
  }

  private toggle(): void {
    this._isOpen = !this._isOpen
    this.render()
  }

  private close(): void {
    if (!this._isOpen) return
    this._isOpen = false
    this.render()
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!this.interactivityOn) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      this.toggle()
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      this.close()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      this.selectRelative(1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      this.selectRelative(-1)
    }
  }

  private selectRelative(delta: number): void {
    const currentIndex = this.selectableChoices.findIndex(
      (choice) => this.choiceValue(choice) === this.value,
    )
    const nextIndex =
      currentIndex < 0
        ? delta > 0
          ? 0
          : this.selectableChoices.length - 1
        : Math.min(
            this.selectableChoices.length - 1,
            Math.max(0, currentIndex + delta),
          )
    this.selectSelectableIndex(nextIndex)
  }

  private get choicesFromAttribute(): AllChoicesType {
    if (!this.hasAttribute('choices')) return []
    try {
      return JSON.parse(
        decodeURIComponent(this.getAttribute('choices') ?? '[]'),
      ) as AllChoicesType
    } catch {
      return []
    }
  }

  private get choix0(): boolean {
    return this.hasAttribute('choix0')
      ? this.getAttribute('choix0') !== 'false'
      : false
  }

  private get offset(): number {
    return this.choix0 ? 0 : 1
  }

  private get initialChoice(): AllChoiceType | undefined {
    return this.choices[0]
  }

  private get selectableChoices(): AllChoicesType {
    return this.offset === 0 ? this.choices : this.choices.slice(1)
  }

  private get selectedChoice(): AllChoiceType | undefined {
    return this.selectableChoices.find(
      (choice) => this.choiceValue(choice) === this.value,
    )
  }

  private choiceValue(choice: AllChoiceType): string {
    return typeof choice === 'string' ? choice : choice.value
  }

  private renderChoice(
    container: HTMLElement,
    choice: AllChoiceType | undefined,
  ): void {
    container.textContent = ''
    if (choice == null) return
    if (typeof choice === 'string') {
      container.textContent = choice
      return
    }
    if (choice.latex != null) {
      container.innerHTML = `$$${choice.latex}$$`
      renderMathInElement(container, {
        renderAccessibleContent: 'speakable-text',
      })
      return
    }
    if (choice.image != null) {
      const image = document.createElement('img')
      image.src = choice.image
      image.style.width = '30px'
      image.style.height = '30px'
      container.appendChild(image)
      return
    }
    if (choice.svg != null) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('viewBox', '-10 -10 20 20')
      svg.classList.add('svgChoice')
      svg.style.display = 'block'
      svg.style.width = '20px'
      svg.style.height = '20px'
      svg.style.verticalAlign = 'middle'
      svg.innerHTML = choice.svg
      container.appendChild(svg)
      return
    }
    const span = document.createElement('span')
    span.innerHTML = choice.label ?? choice.value
    container.appendChild(span)
    renderMathInElement(container, {
      renderAccessibleContent: 'speakable-text',
    })
  }

  private positionList(): void {
    if (!this._isOpen || this.shadowRoot == null) return
    const container =
      this.shadowRoot.querySelector<HTMLElement>('.listeDeroulante')
    const list = this.shadowRoot.querySelector<HTMLUListElement>('ul')
    if (container == null || list == null) return
    const rect = container.getBoundingClientRect()
    list.style.top = `${rect.bottom}px`
    list.style.left = `${rect.left}px`
    list.style.minWidth = `${rect.width}px`
    list.style.maxHeight = `${Math.max(window.innerHeight - rect.bottom - 10, 100)}px`
  }
}

// La réponse stockée est déjà lisible et l'élément peut rester affiché dans
// les corrections : les hooks par défaut de MathaleaCustomElement suffisent.
registerMathaleaCustomElement(ListeDeroulanteElement)
export default ListeDeroulanteElement
