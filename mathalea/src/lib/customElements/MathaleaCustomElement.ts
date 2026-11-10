import { context } from '../../modules/context'
import { renderKatexIncludingShadowRoots } from '../latex/renderKatex'
import type { IExercice } from '../types'
export const listOfCustomElements = [
  'interactive-clock',
  'echiquier-probleme',
  'mathalea-dom-ready',
  'meta-custom',
  'mathalea-labyrinthe',
  'juniper-green',
  'kenken-grille',
  'killer-sudoku-grille',
  'grimuku-grille',
  'pyramide-nombres',
  'etoile-calculs',
  'decomposition-facteurs-premiers',
  'tables-effacees-grille',
  'blockly-editor',
  'fraction-cliquable',
  'labyrinthe-blockly',
  'scratch-editor',
  'multi-mathfield',
  'liste-deroulante',
  'my-spreadsheet',
  'my-calculator',
  'guide-ane',
  'svg-selection',
  'demi-droite-interactive',
  'trigo-circle-selection',
  'tableau-signes-variations',
  'mathalea-mathfield',
  'fill-in-the-blank',
  'mathalea-textfield',
  'tableau-mathlive',
  'tableau-hybride',
  'mathalea-qcm',
  'mathalea-couteau-suisse',
  'mathalea-branching-qcm',
  'mathalea-compte-est-bon',
  'clique-figure',
  'points-cliquables',
  'objets-cliquables',
  'drag-and-drop',
  'meta-interactif-2d',
  'alea-iep-editeur',
  'relier-etiquettes',
  'diagram-builder',
  'diagram-pie-assessment',
  'diagram-bar-assessment',
  'diagram-histogram-assessment',
  'diagram-cartesian-assessment',
  'traceur-de-courbe',
  'cube-stack-editor',
  'schema-en-barre',
  'shape-2d-grid-editor',
  'apigeom-figure',
  'intervalle-droite',
  'ensemble-intervalles-droite',
  'mathalea-solveur',
  'possible-multi-lines-answer',
]

/**
 * Registre tag → classe des customElements MathALÉA.
 *
 * Il est alimenté par `registerMathaleaCustomElement` au chargement du module
 * de chaque composant. Il permet un traitement générique des customElements
 * (ex : affichage des réponses élèves dans les corrections de la CAN via
 * `src/lib/components/canSolutions.ts`) sans multiplier les cas particuliers.
 */
export const mathaleaCustomElementsRegistry = new Map<
  string,
  typeof MathaleaCustomElement
>()

/**
 * Définit le customElement dans le navigateur (si ce n'est pas déjà fait)
 * et l'ajoute au registre `mathaleaCustomElementsRegistry`.
 *
 * À utiliser à la place d'un appel direct à `customElements.define` pour
 * toute classe qui étend `MathaleaCustomElement`.
 */
export function registerMathaleaCustomElement(
  elementClass: typeof MathaleaCustomElement,
): void {
  const tag = elementClass.elementTag
  if (!tag) {
    throw new Error(
      `registerMathaleaCustomElement : elementTag manquant sur ${elementClass.name}`,
    )
  }
  if (customElements.get(tag) === undefined) {
    customElements.define(
      tag,
      elementClass as unknown as CustomElementConstructor,
    )
  }
  mathaleaCustomElementsRegistry.set(tag, elementClass)
}

type CreateAttributes = Record<string, unknown>
/**
 * @author Jean-Claude Lhote
 */
export default class MathaleaCustomElement extends HTMLElement {
  static readonly elementTag: string = ''

  private _value: unknown = null
  private _interactivityOn = true

  constructor() {
    super()
  }

  /**
   * Génère le HTML de l'élément à injecter dans l'énoncé.
   * Retourne une chaîne vide hors contexte HTML.
   */
  static create(attributes: CreateAttributes = {}): string {
    if (!context.isHtml) return ''
    const tag = (this as typeof MathaleaCustomElement).elementTag
    if (!tag) return ''
    const attrs = this.buildAttributes(attributes)
    return `<${tag}${attrs}></${tag}>`
  }

  protected static buildAttributes(attributes: CreateAttributes): string {
    const parts: string[] = []
    Object.entries(attributes).forEach(([name, rawValue]) => {
      const serialized = this.serializeAttributeValue(rawValue)
      if (serialized == null) return
      const attrName = this.toKebabCase(name)
      parts.push(`${attrName}="${serialized}"`)
    })
    return parts.length > 0 ? ` ${parts.join(' ')}` : ''
  }

  protected static serializeAttributeValue(value: unknown): string | null {
    if (value == null) return null
    if (typeof value === 'boolean') return value ? 'true' : 'false'
    if (typeof value === 'number')
      return Number.isFinite(value) ? `${value}` : null
    if (typeof value === 'string') return this.escapeHtmlAttribute(value)
    if (Array.isArray(value) || typeof value === 'object') {
      return this.escapeHtmlAttribute(JSON.stringify(value))
    }
    return this.escapeHtmlAttribute(String(value))
  }

