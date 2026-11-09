import { context } from '../../modules/context'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

export type OperateurCompteEstBon = '+' | '-' | '*' | '/'

export type OperationCompteEstBon = {
  resultId: string
  leftId: string
  rightId: string
  operator: OperateurCompteEstBon
}

export type CompteEstBonState = {
  version: 1
  operations: OperationCompteEstBon[]
  finalId: string | null
  selectedIds: string[]
}

export type CompteEstBonOptions = {
  id?: string
  cible: number
  tirage: number[]
  avecDivision: boolean
  meilleurEcart: number
  interactivityOn?: boolean
}

type CompteEstBonCreateOptions = CompteEstBonOptions & {
  numeroExercice?: number
  questionIndex?: number
}

type CarteCompteEstBon = {
  id: string
  valeur: number
  disponible: boolean
}

const EMPTY_STATE: CompteEstBonState = {
  version: 1,
  operations: [],
  finalId: null,
  selectedIds: [],
}

function parseNumberArray(rawValue: string | null): number[] {
  if (rawValue == null) return []
  try {
    const value: unknown = JSON.parse(rawValue)
    return Array.isArray(value) ? value.map(Number).filter(Number.isFinite) : []
  } catch {
    return []
  }
}

function parseState(rawValue: unknown): CompteEstBonState | null {
  try {
    const value: unknown =
      typeof rawValue === 'string' ? JSON.parse(rawValue) : rawValue
    if (typeof value !== 'object' || value == null) return null
    const candidate = value as Partial<CompteEstBonState>
    if (!Array.isArray(candidate.operations)) return null
    return {
      version: 1,
      operations: candidate.operations.filter(
        (operation): operation is OperationCompteEstBon =>
          typeof operation === 'object' &&
          operation != null &&
          typeof operation.resultId === 'string' &&
          typeof operation.leftId === 'string' &&
          typeof operation.rightId === 'string' &&
          ['+', '-', '*', '/'].includes(operation.operator),
      ),
      finalId: typeof candidate.finalId === 'string' ? candidate.finalId : null,
      selectedIds: Array.isArray(candidate.selectedIds)
        ? candidate.selectedIds.filter(
            (id): id is string => typeof id === 'string',
          )
        : [],
    }
  } catch {
    return null
  }
}

function symboleLatex(operator: OperateurCompteEstBon): string {
  if (operator === '*') return '\\times'
  if (operator === '/') return '\\div'
  return operator
}

function resultatOperation(
  gauche: number,
  droite: number,
  operator: OperateurCompteEstBon,
  avecDivision: boolean,
): number | null {
  if (operator === '+') return gauche + droite
  if (operator === '*') return gauche * droite
  if (operator === '-') return gauche > droite ? gauche - droite : null
  if (!avecDivision || droite === 0 || gauche % droite !== 0) return null
  return gauche / droite
}

function rejoueOperations(
  tirage: number[],
  operations: OperationCompteEstBon[],
  avecDivision: boolean,
): {
  cartes: Map<string, CarteCompteEstBon>
  operations: OperationCompteEstBon[]
} {
  const cartes = new Map<string, CarteCompteEstBon>(
    tirage.map((valeur, index) => [
      `p${index}`,
      { id: `p${index}`, valeur, disponible: true },
    ]),
  )
  const operationsValides: OperationCompteEstBon[] = []

  for (const operation of operations) {
    const gauche = cartes.get(operation.leftId)
    const droite = cartes.get(operation.rightId)
    if (
      gauche == null ||
      droite == null ||
      !gauche.disponible ||
      !droite.disponible ||
      gauche.id === droite.id ||
      operation.resultId !== `r${operationsValides.length}`
    ) {
      break
    }
    const resultat = resultatOperation(
      gauche.valeur,
      droite.valeur,
      operation.operator,
      avecDivision,
    )
    if (resultat == null || resultat <= 0 || !Number.isInteger(resultat)) break

    gauche.disponible = false
    droite.disponible = false
    cartes.set(operation.resultId, {
      id: operation.resultId,
      valeur: resultat,
      disponible: true,
    })
    operationsValides.push(operation)
  }
  return { cartes, operations: operationsValides }
}

