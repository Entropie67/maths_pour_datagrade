import { context } from '../../modules/context'
import { latexCalculator } from '../calculatrice/latexCalculator'
import ce, { fonctionComparaison } from '../interactif/comparisonFunctions'
import type { IExercice, OptionsComparaisonType } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

/**
 * Calculatrice Web Component autonome
 * Pas de dépendance Svelte, pur HTML/CSS/JS
 * Utilise ComputeEngine pour l'évaluation des expressions mathématiques
 *
 * Utilisation:
 * <my-calculator></my-calculator>
 * <my-calculator broken-keys="*,5"></my-calculator>
 * @author Jean-Claude Lhote
 */
export type CalculatorOptions = {
  id?: string
  brokenKeys?: string[]
  limitedKeys?: Array<{ key: string; limit: number }>
  interactivityOn?: boolean
}

export type CalculatorCreateOptions = CalculatorOptions & {
  numeroExercice?: number
  questionIndex?: number
}

export class CalculatorElement extends MathaleaCustomElement {
  static readonly elementTag = 'my-calculator'

  private fullText: string = '0' // Texte complet affiché
  private displayElement: HTMLElement | null = null
  private history: Array<{ expression: string; result: string }> = [] // Historique des calculs
  private cursorPosition: number = 1 // Position du curseur dans le texte complet (commence à la fin du '0')
  private keyUsageCount: Map<string, number> = new Map() // Compteur d'utilisations par touche
  private keyUsageLimit: Map<string, number> = new Map() // Limite d'utilisations par touche
  private linkedInput: HTMLInputElement | null = null
  private lastResult = ''

  private buttons = [
    { label: '←', value: 'left', type: 'navigation' },
    { label: '→', value: 'right', type: 'navigation' },
    { label: '(', value: '(', type: 'parenthesis' },
    { label: ')', value: ')', type: 'parenthesis' },
    { label: 'x²', value: '^2', type: 'function' },
    { label: '7', value: '7', type: 'number' },
    { label: '8', value: '8', type: 'number' },
    { label: '9', value: '9', type: 'number' },
    { label: '÷', value: '/', type: 'operator' },
    { label: '4', value: '4', type: 'number' },
    { label: '5', value: '5', type: 'number' },
    { label: '6', value: '6', type: 'number' },
    { label: '×', value: '*', type: 'operator' },
    { label: '1', value: '1', type: 'number' },
    { label: '2', value: '2', type: 'number' },
    { label: '3', value: '3', type: 'number' },
    { label: '−', value: '-', type: 'operator' },
    { label: '0', value: '0', type: 'number' },
    { label: '.', value: '.', type: 'decimal' },
    { label: '+/-', value: 'negate', type: 'function' },
    { label: '+', value: '+', type: 'operator' },
    { label: 'EXE', value: '=', type: 'equals' },
    { label: 'C', value: 'clear', type: 'clear' },
  ]

  connectedCallback() {
    this.hydrateCommonAttributes()
    this.render()
    if (this.interactivityOn) this.addKeyboardSupport()
    this.appendContextElementsFromId()
  }

  disconnectedCallback() {
    this.removeKeyboardSupport()
  }

