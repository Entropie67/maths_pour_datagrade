import Decimal from 'decimal.js'
import FractionEtendue from '../../modules/FractionEtendue'
import { context } from '../../modules/context'
import type { FonctionBareme } from '../interactif/baremeExercice'
import { buildDataKeyboardFromStyle } from '../interactif/claviers/keyboard'
import { onlyProduct } from '../interactif/checks'
import { fonctionComparaison } from '../interactif/comparisonFunctions'
import { verifySingleMathLiveField } from '../interactif/mathLiveVerifications'
import { nommeChampsAutourDe } from '../interactif/nomAccessibleChamp'
import { ajouteFeedback } from '../interactif/questionMathLive'
import { bleuMathalea } from '../colors'
import { renderKatex } from '../latex/renderKatex'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'
import {
  MathaleaMathfieldElement,
  type MathaleaMathfieldVerificationResult,
} from './MathaleaMathfield'

/**
 * - `toutOuRien` : la question rapporte les points du barème de la réponse
 *   (1 par défaut) seulement si le résultat et toutes les étapes sont justes.
 * - `etapes` : 2 points si tout est juste, 1 point si le résultat est juste
 *   malgré une étape fausse. Chaque ligne ajoutée est corrigée immédiatement
 *   puis verrouillée : l'élève corrige une étape fausse sur la ligne suivante.
 */
export type BaremeMultiLignes = 'toutOuRien' | 'etapes'

export type PossibleMultiLinesAnswerOptions = {
  /** Début de chaque ligne, en LaTeX sans dollars (par exemple `A =`). */
  prefix?: string
  /** Style du champ, comme pour `ajouteChampTexteMathLive()` (clavier, classes CSS). */
  style?: string
  bareme?: BaremeMultiLignes
  /**
   * Les lignes intermédiaires doivent être des produits (multiplications et
   * puissances d'entiers) : `80+10` est refusé pour `90`.
   */
  produitSeulement?: boolean
  /**
   * Expression de départ, en LaTeX sans dollars (par exemple `360`), citée dans
   * le message d'une ligne fausse : « Ce produit n'est pas égal à $360$. »
   */
  valeurDeDepart?: string
  /**
   * Place la première ligne à côté du numéro de la question (liste numérotée),
   * quand la question n'a pas d'autre texte que `prefix`.
   */
  enLigne?: boolean
  /**
   * Affiche à côté du « + » un message qui explique qu'on peut détailler le
   * calcul. Il disparaît dès que l'élève ajoute une 2e ligne. Par défaut,
   * seule la première question de l'exercice l'affiche.
   */
  aide?: boolean
  id?: string
}

type PossibleMultiLinesAnswerCreateOptions = PossibleMultiLinesAnswerOptions & {
  numeroExercice: number
  questionIndex: number
}

/** Barème de la réponse finale en mode `etapes` : 2 points si elle est juste. */
export const baremeEtapes: FonctionBareme = (points) => [
  2 * (points[0] ?? 0),
  2,
]

const STYLE_ID = 'possible-multi-lines-answer-style'
const MESSAGE_AIDE =
  'Tu peux directement donner le résultat ou cliquer sur le + pour faire le calcul en plusieurs étapes.'
const ICONE_AJOUT =
  '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="10" cy="10" r="8.5"/><path d="M10 6v8M6 10h8"/></svg>'

/**
 * Champ de réponse MathLive auquel l'élève peut ajouter autant de lignes
 * intermédiaires qu'il le souhaite (bouton « + »), pour rédiger un calcul en
 * plusieurs étapes.
 *
 * La dernière ligne est le champ standard `champTexteEx…Q…` : elle est vérifiée
 * exactement comme avec `ajouteChampTexteMathLive()` (options de comparaison,
 * barème, feedback). Chaque ligne intermédiaire non vide doit seulement être
 * égale à la réponse attendue, quelle que soit sa forme (voir
 * `BaremeMultiLignes` pour la notation).
 *
 * `value` est la liste de toutes les lignes, la dernière étant la réponse finale.
 */
