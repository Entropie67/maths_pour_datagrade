import { compile } from '@cortex-js/compute-engine'
import { MathfieldElement } from 'mathlive'
import { context } from '../../modules/context'
import { bleuMathalea } from '../colors'
import { isEquivalentEquation } from '../interactif/checks/equationChecks'
import {
  isEquivalentInequality,
  splitInequality,
} from '../interactif/checks/inequalityChecks'
import { pointsMaxDuBareme } from '../interactif/baremeExercice'
import { haveSameComplexValue } from '../interactif/checks/complexArithmetic'
import { fromOptions } from '../interactif/checks/adapter'
import { normalizeLatexArithmetic } from '../interactif/checks/latexArithmetic'
import { sameSet } from '../interactif/checks/sameSet'
import { fonctionComparaison } from '../interactif/comparisonFunctions'
import { toutAUnPoint, toutPourUnPoint } from '../interactif/fonctionsBaremes'
import { nommeChampsAutourDe } from '../interactif/nomAccessibleChamp'
import { setMathfield, setMathfieldListener } from '../interactif/setMathfield'
import type { IExercice } from '../types'
import {
  IntervalleDroiteElement,
  type IntervalleDroiteValue,
} from './IntervalleDroiteElement'
import {
  equationsProduitNul,
  normaliseParentheses,
  regleProduitNul,
} from './equationProduit'
import { evenementSolveurTermine } from './solveurTermine'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

export type SolveurKind = 'equation' | 'inequation'
/**
 * Façon de conclure la résolution d'une équation :
 * - `x=` : l'élève s'arrête à `x=…` (ou, pour une équation produit, quand les
 *   deux équations sont résolues) ;
 * - `S=` : l'élève donne l'ensemble des solutions (`\{-2;3\}`) ;
 * - `phrase` : l'élève complète « La solution de l'équation est … » ou « Les
 *   solutions de l'équation sont … » (valeurs séparées par des points-virgules).
 */
export type SolveurConclusion = 'x=' | 'S=' | 'phrase'
/**
 * - `evaluation` : la première étape fausse fige le solveur, la question est
 *   comptée fausse (1 point au maximum).
 * - `entrainement` : l'élève peut continuer et se corriger après une étape
 *   fausse. Dans un exercice interactif, avec `baremeSolveur('entrainement')`,
 *   la question vaut 2 points : 0 si la solution n'est pas trouvée, 1 si elle
 *   est trouvée malgré au moins une étape fausse, 2 si elle est trouvée sans
 *   aucune étape fausse. Dans un exercice non interactif, c'est un brouillon
 *   sans note.
 */
export type SolveurMode = 'entrainement' | 'evaluation'

/**
 * Barème à déclarer dans `handleAnswers()` pour une question avec solveur.
 * Il doit correspondre au mode utilisé lorsque l'exercice est interactif.
 */
export function baremeSolveur(
  mode: SolveurMode,
): (listePoints: number[]) => [number, number] {
  return mode === 'entrainement' ? toutAUnPoint : toutPourUnPoint
}

/**
 * Paramètre de formulaire (`besoinFormulaire2Numerique`...) permettant à
 * l'enseignant de choisir le barème du solveur lorsque l'exercice est
 * interactif. La valeur 1 (sur 1 point, mode `evaluation`) est la valeur par
 * défaut à affecter au paramètre.
 */
export function formulaireBaremeSolveur(): [string, number, string] {
  return [
    'Barème',
    2,
    "1 : Sur 1 point : une étape fausse rend la question fausse\n2 : Sur 2 points : l'élève peut se corriger après une étape fausse mais perd 1 point",
  ]
}

/** Convertit la valeur du paramètre de `formulaireBaremeSolveur()` en mode. */
export function modeSolveur(choixBareme: unknown): SolveurMode {
  return Number(choixBareme) === 2 ? 'entrainement' : 'evaluation'
}

/**
 * Options `mode` et `interactivityOn` d'`addMathaleaSolveur()` pour un exercice
 * qui propose à la fois le choix du barème (exercice interactif) et le mode
 * brouillon (exercice non interactif, case à cocher `brouillon`).
 */
export function optionsSolveur(
  interactif: boolean | undefined,
  brouillon: unknown,
  choixBareme: unknown,
): { mode: SolveurMode; interactivityOn: boolean } {
  if (interactif)
    return { mode: modeSolveur(choixBareme), interactivityOn: true }
  return {
    mode: brouillon ? 'entrainement' : 'evaluation',
    interactivityOn: Boolean(brouillon),
  }
}

/** Texte du commentaire (`this.comment`) des exercices avec solveur. */
export const commentaireSolveurInteractif = `Cet exercice propose un élément interactif permettant à l'élève d'effectuer la résolution pas à pas.<br>
Lorsque l'exercice est interactif, le barème est au choix :<br>
- sur 1 point : la résolution s'arrête dès la première étape non équivalente et la question est comptée fausse ;<br>
- sur 2 points (mode entraînement évalué) : l'élève peut se corriger après une étape fausse. Il obtient 2 points s'il trouve la solution sans aucune étape fausse, 1 point s'il la trouve malgré une ou plusieurs étapes fausses, 0 sinon.`

/** Texte du commentaire (`this.comment`) des exercices avec solveur et mode brouillon. */
export const commentaireSolveur = `${commentaireSolveurInteractif}<br>
Lorsque l'exercice n'est pas interactif, activer le mode entraînement affiche l'élément en version brouillon : les erreurs restent visibles et il n'y a pas de note.`

