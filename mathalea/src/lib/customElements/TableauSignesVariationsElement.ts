import katexCss from 'katex/dist/katex.min.css?inline'
import { fonctionComparaison } from '../interactif/comparisonFunctions'
import { toLatex } from '../interactif/tableauSignesVariations/latexExport'
import { renderTableau, updateCellDisplay } from '../interactif/tableauSignesVariations/render'
import { toTypst } from '../interactif/tableauSignesVariations/typstExport'
import {
  createToolbarController,
  type ToolbarController,
} from '../interactif/tableauSignesVariations/toolbar'
import type {
  ActiveCellInfo,
  Ligne,
  SensFleche,
  SigneSymbol,
  TableauSVConfig,
  TableauSVValue,
  ToolbarMode,
} from '../interactif/tableauSignesVariations/types'
import { context } from '../../modules/context'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

/** Clé des attendus qui porte le nombre de colonnes (avec `configAttendue`). */
const NB_COLONNES = 'nbColonnes'

const STYLE_CSS = `
:host {
  display: inline-block;
  position: relative;
  --tab-sv-border: #444;
  --tab-sv-cell-padding: 4px 8px;
  --tab-sv-toolbar-bg: #fff;
  --tab-sv-toolbar-color: #1a1a1a;
  --tab-sv-toolbar-shadow: 0 4px 12px rgba(0,0,0,0.15);
  --tab-sv-accent: #2563eb;
  font-family: inherit;
}
.tab-sv {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  position: relative;
}
.tab-sv__main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
/* ── Contrôles de colonnes (à droite) ── */
.tab-sv__col-controls {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 6px;
  align-self: center;
}
/* ── Contrôles de lignes (en bas) ── */
.tab-sv__row-controls {
  display: flex;
  flex-direction: row;
  gap: 4px;
  padding: 4px 0;
  align-items: center;
}
/* Bouton générique +/− (colonnes et lignes) */
.tab-sv__col-btn {
  background: transparent;
  border: 1px solid var(--tab-sv-border);
  width: 22px;
  height: 22px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 15px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.tab-sv__col-btn:hover { background: rgba(37, 99, 235, 0.10); border-color: var(--tab-sv-accent); }
.tab-sv__col-btn:disabled { opacity: 0.35; cursor: default; pointer-events: none; }
/* ── Popup de choix du type de ligne ── */
.tab-sv__row-add-details {
  position: relative;
  display: inline-block;
}
.tab-sv__row-add-details > summary {
  display: flex;
  align-items: center;
  justify-content: center;
  list-style: none;
  width: 22px;
  height: 22px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 15px;
  border: 1px solid var(--tab-sv-border);
  background: transparent;
  user-select: none;
}
.tab-sv__row-add-details > summary::-webkit-details-marker { display: none; }
.tab-sv__row-add-details > summary::marker { display: none; }
.tab-sv__row-add-details > summary:hover { background: rgba(37,99,235,0.10); border-color: var(--tab-sv-accent); }
.tab-sv__row-add-popup {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  z-index: 101;
  background: var(--tab-sv-toolbar-bg);
  color: var(--tab-sv-toolbar-color);
  border: 1px solid var(--tab-sv-border);
  border-radius: 6px;
  box-shadow: var(--tab-sv-toolbar-shadow);
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  white-space: nowrap;
}
.tab-sv__row-type-btn {
  background: transparent;
  color: inherit;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
  text-align: left;
  font-size: 0.95em;
}
.tab-sv__row-type-btn:hover { background: rgba(37,99,235,0.10); }
.tab-sv__table {
  border-collapse: collapse;
  border: 1px solid var(--tab-sv-border);
}
.tab-sv__col--label { }
.tab-sv__col--antecedent { width: 1px; } /* se réduit au contenu */
.tab-sv__col--intervalle { width: 112px; } /* largeur minimale des intervalles */
.tab-sv__label {
  padding: var(--tab-sv-cell-padding);
  height: 2em; /* min-height via modèle table */
  border: 1px solid var(--tab-sv-border);
  border-right: 1px solid var(--tab-sv-border);
  font-style: italic;
  text-align: left;
  white-space: nowrap;
}
.tab-sv__cell {
  padding: var(--tab-sv-cell-padding);
  height: 2em; /* min-height via modèle table */
  border: 1px solid var(--tab-sv-border);
  text-align: center;
  vertical-align: middle;
  white-space: nowrap;
}
/* Antécédents (en-tête et colonnes paires des lignes de signes) */
.tab-sv__antecedent,
.tab-sv__cell--antecedent-col {
  background: transparent;
}
/* Cellules vides intercalées dans l'en-tête et les lignes de valeurs :
   pas de bordures gauche/droite (évite les traits parasites entre antécédents) */
.tab-sv__cell--header-spacer,
.tab-sv__cell--spacer {
  border-left: none;
  border-right: none;
  padding: 0;
}
.tab-sv__cell--editable {
  cursor: pointer;
  background: rgba(37, 99, 235, 0.06);
  outline: none;
}
.tab-sv__cell--editable:hover {
  background: rgba(37, 99, 235, 0.14);
}
.tab-sv__cell--editable:focus-visible {
  outline: 2px solid var(--tab-sv-accent);
  outline-offset: -2px;
}
/* ── Ligne de variations ── */
.tab-sv__cell--var-valeur {
  font-weight: 500;
  padding: 4px 6px;
  border-left: none;   /* pas de trait entre la valeur et la flèche adjacente */
  border-right: none;
  white-space: nowrap;
}
.tab-sv__cell--var-top    { vertical-align: top;    }
.tab-sv__cell--var-bottom { vertical-align: bottom; }
.tab-sv__cell--var-fleche {
  position: relative;
  padding: 0;
  height: 86px;
  border-left: none;
  border-right: none;
}
.tab-sv__fleche-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}
.tab-sv__toolbar {
  position: absolute;
  z-index: 100;
  background: var(--tab-sv-toolbar-bg);
  color: var(--tab-sv-toolbar-color);
  border: 1px solid var(--tab-sv-border);
  border-radius: 6px;
  box-shadow: var(--tab-sv-toolbar-shadow);
  padding: 4px;
  display: flex;
  gap: 2px;
  align-items: center;
}
.tab-sv__tool-btn {
  background: transparent;
  color: inherit;
  border: 1px solid transparent;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 1em;
  min-width: 32px;
}
.tab-sv__tool-btn:hover { background: rgba(0,0,0,0.05); }
.tab-sv__tool-btn.is-current { border-color: var(--tab-sv-accent); }
.tab-sv__tool-btn--validate { color: var(--tab-sv-accent); font-weight: bold; }
.tab-sv__tool-mathinput { display: flex; gap: 4px; align-items: center; }
.tab-sv__math-field { min-width: 120px; padding: 4px; border: 1px solid var(--tab-sv-border); border-radius: 4px; color: inherit; background: var(--tab-sv-toolbar-bg); }
math-field::part(menu-toggle) { display: none; }
math-field::part(virtual-keyboard-toggle) { display: none; }
/* ── Cellule double (deux limites à une discontinuité) ── */
/* NB : pas de display:flex sur le <td> lui-même — ça sortirait l'élément du
   contexte table et casserait les bordures. On utilise un div interne. */
.tab-sv__cell--var-double {
  padding: 0;
  height: 86px;
}
.tab-sv__var-double-inner {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
}
.tab-sv__var-half {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 4px 6px;
  min-width: 0;
}
.tab-sv__var-half--gauche { text-align: left; }
.tab-sv__var-half--droite { text-align: right; }
.tab-sv__var-half.tab-sv__cell--var-top    { justify-content: flex-start; }
.tab-sv__var-half.tab-sv__cell--var-bottom { justify-content: flex-end; }
/* Bouton transparent centré sur la barre — le gradient du <td> est visible en dessous. */
.tab-sv__var-bar-btn {
  width: 16px;
  flex-shrink: 0;
  background: transparent;
  border: none;
  padding: 0;
  align-self: stretch;
  cursor: pointer;
  outline: none;
  border-radius: 2px;
}
.tab-sv__var-bar-btn:hover  { background: rgba(37, 99, 235, 0.10); }
.tab-sv__var-bar-btn:focus-visible { outline: 2px solid var(--tab-sv-accent); outline-offset: -2px; }
/* Lignes en-tête et signes : pas de bordures internes gauche/droite */
.tab-sv__row--header .tab-sv__cell,
.tab-sv__row--signe .tab-sv__cell {
  border-left: none;
  border-right: none;
}
/* Repères verticaux mathématiques aux antécédents critiques. */
.tab-sv .tab-sv__cell--marker {
  position: relative;
  background-image: linear-gradient(
    to right,
    transparent calc(50% - 0.5px),
    var(--tab-sv-border) calc(50% - 0.5px),
    var(--tab-sv-border) calc(50% + 0.5px),
    transparent calc(50% + 0.5px)
  );
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-origin: border-box;
  background-clip: border-box;
}
.tab-sv .tab-sv__cell--marker-double {
  background-image: linear-gradient(
    to right,
    transparent calc(50% - 3px),
    var(--tab-sv-border) calc(50% - 3px),
    var(--tab-sv-border) calc(50% - 2px),
    transparent calc(50% - 2px),
    transparent calc(50% + 2px),
    var(--tab-sv-border) calc(50% + 2px),
    var(--tab-sv-border) calc(50% + 3px),
    transparent calc(50% + 3px)
  );
}
:host([disabled]) .tab-sv__cell--editable,
:host([readonly]) .tab-sv__cell--editable {
  cursor: default;
  background: transparent;
  pointer-events: none;
}
.tab-sv__cell--feedback-ok { background-color: rgba(34, 197, 94, 0.25) !important; }
.tab-sv__cell--feedback-ko { background-color: rgba(239, 68, 68, 0.30) !important; }
`

