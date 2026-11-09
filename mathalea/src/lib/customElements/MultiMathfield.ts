// Utilitaire pour styliser les items a), b), ... dans un texte brut
import renderMathInElement from 'katex/contrib/auto-render'
import katexCss from 'katex/dist/katex.min.css?inline'
import { MathfieldElement } from 'mathlive'
import type { ToucheDeQuestion } from '../../components/keyboard/lib/touchesPersonnalisees'
import { context } from '../../modules/context'
import { bleuMathalea, vertMathalea } from '../colors'
import { setStyles } from '../html/dom'
import {
  compteChampsDeReponse,
  pointsMaxDuBareme,
} from '../interactif/baremeExercice'
import {
  buildDataKeyboardFromStyle,
  KeyboardType,
} from '../interactif/claviers/keyboard'
import { fonctionComparaison } from '../interactif/comparisonFunctions'
import { toutAUnPoint } from '../interactif/fonctionsBaremes'
import { nommeChampsAutourDe } from '../interactif/nomAccessibleChamp'
import { setMathfield, setMathfieldListener } from '../interactif/setMathfield'
import { optionsKatex } from '../latex/Katex'
import { texteApresChamp } from '../outils/outilString'
import type { IExercice, ValeurNames } from '../types'
import './ListeDeroulanteElement'
import type ListeDeroulanteElement from './ListeDeroulanteElement'
import type { AllChoicesType, AllChoiceType } from './ListeDeroulanteElement'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

const rougeReponseFausse = '#dc2626'

/**
 * LaTeX d'une saisie dont les parties sont séparées par `;` (coordonnées) :
 * chacune est en vert si elle est juste, en rouge sinon. La saisie est colorée
 * d'un seul bloc si elle ne se découpe pas comme les résultats, ou si elle
 * contient `\left(…\right)`, qu'on ne peut pas couper en deux.
 */
export function colorizeAnswerParts(
  saisie: string,
  partsOk: boolean[],
): string {
  const color = (latex: string, isOk: boolean) =>
    `\\textcolor{${isOk ? vertMathalea : rougeReponseFausse}}{${latex}}`
  const parts = saisie.split(';')
  if (parts.length !== partsOk.length || /\\left|\\right/.test(saisie)) {
    return color(saisie, partsOk.every(Boolean))
  }
  return parts.map((part, k) => color(part, partsOk[k])).join(';')
}

function stylizeItems(text: string, output: 'html' | 'latex' = 'html'): string {
  // Un `<br>` (saut de ligne déjà converti) sépare les items comme un espace.
  const itemRegex = /(^|\s+|<br>\s*)([a-z]\))/g
  return text.replace(itemRegex, (_match, prefix, item, offset) => {
    const isAtLineStart =
      prefix.startsWith('<br>') || text.slice(0, offset).trim() === ''

    if (output === 'latex') {
      return (prefix || '') + `$\\textbf{${item}}$`
    }

    const styles = [`color:${bleuMathalea}`, 'font-weight:bold']
    if (isAtLineStart) {
      styles.push('display:inline-block', 'margin-left:0.75em')
    }

    return (
      (prefix || '') + `<span style="${styles.join('; ')}">` + item + '</span>'
    )
  })
}

/**
 * Un `\n` du `dataTemplate` est-il un simple artefact de mise en forme du
 * générateur (ex. `createList`, qui indente son HTML avec de vrais retours à
 * la ligne entre ses balises) plutôt qu'un saut de ligne voulu par l'auteur
 * de l'exercice ?
 *
 * Un `\n` compris entre deux balises (rien d'autre que du blanc avant lui
 * jusqu'à un `>`, et après lui jusqu'à un `<`) ne sépare aucun texte visible :
 * un navigateur l'ignorerait. Le convertir quand même en `<br>` ajoute un
 * saut de ligne parasite à chaque frontière de balise (ex. juste après
 * `<ol>` ou avant `</li>`), ce qui perturbe la conversion Typst de ces
 * listes (voir `latexToTypst.ts`, cas `ol`/`ul`/`li`).
 */
function isTemplateNewlineBetweenTags(
  template: string,
  start: number,
  end: number,
): boolean {
  const before = template.slice(0, start).replace(/\s+$/, '')
  const after = template.slice(end).replace(/^\s+/, '')
  return (
    (before === '' || before.endsWith('>')) &&
    (after === '' || after.startsWith('<'))
  )
}

function buildLatexEnumitemBlock(lines: string[]): string | null {
  const itemLineRegex = /^\s*([a-z])\)\s*(.*)$/
  const nonEmptyLines = lines.filter((line) => line.trim() !== '')

  if (
    nonEmptyLines.length === 0 ||
    !nonEmptyLines.every((line) => itemLineRegex.test(line))
  ) {
    return null
  }

  const items = nonEmptyLines.map((line) => {
    const match = line.match(itemLineRegex)
    return `\\item ${match?.[2] ?? ''}`
  })

  return [
    '\\begin{enumerate}[label=\\textbf{\\alph*)}]',
    ...items,
    '\\end{enumerate}',
  ].join('\n')
}

export type DataOptionsMultiMathfield = Partial<
  Record<
    ValeurNames,
    {
      legacyAnswerId?: string
      keyboard?: string
      /** Touches propres au champ, avec `clavierPersonnalisable` ou `clavierEntierementPersonnalisable`. */
      dataKeys?: ToucheDeQuestion
      /** Remplace « réponse 2 sur 4 » dans le nom accessible (voir `nomAccessibleChamp.ts`). */
      nomAccessible?: string
      placeholder?: string
      /** Largeur minimale (px) : un plancher, le champ s'élargit avec la saisie. */
      minWidth?: number
      /** Largeur maximale (px). Sans elle, le champ s'élargit jusqu'à la largeur de la ligne. */
      maxWidth?: number
      texteApres?: string
      ldots?: boolean
      /**
       * Si ce tableau est fourni, le champ n'est pas un MathLive mais une liste
       * déroulante proposant ces choix.
       */
      choices?: AllChoicesType
      /**
       * Si ce tableau est fourni, le champ n'est pas un MathLive mais un QCM
       * radio proposant ces choix.
       */
      qcm?: AllChoicesType
      /** Le premier choix de la liste est-il sélectionnable ? */
      choix0?: boolean
      vertical?: boolean
    }
  >