export class PossibleMultiLinesAnswerElement extends MathaleaCustomElement {
  static readonly elementTag = 'possible-multi-lines-answer'

  /** Exercice de chaque élément, pour corriger les étapes dès leur ajout. */
  private static readonly questions = new Map<
    string,
    { exercice: IExercice; questionIndex: number }
  >()

  private pendingLines: string[] | null = null
  private lineCounter = 0

  static create({
    id,
    numeroExercice,
    questionIndex,
    prefix = '',
    style = '',
    bareme = 'toutOuRien',
    produitSeulement = false,
    valeurDeDepart = '',
    enLigne = false,
    aide = questionIndex === 0,
  }: PossibleMultiLinesAnswerCreateOptions): string {
    if (!context.isHtml) return ''
    const tag = PossibleMultiLinesAnswerElement.elementTag
    const computedId = id ?? `${tag}Ex${numeroExercice}Q${questionIndex}`
    const dataKeyboard = buildDataKeyboardFromStyle(style).join(' ')
    const mathfield = MathaleaMathfieldElement.create({
      numeroExercice,
      questionIndex,
      dataKeyboard,
      className: style,
    })
    const attrs = this.buildAttributes({
      id: computedId,
      numeroExercice,
      questionIndex,
      prefix,
      dataKeyboard,
      className: style,
      bareme,
      produitSeulement,
      valeurDeDepart,
      enLigne,
    })
    const finalLine = `<div class="pmla-line" data-pmla-final>${labelHtml(prefix, `champTexteEx${numeroExercice}Q${questionIndex}`)}${mathfield}<span id="resultatCheckEx${numeroExercice}Q${questionIndex}"></span><button type="button" class="pmla-add" data-pmla-add title="Ajouter une ligne" aria-label="Ajouter une ligne">${ICONE_AJOUT}</button>${aide ? `<span class="pmla-aide" data-pmla-aide style="color: ${bleuMathalea}">${MESSAGE_AIDE}</span>` : ''}</div>`
    return `<${tag}${attrs}><div data-pmla-lines></div>${finalLine}</${tag}>`
  }

  static verifQuestion(
    exercice: IExercice,
    i: number,
  ): MathaleaMathfieldVerificationResult {
    const element = document.querySelector(
      `#${PossibleMultiLinesAnswerElement.elementTag}Ex${exercice.numeroExercice}Q${i}`,
    ) as PossibleMultiLinesAnswerElement | null
    if (element == null)
      return MathaleaMathfieldElement.verifQuestion(exercice, i)

    element.removeEmptyLines()
    let nbLignesFausses = 0
    for (const line of element.intermediateLines()) {
      if (element.corrigeLigne(line, exercice, i) === false) nbLignesFausses++
    }

    const lines = element.value
    if (lines.length > 1 && typeof exercice.answers === 'object') {
      exercice.answers[element.id] = JSON.stringify(lines)
    }
    const finalField = element.finalMathfield()
    const resultatFinal = verifySingleMathLiveField(
      exercice,
      i,
      finalField?.querySelector('math-field') ?? null,
    )
    element.interactivityOn = false
    if (nbLignesFausses === 0) return resultatFinal

    // Le smiley signifie « tout est réussi » : avec une étape fausse, un
    // résultat final juste reçoit une simple coche, comme les autres étapes.
    if (resultatFinal.isOk) {
      const span = element.querySelector(
        `#resultatCheckEx${exercice.numeroExercice}Q${i}`,
      )
      if (span != null) {
        span.textContent = '✓'
        span.className = 'pmla-ok'
      }
    }

    const unPointPourLeResultat =
      element.baremeEtapes && resultatFinal.isOk ? 1 : 0
    return {
      isOk: false,
      feedback: resultatFinal.feedback,
      score: {
        nbBonnesReponses: unPointPourLeResultat,
        nbReponses: resultatFinal.score.nbReponses,
      },
    }
  }