/**
 * Tableau de signes / variations interactif (tkz-tab en LaTeX).
 * @author Rémi Angot
 */
export class TableauSignesVariationsElement extends MathaleaCustomElement {
  static readonly elementTag = 'tableau-signes-variations'

  private _config: TableauSVConfig | null = null
  private _state: TableauSVValue = {}
  private _cells: Map<string, HTMLElement> = new Map()
  private _toolbar: ToolbarController | null = null
  private _updatingValueAttr = false
  private _updatingConfigAttr = false
  private _root: HTMLElement | null = null
  private _feedback: Record<string, 'ok' | 'ko'> = {}

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  static get observedAttributes() {
    return ['config', 'value', 'disabled', 'readonly', 'interactivity-on']
  }

  static create({
    id,
    numeroExercice,
    questionIndex,
    config,
    className,
    readonly,
    interactivityOn = true,
  }: TableauSignesVariationsCreateOptions): string {
    if (!context.isHtml) {
      return toLatex(config, {})
    }
    if (context.isTypst) {
      // L'export Typst réutilise le rendu HTML (context.isHtml reste vrai),
      // mais ce web component ne peut pas être « rejoué » par htmlToTypst
      // (JS exécuté après montage dans le DOM, cf. documentation/developpement/
      // auteurs-exercices/complements/variantes-exercices.md#branches-de-rendu).
      // On insère donc
      // directement le code Typst (package vartable) via le marqueur
      // <mathalea-typst>, reconnu tel quel par htmlToTypst (latexToTypst.ts).
      return `<mathalea-typst>${toTypst(config, {})}</mathalea-typst>`
    }
    const computedId =
      id ??
      `${TableauSignesVariationsElement.elementTag}Ex${numeroExercice ?? 0}Q${questionIndex ?? 0}`
    return super.create({
      id: computedId,
      class: className,
      readonly: readonly ? true : undefined,
      interactivityOn,
      config,
    })
  }