  protected static toKebabCase(name: string): string {
    return name.replaceAll(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  }

  protected static escapeHtmlAttribute(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
  }

  /**
   * Formate la réponse brute de l'élève (telle que stockée dans
   * `exercice.answers`) pour l'affichage « Réponse donnée : ... » de la vue
   * des corrections (CAN).
   *
   * Par défaut la valeur brute est affichée telle quelle (cas d'une valeur
   * déjà lisible, comme celle de `liste-deroulante`). À surcharger quand la
   * valeur stockée n'est pas directement affichable (JSON, format interne...).
   */
  static formatStudentAnswer(
    rawAnswer: string,
    _questionHtml?: string,
  ): string {
    return rawAnswer
  }

  /**
   * Vérification interactive spécifique à un custom element.
   *
   * Ce hook est optionnel et peut être surchargé par les classes filles
   * qui portent leur propre logique de correction (ex: svg-selection).
   */
  static verifQuestion(
    _exercice: IExercice,
    _i: number,
  ): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    return {
      isOk: true,
      feedback: '',
      score: { nbBonnesReponses: 0, nbReponses: 0 },
    }
  }

  /**
   * Nombre de points maximum que la question peut rapporter, c'est-à-dire le
   * `score.nbReponses` que `verifQuestion()` retournera si l'élève répond
   * juste partout. Il est calculé avant toute saisie pour afficher le barème
   * de l'exercice dans ses paramètres (voir `src/lib/interactif/baremeExercice.ts`).
   *
   * Une question vaut 1 point par défaut : c'est le cas de tous les composants
   * qui corrigent une réponse unique. À surcharger par les composants dont une
   * question peut rapporter plusieurs points (plusieurs champs de saisie,
   * barème spécifique...).
   */
  static pointsMaxQuestion(_exercice: IExercice, _i: number): number {
    return 1
  }

  /**
   * Transforme le HTML de la question pour l'affichage dans la liste
   * des corrections (CAN)
   * Par défaut l'attribut `interactivity-on` est forcé à false pour avoir la version non interactive du composant et éviter que l'élève puisse interagir avec
   * (vide) dans la correction.
   * À surcharger si le composant ne doit pas
   * apparaître (voir `InteractiveClock`) ou pour tout autre traitement spécifique.
   */
  static stripFromQuestionHtml(questionHtml: string): string {
    const tag = (this as typeof MathaleaCustomElement).elementTag
    if (!tag) return questionHtml

    return this.replaceBooleanAttributeInTagHtml(
      questionHtml,
      tag,
      'interactivity-on',
      false,
    )
  }

  protected static replaceBooleanAttributeInTagHtml(
    html: string,
    tag: string,
    attrName: string,
    value: boolean,
  ): string {
    const escapedTag = this.escapeRegExp(tag)
    const escapedAttr = this.escapeRegExp(attrName)
    const normalized = value ? 'true' : 'false'
    const tagPattern = new RegExp(`<${escapedTag}\\b([^>]*)>`, 'gi')

    return html.replace(tagPattern, (_match, attrs: string) => {
      const attrPattern = new RegExp(
        `(\\s${escapedAttr}\\s*=\\s*")[^"]*(")`,
        'i',
      )
      if (attrPattern.test(attrs)) {
        return `<${tag}${attrs.replace(attrPattern, `$1${normalized}$2`)}>`
      }
      return `<${tag}${attrs} ${attrName}="${normalized}">`
    })
  }

  protected static escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  connectedCallback() {
    this.hydrateCommonAttributes()
    this.render()
    if (!this.interactivityOn) this.renderReadOnlyMath()
  }

  disconnectedCallback() {
    // Hook volontairement vide pour les classes filles.
  }

  /**
   * En contexte HTML: met à jour l'affichage du composant.
   * En contexte LaTeX: retourne la représentation LaTeX (ou '').
   */
  render(): string | void {
    if (!context.isHtml || context.isTypst) {
      return this.renderLatex()
    }
    return ''
  }

  protected renderLatex(): string {
    return ''
  }

  get value(): unknown {
    return this._value
  }

  set value(nextValue: unknown) {
    this._value = nextValue
  }

  get interactivityOn(): boolean {
    return this._interactivityOn
  }

  set interactivityOn(isOn: boolean) {
    this._interactivityOn = isOn
    this.setAttribute('interactivity-on', isOn ? 'true' : 'false')
    this.onInteractivityChanged(isOn)
    if (!isOn) this.renderReadOnlyMath()
  }

  protected onInteractivityChanged(_isOn: boolean): void {
    // Hook pour les classes filles.
  }

  /** Rend le LaTeX affiché par la version figée, y compris dans le shadow DOM. */
  protected renderReadOnlyMath(): void {
    renderKatexIncludingShadowRoots(this)
  }

  protected hydrateCommonAttributes(): void {
    if (this.hasAttribute('interactivity-on')) {
      this._interactivityOn = this.getAttribute('interactivity-on') !== 'false'
    }
  }
}