  static pointsMaxQuestion(exercice: IExercice, i: number): number {
    return MathaleaMathfieldElement.pointsMaxQuestion(exercice, i)
  }

  /** Seule la dernière ligne, c'est-à-dire la réponse finale, est affichée. */
  static formatStudentAnswer(rawAnswer: string): string {
    const lines = parseLines(rawAnswer)
    if (lines == null) return `$${rawAnswer}$`
    return `$${lines.at(-1) ?? ''}$`
  }

  static stripFromQuestionHtml(questionHtml: string): string {
    return MathaleaMathfieldElement.stripFromQuestionHtml(
      super.stripFromQuestionHtml(questionHtml),
    )
      .replace(/<button[^>]*data-pmla-add[^>]*>[\s\S]*?<\/button>/gi, '')
      .replace(/<span[^>]*data-pmla-aide[^>]*>[\s\S]*?<\/span>/gi, '')
  }

  static registerQuestion(
    id: string,
    exercice: IExercice,
    questionIndex: number,
  ): void {
    PossibleMultiLinesAnswerElement.questions.set(id, {
      exercice,
      questionIndex,
    })
  }

  connectedCallback() {
    super.connectedCallback()
  }

  render(): string | void {
    injectStyle()
    const addButton = this.querySelector<HTMLButtonElement>('[data-pmla-add]')
    if (addButton != null && addButton.dataset.listenerAdded !== 'true') {
      addButton.addEventListener('click', () => this.addLine())
      addButton.dataset.listenerAdded = 'true'
    }
    if (this.pendingLines != null) {
      const lines = this.pendingLines
      this.pendingLines = null
      this.applyLines(lines)
    }
    this.onInteractivityChanged(this.interactivityOn)
  }

  get value(): string[] {
    if (this.finalMathfield() == null) return this.pendingLines ?? []
    const lines = this.intermediateLines().map(
      (line) =>
        (
          line.querySelector(
            MathaleaMathfieldElement.elementTag,
          ) as MathaleaMathfieldElement | null
        )?.value ?? '',
    )
    lines.push(this.finalMathfield()?.value ?? '')
    return lines.length === 1 && lines[0] === '' ? [] : lines
  }

  set value(nextValue: string[] | string) {
    this.update(nextValue)
  }

  update(nextValue: string[] | string): void {
    const lines =
      typeof nextValue === 'string' ? parseLines(nextValue) : nextValue
    if (lines == null || !lines.every((line) => typeof line === 'string'))
      return
    if (this.finalMathfield() == null) {
      this.pendingLines = [...lines]
      return
    }
    this.applyLines(lines)
  }