  static formatStudentAnswer(rawAnswer: string): string {
    try {
      const parsed = JSON.parse(rawAnswer) as Record<string, string>
      const entries = Object.entries(parsed).filter(([, v]) => v !== '')
      if (entries.length === 0) return rawAnswer
      return entries.map(([key, val]) => `${key} = ${val}`).join(', ')
    } catch {
      return rawAnswer
    }
  }

  static verifQuestion(
    exercice: IExercice,
    i: number,
  ): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    const id = `${TableauSignesVariationsElement.elementTag}Ex${exercice.numeroExercice}Q${i}`
    const el = document.getElementById(
      id,
    ) as TableauSignesVariationsElement | null
    const ac = exercice.autoCorrection?.[i]
    const rawExpected =
      (ac?.valeur?.reponse as { value?: string } | undefined)?.value ?? '{}'
    const barFn = ac?.valeur?.bareme
    let expected: Record<string, string> = {}
    try {
      expected = JSON.parse(rawExpected)
    } catch {
      expected = {}
    }

    // effectiveValue inclut les valeurs initiales de la config pour les cellules
    // non encore modifiées par l'élève (évite les faux négatifs sur pré-remplissages).
    const actual: Record<string, string> = el?.effectiveValue ?? {}

    if (exercice.answers === undefined) exercice.answers = {}
    if (el) exercice.answers[id] = el.value

    const feedback: Record<string, 'ok' | 'ko'> = {}
    let correctCount = 0
    const totalCount = Object.keys(expected).length
    for (const key of Object.keys(expected)) {
      const exp = expected[key]
      const got = actual[key] ?? ''
      // L0C* keys are column antecedents (numbers/fractions): use math comparison.
      // For sign/arrow keys: if expected is a pure bar symbol ('||'), the bar itself
      // is the answer — check that the student set it AND added no sign value.
      // Otherwise only the numeric/sign value matters (bar presence is irrelevant).
      let isOk: boolean
      if (key === NB_COLONNES) {
        isOk = String(el?.config?.colonnes.length ?? '') === exp
      } else if (key.startsWith('L0C')) {
        isOk = fonctionComparaison(got, exp).isOk
      } else if (exp === '||') {
        isOk = got === '' && (actual[key + 'B'] ?? '') === '||'
      } else {
        isOk = got === signPartOf(exp)
      }
      feedback[key] = isOk ? 'ok' : 'ko'
      if (isOk) correctCount++
    }

    el?.showFeedback(feedback)
    if (el) el.interactivityOn = false

    const allOk = correctCount === totalCount
    const spanResultat = document.getElementById(
      `resultatCheckEx${exercice.numeroExercice}Q${i}`,
    )
    if (spanResultat) {
      spanResultat.innerHTML = allOk ? '😎' : '☹️'
      ;(spanResultat as HTMLElement).style.fontSize = 'large'
    }

    let nbBonnesReponses = correctCount
    let nbReponses = totalCount || 1
    if (barFn != null && totalCount > 0) {
      const listePoints = Object.keys(expected).map((k) =>
        feedback[k] === 'ok' ? 1 : 0,
      )
      const [obtained, max] = barFn(listePoints)
      nbBonnesReponses = obtained
      nbReponses = max
    }

    return {
      isOk: allOk,
      feedback: '',
      score: { nbBonnesReponses, nbReponses },
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return
    if (name === 'config' && !this._updatingConfigAttr) {
      this._config = parseConfigAttribute(newValue)
      this.render()
      return
    }
    if (name === 'value' && !this._updatingValueAttr) {
      this._state = parseValueAttribute(newValue)
      this.render()
      return
    }
    if (name === 'disabled' || name === 'readonly') {
      this.render()
      return
    }
    if (name === 'interactivity-on') {
      this.hydrateCommonAttributes()
      this.render()
    }
  }