>

export type MultiMathfieldOptions = {
  dataTemplate: string
  dataOptions: DataOptionsMultiMathfield
  id?: string
}

export type MultiMathfieldCreateOptions = MultiMathfieldOptions & {
  numeroExercice?: number
  questionIndex?: number
  interactivityOn?: boolean
}

type MultiMathfieldAnswers = Record<string, string>
type MultiMathfieldOption = {
  /** Ancienne clé LMS de ce champ, avant son regroupement en multi-mathfield. */
  legacyAnswerId?: string
  keyboard?: string
  dataKeys?: ToucheDeQuestion
  nomAccessible?: string
  placeholder?: string
  minWidth?: number
  maxWidth?: number
  texteApres?: string
  ldots?: boolean
  choices?: AllChoicesType
  qcm?: AllChoicesType
  choix0?: boolean
  vertical?: boolean
}

function choiceValue(choice: AllChoiceType): string {
  return typeof choice === 'string' ? choice : choice.value
}

function choiceHtml(choice: AllChoiceType): string {
  if (typeof choice === 'string') return choice
  if (choice.label != null) return String(choice.label)
  if (choice.latex != null) return `$${choice.latex}$`
  if (choice.svg != null) return choice.svg
  if (choice.image != null) {
    return `<img src="${choice.image}" alt="${choice.value}" style="width:30px;height:30px;display:inline-block;vertical-align:middle;">`
  }
  return choice.value
}

function decodeHtmlAttribute(value: string): string {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&#34;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&')
}

const buildDataKeyboardString = (style = '') => {
  const blocks = buildDataKeyboardFromStyle(style)
  return blocks.join(' ')
}

function renderKatexInElement(element: HTMLElement): void {
  Object.assign(optionsKatex, {
    preProcess: (chaine: string) =>
      '{' + chaine.replaceAll(String.fromCharCode(160), '\\,') + '}',
  })
  renderMathInElement(
    element,
    optionsKatex as Parameters<typeof renderMathInElement>[1],
  )
}
/**
 * @author Jean-Claude Lhote + Rémi Angot
 */
export class MultiMathfieldElement extends MathaleaCustomElement {
  private static scoreFromResult(result: { isOk: boolean }): number {
    const score = (result as { score?: unknown }).score
    return typeof score === 'number' ? score : result.isOk ? 1 : 0
  }