export type MathaleaSolveurOptions = {
  id?: string
  numeroExercice?: number
  questionIndex?: number
  initial: string
  kind?: SolveurKind
  mode?: SolveurMode
  variable?: string
  /**
   * Résolution dans C : `i` est l'unité imaginaire, l'équivalence des étapes est
   * contrôlée sur les nombres complexes et la solution attendue est de la forme
   * algébrique `a+bi` (clavier avec la touche `i`). Équations uniquement.
   */
  complex?: boolean
  /**
   * Équations produit (équations uniquement) : lorsque la dernière étape
   * validée est un produit de deux expressions affines égal à zéro, un bouton
   * « Équation produit » propose deux colonnes, une par facteur. Une fois les
   * équations résolues (ou l'équation de départ résolue), l'élève donne
   * l'ensemble des solutions `S=` : c'est lui qui est vérifié (avec le
   * `compare` de `handleAnswers()`, ex : `seq([sameSet()])`).
   */
  equationProduit?: boolean
  /**
   * Conclusion de la résolution d'une équation dans R (voir
   * `SolveurConclusion`, `x=` par défaut). Avec `S=` ou `phrase`, une équation
   * `x^2=a` est considérée comme résolue et l'élève donne ses deux solutions ;
   * la valeur attendue de `handleAnswers()` est alors l'ensemble (`\{-2;3\}`)
   * ou les valeurs séparées par des points-virgules (`-2;3`).
   */
  conclusion?: SolveurConclusion
  showInterval?: boolean
  intervalMin?: number
  intervalMax?: number
  interactivityOn?: boolean
}

// Même icône que le « + » de `PossibleMultiLinesAnswerElement` (calcul en plusieurs étapes).
const ICONE_PLUS =
  '<svg viewBox="0 0 20 20" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="10" cy="10" r="8.5"/><path d="M10 6v8M6 10h8"/></svg>'

type Zone = 'principale' | 'branche0' | 'branche1' | 'ensemble'

/**
 * Suite d'étapes d'une résolution : l'équation de départ, l'équation d'un
 * facteur d'une équation produit ou les propositions pour l'ensemble `S=`.
 */
type Resolution = {
  lines: string[]
  invalid: Set<number>
  /** Forme résolue atteinte (ou ensemble correct) : plus rien à saisir. */
  resolue: boolean
}

function nouvelleResolution(lines: string[]): Resolution {
  return { lines, invalid: new Set(), resolue: false }
}

/** Dernière ligne non vide et non fausse, à partir de la ligne `premiere`. */
function derniereLigneValide(resolution: Resolution, premiere: number): string {
  for (let index = resolution.lines.length - 1; index >= premiere; index--) {
    if (resolution.lines[index].trim() !== '' && !resolution.invalid.has(index))
      return resolution.lines[index]
  }
  return ''
}

type VerificationResult = {
  isOk: boolean
  feedback: string
  score: { nbBonnesReponses: number; nbReponses: number }
}

/**
 * @author Jean-Claude Lhote
 */
export class MathaleaSolveurElement extends MathaleaCustomElement {
  static readonly elementTag = 'mathalea-solveur'
  private principale = nouvelleResolution([])
  // Équations des deux facteurs d'une équation produit (vide tant que l'élève
  // n'a pas cliqué sur « Équation produit »).
  private branches: Resolution[] = []
  // Propositions pour l'ensemble des solutions, une fois les équations résolues.
  private ensemble: Resolution | null = null
  private message = ''
  private messageIsSuccess = false
  // Élément créé sans interactivité (ex : correction CAN) : seule l'équation est affichée.
  private equationOnly = false

  static create({
    id,
    numeroExercice,
    questionIndex,
    initial,
    kind = 'equation',
    mode = 'entrainement',
    variable = 'x',
    complex = false,
    equationProduit = false,
    conclusion = 'x=',
    showInterval = false,
    intervalMin = -5,
    intervalMax = 5,
    interactivityOn = true,
  }: MathaleaSolveurOptions): string {
    // Hors interactivité (ou hors HTML), seule l'équation est écrite.
    if (!context.isHtml || context.isTypst || !interactivityOn)
      return `$${initial}$`
    return super.create({
      id:
        id ??
        `${MathaleaSolveurElement.elementTag}Ex${numeroExercice ?? 0}Q${questionIndex ?? 0}`,
      numeroExercice: numeroExercice ?? 0,
      questionIndex: questionIndex ?? 0,
      initial,
      kind,
      mode,
      variable,
      complex,
      equationProduit,
      conclusion,
      showInterval,
      intervalMin,
      intervalMax,
      interactivityOn,
    })
  }

  connectedCallback(): void {
    if (this.getAttribute('interactivity-on') === 'false')
      this.equationOnly = this.principale.lines.length === 0
    if (this.principale.lines.length === 0)
      this.principale.lines = [this.getAttribute('initial') ?? '', '']
    super.connectedCallback()
  }

  disconnectedCallback(): void {
    this.replaceChildren()
  }