function texteOperations(
  tirage: number[],
  state: CompteEstBonState,
  avecDivision: boolean,
): string {
  const cartes = new Map<string, number>(
    tirage.map((valeur, index) => [`p${index}`, valeur]),
  )
  const lignes: string[] = []
  for (const operation of state.operations) {
    const gauche = cartes.get(operation.leftId)
    const droite = cartes.get(operation.rightId)
    if (gauche == null || droite == null) break
    const resultat = resultatOperation(
      gauche,
      droite,
      operation.operator,
      avecDivision,
    )
    if (resultat == null) break
    cartes.set(operation.resultId, resultat)
    lignes.push(
      `$${gauche} ${symboleLatex(operation.operator)} ${droite} = ${resultat}$`,
    )
  }
  const valeurFinale = state.finalId == null ? null : cartes.get(state.finalId)
  if (valeurFinale != null) lignes.push(`Résultat proposé : $${valeurFinale}$.`)
  return lignes.length > 0 ? lignes.join('<br>') : 'aucune réponse'
}

export class MathaleaCompteEstBonElement extends MathaleaCustomElement {
  static readonly elementTag = 'mathalea-compte-est-bon'

  private cible = 0
  private tirage: number[] = []
  private avecDivision = true
  private meilleurEcart = 0
  private state: CompteEstBonState = structuredClone(EMPTY_STATE)

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  static create({
    id,
    numeroExercice,
    questionIndex,
    ...options
  }: CompteEstBonCreateOptions): string {
    if (!context.isHtml || context.isTypst) return ''
    return super.create({
      id:
        id ??
        `${this.elementTag}Ex${numeroExercice ?? 0}Q${questionIndex ?? 0}`,
      numeroExercice,
      questionIndex,
      ...options,
    })
  }

  connectedCallback(): void {
    this.hydrateCommonAttributes()
    this.cible = Number(this.getAttribute('cible'))
    this.tirage = parseNumberArray(this.getAttribute('tirage'))
    this.avecDivision = this.getAttribute('avec-division') !== 'false'
    this.meilleurEcart = Math.max(
      0,
      Number(this.getAttribute('meilleur-ecart')) || 0,
    )
    const restored = parseState(this.getAttribute('value'))
    if (restored != null) this.state = restored
    this.normaliseState()
    this.render()
  }

  get value(): CompteEstBonState {
    return structuredClone(this.state)
  }

  set value(rawState: CompteEstBonState | string) {
    this.update(rawState)
  }

  update(rawState: CompteEstBonState | string): void {
    const state = parseState(rawState)
    this.state = state ?? structuredClone(EMPTY_STATE)
    this.normaliseState()
    this.render()
  }

  protected onInteractivityChanged(): void {
    this.render()
  }

  private normaliseState(): void {
    const replay = rejoueOperations(
      this.tirage,
      this.state.operations,
      this.avecDivision,
    )
    const disponibles = new Set(
      [...replay.cartes.values()]
        .filter((carte) => carte.disponible)
        .map((carte) => carte.id),
    )
    this.state = {
      version: 1,
      operations: replay.operations,
      finalId:
        this.state.finalId != null && disponibles.has(this.state.finalId)
          ? this.state.finalId
          : null,
      selectedIds: this.state.selectedIds
        .filter((id) => disponibles.has(id))
        .slice(0, 2),
    }
  }

  private cartesDisponibles(): CarteCompteEstBon[] {
    return [
      ...rejoueOperations(
        this.tirage,
        this.state.operations,
        this.avecDivision,
      ).cartes.values(),
    ].filter((carte) => carte.disponible)
  }