  connectedCallback() {
    this.hydrateCommonAttributes()
    if (!this._config && this.hasAttribute('config')) {
      this._config = parseConfigAttribute(this.getAttribute('config'))
    }
    if (this.hasAttribute('value')) {
      this._state = parseValueAttribute(this.getAttribute('value'))
    }
    this.render()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this._toolbar) this._toolbar.destroy()
    this._toolbar = null
  }

  // === API publique ===

  set config(cfg: TableauSVConfig | null) {
    this._config = cfg
    if (cfg) {
      this.setAttribute('config', encodeConfig(cfg))
    } else {
      this.removeAttribute('config')
    }
  }

  get config(): TableauSVConfig | null {
    return this._config
  }

  set value(val: TableauSVValue | string) {
    this.update(val)
  }

  get value(): string {
    return JSON.stringify(this.effectiveValue)
  }

  get state(): TableauSVValue {
    return { ...this._state }
  }

  getState(): TableauSVValue {
    return this.state
  }

  /** Applique un état restaurable (valeurs saisies) et redessine le tableau. */
  update(state: TableauSVValue | string): void {
    const parsedState =
      typeof state === 'string' ? parseValueAttribute(state) : state
    this._state = { ...parsedState }
    this.syncValueAttribute()
    this.render()
  }

  /** Code LaTeX tkz-tab pour l'état courant. */
  toLatex(): string {
    if (!this._config) return ''
    return toLatex(this._config, this._state)
  }

  /**
   * État effectif : valeurs saisies, avec fallback sur la valeur initiale de la config
   * pour les cellules éditables non encore modifiées par l'élève.
   */
  get effectiveValue(): TableauSVValue {
    if (!this._config) return { ...this._state }
    const config = this._config
    const result: TableauSVValue = { ...this._state }
    config.colonnes.forEach((col, j) => {
      const key = `L0C${j}`
      if (col.editable && !(key in result)) result[key] = col.valeur
    })
    config.lignes.forEach((ligne, i) => {
      const li = i + 1
      const labelKey = `L${li}label`
      if (ligne.labelEditable && !(labelKey in result)) result[labelKey] = ligne.label
      if (ligne.type === 'signe') {
        ligne.cellules.forEach((_c, j) => {
          const key = `L${li}C${j}`
          if (_c.editable && !(key in result)) result[key] = getCellInitialValue(config, key)
        })
      } else if (ligne.type === 'variation') {
        ligne.valeurs.forEach((_c, j) => {
          const key = `L${li}C${j}`
          if (_c.editable && !(key in result)) result[key] = getCellInitialValue(config, key)
        })
        ligne.fleches.forEach((_c, j) => {
          const key = `L${li}C${config.colonnes.length + j}`
          if (_c.editable && !(key in result)) result[key] = getCellInitialValue(config, key)
        })
      }
    })
    return result
  }

  /** Colorie les cellules en vert (ok) ou rouge (ko) selon le feedback. */
  showFeedback(feedback: Record<string, 'ok' | 'ko'>) {
    this._feedback = { ...feedback }
    this._applyFeedback()
  }

  private _applyFeedback() {
    for (const [cellId, status] of Object.entries(this._feedback)) {
      const el = this._cells.get(cellId)
      if (!el) continue
      el.classList.remove('tab-sv__cell--feedback-ok', 'tab-sv__cell--feedback-ko')
      el.classList.add(`tab-sv__cell--feedback-${status}`)
    }
  }

  protected onInteractivityChanged(isOn: boolean): void {
    if (isOn) {
      this.removeAttribute('readonly')
    } else {
      this.setAttribute('readonly', '')
    }
  }

  // === Rendu ===

  render(): string | void {
    if (!context.isHtml || context.isTypst) {
      return this.renderLatex()
    }
    this.fullRender()
    return ''
  }

  protected renderLatex(): string {
    return this.toLatex()
  }

  private fullRender() {
    if (!this.shadowRoot) return
    // Libère les écouteurs globaux de la barre d'outils précédente avant de la recréer.
    this._toolbar?.destroy()
    this._toolbar = null
    this.shadowRoot.innerHTML = ''

    const katexStyle = document.createElement('style')
    katexStyle.textContent = katexCss
    this.shadowRoot.appendChild(katexStyle)

    const style = document.createElement('style')
    style.textContent = STYLE_CSS
    this.shadowRoot.appendChild(style)

    if (!this._config) return

    const readonly =
      this.hasAttribute('disabled') ||
      this.hasAttribute('readonly') ||
      !this.interactivityOn

    const { root, main, cells } = renderTableau({
      config: this._config,
      state: this._state,
      readonly,
      onCellActivate: (info, cellEl) => this.activateCell(info, cellEl),
    })
    this._root = root
    this._cells = cells
    this.shadowRoot.appendChild(root)

    if (!readonly) {
      this._toolbar = createToolbarController(this.shadowRoot, (info, value) =>
        this.commitCell(info, value),
      )

      // ── Contrôles de colonnes (droite, si activés) ──
      if (this._config.colonnesEditables) {
        const colControls = document.createElement('div')
        colControls.classList.add('tab-sv__col-controls')

        const btnAdd = document.createElement('button')
        btnAdd.type = 'button'
        btnAdd.classList.add('tab-sv__col-btn')
        btnAdd.textContent = '+'
        btnAdd.setAttribute('aria-label', 'Ajouter une colonne')
        btnAdd.addEventListener('click', () => this.addColumn())

        const btnRemove = document.createElement('button')
        btnRemove.type = 'button'
        btnRemove.classList.add('tab-sv__col-btn')
        btnRemove.textContent = '−'
        btnRemove.setAttribute('aria-label', 'Supprimer une colonne')
        if (this._config.colonnes.length <= 2) btnRemove.setAttribute('disabled', '')
        btnRemove.addEventListener('click', () => this.removeColumn())

        colControls.appendChild(btnAdd)
        colControls.appendChild(btnRemove)
        root.appendChild(colControls)
      }

      // ── Contrôles de lignes (bas, si activés) ──
      if (this._config.lignesEditables) {
        const rowControls = document.createElement('div')
        rowControls.classList.add('tab-sv__row-controls')

        // Bouton "+" avec popup de choix de type
        const details = document.createElement('details')
        details.classList.add('tab-sv__row-add-details')

        const summary = document.createElement('summary')
        summary.textContent = '+'
        summary.setAttribute('title', 'Ajouter une ligne')
        details.appendChild(summary)

        const popup = document.createElement('div')
        popup.classList.add('tab-sv__row-add-popup')

        const ligneTypes: Array<{ type: 'signe' | 'variation' | 'valeur'; label: string }> = [
          { type: 'signe',     label: 'Ligne de signes' },
          { type: 'variation', label: 'Ligne de variations' },
          // { type: 'valeur', label: 'Ligne de valeurs' },  // TODO: à activer
        ]
        for (const { type, label } of ligneTypes) {
          const btn = document.createElement('button')
          btn.type = 'button'
          btn.classList.add('tab-sv__row-type-btn')
          btn.textContent = label
          btn.addEventListener('click', () => {
            details.open = false
            this.addLigne(type)
          })
          popup.appendChild(btn)
        }
        details.appendChild(popup)
        rowControls.appendChild(details)

        // Bouton "−"
        const btnRemoveRow = document.createElement('button')
        btnRemoveRow.type = 'button'
        btnRemoveRow.classList.add('tab-sv__col-btn')
        btnRemoveRow.textContent = '−'
        btnRemoveRow.setAttribute('aria-label', 'Supprimer la dernière ligne')
        if (this._config.lignes.length === 0) btnRemoveRow.setAttribute('disabled', '')
        btnRemoveRow.addEventListener('click', () => this.removeLigne())
        rowControls.appendChild(btnRemoveRow)

        main.appendChild(rowControls)
      }
    }

    this._applyFeedback()
  }

  private activateCell(info: ActiveCellInfo, cellEl: HTMLElement) {
    if (!this._toolbar) return
    let currentValue: string
    if (info.mode === 'valeurBarree') {
      currentValue = `${this.getCellCurrentValue(info.cellId, 'valeur')}\u0000${this.getCellCurrentValue(info.secondaryCellId ?? '', 'barre')}`
    } else if (info.mode === 'signeBarree') {
      // Compose signe + barre séparément pour que la toolbar surligne les bons boutons.
      currentValue = `${this.getCellCurrentValue(info.cellId, 'signe')} ${this.getCellCurrentValue(info.secondaryCellId ?? '', 'barre')}`
    } else {
      currentValue = this.getCellCurrentValue(info.cellId, info.mode)
    }
    this._toolbar.show(info, cellEl, currentValue)
  }

  private getCellCurrentValue(cellId: string, _mode: ToolbarMode): string {
    if (this._state[cellId] != null) return this._state[cellId]
    if (!this._config) return ''
    return getCellInitialValue(this._config, cellId)
  }

  private commitCell(info: ActiveCellInfo, value: string) {
    this._state = { ...this._state, [info.cellId]: value }
    delete this._feedback[info.cellId]
    this.syncValueAttribute()
    // Pour les flèches et cellules doubles, re-rendu complet nécessaire.
    // Pour les autres modes, mise à jour ciblée.
    if (info.mode === 'variation' || info.mode === 'barre' || info.mode === 'valeurDroite') {
      this.render()
    } else {
      const el = this._cells.get(info.cellId)
      if (el) {
        updateCellDisplay(el, info.mode, value)
        el.classList.remove('tab-sv__cell--feedback-ok', 'tab-sv__cell--feedback-ko')
      }
    }
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          cellId: info.cellId,
          value,
          state: { ...this._state },
        },
        bubbles: true,
        composed: true,
      }),
    )
  }

  private syncValueAttribute() {
    if (!this.isConnected) return
    this._updatingValueAttr = true
    this.setAttribute('value', encodeURIComponent(JSON.stringify(this._state)))
    this._updatingValueAttr = false
  }

  private addLigne(type: 'signe' | 'variation' | 'valeur') {
    if (!this._config) return
    const N = this._config.colonnes.length
    let newLigne: Ligne
    if (type === 'signe') {
      newLigne = {
        type: 'signe',
        label: '',
        labelEditable: true,
        cellules: Array.from({ length: 2 * N - 1 }, () => ({
          symbole: '' as SigneSymbol,
          editable: true,
        })),
      }
    } else if (type === 'variation') {
      newLigne = {
        type: 'variation',
        label: '',
        labelEditable: true,
        valeurs: Array.from({ length: N }, () => ({ latex: '', editable: true })),
        fleches: Array.from({ length: N - 1 }, () => ({ sens: '' as SensFleche, editable: true })),
      }
    } else {
      newLigne = {
        type: 'valeur',
        label: '',
        labelEditable: true,
        valeurs: Array.from({ length: N }, () => ({ latex: '', editable: true })),
      }
    }
    this._config = { ...this._config, lignes: [...this._config.lignes, newLigne] }
    this.syncConfigAttribute()
    this.render()
    this.dispatchEvent(
      new CustomEvent('ligne-change', {
        detail: { action: 'add', type, config: this._config },
        bubbles: true,
        composed: true,
      }),
    )
  }

  private removeLigne() {
    if (!this._config || this._config.lignes.length === 0) return
    const lastLi = this._config.lignes.length // index 1-based de la dernière ligne
    // Supprime toutes les clés d'état de la dernière ligne (cellules + label)
    const newState: TableauSVValue = {}
    for (const [k, v] of Object.entries(this._state)) {
      if (!k.startsWith(`L${lastLi}C`) && k !== `L${lastLi}label`) newState[k] = v
    }
    this._state = newState
    this._config = { ...this._config, lignes: this._config.lignes.slice(0, -1) }
    this.syncConfigAttribute()
    this.syncValueAttribute()
    this.render()
    this.dispatchEvent(
      new CustomEvent('ligne-change', {
        detail: { action: 'remove', config: this._config },
        bubbles: true,
        composed: true,
      }),
    )
  }

  private syncConfigAttribute() {
    if (!this.isConnected || !this._config) return
    this._updatingConfigAttr = true
    this.setAttribute('config', encodeConfig(this._config))
    this._updatingConfigAttr = false
  }

  private addColumn() {
    if (!this._config) return
    const N = this._config.colonnes.length
    const newState = { ...this._state }

    const moveKey = (from: string, to: string) => {
      if (from in newState) { newState[to] = newState[from]; delete newState[from] }
    }

    // La dernière colonne (N-1) est repoussée en position N
    moveKey(`L0C${N - 1}`, `L0C${N}`)

    this._config.lignes.forEach((ligne, i) => {
      const li = i + 1
      if (ligne.type === 'signe') {
        // Dernier antécédent (2N-2) décalé en 2N
        moveKey(`L${li}C${2 * N - 2}`, `L${li}C${2 * N}`)
        moveKey(`L${li}C${2 * N - 2}B`, `L${li}C${2 * N}B`)
      } else if (ligne.type === 'variation') {
        // Dernière valeur (N-1) décalée en N
        moveKey(`L${li}C${N - 1}`, `L${li}C${N}`)
        moveKey(`L${li}C${N - 1}R`, `L${li}C${N}R`)
        moveKey(`L${li}C${N - 1}B`, `L${li}C${N}B`)
        // Fleches : N augmente de 1, toutes les clés décalées de +1
        const saved: Record<number, string> = {}
        for (let j = 0; j < N - 1; j++) {
          const k = `L${li}C${N + j}`
          if (k in newState) { saved[j] = newState[k]; delete newState[k] }
        }
        for (const [j, v] of Object.entries(saved)) {
          newState[`L${li}C${N + 1 + Number(j)}`] = v
        }
      } else {
        moveKey(`L${li}C${N - 1}`, `L${li}C${N}`)
      }
    })

    // Insère la nouvelle colonne en avant-dernière position
    this._config = {
      ...this._config,
      colonnes: [
        ...this._config.colonnes.slice(0, N - 1),
        { valeur: '', editable: true },
        this._config.colonnes[N - 1],
      ],
      lignes: this._config.lignes.map(ligne => {
        if (ligne.type === 'signe') {
          return {
            ...ligne,
            cellules: [
              ...ligne.cellules.slice(0, 2 * N - 2),
              { symbole: '' as SigneSymbol, editable: true },
              { symbole: '' as SigneSymbol, editable: true },
              ligne.cellules[2 * N - 2],
            ],
          }
        } else if (ligne.type === 'variation') {
          return {
            ...ligne,
            valeurs: [
              ...ligne.valeurs.slice(0, N - 1),
              { latex: '', editable: true },
              ligne.valeurs[N - 1],
            ],
            fleches: [
              ...ligne.fleches.slice(0, N - 2),
              { sens: '' as SensFleche, editable: true },
              ligne.fleches[N - 2],
            ],
          }
        } else {
          return {
            ...ligne,
            valeurs: [
              ...ligne.valeurs.slice(0, N - 1),
              { latex: '', editable: true },
              ligne.valeurs[N - 1],
            ],
          }
        }
      }),
    }

    this._state = newState
    this.syncConfigAttribute()
    this.syncValueAttribute()
    this.render()
    this.dispatchEvent(
      new CustomEvent('column-change', {
        detail: { action: 'add', config: this._config },
        bubbles: true,
        composed: true,
      }),
    )
  }

  private removeColumn() {
    if (!this._config || this._config.colonnes.length <= 2) return
    const N = this._config.colonnes.length
    const newState = { ...this._state }

    // Supprime l'avant-dernière colonne (N-2) et décale la dernière (N-1 → N-2)
    delete newState[`L0C${N - 2}`]
    const moveKey = (from: string, to: string) => {
      if (from in newState) { newState[to] = newState[from]; delete newState[from] }
    }
    moveKey(`L0C${N - 1}`, `L0C${N - 2}`)

    this._config.lignes.forEach((ligne, i) => {
      const li = i + 1
      if (ligne.type === 'signe') {
        // Positions affectées : 2N-5 (intervalle avant N-2), 2N-4 (a(N-2)),
        //                        2N-3 (intervalle après N-2 → 2N-5), 2N-2 (a(N-1) → 2N-4)
        const saved: Record<string, string> = {}
        for (const k of [`L${li}C${2*N-3}`, `L${li}C${2*N-2}`, `L${li}C${2*N-2}B`]) {
          if (k in newState) { saved[k] = newState[k] }
        }
        for (const k of [`L${li}C${2*N-5}`, `L${li}C${2*N-4}`, `L${li}C${2*N-4}B`,
                          `L${li}C${2*N-3}`, `L${li}C${2*N-2}`, `L${li}C${2*N-2}B`]) {
          delete newState[k]
        }
        if (`L${li}C${2*N-3}` in saved) newState[`L${li}C${2*N-5}`] = saved[`L${li}C${2*N-3}`]
        if (`L${li}C${2*N-2}` in saved) newState[`L${li}C${2*N-4}`] = saved[`L${li}C${2*N-2}`]
        if (`L${li}C${2*N-2}B` in saved) newState[`L${li}C${2*N-4}B`] = saved[`L${li}C${2*N-2}B`]
      } else if (ligne.type === 'variation') {
        // Valeur N-2 supprimée, valeur N-1 → N-2
        delete newState[`L${li}C${N - 2}`]
        delete newState[`L${li}C${N - 2}R`]
        delete newState[`L${li}C${N - 2}B`]
        moveKey(`L${li}C${N - 1}`, `L${li}C${N - 2}`)
        moveKey(`L${li}C${N - 1}R`, `L${li}C${N - 2}R`)
        moveKey(`L${li}C${N - 1}B`, `L${li}C${N - 2}B`)
        // Fleches : supprime f(N-3) (entre N-3 et N-2), garde f(N-2) en position N-3
        // N diminue de 1, nouvelles clés = (N-1)+j au lieu de N+j
        const saved: Record<number, string> = {}
        for (let j = 0; j < N - 1; j++) {
          const k = `L${li}C${N + j}`
          if (k in newState) { saved[j] = newState[k]; delete newState[k] }
        }
        // Réécrit : fleches 0..N-4 gardent leur position, fleche N-2 → position N-3
        for (let j = 0; j < N - 2; j++) {
          const srcJ = j < N - 3 ? j : N - 2  // saute j=N-3, récupère N-2 en position N-3
          if (srcJ in saved) newState[`L${li}C${N - 1 + j}`] = saved[srcJ]
        }
      } else {
        delete newState[`L${li}C${N - 2}`]
        moveKey(`L${li}C${N - 1}`, `L${li}C${N - 2}`)
      }
    })

    // Supprime l'avant-dernière colonne dans la config
    this._config = {
      ...this._config,
      colonnes: [...this._config.colonnes.slice(0, N - 2), this._config.colonnes[N - 1]],
      lignes: this._config.lignes.map(ligne => {
        if (ligne.type === 'signe') {
          return {
            ...ligne,
            cellules: [...ligne.cellules.slice(0, 2 * N - 5), ...ligne.cellules.slice(2 * N - 3)],
          }
        } else if (ligne.type === 'variation') {
          return {
            ...ligne,
            valeurs: [...ligne.valeurs.slice(0, N - 2), ligne.valeurs[N - 1]],
            fleches: [...ligne.fleches.slice(0, N - 3), ligne.fleches[N - 2]],
          }
        } else {
          return { ...ligne, valeurs: [...ligne.valeurs.slice(0, N - 2), ligne.valeurs[N - 1]] }
        }
      }),
    }

    this._state = newState
    this.syncConfigAttribute()
    this.syncValueAttribute()
    this.render()
    this.dispatchEvent(
      new CustomEvent('column-change', {
        detail: { action: 'remove', config: this._config },
        bubbles: true,
        composed: true,
      }),
    )
  }
}