  static formatStudentAnswer(rawAnswer: string): string {
    return rawAnswer === '' ? 'aucune réponse' : `$${rawAnswer}$`
  }

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): VerificationResult {
    const element = document.getElementById(
      `${this.elementTag}Ex${exercice.numeroExercice}Q${questionIndex}`,
    ) as MathaleaSolveurElement | null
    const actual = element?.value ?? ''
    const expected =
      exercice.autoCorrection[questionIndex]?.valeur?.reponse?.value
    const expectedValues = Array.isArray(expected)
      ? expected.map(String)
      : [String(expected ?? '')]
    // Une étape équivalente à la solution (ex : `x+3-3=7-3`) ne suffit pas :
    // la dernière ligne doit être la forme résolue, sans calcul à poursuivre.
    const kind = element?.kind ?? 'equation'
    const complex = element?.complex ?? false
    const avecConclusion = element?.avecConclusion ?? false
    const variable = element?.getAttribute('variable') ?? 'x'
    const reponse = exercice.autoCorrection[questionIndex]?.valeur?.reponse
    let isSolved: boolean
    if (avecConclusion) {
      // La conclusion (`S=` ou phrase) est comparée avec le `compare` de l'exercice.
      const compare = reponse?.compare ?? fonctionComparaison
      isSolved =
        actual !== '' &&
        expectedValues.some(
          (candidate) => compare(actual, candidate, reponse?.options).isOk,
        )
    } else if (element != null && element.branches.length > 0) {
      // Équation produit sans conclusion : chaque équation résolue doit être
      // l'une des solutions attendues, et toutes doivent être trouvées.
      const lignes = element.lignesDesEquations
      isSolved =
        lignes.every(
          (ligne) =>
            isSolvedForm(ligne, kind, variable, complex) &&
            expectedValues.some((candidate) =>
              isConformToExpected(ligne, candidate, kind, complex),
            ),
        ) &&
        expectedValues.every((candidate) =>
          lignes.some((ligne) =>
            isConformToExpected(ligne, candidate, kind, complex),
          ),
        )
    } else {
      isSolved =
        isSolvedForm(actual, kind, variable, complex) &&
        expectedValues.some((candidate) =>
          isConformToExpected(actual, candidate, kind, complex),
        )
    }
    const hasWrongStep = (element?.nbEtapesFausses ?? 0) > 0
    // En mode entrainement, le second « champ » vaut 1 si aucune étape n'est fausse.
    const points =
      element?.mode === 'entrainement'
        ? [isSolved ? 1 : 0, isSolved && !hasWrongStep ? 1 : 0]
        : [isSolved ? 1 : 0]
    const bareme =
      exercice.autoCorrection[questionIndex]?.valeur?.bareme ?? toutPourUnPoint
    const [nbBonnesReponses, nbReponses] = bareme(points)
    const isOk = nbBonnesReponses === nbReponses
    const resolu =
      element?.kind === 'inequation' ? "L'inéquation" : "L'équation"
    const feedback = isOk
      ? ''
      : isSolved
        ? `${resolu} est résolue mais au moins une étape était incorrecte.`
        : avecConclusion
          ? actual === ''
            ? "Il faut résoudre l'équation puis conclure."
            : "La conclusion n'est pas celle attendue."
          : element?.kind === 'inequation'
            ? "La dernière inéquation n'est pas la solution attendue."
            : "La dernière équation n'est pas la solution attendue."

    exercice.answers ??= {}
    if (element != null) {
      exercice.answers[element.id] = actual
      element.message = feedback
      element.messageIsSuccess = isOk
      element.interactivityOn = false
    }
    updateExternalFeedback(exercice, questionIndex, isOk, feedback)
    return {
      isOk,
      feedback,
      score: { nbBonnesReponses, nbReponses },
    }
  }

  static pointsMaxQuestion(exercice: IExercice, questionIndex: number): number {
    // Le barème s'applique à deux « champs » en mode entrainement (solution
    // trouvée, aucune étape fausse) et à un seul en mode evaluation.
    return pointsMaxDuBareme(
      exercice.autoCorrection?.[questionIndex]?.valeur?.bareme,
      2,
    )
  }

  get kind(): SolveurKind {
    return this.getAttribute('kind') === 'inequation'
      ? 'inequation'
      : 'equation'
  }

  /** Résolution dans C (voir l'option `complex`). */
  get complex(): boolean {
    return this.getAttribute('complex') === 'true' && this.kind === 'equation'
  }

  get mode(): SolveurMode {
    return this.getAttribute('mode') === 'evaluation'
      ? 'evaluation'
      : 'entrainement'
  }

  /** Conclusion demandée (`x=` pour les inéquations et les équations dans C). */
  get conclusion(): SolveurConclusion {
    const conclusion = this.getAttribute('conclusion')
    return (conclusion === 'S=' || conclusion === 'phrase') &&
      this.kind === 'equation' &&
      !this.complex
      ? conclusion
      : 'x='
  }

  /** `S=` ou phrase : une ligne de conclusion est demandée une fois l'équation résolue. */
  get avecConclusion(): boolean {
    return this.conclusion !== 'x='
  }

  /** Bouton « Équation produit » disponible (équations dans R uniquement). */
  get avecProduit(): boolean {
    return (
      this.getAttribute('equation-produit') === 'true' &&
      this.kind === 'equation' &&
      !this.complex
    )
  }

  /** Dernière ligne valide de chaque équation d'une équation produit. */
  get lignesDesEquations(): string[] {
    return this.branches.map((branche) => derniereLigneValide(branche, 0))
  }

  /** Nombre d'étapes évaluées et reconnues fausses (mode entrainement). */
  get nbEtapesFausses(): number {
    return [this.principale, ...this.branches, this.ensemble].reduce(
      (total, resolution) => total + (resolution?.invalid.size ?? 0),
      0,
    )
  }

  get value(): string {
    if (this.avecConclusion)
      return this.ensemble == null ? '' : derniereLigneValide(this.ensemble, 0)
    if (this.branches.length > 0) return this.lignesDesEquations.join(';')
    return derniereLigneValide(this.principale, 1)
  }

  set value(nextValue: string) {
    const initial = this.getAttribute('initial') ?? ''
    this.branches = []
    this.ensemble = null
    this.principale = nouvelleResolution([initial, ''])
    if (nextValue.trim() !== '') {
      if (this.avecConclusion) {
        this.principale.lines = [initial]
        this.ensemble = nouvelleResolution([nextValue])
        this.ensemble.resolue = true
      } else {
        this.principale.lines = [initial, nextValue]
      }
    }
    this.render()
  }

  render(): string | void {
    if (this.equationOnly) {
      this.innerHTML = `<span class="solver-equation">$${this.getAttribute('initial') ?? ''}$</span>`
      return
    }
    const numeroExercice = this.getAttribute('numero-exercice') ?? '0'
    const questionIndex = this.getAttribute('question-index') ?? '0'
    const colonnes =
      this.branches.length === 0
        ? ''
        : `<p class="regle">${regleProduitNul}</p>
      <div class="colonnes">${this.branches
        .map(
          (_, k) =>
            `<div class="colonne">${this.lignesHtml(`branche${k}` as Zone)}</div>`,
        )
        .join('')}</div>`
    const ensemble =
      this.ensemble == null
        ? ''
        : `<div class="solver ensemble">${this.lignesHtml('ensemble')}</div>`
    this.innerHTML = `
      <style>
        mathalea-solveur { display: block; margin: .6rem 0; max-width: 760px; }
        mathalea-solveur .solver { display: grid; gap: .45rem; }
        mathalea-solveur .line { display: grid; grid-template-columns: 5.5rem minmax(12rem, 1fr) auto; align-items: center; gap: .55rem; }
        mathalea-solveur .step { color: ${bleuMathalea}; font-size: .82rem; font-weight: 600; }
        mathalea-solveur .solver-field { display: block; min-width: 0; margin: 0; padding: 0; border: 0; background: transparent; }
        mathalea-solveur math-field { display: block !important; width: 100%; margin: 0 !important; padding: 0; box-sizing: border-box; }
        mathalea-solveur math-field::part(container) { border: none !important; }
        mathalea-solveur math-field:not(.solver-readonly) { border: 1px solid #aab2bd !important; border-radius: .35rem; }
        mathalea-solveur math-field:not(.solver-readonly):focus-within { border-color: transparent !important; }
        mathalea-solveur math-field.solver-readonly::part(container) { border: none !important; outline: none !important; box-shadow: none !important; background: transparent; }
        mathalea-solveur .line.invalid math-field { color: #b42318; }
        mathalea-solveur .line.invalid math-field::part(container) { border: none; background: transparent; }
        mathalea-solveur .line.invalid .step, mathalea-solveur .line-status { color: #b42318; }
        mathalea-solveur .line-status { font-size: .8rem; font-weight: 600; }
        mathalea-solveur .actions { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem; }
        mathalea-solveur button.plus { display: inline-flex; align-items: center; border: none; background: transparent; color: #9ca3af; padding: .1rem; border-radius: 999px; }
        mathalea-solveur button.plus:hover, mathalea-solveur button.plus:focus-visible { background: transparent; color: #4b5563; }
        mathalea-solveur button { border: 1px solid ${bleuMathalea}; border-radius: .35rem; background: transparent; color: ${bleuMathalea}; cursor: pointer; padding: .4rem .7rem; font: inherit; }
        mathalea-solveur button:hover, mathalea-solveur button:focus-visible { background: ${bleuMathalea}12; }
        mathalea-solveur .regle { margin: .8rem 0 .4rem; color: ${bleuMathalea}; font-weight: 600; }
        mathalea-solveur .colonnes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .8rem; }
        mathalea-solveur .colonne { display: grid; gap: .45rem; align-content: start; }
        mathalea-solveur .colonne .line { grid-template-columns: minmax(0, 1fr) auto; }
        mathalea-solveur .colonne .step { grid-column: 1 / -1; }
        mathalea-solveur .ensemble { margin-top: .8rem; }
        mathalea-solveur .ensemble .line { grid-template-columns: 2.5rem minmax(12rem, 1fr) auto; }
        mathalea-solveur .ensemble .line.phrase { grid-template-columns: minmax(0, 1fr) auto; }
        mathalea-solveur .ensemble .line.phrase .step { grid-column: 1 / -1; font-size: .95rem; }
        mathalea-solveur .message { margin: .1rem 0 0 6.05rem; font-size: .9rem; }
        mathalea-solveur .message.ok { color: #16803c; }
        mathalea-solveur .message.ko { color: #b42318; }
        mathalea-solveur .interval { margin-left: 6.05rem; }
        @media (max-width: 520px) { mathalea-solveur .line { grid-template-columns: 1fr auto; } mathalea-solveur .step { grid-column: 1 / -1; } mathalea-solveur .colonnes { grid-template-columns: minmax(0, 1fr); } mathalea-solveur .message, mathalea-solveur .interval { margin-left: 0; } }
      </style>
      <div class="solver">${this.lignesHtml('principale')}</div>
      ${colonnes}
      ${ensemble}
      <p class="message ${this.messageIsSuccess ? 'ok' : 'ko'}" role="status">${this.message}</p>
      <div class="interval"></div>
      <span id="resultatCheckEx${numeroExercice}Q${questionIndex}"></span>
      <div id="feedbackEx${numeroExercice}Q${questionIndex}"></div>`

    this.querySelectorAll<HTMLElement>('.solver-field').forEach((host) => {
      const zone = host.dataset.zone as Zone
      const index = Number(host.dataset.index)
      const resolution = this.resolutionDe(zone)
      const field = new MathfieldElement()
      field.id = `${this.id}-${zone === 'principale' ? '' : `${zone}-`}line-${index}`
      field.id = `${this.id}-${zone === 'principale' ? '' : `${zone}-`}line-${index}`
      field.value = resolution.lines[index]
      const editable = this.estEditable(zone, index)
      field.readOnly = !editable
      field.classList.toggle('solver-readonly', !editable)
      field.setAttribute('virtual-keyboard-mode', 'manual')

      // Clavier de base avec fractions, où la touche π est remplacée par la
      // lettre de l'inconnue.
      field.setAttribute(
        'data-keyboard',
        zone === 'ensemble'
          ? this.conclusion === 'phrase'
            ? 'numbersX ensemble'
            : 'numbersX ensemble ensembleDefini'
          : this.kind === 'inequation'
            ? 'numbersInconnue basicOperations compare'
            : this.complex
              ? 'numbersInconnue basicOperationsComplexes'
              : 'numbersInconnue basicOperations2',
      )
      field.dataset.inconnue = this.getAttribute('variable') ?? 'x'
      field.dataset.nomAccessible =
        zone === 'ensemble'
          ? 'ensemble des solutions'
          : index === 0
            ? zone === 'principale'
              ? 'équation de départ'
              : 'équation à résoudre'
            : `étape ${index}`
      if (editable) {
        field.addEventListener('input', () => {
          resolution.lines[index] = normaliseParentheses(field.value)
          this.dispatchEvent(new Event('input', { bubbles: true }))
        })
      }
      host.appendChild(field)
      if (field.isConnected) {
        setMathfield(field)
      } else {
        field.addEventListener('mount', setMathfieldListener, { once: true })
      }
      if (field.isConnected) {
        setMathfield(field)
      } else {
        field.addEventListener('mount', setMathfieldListener, { once: true })
      }
    })
    this.querySelectorAll<HTMLElement>('.evaluate').forEach((bouton) =>
      bouton.addEventListener('click', () =>
        this.evaluate(bouton.dataset.zone as Zone),
      ),
    )
    this.querySelector('.produit')?.addEventListener('click', () =>
      this.choisirEquationProduit(),
    )
    this.renderInterval()
    nommeChampsAutourDe(this)
  }

  protected onInteractivityChanged(): void {
    this.render()
  }

  evaluate(zone: Zone = 'principale'): void {
    this.evaluateCurrentLine(zone)
  }

  private resolutionDe(zone: Zone): Resolution {
    if (zone === 'ensemble') return this.ensemble ?? nouvelleResolution([''])
    if (zone === 'principale') return this.principale
    return this.branches[zone === 'branche0' ? 0 : 1]
  }

  /** Une zone n'est modifiable que tant que la suite de la résolution ne la fige pas. */
  private zoneActive(zone: Zone): boolean {
    if (zone === 'ensemble') return true
    if (this.ensemble != null) return false
    return zone !== 'principale' || this.branches.length === 0
  }

  private estEditable(zone: Zone, index: number): boolean {
    const resolution = this.resolutionDe(zone)
    return (
      this.interactivityOn &&
      this.zoneActive(zone) &&
      !resolution.resolue &&
      index === resolution.lines.length - 1 &&
      // La première ligne est l'équation donnée, sauf pour l'ensemble.
      (index > 0 || zone === 'ensemble')
    )
  }

  /** Étiquette de la ligne de conclusion : `S =` ou le début de la phrase. */
  private etiquetteConclusion(): string {
    if (this.conclusion === 'S=') return 'S ='
    const pluriel =
      this.branches.length > 0 ||
      carreEgalNombre(
        derniereLigneValide(this.principale, 0),
        this.getAttribute('variable') ?? 'x',
      ) != null
    return pluriel
      ? 'Les solutions de l’équation sont'
      : 'La solution de l’équation est'
  }

  /** Lignes d'une zone : une étiquette, un champ et, si modifiable, ses boutons. */
  private lignesHtml(zone: Zone): string {
    const resolution = this.resolutionDe(zone)
    let stepNumber = 1
    return resolution.lines
      .map((line, index) => {
        const editable = this.estEditable(zone, index)
        const invalid = resolution.invalid.has(index)
        let label = `Étape ${stepNumber}`
        if (zone === 'ensemble') label = this.etiquetteConclusion()
        else if (index === 0)
          label = zone === 'principale' ? 'Énoncé' : 'Équation'
        if (zone !== 'ensemble' && index > 0 && !invalid && line.trim() !== '')
          stepNumber++
        const boutonProduit =
          editable && zone === 'principale' && this.equationsProduit() != null
            ? '<button class="produit" type="button">Équation produit</button>'
            : ''
        const droite = invalid
          ? `<span class="line-status">${zone === 'ensemble' ? 'Réponse incorrecte' : 'Étape incorrecte'}</span>`
          : editable
            ? `<span class="actions"><button class="evaluate plus" data-zone="${zone}" type="button" title="Valider cette ligne" aria-label="Valider cette ligne">${ICONE_PLUS}</button>${boutonProduit}</span>`
            : ''
        const classes = `line${invalid ? ' invalid' : ''}${zone === 'ensemble' && this.conclusion === 'phrase' ? ' phrase' : ''}`
        return `<div class="${classes}"><span class="step">${label}</span><span class="solver-field" data-zone="${zone}" data-index="${index}"></span>${droite}</div>`
      })
      .join('')
  }

  private compare(
    input: string,
    expected: string,
  ): { passed: boolean; feedbackKo: string; feedbackOk?: string } {
    if (this.complex)
      return isEquivalentEquation({ complexes: true }).run(input, expected)
    return this.kind === 'inequation'
      ? isEquivalentInequality().run(input, expected)
      : isEquivalentEquation().run(
          normalizeEquationVariable(
            input,
            this.getAttribute('variable') ?? 'x',
          ),
          normalizeEquationVariable(
            expected,
            this.getAttribute('variable') ?? 'x',
          ),
        )
  }

  /** Équations des deux facteurs si la dernière étape validée est une équation produit. */
  private equationsProduit(): [string, string] | null {
    if (
      !this.avecProduit ||
      !this.interactivityOn ||
      this.branches.length > 0 ||
      this.ensemble != null
    )
      return null
    const editable = this.principale.lines.length - 1
    return equationsProduitNul(
      this.findPreviousValidLine(this.principale, editable),
      this.getAttribute('variable') ?? 'x',
    )
  }

  /** Bouton « Équation produit » : une colonne par facteur de la dernière étape. */
  private choisirEquationProduit(): void {
    const equations = this.equationsProduit()
    if (equations == null) return
    // La ligne en cours de saisie est abandonnée : la résolution continue dans les colonnes.
    this.principale.lines.pop()
    this.branches = equations.map((equation) => {
      const resolution = nouvelleResolution([equation, ''])
      if (this.estResolue(equation)) {
        resolution.lines.pop()
        resolution.resolue = true
      }
      return resolution
    })
    this.message = ''
    this.messageIsSuccess = false
    if (this.branches.every((branche) => branche.resolue))
      this.apresResolution()
    this.render()
    this.dispatchEvent(new Event('change', { bubbles: true }))
    if (!this.interactivityOn)
      this.dispatchEvent(
        new Event(evenementSolveurTermine, { bubbles: true, composed: true }),
      )
  }

  /** Forme résolue, ou `x^2=a` lorsqu'une conclusion est demandée. */
  private estResolue(ligne: string): boolean {
    const variable = this.getAttribute('variable') ?? 'x'
    return (
      isSolvedForm(ligne, this.kind, variable, this.complex) ||
      (this.avecConclusion && carreEgalNombre(ligne, variable) != null)
    )
  }

  /**
   * Après la résolution d'une équation : si elles sont toutes résolues, demande
   * la conclusion (`S=` ou phrase) ou, sans conclusion, termine le solveur.
   */
  private apresResolution(): void {
    const feuilles = this.feuilles()
    this.messageIsSuccess = true
    if (!feuilles.every((f) => f.resolue)) {
      this.message = 'Cette équation est résolue.'
      return
    }
    const pluriel =
      feuilles.length > 1 ? 'Les équations sont' : 'L’équation est'
    if (this.avecConclusion) {
      this.ensemble = nouvelleResolution([''])
      this.message = `${pluriel} résolue${feuilles.length > 1 ? 's' : ''} : ${this.conclusion === 'S=' ? 'donner l’ensemble des solutions' : 'conclure par une phrase'}.`
    } else {
      this.message = `${pluriel} résolue${feuilles.length > 1 ? 's' : ''}.`
      this.interactivityOn = false
    }
  }

  /** Résolutions dont les solutions forment l'ensemble `S`. */
  private feuilles(): Resolution[] {
    return this.branches.length > 0 ? this.branches : [this.principale]
  }

  /** Solutions déduites des équations résolues par l'élève, sans doublon. */
  private solutionsAttendues(): string[] {
    const variable = this.getAttribute('variable') ?? 'x'
    const valeurs: string[] = []
    for (const feuille of this.feuilles()) {
      for (const solution of solutionsDeLigne(
        derniereLigneValide(feuille, 0),
        variable,
      ) ?? []) {
        if (!valeurs.some((valeur) => sameExpression(valeur, solution)))
          valeurs.push(solution)
      }
    }
    return valeurs
  }

  /** Contrôle la conclusion de l'élève par rapport à ses équations résolues. */
  private compareConclusion(conclusion: string): {
    passed: boolean
    feedbackKo: string
    feedbackOk?: string
  } {
    const solutions = this.solutionsAttendues()
    if (this.conclusion === 'S=')
      return sameSet().run(
        conclusion,
        solutions.length === 0 ? '\\emptyset' : `\\{${solutions.join(';')}\\}`,
      )
    return fromOptions({ suiteDeNombres: true }).run(
      conclusion,
      solutions.length === 0 ? '\\emptyset' : solutions.join(';'),
    )
  }

  private evaluateCurrentLine(zone: Zone): void {
    const resolution = this.resolutionDe(zone)
    const index = resolution.lines.length - 1
    const current = resolution.lines[index]?.trim() ?? ''
    if (current === '') {
      this.message = 'Saisir une nouvelle ligne avant de l’évaluer.'
      this.messageIsSuccess = false
      this.render()
      return
    }
    const result =
      zone === 'ensemble'
        ? this.compareConclusion(current)
        : this.compare(current, this.findPreviousValidLine(resolution, index))
    this.message = result.passed
      ? (result.feedbackOk ?? 'Transformation correcte.')
      : result.feedbackKo
    this.messageIsSuccess = result.passed
    if (result.passed) {
      if (zone === 'ensemble' || this.estResolue(current)) {
        resolution.resolue = true
        if (
          zone === 'ensemble' ||
          (!this.avecConclusion && this.branches.length === 0)
        ) {
          this.message =
            this.kind === 'inequation'
              ? "L'inéquation est résolue."
              : "L'équation est résolue."
          this.interactivityOn = false
        } else {
          this.apresResolution()
          this.render()
        }
      } else {
        resolution.lines.push('')
        this.render()
      }
    } else if (this.mode === 'evaluation') this.interactivityOn = false
    else {
      resolution.invalid.add(index)
      resolution.lines.push('')
      this.render()
    }
    this.dispatchEvent(new Event('change', { bubbles: true }))
    if (!this.interactivityOn)
      this.dispatchEvent(
        new Event(evenementSolveurTermine, { bubbles: true, composed: true }),
      )
  }

  private findPreviousValidLine(
    resolution: Resolution,
    beforeIndex: number,
  ): string {
    for (let index = beforeIndex - 1; index >= 0; index--) {
      if (
        !resolution.invalid.has(index) &&
        resolution.lines[index]?.trim() !== ''
      ) {
        return resolution.lines[index]
      }
    }
    return this.getAttribute('initial') ?? ''
  }

  private renderInterval(): void {
    const host = this.querySelector<HTMLElement>('.interval')
    if (
      host == null ||
      this.getAttribute('show-interval') !== 'true' ||
      this.kind !== 'inequation'
    )
      return
    const value = inequalityToInterval(
      this.value,
      this.getAttribute('variable') ?? 'x',
      this.numberAttribute('interval-min', -5),
      this.numberAttribute('interval-max', 5),
    )
    if (value == null) return
    const interval = new IntervalleDroiteElement()
    interval.setAttribute(
      'min',
      String(this.numberAttribute('interval-min', -5)),
    )
    interval.setAttribute(
      'max',
      String(this.numberAttribute('interval-max', 5)),
    )
    interval.interactivityOn = false
    host.appendChild(interval)
    interval.value = JSON.stringify(value)
  }

  private numberAttribute(name: string, fallback: number): number {
    const value = Number(this.getAttribute(name))
    return Number.isFinite(value) ? value : fallback
  }
}