  /**
   * La valeur stockée est de la forme `%{champ:"valeur"} %{champ2:"valeur2"}` :
   * on remplace chaque champ par sa valeur entourée de dollars.
   */
  static formatStudentAnswer(rawAnswer: string): string {
    if (typeof rawAnswer !== 'string') return ''
    const fromJson = (() => {
      try {
        const parsed = JSON.parse(rawAnswer) as unknown
        if (
          parsed == null ||
          typeof parsed !== 'object' ||
          Array.isArray(parsed)
        ) {
          return null
        }
        const values = Object.values(parsed as Record<string, unknown>)
          .map((value) => String(value).trim())
          .filter((value) => value.length > 0)
        return values.length === 0
          ? ''
          : values
              .map((value) => {
                let v = value
                if (!v.startsWith('$')) v = '$' + v
                if (!v.endsWith('$')) v += '$'
                return v
              })
              .join(' ; ')
      } catch {
        return null
      }
    })()
    if (fromJson != null) return fromJson

    const cleaned = rawAnswer.replace(
      /%\{([a-zA-Z0-9_]+):"([^"]*)"\}/g,
      (_match, _champ, valeur: string) => {
        // Ajoute des dollars autour de la valeur, en évitant les doubles dollars
        let v = valeur.trim()
        if (!v.startsWith('$')) v = '$' + v
        if (!v.endsWith('$')) v += '$'
        return v
      },
    )
    // Nettoie les doubles dollars successifs
    return cleaned.replace(/\${2,}/g, '')
  }

  static readonly elementTag = 'multi-mathfield'

  private readonly contentHost: HTMLSpanElement

  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: 'open' })

    // Les styles KaTeX doivent exister dans le shadowRoot pour un rendu complet.
    const style = document.createElement('style')
    style.textContent = `
      ${katexCss}
      /* Le shadowRoot ne reçoit pas la surcharge globale de app.css : sans elle,
         KaTeX rendrait ici en 1,21em et la police jurerait avec le reste de la question. */
      .katex {
        font-size: 1em;
      }
      math-field::part(menu-toggle) {
        display: none;
      }
      math-field::part(virtual-keyboard-toggle) {
        display: none;
      }
      math-field {
        color: var(--color-coopmaths-corpus, #1f2429);
        --caret-color: hsl(212, 40%, 49%);
        --selection-color: #000;
        --selection-background-color: hsl(212, 70%, 85%);
        --contains-highlight-color: hsl(212, 40%, 49%);
        --contains-highlight-background-color: hsl(212, 40%, 95%);
        --highlight-text: transparent;
        /* Nom utilisé par MathLive quand l'appareil est en mode sombre : les mots fixes d'un champ à trous (\text{}) ne sont pas surlignés, en clair comme en sombre */
        --text-highlight-background-color: transparent;
        line-height: 1;
        border-radius: 4px;
        border: none;
        background-color: transparent;
        font-size: 1em;
        margin-left: 5px;
        display: inline-block;
        vertical-align: middle;
        min-width: 50px;
      }
      :host-context(.dark) math-field {
        color: var(--color-coopmathsdark-corpus, #b0b0b0);
        --caret-color: hsl(212, 65%, 55%);
        --selection-color: #fff;
        --selection-background-color: hsl(212, 65%, 55%);
        --contains-highlight-color: hsl(212, 85%, 75%);
        --contains-highlight-background-color: hsl(212, 30%, 40%);
        --highlight-text: transparent;
        --text-highlight-background-color: transparent;
      }
      math-field::part(container) {
        border-radius: 4px;
        border: 1px solid rgba(0, 0, 0, 0.3);
        min-width: 50px;
        display: inline-block;
        justify-content: center;
      }
      :host-context(.dark) math-field::part(container) {
        border: 1px solid rgba(213, 206, 206, 0.917);
      }
      math-field::part(content) {
        padding: 0;
        justify-content: center;
      }
      math-field:focus-within {
        outline: solid;
        outline-width: 2px;
        outline-color: var(--color-coopmaths-struct, #216d9a);
        border: none;
      }
      math-field:focus-within::part(container) {
        outline: none;
        border: none;
      }
      ol.alpha {
        list-style-type: lower-alpha;
        list-style-position: outside;
        margin-left: 1.5rem;
        margin-top: 0;
        margin-bottom: 0;
        padding-left: 0;
      }
      ol.alpha > li {
        margin-top: 0.5em;
      }
      ol.alpha > li::marker {
        content: counter(list-item, lower-alpha) ') ';
        color: var(--color-coopmaths-struct, #216d9a);
        font-weight: bold;
      }
      /* QCU : le shadowRoot ne reçoit ni Tailwind ni la surcharge de app.css.
         On reproduit ici le style des autres QCM du site (ex. 1A-E01-1) :
         bouton radio « coopmaths-action », espacement et alignement. */
      [data-type='qcm'] {
        display: inline-flex;
        gap: 1.5rem;
        align-items: center;
        vertical-align: middle;
      }
      [data-type='qcm'][data-vertical='true'] {
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
      }
      [data-type='qcm'] > span {
        display: inline-flex;
        gap: 0.5rem;
        align-items: center;
      }
      [data-type='qcm'] input[type='radio'] {
        appearance: none;
        -webkit-appearance: none;
        box-sizing: border-box;
        height: 1rem;
        width: 1rem;
        margin: 0;
        padding: 0;
        border: 1px solid var(--color-coopmaths-action, #f15929);
        border-radius: 50%;
        background-color: transparent;
        vertical-align: middle;
        cursor: pointer;
      }
      :host-context(.dark) [data-type='qcm'] input[type='radio'] {
        border-color: var(--color-coopmathsdark-action, #ffb86c);
      }
      [data-type='qcm'] input[type='radio']:checked {
        border-color: var(--color-coopmaths-action, #f15929);
        background-color: var(--color-coopmaths-action, #f15929);
        background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e");
        background-size: 100% 100%;
        background-position: center;
        background-repeat: no-repeat;
      }
      [data-type='qcm'] input[type='radio']:disabled {
        opacity: 0.3;
        cursor: default;
      }
      [data-type='qcm'] label {
        vertical-align: middle;
        cursor: pointer;
      }
      [data-type='qcm'] input[type='radio']:disabled + label {
        cursor: default;
      }
    `
    shadowRoot.appendChild(style)

    this.contentHost = document.createElement('span')
    this.contentHost.style.display = 'inline-block'
    this.contentHost.style.maxWidth = '100%'
    shadowRoot.appendChild(this.contentHost)
  }

  /**
   * Extrait les réponses des champs depuis un filledTemplate de la forme
   * $2\times($%{champ1:"7"}$+$%{champ2:"10"}$)=%{champ3:"34"}
   * et retourne un objet { champ1: "7", champ2: "10", champ3: "34" }
   */
  static answersFromFilledTemplate(
    filledTemplate: string,
  ): Record<string, string> {
    const result: Record<string, string> = {}
    if (typeof filledTemplate !== 'string') return result
    // Parcourt le template rempli et récupère les valeurs injectées
    // Exemple: %{champ1:"7"} ou %{champ2}
    const regex = /%\{([a-zA-Z0-9_]+)(?::"([^"]*)")?\}/g
    let match
    while ((match = regex.exec(filledTemplate)) !== null) {
      const champ = match[1]
      const valeur = match[2] ?? ''
      result[champ] = valeur
    }
    return result
  }

  static create({
    id,
    numeroExercice,
    questionIndex,
    dataTemplate,
    dataOptions,
    interactivityOn = true,
  }: MultiMathfieldCreateOptions): string {
    if (!context.isHtml || context.isTypst || !interactivityOn) {
      const output = context.isHtml ? 'html' : 'latex'
      const rendered = this.renderStaticTemplate(
        dataTemplate,
        dataOptions,
        output,
        (fieldOptions) => {
          if (!fieldOptions.ldots) return ''
          // En Typst comme en LaTeX, on veut un vrai espace de réponse : les
          // pointillés texte ' ... ' de la sortie HTML sont trop courts.
          if (!context.isHtml || context.isTypst) return '$\\ldots\\ldots$'
          return ' ... '
        },
        `labelEx${numeroExercice ?? 0}Q${questionIndex ?? 0}R`,
      )

      if (!context.isHtml && !rendered.includes('\\begin{qcmprop}')) {
        const enumitemBlock = buildLatexEnumitemBlock(rendered.split('\n'))
        if (enumitemBlock) {
          return enumitemBlock
        }
      }

      return rendered
    }

    const computedId =
      id ??
      `${MultiMathfieldElement.elementTag}Ex${numeroExercice ?? 0}Q${questionIndex ?? 0}`
    const dataOptionsStr = encodeURIComponent(JSON.stringify(dataOptions))
      .replace(/'/g, '%27')
      .replace(/"/g, '%22')

    const legacyAnswerIds = Object.fromEntries(
      Object.entries(dataOptions)
        .filter(([, options]) => options.legacyAnswerId != null)
        .map(([name, options]) => [options.legacyAnswerId!, name]),
    )
    const legacyAttribute =
      Object.keys(legacyAnswerIds).length > 0
        ? ` data-legacy-answer-ids="${encodeURIComponent(JSON.stringify(legacyAnswerIds))}"`
        : ''
    const html = `<multi-mathfield${legacyAttribute} id="${computedId}" data-template="${dataTemplate.replace(/"/g, '&quot;')}" data-options="${dataOptionsStr}"></multi-mathfield>`
    return `${html}<div class="ml-2 py-2 italic text-coopmaths-warn-darkest dark:text-coopmathsdark-warn-darkest" id="feedbackEx${numeroExercice ?? 0}Q${questionIndex ?? 0}" style="display: none;"></div>`
  }

  private static staticQcm(
    choices: AllChoicesType,
    vertical = false,
    output: 'html' | 'latex' = 'html',
    labelPrefix = 'labelEx0Q0R',
    firstLabelIndex = 0,
  ): string {
    const filteredChoices = choices.filter(
      (choice) => choiceValue(choice) !== '',
    )
    if (output === 'latex') {
      const finalCols = vertical ? 1 : Math.max(filteredChoices.length, 1)
      const contenuTasks = filteredChoices
        .map((choice) => `  \\task ${choiceHtml(choice)}\n`)
        .join('')
      return `\\begin{qcmprop}[cols=${finalCols}, case]\n${contenuTasks}\\end{qcmprop}`
    }

    const items = filteredChoices.map(
      (choice, index) =>
        `<span class="ex0" style="display:inline-flex;align-items:center;gap:0.5rem"><input type="radio" disabled style="appearance:none;-webkit-appearance:none;box-sizing:border-box;opacity:1;height:1rem;width:1rem;margin:0;padding:0;border:1px solid var(--color-coopmaths-action, #f15929);border-radius:50%;background:transparent;vertical-align:middle" class="disabled:cursor-default"><label id="${labelPrefix}${firstLabelIndex + index}">${choiceHtml(choice)}</label></span>`,
    )
    return `<span class="mx-2" style="display:inline-flex;${vertical ? 'flex-direction:column;align-items:flex-start;gap:0.5rem' : 'align-items:center;gap:1.5rem'}">${items.join('')}</span>`
  }

  static renderStaticTemplate(
    dataTemplate: string,
    dataOptions: DataOptionsMultiMathfield,
    output: 'html' | 'latex' = 'html',
    freeFieldPlaceholder: (fieldOptions: MultiMathfieldOption) => string = () =>
      ' ... ',
    qcmLabelPrefix = 'labelEx0Q0R',
  ): string {
    const template = dataTemplate.replaceAll('<br>', '\n')
    const regex = /(\$[^$]+\$|%\{[^}]+\}|\n)/g
    let lastIndex = 0
    let result = ''
    let match
    let nextQcmLabelIndex = 0

    while ((match = regex.exec(template)) !== null) {
      if (match.index > lastIndex) {
        result += stylizeItems(template.slice(lastIndex, match.index), output)
      }
      const token = match[0]
      if (token === '\n') {
        if (output !== 'html') {
          result += '\n'
        } else if (
          !isTemplateNewlineBetweenTags(template, match.index, regex.lastIndex)
        ) {
          result += '<br>'
        }
      } else if (token.startsWith('%{')) {
        const name = token.slice(2, -1) as ValeurNames
        const fieldOptions = dataOptions[name] ?? {}
        let hasVisibleField = true
        if (
          Array.isArray(fieldOptions.choices) &&
          fieldOptions.choices.length > 0
        ) {
          result += this.staticQcm(
            fieldOptions.choices,
            fieldOptions.vertical ?? true,
            output,
            qcmLabelPrefix,
            nextQcmLabelIndex,
          )
          nextQcmLabelIndex += fieldOptions.choices.filter(
            (choice) => choiceValue(choice) !== '',
          ).length
        } else if (
          Array.isArray(fieldOptions.qcm) &&
          fieldOptions.qcm.length > 0
        ) {
          result += this.staticQcm(
            fieldOptions.qcm,
            fieldOptions.vertical ?? false,
            output,
            qcmLabelPrefix,
            nextQcmLabelIndex,
          )
          nextQcmLabelIndex += fieldOptions.qcm.filter(
            (choice) => choiceValue(choice) !== '',
          ).length
        } else {
          const placeholder = freeFieldPlaceholder(fieldOptions)
          result += placeholder
          hasVisibleField = placeholder !== ''
        }
        // Sans champ visible (ni choix, ni QCM, ni pointillés), on n'ajoute pas
        // le texte d'unité : sinon il « pendouille » après la question en mode
        // non interactif (ex. « Quel sera le capital au bout de 3 ans ? euros »).
        if (hasVisibleField && fieldOptions.texteApres) {
          result += texteApresChamp(fieldOptions.texteApres)
        }
      } else {
        result += token
      }
      lastIndex = regex.lastIndex
    }

    if (lastIndex < template.length) {
      result += stylizeItems(template.slice(lastIndex), output)
    }
    return result
  }

  static stripFromQuestionHtml(questionHtml: string): string {
    return questionHtml.replace(
      /<multi-mathfield\b([^>]*)>(?:<\/multi-mathfield>)?/g,
      (_match, rawAttributes: string) => {
        const attributes = String(rawAttributes)
        const templateMatch = attributes.match(/\bdata-template="([^"]*)"/)
        const optionsMatch = attributes.match(/\bdata-options="([^"]*)"/)
        const dataTemplate = decodeHtmlAttribute(templateMatch?.[1] ?? '')
        let dataOptions: DataOptionsMultiMathfield = {}
        if (optionsMatch?.[1] != null) {
          try {
            dataOptions = JSON.parse(
              decodeURIComponent(decodeHtmlAttribute(optionsMatch[1])),
            )
          } catch (error) {
            window.notify('Erreur lors du rendu statique du multi-mathfield.', {
              error,
            })
          }
        }
        return this.renderStaticTemplate(dataTemplate, dataOptions)
      },
    )
  }

  connectedCallback() {
    this.hydrateCommonAttributes()
    this.render()
  }

  protected onInteractivityChanged(isOn: boolean): void {
    if (!this.isConnected) return
    if (!isOn && this.figerLesChamps()) return
    this.render()
  }

  /**
   * Fige les champs déjà affichés sans les redessiner : le rendu statique
   * effacerait les réponses de l'élève et les 😎/☹️ de chaque champ (le couteau
   * suisse coupe l'interactivité de ses enfants après la vérification).
   * Renvoie `false` s'il n'y a aucun champ à figer.
   */
  private figerLesChamps(): boolean {
    const champs =
      this.contentHost.querySelectorAll<MathfieldElement>('math-field')
    const listes =
      this.contentHost.querySelectorAll<ListeDeroulanteElement>(
        'liste-deroulante',
      )
    const radios = this.contentHost.querySelectorAll<HTMLInputElement>(
      '[data-type="qcm"] input[type="radio"]',
    )
    if (champs.length + listes.length + radios.length === 0) return false
    champs.forEach((champ) => {
      champ.readOnly = true
    })
    listes.forEach((liste) => {
      liste.interactivityOn = false
    })
    radios.forEach((radio) => {
      radio.disabled = true
    })
    return true
  }

  /**
   * Construit une liste déroulante imbriquée pour un champ défini avec `choices`.
   * L'id est préfixé par le tag pour que le span de résultat créé par
   * `ListeDeroulanteElement` ne rentre pas en collision avec l'élément lui-même.
   */
  private createListeDeroulante(
    name: string,
    fieldOptions: MultiMathfieldOption,
  ): ListeDeroulanteElement {
    const liste = document.createElement(
      'liste-deroulante',
    ) as ListeDeroulanteElement
    liste.id = `liste-deroulante-${this.id || 'multi-mathfield'}-${name}`
    liste.setAttribute('data-name', name)
    liste.setAttribute('class', 'mx-2 listeDeroulante')
    liste.setAttribute(
      'choices',
      encodeURIComponent(JSON.stringify(fieldOptions.choices ?? [])),
    )
    liste.setAttribute('choix0', fieldOptions.choix0 ? 'true' : 'false')
    liste.setAttribute(
      'interactivity-on',
      this.interactivityOn ? 'true' : 'false',
    )
    return liste
  }

  private createQcm(
    name: string,
    fieldOptions: MultiMathfieldOption,
  ): HTMLSpanElement {
    const qcm = document.createElement('span')
    qcm.setAttribute('data-name', name)
    qcm.setAttribute('data-type', 'qcm')
    qcm.className = 'mx-2 inline-block'
    const choices = fieldOptions.qcm ?? []
    const inputName = `qcm-${this.id || 'multi-mathfield'}-${name}`
    const vertical = fieldOptions.vertical ?? false
    qcm.setAttribute('data-vertical', String(vertical))

    choices.forEach((choice, index) => {
      const value = choiceValue(choice)
      const id = `${inputName}-${index}`
      const item = document.createElement('span')

      const input = document.createElement('input')
      input.type = 'radio'
      input.id = id
      input.name = inputName
      input.value = value
      input.disabled = !this.interactivityOn
      input.className = 'align-middle'
      item.appendChild(input)

      const label = document.createElement('label')
      label.htmlFor = id
      label.innerHTML = choiceHtml(choice)
      item.appendChild(label)
      qcm.appendChild(item)
    })

    return qcm
  }

  render() {
    const template = this.getAttribute('data-template') || ''
    const rawOptionsAttr = this.getAttribute('data-options') || '%7B%7D'
    let options: Record<string, MultiMathfieldOption>
    try {
      options = JSON.parse(decodeURIComponent(rawOptionsAttr))
    } catch (e) {
      console.error(
        '[MultiMathfield] Erreur JSON.parse sur data-options:',
        decodeURIComponent(rawOptionsAttr),
        e,
      )
      throw e
    }
    // Un gabarit sur plusieurs lignes ne doit pas former un inline-block : il
    // serait aligné sur sa dernière ligne (ligne de base du bloc), donc décalé
    // par rapport au numéro et à l'énoncé, et ses lignes seraient décalées
    // à droite de l'énoncé. En `inline`, les <br> coupent la ligne de la
    // question et chaque ligne repart de la marge gauche.
    const isMultiline = /<br\s*\/?>|\n/i.test(template)
    this.contentHost.style.display = isMultiline ? 'inline' : 'inline-block'

    if (!this.interactivityOn) {
      this.contentHost.innerHTML = MultiMathfieldElement.renderStaticTemplate(
        template,
        options,
        'html',
        (fieldOptions) => {
          if (!fieldOptions.ldots) return ''
          return ' ... '
        },
        `labelEx${this.getAttribute('numero-exercice') ?? 0}Q${this.getAttribute('question-index') ?? 0}R`,
      )
      return
    }

    // Construire d'abord tout le HTML : découper chaque fragment autour des
    // champs détruit les <ol>/<li> et recommence la numérotation à chaque item.
    const htmlTemplate = template.replace(/\n/g, (_newline, index: number) =>
      isTemplateNewlineBetweenTags(template, index, index + 1) ? '' : '<br>',
    )
    const tokens: string[] = []
    const tokenRegex = /(\$[^$]+\$|%\{[^}]+\})/g
    let lastIndex = 0
    let html = ''
    for (const match of htmlTemplate.matchAll(tokenRegex)) {
      const index = match.index ?? 0
      html += stylizeItems(htmlTemplate.slice(lastIndex, index))
      tokens.push(match[0])
      html += `<span data-multi-token="${tokens.length - 1}"></span>`
      lastIndex = index + match[0].length
    }
    html += stylizeItems(htmlTemplate.slice(lastIndex))
    this.contentHost.innerHTML = html

    for (const placeholder of Array.from(
      this.contentHost.querySelectorAll<HTMLElement>('[data-multi-token]'),
    )) {
      const token = tokens[Number(placeholder.dataset.multiToken)]
      if (token.startsWith('$')) {
        const span = document.createElement('span')
        span.textContent = token
        placeholder.replaceWith(span)
        continue
      }

      const name = token.slice(2, -1)
      const fieldOptions = options[name] ?? {}
      const fieldContent = document.createDocumentFragment()
      if (
        Array.isArray(fieldOptions.choices) &&
        fieldOptions.choices.length > 0
      ) {
        fieldContent.appendChild(this.createListeDeroulante(name, fieldOptions))
      } else if (
        Array.isArray(fieldOptions.qcm) &&
        fieldOptions.qcm.length > 0
      ) {
        fieldContent.appendChild(this.createQcm(name, fieldOptions))
      } else {
        const wrapper = document.createElement('div')
        wrapper.style.cssText =
          'display:inline-block;max-width:100%;margin:0 2px;padding:0;vertical-align:middle'
        const mathfield = new MathfieldElement()
        mathfield.classList.add('ml-1')
        // Le champ s'élargit avec son contenu, dans la limite de la ligne
        // (un plafond fixe rognait les réponses longues, ex. un enchaînement de calculs).
        mathfield.style.maxWidth =
          fieldOptions.maxWidth == null ? '100%' : `${fieldOptions.maxWidth}px`
        mathfield.style.minWidth = `${fieldOptions.minWidth ?? 30}px`
        mathfield.setAttribute(
          'data-keyboard',
          buildDataKeyboardString(fieldOptions.keyboard ?? ''),
        )
        if (fieldOptions.dataKeys != null && fieldOptions.dataKeys.length > 0) {
          mathfield.setAttribute(
            'data-keys',
            JSON.stringify(fieldOptions.dataKeys),
          )
        }
        if (fieldOptions.placeholder) {
          mathfield.setAttribute('placeholder', fieldOptions.placeholder)
        }
        if (fieldOptions.nomAccessible) {
          mathfield.dataset.nomAccessible = fieldOptions.nomAccessible
        }
        mathfield.id = (this.id || 'multi-mathfield') + '-' + name
        mathfield.setAttribute('data-name', name)
        mathfield.setAttribute('virtual-keyboard-mode', 'manual')
        mathfield.style.border = 'none'
        mathfield.addEventListener('keydown', (event) => {
          if (event.key !== 'Tab') return
          event.preventDefault()
          const allMathfields = [
            ...document.querySelectorAll<MathfieldElement>('math-field'),
            ...Array.from(document.querySelectorAll('multi-mathfield')).flatMap(
              (element) =>
                Array.from(
                  element.shadowRoot?.querySelectorAll<MathfieldElement>(
                    'math-field',
                  ) ?? [],
                ),
            ),
          ].filter((field) => !field.readOnly)
          const index = allMathfields.indexOf(event.target as MathfieldElement)
          const nextIndex = event.shiftKey
            ? (index - 1 + allMathfields.length) % allMathfields.length
            : (index + 1) % allMathfields.length
          allMathfields[nextIndex]?.focus()
        })
        wrapper.appendChild(mathfield)
        fieldContent.appendChild(wrapper)
        if (mathfield.isConnected) {
          setMathfield(mathfield)
        } else {
          mathfield.addEventListener('mount', setMathfieldListener, {
            once: true,
          })
        }
      }
      if (fieldOptions.texteApres) {
        const texteApres = document.createElement('span')
        texteApres.innerHTML = texteApresChamp(fieldOptions.texteApres)
        fieldContent.appendChild(texteApres)
      }
      const checkSpan = document.createElement('span')
      checkSpan.id = 'check-' + (this.id || 'multi-mathfield') + '-' + name
      // Les classes Tailwind (mx-2) ne s'appliquent pas dans le shadow DOM :
      // on espace le smiley du dernier choix du QCM.
      if (Array.isArray(fieldOptions.qcm) && fieldOptions.qcm.length > 0) {
        checkSpan.style.marginLeft = '0.5em'
      }
      fieldContent.appendChild(checkSpan)
      placeholder.replaceWith(fieldContent)
    }

    try {
      renderKatexInElement(this.contentHost)
    } catch (error) {
      window.notify('Erreur lors du rendu KaTeX du multi-mathfield.', {
        error,
      })
    }
    this.contentHost.oninput = () => this.updateConditionalSections()
    this.updateConditionalSections()
    nommeChampsAutourDe(this)
  }

  /** Affiche les sections liées à la valeur d'un autre champ du gabarit. */
  private updateConditionalSections(): void {
    const answers = this.getValue()
    this.contentHost
      .querySelectorAll<HTMLElement>('[data-show-when]')
      .forEach((section) => {
        const [field, expected] = (section.dataset.showWhen ?? '').split(':')
        section.hidden = answers[field] !== expected
      })
  }

  getValue() {
    const result: MultiMathfieldAnswers = {}
    if (this.shadowRoot) {
      this.shadowRoot.querySelectorAll('math-field').forEach((el) => {
        const mf = el as MathfieldElement
        const name = mf.getAttribute('data-name')
        if (name) {
          // Après correction, `mf.value` contient les couleurs : on garde la saisie.
          result[name] = mf.dataset.saisie ?? mf.value
        }
      })
      this.shadowRoot.querySelectorAll('liste-deroulante').forEach((el) => {
        const liste = el as ListeDeroulanteElement
        const name = liste.getAttribute('data-name')
        if (name) {
          result[name] = liste.value ?? ''
        }
      })
      this.shadowRoot.querySelectorAll('[data-type="qcm"]').forEach((el) => {
        const qcm = el as HTMLElement
        const name = qcm.getAttribute('data-name')
        const checked = qcm.querySelector<HTMLInputElement>(
          'input[type="radio"]:checked',
        )
        if (name) {
          result[name] = checked?.value ?? ''
        }
      })
    }
    return result
  }

  get value(): string {
    return JSON.stringify(this.getValue())
  }

  update(answers: MultiMathfieldAnswers | string) {
    let parsedAnswers: MultiMathfieldAnswers
    if (typeof answers === 'string') {
      // Format attendu: filledDataTemplate fabriqué par MultiMathfieldElement.verifQuestion
      parsedAnswers = MultiMathfieldElement.answersFromFilledTemplate(answers)

      // Compatibilité avec un éventuel ancien format JSON.stringify
      if (Object.keys(parsedAnswers).length === 0) {
        try {
          parsedAnswers = JSON.parse(answers)
        } catch {
          return
        }
      }
    } else {
      parsedAnswers = answers
    }
    this.setAnswers(parsedAnswers)
  }

  set value(answers: MultiMathfieldAnswers | string) {
    this.update(answers)
  }

  getSpansResultats() {
    const result: Record<string, HTMLElement> = {}
    if (this.shadowRoot) {
      this.shadowRoot.querySelectorAll('span[id^="check-"]').forEach((el) => {
        const id = el.id
        const name = id.split('-')[2]
        result[name] = el as HTMLElement
      })
    }
    return result
  }

  setAnswers(answers: MultiMathfieldAnswers) {
    if (this.shadowRoot) {
      this.shadowRoot.querySelectorAll('math-field').forEach((el) => {
        const mf = el as MathfieldElement
        const name = mf.getAttribute('data-name')
        if (name && answers[name] !== undefined) {
          delete mf.dataset.saisie
          mf.value = answers[name]
        }
      })
      this.shadowRoot.querySelectorAll('liste-deroulante').forEach((el) => {
        const liste = el as ListeDeroulanteElement
        const name = liste.getAttribute('data-name')
        if (name && answers[name] !== undefined) {
          liste.value = answers[name]
        }
      })
      this.shadowRoot.querySelectorAll('[data-type="qcm"]').forEach((el) => {
        const qcm = el as HTMLElement
        const name = qcm.getAttribute('data-name')
        if (name == null || answers[name] === undefined) return
        qcm
          .querySelectorAll<HTMLInputElement>('input[type="radio"]')
          .forEach((input) => {
            input.checked = input.value === answers[name]
          })
      })
    }
    this.updateConditionalSections()
  }

  static verifQuestion(
    exercice: IExercice,
    i: number,
  ): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    if (exercice.autoCorrection[i]?.valeur == null) {
      throw Error(
        `MultiMathfieldElement.verifQuestion appelé sur une question sans réponse: ${JSON.stringify(
          {
            exercice,
            question: i,
            autoCorrection: exercice.autoCorrection[i],
          },
        )}`,
      )
    }

    const multiId = `${this.elementTag}Ex${exercice.numeroExercice}Q${i}`
    const legacyMultiId = `multiMathfieldEx${exercice.numeroExercice}Q${i}`
    const multi = (document.getElementById(multiId) ??
      document.getElementById(legacyMultiId)) as HTMLElement | null
    const fieldIdPrefix = multi?.id ?? multiId
    const reponses = exercice.autoCorrection[i].valeur

    if (reponses == null) {
      window.notify(
        `MultiMathfieldElement.verifQuestion: reponses est null pour la question ${i} de l'exercice ${exercice.id}`,
        { exercice, i },
      )
      return {
        isOk: false,
        feedback: 'erreur dans le programme',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }

    if (typeof reponses !== 'object') {
      window.notify(
        `MultiMathfieldElement.verifQuestion: reponses n'est pas un objet pour la question ${i} de l'exercice ${exercice.id}`,
        { exercice, i, reponses },
      )
      return {
        isOk: false,
        feedback: 'erreur dans le programme',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }

    const bareme: (arg: number[]) => [number, number] =
      reponses.bareme ?? toutAUnPoint
    const feedbackFunction = reponses.feedback ?? undefined
    const variables = Object.entries(reponses).filter(
      ([key]) => key !== 'bareme' && key !== 'feedback',
    )
    const points = []
    const saisies: Record<string, string> = {}
    let compteurSaisiesVides = 0
    let compteurBonnesReponses = 0
    let noFeedback = false
    let feedback = ''
    const feedbackMessages = new Set<string>()

    for (const [field, reponse] of variables) {
      const conditionalField = multi?.shadowRoot?.querySelector(
        `[data-name="${field}"]`,
      )
      if (conditionalField?.closest('[data-show-when][hidden]') != null) {
        // Une branche inactive ne demande aucune réponse et ne bloque pas le barème.
        points.push(1)
        compteurBonnesReponses++
        continue
      }
      const options = reponse.options
      noFeedback = noFeedback || Boolean(options?.noFeedback)
      const compareFunction = reponse.compare ?? fonctionComparaison

      const liste = multi?.shadowRoot?.querySelector(
        `liste-deroulante[data-name="${field}"]`,
      ) as ListeDeroulanteElement | null
      if (liste != null) {
        // Champ « liste déroulante » : la comparaison est une simple égalité
        // avec la (ou l'une des) valeur(s) attendue(s).
        liste.interactivityOn = false
        const saisie = liste.value ?? ''
        const eltFeedbackListe = multi?.shadowRoot?.getElementById(
          `check-${fieldIdPrefix}-${field}`,
        ) as HTMLSpanElement | null
        if (saisie === '') {
          compteurSaisiesVides++
          points.push(0)
          continue
        }
        saisies[field] = saisie
        const attendues: unknown[] = Array.isArray(reponse.value)
          ? reponse.value
          : [reponse.value]
        const isOk = attendues.some((valeur) => String(valeur) === saisie)
        points.push(isOk ? 1 : 0)
        if (isOk) compteurBonnesReponses++
        if (eltFeedbackListe) {
          setStyles(eltFeedbackListe, 'marginBottom: 20px')
          eltFeedbackListe.innerHTML = isOk ? '😎' : '☹️'
        }
        continue
      }

      const qcm = multi?.shadowRoot?.querySelector(
        `[data-type="qcm"][data-name="${field}"]`,
      ) as HTMLElement | null
      if (qcm != null) {
        qcm
          .querySelectorAll<HTMLInputElement>('input[type="radio"]')
          .forEach((input) => {
            input.disabled = true
          })
        const saisie =
          qcm.querySelector<HTMLInputElement>('input[type="radio"]:checked')
            ?.value ?? ''
        const eltFeedbackQcm = multi?.shadowRoot?.getElementById(
          `check-${fieldIdPrefix}-${field}`,
        ) as HTMLSpanElement | null
        if (saisie === '') {
          compteurSaisiesVides++
          points.push(0)
          continue
        }
        saisies[field] = saisie
        const attendues: unknown[] = Array.isArray(reponse.value)
          ? reponse.value
          : [reponse.value]
        const isOk = attendues.some((valeur) => String(valeur) === saisie)
        points.push(isOk ? 1 : 0)
        if (isOk) compteurBonnesReponses++
        if (eltFeedbackQcm) {
          setStyles(eltFeedbackQcm, 'marginBottom: 20px')
          eltFeedbackQcm.innerHTML = isOk ? '😎' : '☹️'
        }
        continue
      }

      const mf = multi?.shadowRoot?.getElementById(
        `${fieldIdPrefix}-${field}`,
      ) as MathfieldElement | null
      if (mf == null) {
        points.push(0)
        continue
      }

      const saisie = mf.dataset.saisie ?? mf.getValue()
      mf.readOnly = true
      mf.classList.add('corrected')
      if (saisie === '') {
        compteurSaisiesVides++
        points.push(0)
        continue
      }

      const eltFeedback = multi?.shadowRoot?.getElementById(
        `check-${fieldIdPrefix}-${field}`,
      ) as HTMLSpanElement | null
      if (eltFeedback) {
        setStyles(eltFeedback, 'marginBottom: 20px')
        eltFeedback.innerHTML = ''
      }

      saisies[field] = saisie
      let result
      if (Array.isArray(reponse.value)) {
        if (options.estDansIntervalle) {
          result = compareFunction(saisie, reponse.value, options)
        } else {
          let ii = 0
          while (!result?.isOk && ii < reponse.value.length) {
            result = compareFunction(saisie, reponse.value[ii], options)
            ii++
          }
        }
      } else {
        result = compareFunction(saisie, reponse.value, options)
      }

      if (result.partsOk != null) {
        mf.dataset.saisie = saisie
        mf.setValue(colorizeAnswerParts(saisie, result.partsOk), {
          silenceNotifications: true,
        })
      }

      if (result.isOk) {
        compteurBonnesReponses++
        points.push(this.scoreFromResult(result))
        if (eltFeedback) eltFeedback.innerHTML = '😎'
      } else {
        points.push(this.scoreFromResult(result))
        if (eltFeedback) eltFeedback.innerHTML = '☹️'
        if (result.feedback === 'saisieVide') result.feedback = ''
        else {
          result = {
            isOk: false,
            feedback: result.feedback ?? '',
          }
        }
      }

      mf.classList.add('corrected')
      if (result.feedback != null && result.feedback !== '') {
        for (const message of result.feedback.split('\n')) {
          if (message !== '') feedbackMessages.add(message)
        }
      }
    }

    feedback = Array.from(feedbackMessages)
      .map((message) => `${message}<br>`)
      .join('')

    if (compteurBonnesReponses === variables.length) {
      feedback = feedback ?? ''
    } else if (compteurSaisiesVides > 0) {
      feedback = `Il manque ${compteurSaisiesVides} réponse${compteurSaisiesVides > 1 ? 's' : ''}.`
    } else {
      feedback = feedback ?? `Certaines réponses sont incorrectes.`
    }

    if (feedbackFunction != null) {
      const feedbackFunctionResult = feedbackFunction(saisies)
      if (typeof feedbackFunctionResult === 'string') {
        feedback += feedbackFunctionResult
      }
    }

    const [nbBonnesReponses, nbReponses] = bareme(points)
    const spanReponseLigne = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${i}`,
    ) as HTMLSpanElement | null
    if (spanReponseLigne != null) {
      spanReponseLigne.innerHTML =
        compteurBonnesReponses === variables.length ? '😎' : '☹️'
    }

    exercice.answers ??= {}
    exercice.answers[multiId] =
      multi instanceof MultiMathfieldElement
        ? JSON.stringify(multi.getValue())
        : JSON.stringify(saisies)

    return {
      isOk: compteurBonnesReponses === variables.length,
      feedback: noFeedback ? '' : feedback !== '' ? feedback : '',
      score: {
        nbBonnesReponses,
        nbReponses,
      },
    }
  }

  static pointsMaxQuestion(exercice: IExercice, i: number): number {
    // `verifQuestion()` applique le barème à un point par champ, avec
    // `toutAUnPoint` par défaut.
    const valeur = exercice.autoCorrection?.[i]?.valeur
    return pointsMaxDuBareme(
      valeur?.bareme,
      compteChampsDeReponse(valeur),
      toutAUnPoint,
    )
  }
}

export function addMultiMathfield(
  exercice: IExercice,
  questionIndex: number,
  { dataTemplate, dataOptions, id }: MultiMathfieldOptions,
) {
  // Extraction des noms de champs %{name}
  const regex = /%\{([^}]+)\}/g
  let match
  const enrichedOptions: Record<string, MultiMathfieldOption> = {
    ...(dataOptions as Record<string, MultiMathfieldOption>),
  }
  while ((match = regex.exec(dataTemplate)) !== null) {
    const name = match[1]
    if (!(name in enrichedOptions)) {
      enrichedOptions[name] = {
        placeholder: '',
        minWidth: 30,
        keyboard: KeyboardType.clavierNumbers,
        ldots: false,
      }
    } else {
      // Ajoute les valeurs par défaut manquantes
      if (enrichedOptions[name].placeholder === undefined)
        enrichedOptions[name].placeholder = ''
      if (enrichedOptions[name].minWidth === undefined)
        enrichedOptions[name].minWidth = 30
      if (enrichedOptions[name].keyboard === undefined)
        enrichedOptions[name].keyboard = KeyboardType.clavierNumbers
      if (enrichedOptions[name].ldots === undefined) {
        enrichedOptions[name].ldots = false
      }
    }
  }
  if (context.isHtml && exercice.interactif && !context.isTypst) {
    registerMathaleaCustomElement(MultiMathfieldElement)
    return MultiMathfieldElement.create({
      id,
      numeroExercice: exercice.numeroExercice,
      questionIndex,
      dataTemplate,
      dataOptions: enrichedOptions,
    })
  } else {
    const output = context.isHtml ? 'html' : 'latex'
    const rendered = MultiMathfieldElement.renderStaticTemplate(
      dataTemplate,
      enrichedOptions,
      output,
      (fieldOptions) => {
        if (!fieldOptions.ldots) return ''
        if (!context.isHtml || context.isTypst) return '$\\ldots\\ldots$'
        return ' ... '
      },
      `labelEx${exercice.numeroExercice ?? 0}Q${questionIndex}R`,
    )

    if (!context.isHtml && !rendered.includes('\\begin{qcmprop}')) {
      const enumitemBlock = buildLatexEnumitemBlock(rendered.split('\n'))
      if (enumitemBlock) {
        return enumitemBlock
      }
    }

    return rendered
  }
}

registerMathaleaCustomElement(MultiMathfieldElement)