export type TableauSignesVariationsOptions = {
  config: TableauSVConfig
  className?: string
  readonly?: boolean
  interactivityOn?: boolean
  id?: string
}

export type TableauSignesVariationsCreateOptions = TableauSignesVariationsOptions & {
  numeroExercice?: number
  questionIndex?: number
}

export interface CreerTableauOptions {
  /** Numéro de l'exercice (pour identifier l'élément). */
  numeroExercice?: number
  /** Numéro de la question. */
  numeroQuestion?: number
  /** Tableau en lecture seule (correction par exemple). */
  readonly?: boolean
  /** Active ou désactive l'interactivité sans perdre l'affichage. */
  interactivityOn?: boolean
  /** Classes CSS additionnelles. */
  className?: string
  /** Identifiant de l'élément, si le défaut (exercice, question) ne suffit pas. */
  id?: string
}

/**
 * Construit le HTML d'un `<tableau-signes-variations>` à insérer dans la
 * question d'un exercice.
 *
 * En mode LaTeX (`context.isHtml === false`), retourne directement le code
 * tkz-tab pour la valeur initiale du tableau.
 *
 * @param config Configuration : antécédents, lignes (signes / variations / valeurs).
 * @param options Méta-info pour identifier l'élément dans le DOM.
 */
export function creerTableauSignesVariations(
  config: TableauSVConfig,
  options: CreerTableauOptions = {},
): string {
  return TableauSignesVariationsElement.create({
    config,
    id: options.id,
    numeroExercice: options.numeroExercice,
    questionIndex: options.numeroQuestion,
    className: options.className,
    readonly: options.readonly,
    interactivityOn: options.interactivityOn,
  })
}