/**
 * Remplace l'inconnue par `x` sans toucher aux commandes LaTeX
 * (ex : le `s` de `\\times` quand l'inconnue est `s`).
 */
function normalizeEquationVariable(equation: string, variable: string): string {
  if (variable === 'x' || variable === '') return equation
  const escaped = variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return equation.replace(
    new RegExp(`\\\\[a-zA-Z]+|${escaped}`, 'g'),
    (token) => (token === variable ? 'x' : token),
  )
}

export function isSolvedForm(
  value: string,
  kind: SolveurKind,
  variable: string,
  complex = false,
): boolean {
  const relation =
    kind === 'inequation' ? splitInequality(value) : splitEquation(value)
  if (relation == null) return false
  const isFinal = complex ? isFinalComplexNumber : isFinalNumber
  return (
    (isVariableAlone(relation.left, variable) &&
      isFinal(relation.right, variable)) ||
    (isVariableAlone(relation.right, variable) &&
      isFinal(relation.left, variable))
  )
}

/**
 * Un nombre complexe est terminal s'il est écrit sous forme algébrique `a+bi`
 * où `a` et `b` sont des nombres ou des fractions, simplifiées ou non, de
 * numérateur et dénominateur numériques (ex : `-3`, `2i`,
 * `\dfrac{1}{13}+\dfrac{5}{13}i`, `-\dfrac{5i}{13}`), sans terme nul lorsque
 * l'écriture comporte deux termes.
 */
