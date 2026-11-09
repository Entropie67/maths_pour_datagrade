import { context } from '../../modules/context'
import { isEqual } from '../interactif/checks/isEqual'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

export type SvgWithValue = { svg: string; value: number }

export type SvgSelectionOptions = {
  className?: string
  gapX?: string
  gapY?: string
  itemPadding?: string
  style?: string
  svgs: SvgWithValue[][] | SvgWithValue[]
  id?: string
}

export type SvgSelectionCreateOptions = SvgSelectionOptions & {
  numeroExercice?: number
  questionIndex?: number
}
/**
 * Composant de sélection d'éléments SVG avec valeurs associées
 * Permet de sélectionner une ou plusieurs options représentées par des SVG
 * Chaque SVG a une valeur numérique associée, et la sélection encode la somme de ces valeurs
 * Les options peuvent être organisées en lignes et colonnes avec des espacements personnalisables
 * La sélection est gérée via un attribut "value" qui encode la somme des valeurs des SVG sélectionnés
 * L'utilisateur peut cliquer sur les SVG pour les sélectionner/désélectionner, et le composant émet un événement "change" avec la nouvelle valeur
 * Le composant est accessible et réactif aux changements d'attributs
 * @author Jean-claude Lhote
 */
export class SvgSelectionElement extends MathaleaCustomElement {
  static readonly elementTag = 'svg-selection'

  static formatStudentAnswer(rawAnswer: string, questionHtml?: string): string {
    const selectedValue = Number(rawAnswer)
    if (!Number.isFinite(selectedValue) || selectedValue < 0) return rawAnswer
    if (selectedValue === 0) return 'aucune'
    if (typeof questionHtml !== 'string') return rawAnswer

    const tagMatch = questionHtml.match(/<svg-selection\b[^>]*>/i)
    if (!tagMatch) return rawAnswer
    const svgsAttr = tagMatch[0].match(/\ssvgs="([^"]*)"/i)
    if (!svgsAttr) return rawAnswer

    const svgsWithValue = this.parseSvgsAttributeStatic(svgsAttr[1])
    if (svgsWithValue.length === 0) return rawAnswer

    const selectedIndices = this.decodeValueStatic(selectedValue, svgsWithValue)
    if (selectedIndices.size === 0) return rawAnswer

    const flatSvgs = svgsWithValue.flatMap((row) => row.map((item) => item.svg))
    const selectedSvgs = Array.from(selectedIndices)
      .sort((a, b) => a - b)
      .map((index) => flatSvgs[index])
      .filter((svg): svg is string => typeof svg === 'string' && svg.length > 0)