  protected onInteractivityChanged(isOn: boolean): void {
    this.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
      button.hidden = !isOn
    })
    this.majAide()
    this.intermediateLines().forEach((line) => {
      const field = line.querySelector<MathaleaMathfieldElement>(
        MathaleaMathfieldElement.elementTag,
      )
      if (field != null) field.readOnly = !isOn || this.baremeEtapes
    })
    const finalField = this.finalMathfield()
    if (finalField != null) finalField.readOnly = !isOn
  }

  /**
   * Le message d'aide disparaît définitivement dès qu'une 2e ligne existe
   * (ajout du « + » ou saisie restaurée), et avec l'interactivité.
   */
  private majAide(): void {
    const aide = this.querySelector<HTMLElement>('[data-pmla-aide]')
    if (aide == null) return
    if (this.intermediateLines().length > 0) aide.dataset.dismissed = 'true'
    aide.hidden = !this.interactivityOn || aide.dataset.dismissed === 'true'
  }

  private get produitSeulement(): boolean {
    return this.getAttribute('produit-seulement') === 'true'
  }

  private get baremeEtapes(): boolean {
    return this.getAttribute('bareme') === 'etapes'
  }

  /**
   * Marque une ligne intermédiaire juste (coche) ou fausse (croix, ligne
   * barée). Retourne `null` pour une ligne vide ou impossible à corriger.
   */
  private corrigeLigne(
    line: HTMLElement,
    exercice: IExercice,
    questionIndex: number,
  ): boolean | null {
    const field = line.querySelector<MathaleaMathfieldElement>(
      MathaleaMathfieldElement.elementTag,
    )
    const span = line.querySelector('[data-pmla-result]')
    const saisie = field?.value ?? ''
    if (saisie === '' || span == null) return null
    const expectedValues = valeursAttendues(exercice, questionIndex)
    const estProduit =
      !this.produitSeulement || onlyProduct().run(saisie, '').passed
    const isOk =
      estProduit &&
      (expectedValues.length === 0 ||
        expectedValues.some(
          (expected) => fonctionComparaison(saisie, expected).isOk,
        ))
    span.textContent = isOk ? '✓' : '✗'
    span.className = isOk ? 'pmla-ok' : 'pmla-ko'
    this.affichePourquoi(line, isOk ? '' : this.motifLigneFausse(estProduit))
    line.classList.toggle('pmla-barre', !isOk)
    return isOk
  }

  /** Message à côté d'une ligne fausse. */
  private motifLigneFausse(estProduit: boolean): string {
    if (!estProduit) return "Ce n'est pas un produit."
    const depart = this.getAttribute('valeur-de-depart')
    const cible = depart ? `$${depart}$` : "l'expression de départ"
    return `${this.produitSeulement ? 'Ce produit' : 'Cette ligne'} n'est pas égal${this.produitSeulement ? '' : 'e'} à ${cible}.`
  }

  private affichePourquoi(line: HTMLElement, message: string): void {
    const zone = line.querySelector<HTMLElement>('[data-pmla-pourquoi]')
    if (zone == null) return
    zone.textContent = message
    if (message.includes('$')) renderKatex(zone)
  }

  /** En mode `etapes`, corrige et verrouille une ligne dès son ajout. */
  private corrigeLigneImmediatement(line: HTMLElement): void {
    if (!this.baremeEtapes) return
    const question = PossibleMultiLinesAnswerElement.questions.get(this.id)
    if (question != null) {
      this.corrigeLigne(line, question.exercice, question.questionIndex)
    }
    const field = line.querySelector<MathaleaMathfieldElement>(
      MathaleaMathfieldElement.elementTag,
    )
    if (field != null) field.readOnly = true
  }

  private intermediateLines(): HTMLElement[] {
    return Array.from(
      this.querySelectorAll<HTMLElement>('[data-pmla-lines] > .pmla-line'),
    )
  }

  private finalMathfield(): MathaleaMathfieldElement | null {
    return this.querySelector(
      `[data-pmla-final] ${MathaleaMathfieldElement.elementTag}`,
    )
  }

  /** Garder la dernière saisie non vide dans le champ de réponse finale. */
  private removeEmptyLines(): void {
    const finalField = this.finalMathfield()
    if (finalField == null) return
    const lines = this.intermediateLines().filter((line) => {
      const field = line.querySelector<MathaleaMathfieldElement>(
        MathaleaMathfieldElement.elementTag,
      )
      if ((field?.value ?? '').trim() !== '') return true
      line.remove()
      return false
    })
    if (finalField.value.trim() === '') {
      const lastLine = lines.at(-1)
      if (lastLine == null) return
      const field = lastLine.querySelector<MathaleaMathfieldElement>(
        MathaleaMathfieldElement.elementTag,
      )
      finalField.value = field?.value ?? ''
      lastLine.remove()
    }
  }

  private applyLines(lines: string[]): void {
    this.intermediateLines().forEach((line) => line.remove())
    lines.slice(0, -1).forEach((line) => this.appendIntermediateLine(line))
    const finalField = this.finalMathfield()
    if (finalField != null) finalField.value = lines.at(-1) ?? ''
  }

  /** Recopie la dernière ligne au-dessus et vide la ligne finale. */
  private addLine(): void {
    const finalField = this.finalMathfield()
    if (finalField == null || !this.interactivityOn) return
    if (finalField.value === '') return
    this.appendIntermediateLine(finalField.value)
    finalField.value = ''
    finalField.focus()
  }

  private appendIntermediateLine(value: string): void {
    const container = this.querySelector('[data-pmla-lines]')
    if (container == null) return
    this.lineCounter++
    const line = document.createElement('div')
    line.className = 'pmla-line'
    // En mode `etapes`, une étape fausse ne doit pas pouvoir être effacée.
    const boutonSupprimer = this.baremeEtapes
      ? ''
      : '<button type="button" class="pmla-remove" title="Supprimer cette ligne" aria-label="Supprimer cette ligne">×</button>'
    const fieldId = `champTexteEx${this.getAttribute('numero-exercice')}Q${this.getAttribute('question-index')}Etape${this.lineCounter}`
    line.innerHTML = `${labelHtml(this.getAttribute('prefix') ?? '', fieldId)}<span data-pmla-result></span><span class="pmla-pourquoi" data-pmla-pourquoi></span>${boutonSupprimer}`
    const field = document.createElement(
      MathaleaMathfieldElement.elementTag,
    ) as MathaleaMathfieldElement
    field.setAttribute('mathfield-id', fieldId)
    field.setAttribute(
      'data-keyboard',
      this.getAttribute('data-keyboard') ?? '',
    )
    field.setAttribute('class-name', this.getAttribute('class-name') ?? '')
    line.querySelector('label')?.after(field)
    line.querySelector('.pmla-remove')?.addEventListener('click', () => {
      line.remove()
      // Le rang « réponse 2 sur 3 » des lignes restantes a changé.
      nommeChampsAutourDe(this)
    })
    container.append(line)
    this.majAide()
    field.value = value
    const label = line.querySelector('label')
    if (label != null) renderKatex(label)
    this.corrigeLigneImmediatement(line)
  }
}