function isFinalComplexNumber(expression: string, variable: string): boolean {
  if (containsVariable(expression, variable)) return false
  const compact = expression
    .replaceAll('\\left', '')
    .replaceAll('\\right', '')
    .replaceAll('\\mathrm{i}', 'i')
    .replaceAll('\\text{i}', 'i')
    .replaceAll('\\imaginaryI', 'i')
    .replaceAll('{i}', 'i')
    .replace(/\s/g, '')
  const termes = splitTermes(compact)
  if (termes.length === 0 || termes.length > 2) return false
  const natures = termes.map((terme) => natureTerme(terme, variable))
  const [premier, second] = natures
  if (premier == null || (termes.length === 2 && second == null)) return false
  if (second == null) return true
  return premier.imaginaire !== second.imaginaire && !premier.nul && !second.nul
}

type NatureTerme = { imaginaire: boolean; nul: boolean }

/** Découpe une somme en termes signés, sans couper à l'intérieur d'accolades. */
function splitTermes(expression: string): string[] {
  const termes: string[] = []
  let debut = 0
  let profondeur = 0
  for (let index = 0; index < expression.length; index++) {
    const caractere = expression[index]
    if (caractere === '{') profondeur++
    if (caractere === '}') profondeur--
    if (profondeur === 0 && index > debut && '+-'.includes(caractere)) {
      termes.push(expression.slice(debut, index))
      debut = index
    }
  }
  termes.push(expression.slice(debut))
  return termes.filter((terme) => terme !== '')
}