/**
 * Helper haut niveau pour un tableau de signes simple.
 *
 * @example
 * creerTableauSignes({
 *   variableName: 'x',
 *   colonnes: [{ valeur: '-\\infty' }, { valeur: '2' }, { valeur: '+\\infty' }],
 *   lignes: [{
 *     type: 'signe',
 *     label: "f(x)",
 *     cellules: [
 *       { symbole: '' },               // cellule sous -∞
 *       { symbole: '-', editable: true }, // signe sur (-∞, 2)
 *       { symbole: '|' },              // cellule sous 2 (zéro simple)
 *       { symbole: '+', editable: true }, // signe sur (2, +∞)
 *       { symbole: '' },               // cellule sous +∞
 *     ],
 *   }],
 * })
 */
export function creerTableauSignes(
  config: TableauSVConfig,
  options: CreerTableauOptions = {},
): string {
  return creerTableauSignesVariations(config, options)
}

/**
 * Helper haut niveau pour un tableau de variations.
 * Identique à creerTableauSignesVariations mais explicite l'intention.
 */
export function creerTableauVariations(
  config: TableauSVConfig,
  options: CreerTableauOptions = {},
): string {
  return creerTableauSignesVariations(config, options)
}

export interface AddTableauSignesVariationsOptions {
  config: TableauSVConfig
  /**
   * Tableau complet qui sert à calculer les attendus, quand `config` n'en
   * montre qu'une partie. Avec `colonnesEditables`, `config` peut ne contenir
   * que les bornes : l'élève ajoute lui-même les colonnes, qui prennent les
   * positions de celles de `configAttendue`.
   */
  configAttendue?: TableauSVConfig
  className?: string
  bareme?: number
  id?: string
  interactivityOn?: boolean
}