  private keyboardHandler = (e: KeyboardEvent) => {
    if (!this.interactivityOn) return
    // Empêcher le comportement par défaut pour certaines touches
    if (['ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) {
      e.preventDefault()
    }

    // Navigation
    if (e.key === 'ArrowLeft') {
      this.handleNavigation('left')
    } else if (e.key === 'ArrowRight') {
      this.handleNavigation('right')
    }
    // Nombres
    else if (e.key >= '0' && e.key <= '9') {
      this.handleNumberClick(e.key)
    }
    // Opérateurs
    else if (e.key === '+') {
      this.handleOperatorClick('+')
    } else if (e.key === '-') {
      this.handleOperatorClick('-')
    } else if (e.key === '*') {
      this.handleOperatorClick('*')
    } else if (e.key === '/') {
      this.handleOperatorClick('/')
    }
    // Parenthèses
    else if (e.key === '(') {
      this.handleParenthesis('(')
    } else if (e.key === ')') {
      this.handleParenthesis(')')
    }
    // Point décimal
    else if (e.key === '.' || e.key === ',') {
      this.handleDecimalClick()
    }
    // Exécution
    else if (e.key === 'Enter' || e.key === '=') {
      this.handleEquals()
    }
    // Effacer
    else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
      this.handleClear()
    }
    // Backspace pour supprimer le caractère avant le curseur
    else if (e.key === 'Backspace') {
      if (this.cursorPosition > 0) {
        this.fullText =
          this.fullText.slice(0, this.cursorPosition - 1) +
          this.fullText.slice(this.cursorPosition)
        this.cursorPosition--
        if (this.fullText === '') {
          this.fullText = '0'
          this.cursorPosition = 1
        }
        this.updateDisplay()
      }
    }
    // Delete pour supprimer le caractère après le curseur
    else if (e.key === 'Delete') {
      if (this.cursorPosition < this.fullText.length) {
        this.fullText =
          this.fullText.slice(0, this.cursorPosition) +
          this.fullText.slice(this.cursorPosition + 1)
        this.updateDisplay()
      }
    }
  }

  private addKeyboardSupport() {
    document.addEventListener('keydown', this.keyboardHandler)
  }

  private removeKeyboardSupport() {
    document.removeEventListener('keydown', this.keyboardHandler)
  }

  private appendContextElementsFromId() {
    const id = this.getAttribute('id') || ''
    const match = id.match(/^(?:Calculatrice|my-calculator)Ex(\d+)Q(\d+)$/)
    if (!match) return

    const exercice = match[1]
    const question = match[2]
    const inputId = `champTexteEx${exercice}Q${question}`
    const spanId = `resultatCheckEx${exercice}Q${question}`

    // Nettoyer les anciens éléments s'ils existent (cas nouvelleVersion)
    const oldInput = document.getElementById(inputId)
    const oldSpan = document.getElementById(spanId)
    if (oldInput) oldInput.remove()
    if (oldSpan) oldSpan.remove()

    const calculator = this.querySelector('.calculator')
    if (!calculator) return

    // Créer les nouveaux éléments
    const input = document.createElement('input')
    input.type = 'hidden'
    input.id = inputId
    this.linkedInput = input

    const span = document.createElement('span')
    span.id = spanId

    calculator.insertAdjacentElement('afterend', input)
    calculator.insertAdjacentElement('afterend', span)
  }

  render() {
    // Récupérer les touches cassées
    const brokenKeysAttr = this.getAttribute('broken-keys')
    const brokenKeys = brokenKeysAttr
      ? brokenKeysAttr.split(',').map((key) => key.trim())
      : []

    // Récupérer les touches à utilisation limitée (format: "2:1,5:2" = touche 2 utilisable 1 fois, touche 5 utilisable 2 fois)
    const limitedKeysAttr = this.getAttribute('limited-keys')
    this.keyUsageLimit.clear()
    this.keyUsageCount.clear()
    if (limitedKeysAttr) {
      limitedKeysAttr.split(',').forEach((pair) => {
        const [key, limit] = pair.split(':').map((s) => s.trim())
        if (key && limit) {
          this.keyUsageLimit.set(key, parseInt(limit, 10))
          this.keyUsageCount.set(key, 0)
        }
      })
    }

    // Créer le HTML
    this.innerHTML = `
      <div class="calculator">
        <div class="display">0</div>
        <div class="buttons-grid">
          ${this.buttons
            .map((btn) => {
              const isBroken = brokenKeys.includes(btn.value)
              return `
            <button 
              class="calc-btn btn-${this.getBtnClass(btn.type)}"
              data-value="${btn.value}"
              data-type="${btn.type}"
              ${isBroken || !this.interactivityOn ? 'disabled' : ''}
              ${isBroken ? 'data-broken="true"' : ''}
            >
              ${btn.label}
            </button>
          `
            })
            .join('')}
        </div>
      </div>
    `

    // Ajouter les styles
    this.addStyles()

    // Récupérer la référence du display
    this.displayElement = this.querySelector('.display')

    // Attacher les événements
    this.attachEventListeners()
  }