/** Nature d'un terme signé (réel ou imaginaire pur) s'il est terminal, sinon `null`. */
function natureTerme(terme: string, variable: string): NatureTerme | null {
  const signe = terme.startsWith('-') ? '-' : ''
  const corps = terme.replace(/^[+-]/, '')
  let coefficient: string | null = null
  const imaginaireEntier = /^(\d+(?:[.,]\d+)?)?i$/.exec(corps)
  const imaginaireFraction = /^(\\[dt]?frac\{[^{}]+\}\{[^{}]+\})i$/.exec(corps)
  const imaginaireNumerateur =
    /^\\([dt]?frac)\{([+-]?)(\d+(?:[.,]\d+)?)?i\}\{([^{}]+)\}$/.exec(corps)
  if (imaginaireEntier != null) coefficient = imaginaireEntier[1] ?? '1'
  else if (imaginaireFraction != null) coefficient = imaginaireFraction[1]
  else if (imaginaireNumerateur != null)
    coefficient = `\\${imaginaireNumerateur[1]}{${imaginaireNumerateur[2]}${imaginaireNumerateur[3] ?? '1'}}{${imaginaireNumerateur[4]}}`
  else if (corps.includes('i')) return null
  const imaginaire = coefficient != null
  const reel = `${signe}${coefficient ?? corps}`
  if (!isFinalNumber(reel, variable)) return null
  return { imaginaire, nul: /^[+-]?0*(?:[.,]0*)?$/.test(coefficient ?? corps) }
}