  private selectionne(id: string): void {
    if (!this.interactivityOn) return
    const index = this.state.selectedIds.indexOf(id)
    if (index >= 0) {
      this.state.selectedIds.splice(index, 1)
    } else if (this.state.selectedIds.length < 2) {
      this.state.selectedIds.push(id)
    } else {
      this.state.selectedIds = [this.state.selectedIds[1], id]
    }
    this.render()
  }

  private placeOperande(id: string, position: 0 | 1): void {
    if (!this.interactivityOn) return
    const selection = this.state.selectedIds.filter(
      (selectedId) => selectedId !== id,
    )
    selection.splice(position, 0, id)
    this.state.selectedIds = selection.slice(0, 2)
    this.render()
  }

  private appliqueOperation(operator: OperateurCompteEstBon): void {
    if (!this.interactivityOn || this.state.selectedIds.length !== 2) return
    const cartes = new Map(
      this.cartesDisponibles().map((carte) => [carte.id, carte]),
    )
    const gauche = cartes.get(this.state.selectedIds[0])
    const droite = cartes.get(this.state.selectedIds[1])
    if (gauche == null || droite == null) return
    const resultat = resultatOperation(
      gauche.valeur,
      droite.valeur,
      operator,
      this.avecDivision,
    )
    if (resultat == null) return
    const resultId = `r${this.state.operations.length}`
    this.state.operations.push({
      resultId,
      leftId: gauche.id,
      rightId: droite.id,
      operator,
    })
    this.state.finalId = resultId
    this.state.selectedIds = [resultId]
    this.render()
  }

  private annule(): void {
    if (!this.interactivityOn || this.state.operations.length === 0) return
    this.state.operations.pop()
    this.state.finalId = this.state.operations.at(-1)?.resultId ?? null
    this.state.selectedIds = []
    this.normaliseState()
    this.render()
  }

  private recommence(): void {
    if (!this.interactivityOn) return
    this.state = structuredClone(EMPTY_STATE)
    this.render()
  }

  private proposeSelection(): void {
    if (!this.interactivityOn || this.state.selectedIds.length !== 1) return
    this.state.finalId = this.state.selectedIds[0]
    this.render()
  }