  private getBtnClass(type: string): string {
    if (type === 'number' || type === 'decimal') return 'number'
    if (type === 'operator') return 'operator'
    if (type === 'parenthesis') return 'parenthesis'
    if (type === 'equals') return 'equals'
    if (type === 'function') return 'function'
    if (type === 'navigation') return 'navigation'
    if (type === 'clear') return 'clear'
    return 'number'
  }

  private checkAndIncrementKeyUsage(value: string): boolean {
    // Vérifier si cette touche a une limite d'utilisation
    if (this.keyUsageLimit.has(value)) {
      const currentCount = this.keyUsageCount.get(value) || 0
      const limit = this.keyUsageLimit.get(value) || 0

      if (currentCount >= limit) {
        return false // Touche déjà utilisée le nombre maximum de fois
      }

      // Incrémenter le compteur
      this.keyUsageCount.set(value, currentCount + 1)

      // Si on atteint la limite, désactiver le bouton
      if (currentCount + 1 >= limit) {
        const btn = this.querySelector(
          `[data-value="${value}"]`,
        ) as HTMLButtonElement
        if (btn) {
          btn.disabled = true
        }
      }
    }
    return true // Touche utilisable
  }

  private attachEventListeners() {
    // Bouton C
    const clearBtn = this.querySelector('.btn-clear') as HTMLButtonElement
    clearBtn?.addEventListener('click', () => this.handleClear())

    // Autres boutons
    const buttons = this.querySelectorAll(
      '[data-value]:not(.btn-clear)',
    ) as NodeListOf<HTMLButtonElement>
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return

        const value = btn.getAttribute('data-value')
        const type = btn.getAttribute('data-type')

        // Vérifier si la touche peut encore être utilisée (pour les touches limitées)
        if (!this.checkAndIncrementKeyUsage(value || '')) {
          return
        }

        if (type === 'number') {
          this.handleNumberClick(value || '')
        } else if (type === 'decimal') {
          this.handleDecimalClick()
        } else if (type === 'operator') {
          this.handleOperatorClick(value || '')
        } else if (type === 'parenthesis') {
          this.handleParenthesis(value || '')
        } else if (type === 'equals') {
          this.handleEquals()
        } else if (type === 'function') {
          this.handleFunction(value || '')
        } else if (type === 'navigation') {
          this.handleNavigation(value || '')
        } else if (type === 'clear') {
          this.handleClear()
        }
      })
    })
  }

  private handleNumberClick(value: string) {
    // Remplacer le '0' initial ou insérer à la position du curseur
    if (this.fullText === '0') {
      this.fullText = value
      this.cursorPosition = 1
    } else {
      this.fullText =
        this.fullText.slice(0, this.cursorPosition) +
        value +
        this.fullText.slice(this.cursorPosition)
      this.cursorPosition++
    }
    this.updateDisplay()
  }

  private handleDecimalClick() {
    // Insérer un point décimal à la position du curseur
    this.fullText =
      this.fullText.slice(0, this.cursorPosition) +
      '.' +
      this.fullText.slice(this.cursorPosition)
    this.cursorPosition++
    this.updateDisplay()
  }

  private handleOperatorClick(op: string) {
    const symbol = this.getOperationSymbol(op)
    const before = this.fullText.slice(0, this.cursorPosition)
    const after = this.fullText.slice(this.cursorPosition)

    this.fullText = before + symbol + after
    this.cursorPosition += symbol.length
    this.updateDisplay()
  }

  private handleParenthesis(paren: string) {
    // Insérer la parenthèse avec un espace si nécessaire
    if (paren === '(') {
      if (this.fullText === '0') {
        this.fullText = '('
        this.cursorPosition = 2
      } else {
        const before = this.fullText.slice(0, this.cursorPosition)
        const after = this.fullText.slice(this.cursorPosition)
        this.fullText = before + '(' + after
        this.cursorPosition += 2
      }
    } else {
      // Parenthèse fermante
      const before = this.fullText.slice(0, this.cursorPosition)
      const after = this.fullText.slice(this.cursorPosition)
      this.fullText = before + ')' + after
      this.cursorPosition += 2
    }
    this.updateDisplay()
  }

  private handleFunction(func: string) {
    if (func === '^2') {
      // Insérer ^2 à la position du curseur
      this.fullText =
        this.fullText.slice(0, this.cursorPosition) +
        '^2' +
        this.fullText.slice(this.cursorPosition)
      this.cursorPosition += 2
      this.updateDisplay()
    } else if (func === 'negate') {
      // Changer le signe du nombre avant le curseur
      const before = this.fullText.slice(0, this.cursorPosition)
      const after = this.fullText.slice(this.cursorPosition)

      // Pattern pour trouver un nombre (possiblement déjà négatif entre parenthèses)
      // Match patterns: "5", "3.14", "(-5)", "(-3.14)"
      const negativePattern = /\(-(\d+\.?\d*)\)\s*$/
      const positivePattern = /(\d+\.?\d*)\s*$/

      // Vérifier si c'est déjà un nombre négatif entre parenthèses
      const negMatch = before.match(negativePattern)
      if (negMatch) {
        // Transformer (-5) en 5
        const number = negMatch[1]
        const matchStart = negMatch.index!
        const newBefore = before.slice(0, matchStart) + number
        this.fullText = newBefore + after
        this.cursorPosition = matchStart + number.length
      } else {
        // Vérifier si c'est un nombre positif
        const posMatch = before.match(positivePattern)
        if (posMatch) {
          const number = posMatch[1]
          // Ne pas transformer 0 en (-0)
          if (parseFloat(number) === 0) {
            return
          }
          // Transformer 5 en (-5)
          const matchStart = posMatch.index!
          const newBefore = before.slice(0, matchStart) + '(-' + number + ')'
          this.fullText = newBefore + after
          this.cursorPosition = matchStart + number.length + 3 // +3 pour "(-" et ")"
        }
      }

      this.updateDisplay()
    }
  }

  private handleNavigation(direction: string) {
    if (direction === 'left') {
      this.cursorPosition = Math.max(0, this.cursorPosition - 1)
    } else if (direction === 'right') {
      this.cursorPosition = Math.min(
        this.fullText.length,
        this.cursorPosition + 1,
      )
    }
    this.updateDisplay()
  }

  private handleEquals() {
    if (!this.fullText || this.fullText === '0') {
      return
    }

    // Évaluer l'expression
    try {
      const result = this.evaluateExpression(this.fullText)
      const resultStr = result.toString()

      // Ajouter à l'historique
      this.history.push({
        expression: this.fullText,
        result: resultStr,
      })

      this.fullText = resultStr
      this.lastResult = resultStr
      this.cursorPosition = resultStr.length
      this.updateDisplay()
      if (this.linkedInput) {
        this.linkedInput.value = resultStr
      }
    } catch (error) {
      const cause = error instanceof Error ? error : new Error(String(error))
      window.notify(`Erreur d'évaluation: ${cause.message}`, {
        expression: this.fullText,
      })
    }
  }

  private handleClear() {
    this.fullText = '0'
    this.cursorPosition = 1
    this.history = [] // Vider l'historique
    this.lastResult = ''
    if (this.linkedInput) this.linkedInput.value = ''

    // Réinitialiser les compteurs d'utilisation des touches limitées
    this.keyUsageCount.clear()
    this.keyUsageLimit.forEach((limit, key) => {
      this.keyUsageCount.set(key, 0)
    })

    // Réactiver tous les boutons limités
    this.keyUsageLimit.forEach((limit, key) => {
      const btn = this.querySelector(
        `[data-value="${key}"]:not([data-broken="true"])`,
      ) as HTMLButtonElement
      if (btn) {
        btn.disabled = false
      }
    })

    this.updateDisplay()
  }

  private updateDisplay() {
    if (this.displayElement) {
      const before = this.fullText.slice(0, this.cursorPosition)
      const after = this.fullText.slice(this.cursorPosition)
      const escapeHtml = (value: string) =>
        value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

      this.displayElement.innerHTML =
        escapeHtml(before) +
        '<span class="calc-cursor" aria-hidden="true"></span>' +
        escapeHtml(after)

      // Scroller automatiquement vers la droite pour voir le curseur
      setTimeout(() => {
        if (this.displayElement) {
          this.displayElement.scrollLeft = this.displayElement.scrollWidth
        }
      }, 0)
    }
  }

  private evaluateExpression(expr: string): number {
    try {
      // Remplacer les symboles mathématiques par les opérateurs standard
      const evalExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .trim()
        // Nettoyer les espaces autour des parenthèses et opérateurs
        .replace(/\s+/g, '')

      // Utiliser le ComputeEngine du projet pour évaluer l'expression
      const parsed = ce.parse(evalExpr)
      const evaluated = parsed.evaluate()

      // Convertir le résultat en nombre
      const result = Number(evaluated.valueOf())

      if (isNaN(result)) {
        throw new Error('Résultat invalide')
      }

      return result
    } catch (e: unknown) {
      throw new Error("Erreur d'évaluation", { cause: e })
    }
  }

  private getOperationSymbol(op: string): string {
    const symbols: { [key: string]: string } = {
      '+': '+',
      '-': '−',
      '*': '×',
      '/': '÷',
    }
    return symbols[op] || op
  }

  private addStyles() {
    if (this.querySelector('style')) return

    const style = document.createElement('style')
    style.textContent = `
      .calculator {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 0.75rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 0.5rem;
        width: 200px;
        max-width: 100%;
        user-select: none;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      }

      .display {
        background: #1a1a2e;
        color: #00d4ff;
        font-size: 1rem;
        padding: 0.5rem;
        border-radius: 0.25rem;
        text-align: right;
        white-space: nowrap;
        overflow-x: auto;
        overflow-y: hidden;
        min-height: 1.5rem;
        max-width: 100%;
        width: 100%;
        box-sizing: border-box;
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        font-weight: bold;
        font-family: 'Courier New', monospace;
        /* Masquer la scrollbar mais garder le scroll fonctionnel */
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .display::-webkit-scrollbar {
        display: none;
      }

      .calc-cursor {
        display: inline-block;
        width: 1px;
        height: 1.2em;
        background: #00d4ff;
        margin: 0 1px;
        animation: calc-blink 1s step-end infinite;
        vertical-align: -0.15em;
      }

      @keyframes calc-blink {
        50% {
          opacity: 0;
        }
      }

      .buttons-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(25px, 1fr));
        grid-auto-rows: 28px;
        gap: 0.375rem;
        width: 100%;
        grid-auto-flow: row;
      }

      .calc-btn {
        padding: 0.1rem;
        font-size: 0.8rem;
        font-weight: bold;
        border: none;
        border-radius: 0.2rem;
        cursor: pointer;
        transition: all 0.2s ease;
        color: white;
        user-select: none;
        min-width: 0;
        line-height: 1;
        position: relative;
        overflow: hidden;
      }

      .btn-number {
        background-color: #383838;
        color: #ffffff;
      }

      .btn-number:hover:not(:disabled) {
        background-color: #505050;
        transform: scale(1.05);
      }

      .btn-operator {
        background-color: #ff9500;
        color: #ffffff;
      }

      .btn-operator:hover:not(:disabled) {
        background-color: #ffb333;
        transform: scale(1.05);
      }

      .btn-parenthesis {
        background-color: #9c27b0;
        color: #ffffff;
      }

      .btn-parenthesis:hover:not(:disabled) {
        background-color: #b039d4;
        transform: scale(1.05);
      }

      .btn-function {
        background-color: #2196f3;
        color: #ffffff;
      }

      .btn-function:hover:not(:disabled) {
        background-color: #42a5f5;
        transform: scale(1.05);
      }

      .btn-navigation {
        background-color: #607d8b;
        color: #ffffff;
      }

      .btn-navigation:hover:not(:disabled) {
        background-color: #78909c;
        transform: scale(1.05);
      }

      .btn-equals {
        background-color: #4caf50;
        color: #ffffff;
        grid-column: span 2;
      }

      .btn-equals:hover:not(:disabled) {
        background-color: #66bb6a;
        transform: scale(1.05);
      }

      .btn-clear {
        background-color: #f44336;
        color: #ffffff;
        grid-column: span 1;
      }

      .btn-clear:hover:not(:disabled) {
        background-color: #ef5350;
        transform: scale(1.02);
      }

      .calc-btn:disabled {
        opacity: 0.85;
        cursor: not-allowed;
      }

      .calc-btn[data-broken="true"]::before,
      .calc-btn[data-broken="true"]::after {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(
            135deg,
            transparent 44%,
            rgba(0, 0, 0, 0.55) 45%,
            rgba(255, 255, 255, 0.3) 48%,
            transparent 52%
          ),
          linear-gradient(
            20deg,
            transparent 55%,
            rgba(0, 0, 0, 0.5) 56%,
            rgba(255, 255, 255, 0.26) 59%,
            transparent 63%
          );
        opacity: 0.75;
      }

      .btn-number[data-broken="true"]::before,
      .btn-number[data-broken="true"]::after {
        background: linear-gradient(
            135deg,
            transparent 42%,
            rgba(255, 255, 255, 0.85) 44%,
            rgba(0, 0, 0, 0.35) 47%,
            transparent 52%
          ),
          linear-gradient(
            20deg,
            transparent 53%,
            rgba(255, 255, 255, 0.75) 55%,
            rgba(0, 0, 0, 0.3) 58%,
            transparent 63%
          );
        opacity: 0.9;
      }

      .calc-btn[data-broken="true"]::after {
        transform: translateY(10%);
        opacity: 0.55;
      }

      .calc-btn:disabled:hover {
        transform: none;
      }

      .calc-btn:active:not(:disabled) {
        transform: scale(0.95);
      }
    `
    this.appendChild(style)
  }

  /**
   * Getter pour récupérer l'historique des calculs effectués
   * Format: Array<{ expression: string, result: string }>
   */
  getHistory(): Array<{ expression: string; result: string }> {
    return [...this.history] // Retourner une copie pour éviter les modifications externes
  }

  get value(): string {
    return this.lastResult
  }

  set value(nextValue: unknown) {
    const value = nextValue == null ? '' : String(nextValue)
    this.lastResult = value
    this.fullText = value || '0'
    this.cursorPosition = this.fullText.length
    if (this.linkedInput) this.linkedInput.value = value
    this.updateDisplay()
  }

  protected onInteractivityChanged(isOn: boolean): void {
    if (isOn) this.addKeyboardSupport()
    else this.removeKeyboardSupport()
    this.querySelectorAll<HTMLButtonElement>('.calc-btn').forEach((button) => {
      const value = button.dataset.value ?? ''
      const reachedLimit =
        this.keyUsageLimit.has(value) &&
        (this.keyUsageCount.get(value) ?? 0) >=
          (this.keyUsageLimit.get(value) ?? 0)
      button.disabled =
        !isOn || button.dataset.broken === 'true' || reachedLimit
    })
  }

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    const id = `${CalculatorElement.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`
    const calculator = document.getElementById(id) as CalculatorElement | null
    if (calculator == null) {
      return {
        isOk: false,
        feedback: 'Calculatrice introuvable dans la question.',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }

    const answer = calculator.value
    exercice.answers ??= {}
    exercice.answers[calculator.id] = answer

    const expected = exercice.autoCorrection?.[questionIndex]?.valeur?.reponse
    if (expected == null) {
      return {
        isOk: false,
        feedback: 'Réponse attendue absente de l’autocorrection.',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }
    const compare = expected.compare ?? fonctionComparaison
    const expectedValues = Array.isArray(expected.value)
      ? expected.value
      : [expected.value]
    let feedback = ''
    const isOk = expectedValues.some((value) => {
      const result = compare(
        answer,
        String(value),
        expected.options as OptionsComparaisonType | undefined,
      )
      feedback ||= result.feedback ?? ''
      return result.isOk
    })

    calculator.interactivityOn = false
    const resultSpan = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${questionIndex}`,
    )
    if (resultSpan != null) resultSpan.innerHTML = isOk ? '😎' : '☹️'
    const feedbackDiv = document.querySelector(
      `#feedbackEx${exercice.numeroExercice}Q${questionIndex}`,
    )
    if (feedbackDiv != null) feedbackDiv.innerHTML = isOk ? '' : feedback

    return {
      isOk,
      feedback: isOk ? '' : feedback,
      score: { nbBonnesReponses: isOk ? 1 : 0, nbReponses: 1 },
    }
  }

  static create({
    id,
    numeroExercice = 0,
    questionIndex = 0,
    brokenKeys = [],
    limitedKeys = [],
    interactivityOn = true,
  }: CalculatorCreateOptions = {}): string {
    const computedId =
      id ??
      `${CalculatorElement.elementTag}Ex${numeroExercice}Q${questionIndex}`
    if (context.isTypst) {
      return `<mathalea-typst>${renderCalculatorTypst(brokenKeys)}</mathalea-typst>`
    }
    if (!context.isHtml) return latexCalculator(brokenKeys)
    return super.create({
      id: computedId,
      brokenKeys: brokenKeys.join(','),
      limitedKeys: limitedKeys
        .map(({ key, limit }) => `${key}:${limit}`)
        .join(','),
      interactivityOn,
    })
  }

  set brokenKeys(keys: string[]) {
    this.setAttribute('broken-keys', keys.join(','))
    this.render()
  }

  get brokenKeys(): string[] {
    const attr = this.getAttribute('broken-keys')
    return attr ? attr.split(',').map((key) => key.trim()) : []
  }

  set limitedKeys(config: { key: string; limit: number }[]) {
    const attr = config.map((c) => `${c.key}:${c.limit}`).join(',')
    this.setAttribute('limited-keys', attr)
    this.render()
  }

  get limitedKeys(): { key: string; limit: number }[] {
    const attr = this.getAttribute('limited-keys')
    if (!attr) return []
    return attr.split(',').map((pair) => {
      const [key, limit] = pair.split(':').map((s) => s.trim())
      return { key, limit: parseInt(limit, 10) }
    })
  }
}