/**
 * Un membre est terminal s'il s'agit d'un nombre en écriture décimale ou
 * fractionnaire (ex : `-3`, `2,5`, `\\dfrac{-6}{5}`), pas d'un calcul à
 * poursuivre (ex : `2\\times\\frac{3}{5}`).
 */
function isFinalNumber(expression: string, variable: string): boolean {
  if (containsVariable(expression, variable)) return false
  const compact = expression
    .replaceAll('\\left', '')
    .replaceAll('\\right', '')
    .replaceAll('{,}', ',')
    .replace(/\s/g, '')
  const unsigned = '\\d+(?:[.,]\\d+)?'
  const signed = `[+-]?${unsigned}`
  if (new RegExp(`^${signed}$`).test(compact)) return true
  // En LaTeX, les accolades sont facultatives autour d'un chiffre seul.
  const latexFraction = new RegExp(
    `^[+-]?\\\\[dt]?frac(?:\\{${signed}\\}|\\d)(?:\\{(${signed})\\}|(\\d))$`,
  ).exec(compact)
  const inlineFraction = new RegExp(`^${signed}/(${signed})$`).exec(compact)
  const denominator =
    latexFraction?.[1] ?? latexFraction?.[2] ?? inlineFraction?.[1]
  if (denominator == null) return false
  // Une fraction numérique est terminale, même si elle est réductible.
  return Number(denominator.replace(',', '.')) !== 0
}

function splitEquation(
  value: string,
): { left: string; right: string } | undefined {
  const parts = value.split('=')
  if (parts.length !== 2 || parts.some((part) => part.trim() === ''))
    return undefined
  return { left: parts[0], right: parts[1] }
}

/**
 * Nombre de l'équation `x^2=a` (ou `a=x^2`) dont `a` est un nombre sans calcul
 * à poursuivre, sinon `null`.
 */
function carreEgalNombre(equation: string, variable: string): string | null {
  const relation = splitEquation(equation)
  if (relation == null) return null
  for (const [carre, nombre] of [
    [relation.left, relation.right],
    [relation.right, relation.left],
  ]) {
    if (
      normalizedVariableExpression(carre) === `${variable}^2` &&
      isFinalNumber(nombre, variable)
    )
      return nombre.trim()
  }
  return null
}

/** Équation `x^2=a` : les équations de ce type sont considérées comme résolues. */
export function estCarreEgalNombre(equation: string, variable = 'x'): boolean {
  return carreEgalNombre(equation, variable) != null
}

/**
 * Solutions de `x^2=a` : aucune si `a<0`, `0` si `a=0`, sinon `-r` et `r`
 * (`r` entier, fraction ou `\\sqrt{a}`).
 */