  render(): void {
    if (this.shadowRoot == null) return
    const cartes = this.cartesDisponibles()
    const valeurs = new Map(cartes.map((carte) => [carte.id, carte.valeur]))
    const [leftId, rightId] = this.state.selectedIds
    const gauche = leftId == null ? undefined : valeurs.get(leftId)
    const droite = rightId == null ? undefined : valeurs.get(rightId)
    const resultatFinal =
      this.state.finalId == null ? undefined : valeurs.get(this.state.finalId)
    const disabled = !this.interactivityOn

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; margin: 1rem 0; font-family: inherit; }
        .atelier { border: 1px solid #cbd5e1; border-radius: .75rem; padding: 1rem; background: #f8fafc; }
        h3 { font-size: 1rem; margin: 0 0 .65rem; }
        .cartes, .operations, .actions { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
        .carte, .operande { min-width: 3.2rem; min-height: 3rem; border: 2px solid #64748b; border-radius: .5rem; background: white; color: #0f172a; font-size: 1.35rem; font-weight: 700; cursor: pointer; }
        .carte[aria-pressed="true"] { border-color: #2563eb; background: #dbeafe; }
        .carte.finale { box-shadow: 0 0 0 3px #86efac; }
        .choix { display: grid; grid-template-columns: minmax(5rem, 1fr) auto minmax(5rem, 1fr); gap: .5rem; align-items: center; margin: 1rem 0; }
        .operande { display: grid; place-items: center; border-style: dashed; color: #334155; }
        .operande.vide { font-size: .85rem; font-weight: 400; }
        .swap { border: 0; background: transparent; font-size: 1.35rem; cursor: pointer; }
        .operation, .action { border: 1px solid #64748b; border-radius: .4rem; background: white; padding: .45rem .75rem; font-size: 1rem; cursor: pointer; }
        .operation { min-width: 2.8rem; font-size: 1.25rem; }
        button:disabled { cursor: default; opacity: .45; }
        .historique { margin: 1rem 0; padding-left: 1.5rem; }
        .historique li { margin: .2rem 0; }
        .proposition { margin: .75rem 0; font-weight: 600; color: #166534; }
        .aide { color: #475569; font-size: .9rem; margin: .45rem 0; }
        @media (max-width: 480px) { .atelier { padding: .75rem; } .carte { min-width: 2.8rem; } }
      </style>
      <div class="atelier">
        <h3>Nombres disponibles</h3>
        <p class="aide">Sélectionner deux nombres, puis une opération. Les cartes peuvent aussi être déposées dans les deux emplacements.</p>
        <div class="cartes"></div>
        <div class="choix">
          <div class="operande ${gauche == null ? 'vide' : ''}" data-position="0">${gauche ?? 'Premier nombre'}</div>
          <button class="swap" type="button" aria-label="Inverser les opérandes" ${disabled || droite == null ? 'disabled' : ''}>⇄</button>
          <div class="operande ${droite == null ? 'vide' : ''}" data-position="1">${droite ?? 'Deuxième nombre'}</div>
        </div>
        <div class="operations"></div>
        <ol class="historique"></ol>
        <div class="proposition">${resultatFinal == null ? 'Aucun résultat proposé.' : `Résultat proposé : ${resultatFinal}.`}</div>
        <div class="actions">
          <button class="action proposer" type="button" ${disabled || this.state.selectedIds.length !== 1 ? 'disabled' : ''}>Proposer le nombre sélectionné</button>
          <button class="action annuler" type="button" ${disabled || this.state.operations.length === 0 ? 'disabled' : ''}>Annuler</button>
          <button class="action recommencer" type="button" ${disabled || this.state.operations.length === 0 ? 'disabled' : ''}>Recommencer</button>
          <span id="${this.id.replace(MathaleaCompteEstBonElement.elementTag, 'resultatCheck')}"></span>
        </div>
      </div>`

    const cartesContainer = this.shadowRoot.querySelector('.cartes')
    for (const carte of cartes) {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = `carte${carte.id === this.state.finalId ? ' finale' : ''}`
      button.textContent = String(carte.valeur)
      button.disabled = disabled
      button.draggable = !disabled
      button.setAttribute(
        'aria-pressed',
        String(this.state.selectedIds.includes(carte.id)),
      )
      button.addEventListener('click', () => this.selectionne(carte.id))
      button.addEventListener('dragstart', (event) => {
        event.dataTransfer?.setData('text/plain', carte.id)
      })
      cartesContainer?.appendChild(button)
    }

    this.shadowRoot
      .querySelectorAll<HTMLElement>('.operande')
      .forEach((zone) => {
        zone.addEventListener('dragover', (event) => event.preventDefault())
        zone.addEventListener('drop', (event) => {
          event.preventDefault()
          const id = event.dataTransfer?.getData('text/plain')
          if (id != null && valeurs.has(id)) {
            this.placeOperande(id, Number(zone.dataset.position) === 0 ? 0 : 1)
          }
        })
      })

    const operationsContainer = this.shadowRoot.querySelector('.operations')
    const operators: Array<[OperateurCompteEstBon, string]> = [
      ['+', '+'],
      ['-', '−'],
      ['*', '×'],
      ...(this.avecDivision
        ? ([['/', '÷']] as Array<[OperateurCompteEstBon, string]>)
        : []),
    ]
    for (const [operator, label] of operators) {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'operation'
      button.textContent = label
      button.disabled =
        disabled ||
        gauche == null ||
        droite == null ||
        resultatOperation(gauche, droite, operator, this.avecDivision) == null
      button.addEventListener('click', () => this.appliqueOperation(operator))
      operationsContainer?.appendChild(button)
    }

    const cartesHistorique = new Map<string, number>(
      this.tirage.map((valeur, index) => [`p${index}`, valeur]),
    )
    const historique = this.shadowRoot.querySelector('.historique')
    for (const operation of this.state.operations) {
      const left = cartesHistorique.get(operation.leftId)
      const right = cartesHistorique.get(operation.rightId)
      if (left == null || right == null) continue
      const result = resultatOperation(
        left,
        right,
        operation.operator,
        this.avecDivision,
      )
      if (result == null) continue
      cartesHistorique.set(operation.resultId, result)
      const li = document.createElement('li')
      li.textContent = `${left} ${operation.operator === '*' ? '×' : operation.operator === '/' ? '÷' : operation.operator} ${right} = ${result}`
      historique?.appendChild(li)
    }

    this.shadowRoot.querySelector('.swap')?.addEventListener('click', () => {
      this.state.selectedIds.reverse()
      this.render()
    })
    this.shadowRoot
      .querySelector('.proposer')
      ?.addEventListener('click', () => this.proposeSelection())
    this.shadowRoot
      .querySelector('.annuler')
      ?.addEventListener('click', () => this.annule())
    this.shadowRoot
      .querySelector('.recommencer')
      ?.addEventListener('click', () => this.recommence())
  }

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    const id = `${this.elementTag}Ex${exercice.numeroExercice ?? 0}Q${questionIndex}`
    const element = document.getElementById(
      id,
    ) as MathaleaCompteEstBonElement | null
    if (element == null) {
      return {
        isOk: false,
        feedback: 'La réponse ne peut pas être lue.',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }

    element.normaliseState()
    const cartes = rejoueOperations(
      element.tirage,
      element.state.operations,
      element.avecDivision,
    ).cartes
    const valeurFinale =
      element.state.finalId == null
        ? undefined
        : cartes.get(element.state.finalId)?.valeur
    const ecart =
      valeurFinale == null
        ? Number.POSITIVE_INFINITY
        : Math.abs(valeurFinale - element.cible)
    const points = ecart === element.meilleurEcart ? 2 : ecart < 5 ? 1 : 0
    const isOk = points === 2

    exercice.answers ??= {}
    exercice.answers[element.id] = JSON.stringify(element.value)
    element.interactivityOn = false

    const result = element.shadowRoot?.querySelector(
      `#${element.id.replace(this.elementTag, 'resultatCheck')}`,
    )
    if (result != null)
      result.textContent = isOk ? '😎' : points === 1 ? '🙂' : '☹️'

    const feedback =
      valeurFinale == null
        ? 'Sélectionner le résultat proposé avant de valider.'
        : isOk
          ? 'La meilleure valeur possible est atteinte.'
          : points === 1
            ? `Le résultat proposé est à ${ecart} de la cible : 1 point sur 2 est accordé.`
            : `Le résultat proposé est à ${ecart} de la cible.`
    return {
      isOk,
      feedback,
      score: { nbBonnesReponses: points, nbReponses: 2 },
    }
  }

  static pointsMaxQuestion(): number {
    return 2
  }

  static formatStudentAnswer(rawAnswer: string, questionHtml?: string): string {
    const state = parseState(rawAnswer)
    if (state == null || typeof questionHtml !== 'string') return rawAnswer
    const tag = questionHtml.match(/<mathalea-compte-est-bon\b[^>]*>/i)?.[0]
    if (tag == null) return rawAnswer
    const tirageRaw = tag.match(/\stirage="([^"]*)"/i)?.[1]
    const avecDivision = tag.match(/\savec-division="([^"]*)"/i)?.[1]
    return texteOperations(
      parseNumberArray(tirageRaw ?? null),
      state,
      avecDivision !== 'false',
    )
  }
}

export function addCompteEstBon(
  exercice: IExercice,
  questionIndex: number,
  options: CompteEstBonOptions,
): string {
  exercice.autoCorrection[questionIndex] ??= {}
  exercice.autoCorrection[questionIndex].formatInteractif =
    MathaleaCompteEstBonElement.elementTag
  return MathaleaCompteEstBonElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice,
    questionIndex,
  })
}

registerMathaleaCustomElement(MathaleaCompteEstBonElement)

export default MathaleaCompteEstBonElement