function renderCalculatorTypst(brokenKeys: string[]): string {
  const broken = new Set(brokenKeys)
  const buttons = [
    ['←', 'left'],
    ['→', 'right'],
    ['(', '('],
    [')', ')'],
    ['x²', '^2'],
    ['7', '7'],
    ['8', '8'],
    ['9', '9'],
    ['÷', '/'],
    ['4', '4'],
    ['5', '5'],
    ['6', '6'],
    ['×', '*'],
    ['1', '1'],
    ['2', '2'],
    ['3', '3'],
    ['−', '-'],
    ['0', '0'],
    ['.', '.'],
    ['+/-', 'negate'],
    ['+', '+'],
    ['EXE', '='],
  ]
  const cells = buttons
    .map(([label, value]) => {
      const fill = broken.has(value) ? 'luma(230)' : 'white'
      const textFill = broken.has(value) ? 'gray' : 'black'
      return `box(width: 16mm, height: 9mm, fill: ${fill}, stroke: .5pt, radius: 1.5pt, align(center + horizon, text(fill: ${textFill})[${label}]))`
    })
    .join(',\n')
  return `#box(fill: luma(245), stroke: .8pt, radius: 3pt, inset: 4pt)[
  #box(width: 70mm, height: 10mm, fill: luma(220), stroke: .5pt, align(right + horizon)[0])
  #v(3pt)
  #grid(columns: (1fr, 1fr, 1fr, 1fr), gutter: 2pt, ${cells})
]`
}

export function addCalculator(
  exercice: IExercice,
  questionIndex: number,
  options: CalculatorOptions = {},
): string {
  exercice.autoCorrection ??= []
  exercice.autoCorrection[questionIndex] ??= {}
  exercice.autoCorrection[questionIndex].formatInteractif =
    CalculatorElement.elementTag
  return CalculatorElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice,
    questionIndex,
  })
}

// Enregistrer le Web Component (uniquement si pas déjà défini)
registerMathaleaCustomElement(CalculatorElement)

export default CalculatorElement