function racinesDuCarre(nombre: string): string[] {
  let valeur: unknown
  try {
    valeur = compile(normalizeLatexArithmetic(nombre))?.run?.({})
  } catch {
    return []
  }
  if (typeof valeur !== 'number' || !Number.isFinite(valeur) || valeur < -1e-12)
    return []
  if (valeur < 1e-12) return ['0']
  const racine = Math.sqrt(valeur)
  for (let denominateur = 1; denominateur <= 100; denominateur++) {
    const numerateur = Math.round(racine * denominateur)
    if (Math.abs(racine * denominateur - numerateur) < 1e-9) {
      const r =
        denominateur === 1
          ? `${numerateur}`
          : `\\dfrac{${numerateur}}{${denominateur}}`
      return [`-${r}`, r]
    }
  }
  return [`-\\sqrt{${nombre}}`, `\\sqrt{${nombre}}`]
}

/**
 * Solutions écrites dans une équation résolue : `x=3` ou `3=x` (une solution),
 * `x^2=a` (deux solutions, une ou aucune). `null` si l'équation n'est pas résolue.
 */
function solutionsDeLigne(equation: string, variable: string): string[] | null {
  const relation = splitEquation(equation)
  if (relation == null) return null
  if (isVariableAlone(relation.left, variable)) return [relation.right.trim()]
  if (isVariableAlone(relation.right, variable)) return [relation.left.trim()]
  const nombre = carreEgalNombre(equation, variable)
  return nombre == null ? null : racinesDuCarre(nombre)
}

function isVariableAlone(expression: string, variable: string): boolean {
  return normalizedVariableExpression(expression) === variable
}

function containsVariable(expression: string, variable: string): boolean {
  return normalizedVariableExpression(expression).includes(variable)
}

function normalizedVariableExpression(expression: string): string {
  return expression
    .replaceAll('\\left', '')
    .replaceAll('\\right', '')
    .replace(/\\[a-z]+/gi, '')
    .replace(/[{}\s]/g, '')
}

function inequalityToInterval(
  raw: string,
  variable: string,
  min: number,
  max: number,
): IntervalleDroiteValue | null {
  const inequality = splitInequality(raw)
  if (inequality == null) return null
  let relation = inequality.relation
  let boundaryExpression: string
  if (inequality.left.trim() === variable) boundaryExpression = inequality.right
  else if (inequality.right.trim() === variable) {
    boundaryExpression = inequality.left
    relation = ({ '<': '>', '<=': '>=', '>': '<', '>=': '<=' } as const)[
      relation
    ]
  } else return null
  const compiled = compile(boundaryExpression)
  let result: unknown
  try {
    result = compiled?.run?.({})
  } catch {
    return null
  }
  if (
    typeof result !== 'number' ||
    !Number.isFinite(result) ||
    result <= min ||
    result >= max
  )
    return null
  if (relation === '<' || relation === '<=') {
    return {
      start: min,
      end: result,
      leftBracket: null,
      rightBracket: relation === '<' ? '[' : ']',
    }
  }
  return {
    start: result,
    end: max,
    leftBracket: relation === '>' ? ']' : '[',
    rightBracket: null,
  }
}

function isConformToExpected(
  input: string,
  expected: string,
  kind: SolveurKind,
  complex = false,
): boolean {
  if (input.trim() === '' || expected.trim() === '') return false
  if (complex && kind === 'equation') {
    const inputParts = input.split('=')
    const expectedParts = expected.split('=')
    if (inputParts.length !== 2 || expectedParts.length !== 2) return false
    return (
      (haveSameComplexValue(inputParts[0], expectedParts[0]) &&
        haveSameComplexValue(inputParts[1], expectedParts[1])) ||
      (haveSameComplexValue(inputParts[0], expectedParts[1]) &&
        haveSameComplexValue(inputParts[1], expectedParts[0]))
    )
  }
  if (kind === 'equation') {
    const inputParts = input.split('=')
    const expectedParts = expected.split('=')
    if (inputParts.length !== 2 || expectedParts.length !== 2) return false
    return (
      (sameExpression(inputParts[0], expectedParts[0]) &&
        sameExpression(inputParts[1], expectedParts[1])) ||
      (sameExpression(inputParts[0], expectedParts[1]) &&
        sameExpression(inputParts[1], expectedParts[0]))
    )
  }

  const parsedInput = splitInequality(input)
  const parsedExpected = splitInequality(expected)
  if (parsedInput == null || parsedExpected == null) return false
  const sameOrder =
    parsedInput.relation === parsedExpected.relation &&
    sameExpression(parsedInput.left, parsedExpected.left) &&
    sameExpression(parsedInput.right, parsedExpected.right)
  const reversedRelation = (
    { '<': '>', '<=': '>=', '>': '<', '>=': '<=' } as const
  )[parsedExpected.relation]
  const reverseOrder =
    parsedInput.relation === reversedRelation &&
    sameExpression(parsedInput.left, parsedExpected.right) &&
    sameExpression(parsedInput.right, parsedExpected.left)
  return sameOrder || reverseOrder
}

function sameExpression(left: string, right: string): boolean {
  return fonctionComparaison(left.trim(), right.trim()).isOk
}

function updateExternalFeedback(
  exercice: IExercice,
  questionIndex: number,
  isOk: boolean,
  feedback: string,
): void {
  const result = document.getElementById(
    `resultatCheckEx${exercice.numeroExercice}Q${questionIndex}`,
  )
  if (result != null) {
    result.innerHTML = isOk ? '😎' : '☹️'
    result.style.fontSize = 'large'
  }
  const feedbackElement = document.getElementById(
    `feedbackEx${exercice.numeroExercice}Q${questionIndex}`,
  )
  if (feedbackElement != null) feedbackElement.innerHTML = feedback
}

export function addMathaleaSolveur(
  exercice: IExercice,
  questionIndex: number,
  options: Omit<MathaleaSolveurOptions, 'numeroExercice' | 'questionIndex'>,
): string {
  exercice.autoCorrection[questionIndex] ??= {}
  exercice.autoCorrection[questionIndex].formatInteractif =
    MathaleaSolveurElement.elementTag
  return MathaleaSolveurElement.create({
    ...options,
    interactivityOn: options.interactivityOn ?? Boolean(exercice.interactif),
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
  })
}

registerMathaleaCustomElement(MathaleaSolveurElement)

export default MathaleaSolveurElement