/**
 * Injecte un `<tableau-signes-variations>` dans la question, et enregistre les
 * cellules `editable` ayant un `expected` comme attendues par l'auto-correction.
 *
 * Structure utilisée :
 * - `exercice.autoCorrection[questionIndex].formatInteractif = 'tableau-signes-variations'`
 * - `exercice.autoCorrection[questionIndex].valeur.reponse.value` reçoit les valeurs
 *   attendues (JSON) sous forme `{ <cellId>: <expected> }` pour le grading.
 * - `exercice.autoCorrection[questionIndex].valeur.bareme` est une fonction de barème
 *   optionnelle `(listePoints: number[]) => [number, number]`.
 *
 * Retourne le HTML à concaténer à la question.
 */
export function addTableauSignesVariations(
  exercice: IExercice,
  questionIndex: number,
  options: AddTableauSignesVariationsOptions,
): string {
  const { config, configAttendue, className, bareme, id, interactivityOn } = options
  const reference = configAttendue ?? config

  // En LaTeX, on inline directement le tkz-tab.
  if (!context.isHtml) {
    return toLatex(config, {})
  }

  // Auto-correction : on collecte les expected par cellule
  if (!exercice.autoCorrection) exercice.autoCorrection = []
  if (!exercice.autoCorrection[questionIndex]) exercice.autoCorrection[questionIndex] = {}
  const ac = exercice.autoCorrection[questionIndex]
  ac.formatInteractif = TableauSignesVariationsElement.elementTag
  if (!ac.valeur) ac.valeur = {}
  if (bareme != null) {
    const b = bareme
    ac.valeur.bareme = (listePoints) => {
      const ok = listePoints.filter((p) => p > 0).length
      return [Math.floor((ok / listePoints.length) * b), b] as [number, number]
    }
  }

  const expected: Record<string, string> = {}
  reference.colonnes.forEach((col, j) => {
    if (col.editable && col.expected != null) {
      expected[`L0C${j}`] = col.expected
    }
  })
  reference.lignes.forEach((ligne, i) => {
    const li = i + 1
    if (ligne.type === 'signe') {
      ligne.cellules.forEach((c, j) => {
        if (c.editable && c.expected != null) expected[`L${li}C${j}`] = c.expected
      })
    } else if (ligne.type === 'variation') {
      ligne.valeurs.forEach((c, j) => {
        if (c.editable && c.expected != null) expected[`L${li}C${j}`] = c.expected
        if (c.editable && c.expectedDroite != null) expected[`L${li}C${j}R`] = c.expectedDroite
      })
      ligne.fleches.forEach((c, j) => {
        if (c.editable && c.expected != null) {
          const flecheIdx = reference.colonnes.length + j
          expected[`L${li}C${flecheIdx}`] = c.expected
        }
      })
    } else {
      ligne.valeurs.forEach((c, j) => {
        if (c.editable && c.expected != null) expected[`L${li}C${j}`] = c.expected
      })
    }
  })
  // Colonnes ajoutées par l'élève : une colonne de trop doit compter faux.
  if (configAttendue != null && config.colonnesEditables) {
    expected[NB_COLONNES] = String(reference.colonnes.length)
  }
  ac.valeur = {
    ...ac.valeur,
    reponse: { value: JSON.stringify(expected) },
  }

  const tag = TableauSignesVariationsElement.create({
    id,
    numeroExercice: exercice.numeroExercice,
    questionIndex,
    config,
    className,
    interactivityOn,
  })
  return `${tag}<span id="resultatCheckEx${exercice.numeroExercice}Q${questionIndex}"></span>`
}