    return selectedSvgs.length > 0 ? selectedSvgs.join(' ') : rawAnswer
  }

  private static parseSvgsAttributeStatic(value: string): SvgWithValue[][] {
    if (!value) return []
    try {
      const decoded = decodeURIComponent(value)
      const parsed = JSON.parse(decoded)
      return this.convertToSvgWithValueStatic(parsed)
    } catch {
      try {
        const parsed = JSON.parse(value)
        return this.convertToSvgWithValueStatic(parsed)
      } catch {
        return []
      }
    }
  }

  private static convertToSvgWithValueStatic(
    parsed: unknown,
  ): SvgWithValue[][] {
    if (!Array.isArray(parsed)) return []

    if (parsed.length > 0 && Array.isArray(parsed[0])) {
      const firstRow = parsed[0] as unknown[]
      if (
        firstRow.length > 0 &&
        typeof firstRow[0] === 'object' &&
        firstRow[0] !== null &&
        'svg' in firstRow[0] &&
        'value' in firstRow[0]
      ) {
        return parsed as SvgWithValue[][]
      }

      let globalIndex = 0
      return (parsed as unknown[][]).map((row) =>
        row.map((svg) => ({ svg: String(svg), value: globalIndex++ })),
      )
    }

    if (parsed.length > 0) {
      const first = parsed[0] as unknown
      if (
        typeof first === 'object' &&
        first !== null &&
        'svg' in first &&
        'value' in first
      ) {
        return [parsed as SvgWithValue[]]
      }

      return [
        (parsed as unknown[]).map((svg, index) => ({
          svg: String(svg),
          value: index,
        })),
      ]
    }
    return []
  }

  private static decodeValueStatic(
    value: number,
    svgsWithValue: SvgWithValue[][],
  ): Set<number> {
    const indices = new Set<number>()
    if (svgsWithValue.length === 0 || value === 0) return indices

    const items: Array<{ index: number; value: number }> = []
    let globalIndex = 0
    for (const row of svgsWithValue) {
      for (const item of row) {
        items.push({ index: globalIndex, value: item.value })
        globalIndex++
      }
    }

    const sortedItems = [...items].sort((a, b) => b.value - a.value)
    let remaining = value

    for (const item of sortedItems) {
      if (remaining === 0) break
      if (item.value <= remaining) {
        indices.add(item.index)
        remaining -= item.value
      }
    }

    if (remaining !== 0) return new Set<number>()
    return indices
  }

  private _svgsWithValue: SvgWithValue[][] = []
  private _selectedIndices: Set<number> = new Set()
  private _updatingValueAttr = false
  private _gapX = '0.2rem'
  private _gapY = '0.2rem'
  private _itemPadding = '2px'

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  static create({
    id,
    numeroExercice,
    questionIndex,
    className,
    svgs,
    style,
    gapX,
    gapY,
    itemPadding,
  }: SvgSelectionCreateOptions): string {
    const attrs: string[] = []
    const computedId =
      id ??
      `${SvgSelectionElement.elementTag}Ex${numeroExercice ?? 0}Q${questionIndex ?? 0}`
    attrs.push(`id="${computedId}"`)
    if (className) attrs.push(`class="${className}"`)
    if (style) attrs.push(`style="${style}"`)
    if (gapX) attrs.push(`gap-x="${gapX}"`)
    if (gapY) attrs.push(`gap-y="${gapY}"`)
    if (itemPadding) attrs.push(`item-padding="${itemPadding}"`)
    attrs.push(`svgs="${encodeURIComponent(JSON.stringify(svgs))}"`)
    return `<svg-selection ${attrs.join(' ')}></svg-selection>`
  }

  static verifQuestion(
    exercice: IExercice,
    i: number,
  ): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    const spanReponseLigne = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${i}`,
    )
    if (spanReponseLigne == null) {
      window.notify(
        "l'exercice ayant appelé verifQuestionSvgSelection() n'a pas correctement défini le span pour le smiley",
        { exercice: JSON.stringify(exercice) },
      )
    }
    const selection = document.querySelector(
      `#svg-selectionEx${exercice.numeroExercice}Q${i}`,
    ) as SvgSelectionElement | null
    let value = ''

    if (selection) {
      value = String(selection.value)
    }

    const repValue = exercice.autoCorrection[i]?.valeur?.reponse?.value
    if (exercice.answers === undefined) {
      exercice.answers = {}
    }
    if (selection) {
      exercice.answers[selection.id] = String(selection.value)
    }
    selection!.interactivityOn = false
    // La somme des valeurs sélectionnées est un flottant : 1/3 + 1/3 + 1/9
    // donne 0.7777777777777777 alors que 7/9 donne 0.7777777777777778.
    const memeValeur = isEqual({ tolerance: -9 })
    const reponses = Array.isArray(repValue) ? repValue : [repValue]
    const resultat: 'OK' | 'KO' = reponses.some(
      (reponse) => memeValeur.run(value, String(reponse)).passed,
    )
      ? 'OK'
      : 'KO'

    if (spanReponseLigne) {
      spanReponseLigne.innerHTML = resultat === 'OK' ? '😎' : '☹️'
      ;(spanReponseLigne as HTMLElement).style.fontSize = 'large'
    }

    return {
      isOk: resultat === 'OK',
      feedback: '',
      score: { nbBonnesReponses: resultat === 'OK' ? 1 : 0, nbReponses: 1 },
    }
  }

  static get observedAttributes() {
    return ['svgs', 'value', 'disabled', 'gap-x', 'gap-y', 'item-padding']
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return
    if (name === 'svgs') {
      this._svgsWithValue = this.parseSvgsAttribute(newValue)
      this.render()
      return
    }
    if (name === 'value' && !this._updatingValueAttr) {
      this._selectedIndices = this.decodeValue(Number(newValue))
      this.updateSelectionState()
      return
    }
    if (name === 'disabled') {
      this.updateDisabledState()
      return
    }
    if (name === 'gap-x') {
      this._gapX = newValue || '0.2rem'
      this.updateGapStyles()
      return
    }
    if (name === 'gap-y') {
      this._gapY = newValue || '0.2rem'
      this.updateGapStyles()
      return
    }
    if (name === 'item-padding') {
      this._itemPadding = newValue || '2px'
      this.updateItemPaddingStyles()
    }
  }

  connectedCallback() {
    this.hydrateFromAttributes()
    this.render()
  }

  get gapX(): string {
    return this._gapX
  }

  set gapX(val: string) {
    this._gapX = val || '0.2rem'
    this.setAttribute('gap-x', this._gapX)
    this.updateGapStyles()
  }

  get gapY(): string {
    return this._gapY
  }

  set gapY(val: string) {
    this._gapY = val || '0.2rem'
    this.setAttribute('gap-y', this._gapY)
    this.updateGapStyles()
  }

  get itemPadding(): string {
    return this._itemPadding
  }

  set itemPadding(val: string) {
    this._itemPadding = val || '2px'
    this.setAttribute('item-padding', this._itemPadding)
    this.updateItemPaddingStyles()
  }

  set svgs(val: SvgWithValue[][] | string[][] | string[]) {
    if (Array.isArray(val) && val.length > 0) {
      if (Array.isArray(val[0])) {
        // val est string[][] ou SvgWithValue[][]
        const firstRow = val[0]
        if (
          firstRow.length > 0 &&
          typeof firstRow[0] === 'object' &&
          'svg' in firstRow[0]
        ) {
          // C'est SvgWithValue[][]
          this._svgsWithValue = val as SvgWithValue[][]
        } else {
          // C'est string[][], convertir en SvgWithValue[][] avec value = index
          let globalIndex = 0
          this._svgsWithValue = (val as string[][]).map((row) =>
            row.map((svg) => ({ svg, value: globalIndex++ })),
          )
        }
      } else {
        // val est string[], convertir en SvgWithValue[][] avec une seule ligne
        this._svgsWithValue = [
          (val as string[]).map((svg, index) => ({ svg, value: index })),
        ]
      }
    } else {
      this._svgsWithValue = []
    }
    this.render()
  }

  get svgs(): SvgWithValue[][] {
    return this._svgsWithValue
  }

  set value(val: number | string) {
    const numericValue = Number(val)
    if (!Number.isFinite(numericValue) || numericValue < 0) return
    this._selectedIndices = this.decodeValue(numericValue)
    this.syncValueAttribute()
    this.updateSelectionState()
  }

  get value(): number {
    return this.encodeValue(this._selectedIndices)
  }

  private hydrateFromAttributes() {
    if (this.hasAttribute('svgs')) {
      this._svgsWithValue = this.parseSvgsAttribute(this.getAttribute('svgs'))
    }
    if (this.hasAttribute('value')) {
      const val = Number(this.getAttribute('value'))
      if (Number.isFinite(val)) {
        this._selectedIndices = this.decodeValue(val)
      }
    }
    if (this.hasAttribute('gap-x')) {
      this._gapX = this.getAttribute('gap-x') || '0.2rem'
    }
    if (this.hasAttribute('gap-y')) {
      this._gapY = this.getAttribute('gap-y') || '0.2rem'
    }
    if (this.hasAttribute('item-padding')) {
      this._itemPadding = this.getAttribute('item-padding') || '2px'
    }
  }

  private parseSvgsAttribute(value: string | null): SvgWithValue[][] {
    if (!value) return []
    try {
      const decoded = decodeURIComponent(value)
      const parsed = JSON.parse(decoded)
      return this.convertToSvgWithValue(parsed)
    } catch {
      try {
        const parsed = JSON.parse(value)
        return this.convertToSvgWithValue(parsed)
      } catch {
        return []
      }
    }
  }

  private convertToSvgWithValue(parsed: unknown): SvgWithValue[][] {
    if (!Array.isArray(parsed)) return []

    if (parsed.length > 0 && Array.isArray(parsed[0])) {
      // Array 2D
      const firstRow = parsed[0]
      if (
        firstRow.length > 0 &&
        typeof firstRow[0] === 'object' &&
        'svg' in firstRow[0]
      ) {
        // Déjà au format SvgWithValue[][]
        return parsed as SvgWithValue[][]
      } else {
        // Format string[][], convertir avec value = index global
        let globalIndex = 0
        return parsed.map((row) =>
          row.map((svg: unknown) => ({
            svg: String(svg),
            value: globalIndex++,
          })),
        )
      }
    } else if (parsed.length > 0) {
      // Array simple
      if (typeof parsed[0] === 'object' && 'svg' in parsed[0]) {
        // Format SvgWithValue[], convertir en 2D
        return [parsed as SvgWithValue[]]
      } else {
        // Format string[], convertir avec value = index
        return [
          parsed.map((svg: unknown, index: number) => ({
            svg: String(svg),
            value: index,
          })),
        ]
      }
    }
    return []
  }

  /**
   * Retourne le nombre total d'éléments SVG
   */
  private getTotalCount(): number {
    return this._svgsWithValue.reduce((sum, row) => sum + row.length, 0)
  }

  /**
   * Encode un ensemble d'indices en calculant la somme des valeurs associées
   * @param indices - Set d'indices à encoder
   * @returns Somme des valeurs des SVG sélectionnés
   */
  private encodeValue(indices: Set<number>): number {
    if (this._svgsWithValue.length === 0 || indices.size === 0) return 0

    let sum = 0
    let globalIndex = 0

    for (const row of this._svgsWithValue) {
      for (const item of row) {
        if (indices.has(globalIndex)) {
          sum += item.value
        }
        globalIndex++
      }
    }

    return sum
  }

  /**
   * Décode un nombre en un ensemble d'indices sélectionnés
   * Trouve toutes les combinaisons possibles dont la somme des valeurs = value
   * Note: Cette fonction retourne la première combinaison valide trouvée
   * @param value - Nombre à décoder
   * @returns Set d'indices correspondants
   */
  private decodeValue(value: number): Set<number> {
    const indices = new Set<number>()
    if (this._svgsWithValue.length === 0 || value === 0) return indices

    // Créer un tableau plat des valeurs avec leurs indices
    const items: Array<{ index: number; value: number }> = []
    let globalIndex = 0
    for (const row of this._svgsWithValue) {
      for (const item of row) {
        items.push({ index: globalIndex, value: item.value })
        globalIndex++
      }
    }

    // Algorithme glouton: sélectionner les éléments dont les valeurs correspondent
    // Trier par valeur décroissante pour une meilleure approche gloutonne
    const sortedItems = [...items].sort((a, b) => b.value - a.value)
    let remaining = value

    for (const item of sortedItems) {
      if (remaining === 0) break
      if (item.value <= remaining) {
        indices.add(item.index)
        remaining -= item.value
      }
    }

    // Si la somme ne correspond pas exactement, retourner un set vide
    if (remaining !== 0) {
      return new Set<number>()
    }

    return indices
  }

  private syncValueAttribute() {
    if (!this.isConnected) return
    this._updatingValueAttr = true
    this.setAttribute('value', String(this.value))
    this._updatingValueAttr = false
  }

  private updateSelectionState() {
    if (!this.shadowRoot) return
    const buttons = Array.from(
      this.shadowRoot.querySelectorAll<HTMLButtonElement>('button[data-index]'),
    )
    for (const button of buttons) {
      const index = Number(button.dataset.index)
      const isSelected = this._selectedIndices.has(index)
      button.classList.toggle('is-selected', isSelected)
      button.setAttribute('aria-pressed', isSelected ? 'true' : 'false')
    }
  }

  private updateDisabledState() {
    if (!this.shadowRoot) return
    const disabled = this.hasAttribute('disabled')
    const buttons = Array.from(
      this.shadowRoot.querySelectorAll<HTMLButtonElement>('button[data-index]'),
    )
    for (const button of buttons) {
      button.disabled = disabled
    }
  }

  private updateGapStyles() {
    if (!this.shadowRoot) return
    const container =
      this.shadowRoot.querySelector<HTMLDivElement>('.svg-selection')
    if (container) {
      container.style.gap = `${this._gapY} ${this._gapX}`
    }
  }

  private updateItemPaddingStyles() {
    if (!this.shadowRoot) return
    const style = this.shadowRoot.querySelector('style')
    if (style) {
      // Mettre à jour la feuille de style existante
      const oldText = style.textContent || ''
      const newText = oldText.replace(
        /\.svg-selection__item\s*\{[^}]*padding:[^;]*;/,
        `.svg-selection__item { padding: ${this._itemPadding};`,
      )
      if (newText !== oldText) {
        style.textContent = newText
      }
    }
  }

  private handleToggle = (event: Event) => {
    const target = event.currentTarget as HTMLButtonElement | null
    if (!target || this.hasAttribute('disabled')) return
    const index = Number(target.dataset.index)
    if (!Number.isFinite(index) || index < 0 || index >= this.getTotalCount())
      return

    if (this._selectedIndices.has(index)) {
      this._selectedIndices.delete(index)
    } else {
      this._selectedIndices.add(index)
    }
    this.syncValueAttribute()
    this.updateSelectionState()
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: this.value },
        bubbles: true,
      }),
    )
  }

  render() {
    if (!this.shadowRoot) return
    this.shadowRoot.innerHTML = ''

    const style = document.createElement('style')
    style.textContent = `
:host {
  display: inline-block;
}
.svg-selection {
  display: grid;
  gap: 0.2rem;
  align-items: center;
}
.svg-selection__item {
  background: transparent;
  border: none;
  padding: 0px;
  cursor: pointer;
  line-height: 0;
  transition: filter 0.15s ease;
}
.svg-selection__item.is-selected {
  filter: brightness(0.8);
}
.svg-selection__item:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
.svg-selection__item:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.svg-selection__item svg {
  pointer-events: none;
}
`
    this.shadowRoot.appendChild(style)

    const container = document.createElement('div')
    container.className = 'svg-selection'
    container.style.gap = `${this._gapY} ${this._gapX}`

    // Calculer le nombre de colonnes (max des longueurs de lignes)
    const maxCols = Math.max(...this._svgsWithValue.map((row) => row.length), 0)
    container.style.gridTemplateColumns = `repeat(${maxCols}, auto)`

    let globalIndex = 0
    this._svgsWithValue.forEach((row) => {
      row.forEach((item) => {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'svg-selection__item'
        button.dataset.index = String(globalIndex)
        button.setAttribute('aria-pressed', 'false')
        button.innerHTML = item.svg
        button.addEventListener('click', this.handleToggle)
        container.appendChild(button)
        globalIndex++
      })
    })

    this.shadowRoot.appendChild(container)
    this.updateSelectionState()
    this.updateDisabledState()
    const resultatCheck = document.createElement('span')
    resultatCheck.id = this.id
      ? `${this.id.replace('svg-selection', 'resultatCheck')}`
      : `svg-selection-resultat`
    this.appendChild(resultatCheck)
  }
}

export function addSvgSelection(
  exercice: IExercice,
  questionIndex: number,
  params: {
    svgs: SvgWithValue[][] | SvgWithValue[]
    options?: {
      gapX?: string
      gapY?: string
      itemPadding?: string
      style?: string
    }
    id?: string
  },
): string {
  if (!context.isHtml) return ''

  const { gapX, gapY, itemPadding, style } = params.options || {}
  if (
    context.isHtml &&
    exercice?.autoCorrection[questionIndex]?.formatInteractif !==
      'svg-selection'
  ) {
    if (exercice?.autoCorrection == null) exercice.autoCorrection = []
    if (exercice?.autoCorrection[questionIndex] == null)
      exercice.autoCorrection[questionIndex] = {}
    exercice.autoCorrection[questionIndex].formatInteractif = 'svg-selection'
  }

  return SvgSelectionElement.create({
    id: params.id,
    numeroExercice: exercice.numeroExercice,
    questionIndex,
    className: 'mx-2 svgSelection',
    style,
    gapX,
    gapY,
    itemPadding,
    svgs: params.svgs,
  })
}

registerMathaleaCustomElement(SvgSelectionElement)

export default SvgSelectionElement