function labelHtml(prefix: string, fieldId: string): string {
  return prefix === '' ? '' : `<label for="${fieldId}">$${prefix}$</label>`
}

function parseLines(raw: string): string[] | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    if (
      !Array.isArray(parsed) ||
      !parsed.every((line) => typeof line === 'string')
    )
      return null
    return parsed
  } catch {
    return null
  }
}

/**
 * Valeurs, en LaTeX, auxquelles chaque ligne intermédiaire doit être égale.
 * Une liste vide signifie que les lignes intermédiaires ne sont pas contrôlées.
 */
function valeursAttendues(exercice: IExercice, i: number): string[] {
  const value = exercice.autoCorrection[i]?.valeur?.reponse?.value
  if (value == null) return []
  return (Array.isArray(value) ? value : [value]).flatMap((v: unknown) => {
    if (typeof v === 'number') return [String(v)]
    if (typeof v === 'string') return [v]
    if (v instanceof FractionEtendue) return [v.texFraction]
    if (v instanceof Decimal) return [v.toString()]
    return []
  })
}

function injectStyle(): void {
  if (document.getElementById(STYLE_ID) != null) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    possible-multi-lines-answer { display: block; }
    possible-multi-lines-answer[en-ligne="true"] { display: inline-flex; flex-direction: column; vertical-align: baseline; }
    possible-multi-lines-answer[en-ligne="true"] [data-pmla-lines] { display: contents; }
    possible-multi-lines-answer .pmla-line { display: flex; align-items: center; gap: .25rem; margin: .25rem 0; }
    possible-multi-lines-answer button { display: inline-flex; align-items: center; border: none; background: transparent; color: #9ca3af; cursor: pointer; font-size: 1.1rem; line-height: 1; padding: .1rem; border-radius: 999px; }
    possible-multi-lines-answer button:hover, possible-multi-lines-answer button:focus-visible { color: #4b5563; }
    possible-multi-lines-answer .pmla-aide { font-size: .85rem; margin-left: .25rem; }
    possible-multi-lines-answer .pmla-aide[hidden] { display: none; }
    possible-multi-lines-answer .pmla-ok, possible-multi-lines-answer .pmla-ko { font-size: .9rem; font-weight: 600; margin-left: .15rem; }
    possible-multi-lines-answer .pmla-pourquoi { color: #dc2626; font-size: .9rem; margin-left: .25rem; }
    possible-multi-lines-answer .pmla-ok { color: #16a34a; }
    possible-multi-lines-answer .pmla-ko { color: #dc2626; }
    possible-multi-lines-answer .pmla-barre math-field { background-image: linear-gradient(to top right, transparent calc(50% - .75px), #dc2626 calc(50% - .75px), #dc2626 calc(50% + .75px), transparent calc(50% + .75px)); }
  `
  document.head.append(style)
}

/**
 * Ajoute un champ de réponse MathLive auquel l'élève peut ajouter des lignes
 * intermédiaires (voir `PossibleMultiLinesAnswerElement`).
 *
 * À appeler après `handleAnswers()` : la réponse attendue est lue dans
 * `exercice.autoCorrection[questionIndex].valeur.reponse`, et le mode
 * `etapes` y remplace le barème (2 points).
 */
export function addPossibleMultiLinesAnswer(
  exercice: IExercice,
  questionIndex: number,
  options: PossibleMultiLinesAnswerOptions = {},
): string {
  if (!context.isHtml || !exercice.interactif) return ''
  const autoCorrection = (exercice.autoCorrection[questionIndex] ??= {})
  autoCorrection.formatInteractif = PossibleMultiLinesAnswerElement.elementTag
  if (options.bareme === 'etapes' && autoCorrection.valeur != null) {
    autoCorrection.valeur.bareme = baremeEtapes
  }
  const numeroExercice = exercice.numeroExercice ?? 0
  PossibleMultiLinesAnswerElement.registerQuestion(
    options.id ??
      `${PossibleMultiLinesAnswerElement.elementTag}Ex${numeroExercice}Q${questionIndex}`,
    exercice,
    questionIndex,
  )
  return (
    PossibleMultiLinesAnswerElement.create({
      ...options,
      numeroExercice,
      questionIndex,
    }) + ajouteFeedback(exercice, questionIndex)
  )
}

/**
 * Paramètre « Vérification » commun aux exercices qui proposent une réponse en
 * plusieurs étapes, à associer à `baremeMultiLignes()`.
 */
export const besoinFormulaireVerificationMultiLignes: [string, number, string] =
  ['Vérification (en interactif)', 2, '1 : À la fin\n2 : À chaque étape']

/** Barème correspondant à la valeur du paramètre « Vérification ». */
export function baremeMultiLignes(sup: unknown): BaremeMultiLignes {
  return Number(sup) === 1 ? 'toutOuRien' : 'etapes'
}

/** Commentaire pour l'enseignant décrivant la réponse en plusieurs étapes. */
export const commentaireMultiLignes = `En interactif, l'élève peut rédiger son calcul en plusieurs étapes : le bouton ⊕ ajoute une ligne. Chaque étape doit être égale à l'expression de départ, sous n'importe quelle forme.<br>
Le paramètre « Vérification » propose deux modes :<br>
- Vérification à la fin (1 point par question) : les étapes et le résultat sont corrigés à la validation. Le point n'est accordé que si le résultat et toutes les étapes sont justes. L'élève peut supprimer une ligne avant de valider.<br>
- Vérification à chaque étape (2 points par question) : chaque ligne est corrigée dès son ajout et ne peut plus être modifiée. Une étape fausse est barrée et l'élève la corrige sur la ligne suivante. Il obtient 2 points si le résultat et toutes les étapes sont justes, 1 point si le résultat est juste malgré une étape fausse, 0 point si le résultat est faux.`

registerMathaleaCustomElement(PossibleMultiLinesAnswerElement)