function parseConfigAttribute(raw: string | null): TableauSVConfig | null {
  if (!raw) return null
  try {
    const decoded = decodeURIComponent(raw)
    const parsed = JSON.parse(decoded)
    return parsed as TableauSVConfig
  } catch {
    try {
      return JSON.parse(raw) as TableauSVConfig
    } catch {
      return null
    }
  }
}

function parseValueAttribute(raw: string | null): TableauSVValue {
  if (!raw) return {}
  try {
    const decoded = decodeURIComponent(raw)
    const parsed = JSON.parse(decoded)
    return parsed as TableauSVValue
  } catch {
    try {
      return JSON.parse(raw) as TableauSVValue
    } catch {
      return {}
    }
  }
}

function encodeConfig(cfg: TableauSVConfig): string {
  return encodeURIComponent(JSON.stringify(cfg))
}

function getCellInitialValue(config: TableauSVConfig, cellId: string): string {
  // IDs de label de ligne (ex. 'L1label') : retourne le label de la ligne.
  const labelMatch = cellId.match(/^L(\d+)label$/)
  if (labelMatch) {
    const li = Number(labelMatch[1])
    return config.lignes[li - 1]?.label ?? ''
  }

  // IDs de valeur droite (ex. 'L2C1R') : retourne latexDroite de la cellule.
  const droiteMatch = cellId.match(/^L(\d+)C(\d+)R$/)
  if (droiteMatch) {
    const li = Number(droiteMatch[1])
    const ci = Number(droiteMatch[2])
    const ligne = config.lignes[li - 1]
    if (ligne?.type === 'variation') return ligne.valeurs[ci]?.latexDroite ?? ''
    if (ligne?.type === 'valeur') return ligne.valeurs[ci]?.latexDroite ?? ''
    return ''
  }

  // IDs de marqueur de barre (ex. 'L1C0B') : retourne la partie barre du symbole combiné.
  const markerMatch = cellId.match(/^L(\d+)C(\d+)B$/)
  if (markerMatch) {
    const li = Number(markerMatch[1])
    const ci = Number(markerMatch[2])
    const ligne = config.lignes[li - 1]
    if (ligne?.type === 'signe') {
      const sym = ligne.cellules[ci]?.symbole ?? ''
      if (sym === '|' || sym === '|0') return '|'
      if (sym === '||' || sym === '||0') return '||'
    }
    // Cellule double dans une ligne de variation → barre double par défaut.
    if (ligne?.type === 'variation' && ligne.valeurs[ci]?.latexDroite !== undefined) {
      return '||'
    }
    return ''
  }

  const match = cellId.match(/^L(\d+)C(\d+)$/)
  if (!match) return ''
  const li = Number(match[1])
  const ci = Number(match[2])
  if (li === 0) return config.colonnes[ci]?.valeur ?? ''
  const ligne = config.lignes[li - 1]
  if (!ligne) return ''
  if (ligne.type === 'signe') {
    const sym = ligne.cellules[ci]?.symbole ?? ''
    // Symboles combinés : retourne uniquement la partie signe pour la toolbar.
    if (sym === '|0' || sym === '||0') return '0'
    if (sym === '|' || sym === '||') return ''
    return sym
  }
  if (ligne.type === 'valeur') return ligne.valeurs[ci]?.latex ?? ''
  // variation
  if (ci < config.colonnes.length) return ligne.valeurs[ci]?.latex ?? ''
  const flecheIdx = ci - config.colonnes.length
  return ligne.fleches[flecheIdx]?.sens ?? ''
}

/** Extrait la partie signe d'un SigneSymbol (ignore la barre | ou ||). */
function signPartOf(sym: string): string {
  if (sym === '|0' || sym === '||0') return '0'
  if (sym === '|' || sym === '||') return ''
  return sym
}

registerMathaleaCustomElement(TableauSignesVariationsElement)

export default TableauSignesVariationsElement
