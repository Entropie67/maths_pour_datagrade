import scratchFr from '@scratch2latex/scratch-core/json/scratchFr.json'
import * as scratchBlocks from 'scratch-blocks'
import {
  areArithmeticAstsEquivalent,
  blocklyWorkspaceToArithmeticAst,
  type ArithmeticAst,
  type ArithmeticOperation,
} from '../mathFonctions/expression'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

// Couleurs principale, secondaire et tertiaire (contour) de Scratch 3.
// Le contour distingue visuellement les blocs imbriqués les uns dans les autres.
const scratchCategoryColours = {
  control: ['#FFAB19', '#EC9C13', '#CF8B17'],
  data: ['#FF8C1A', '#FF8000', '#DB6E00'],
  data_lists: ['#FF661A', '#FF5500', '#E64D00'],
  sounds: ['#CF63CF', '#C94FC9', '#BD42BD'],
  motion: ['#4C97FF', '#4280D7', '#3373CC'],
  looks: ['#9966FF', '#855CD6', '#774DCB'],
  event: ['#FFBF00', '#E6AC00', '#CC9900'],
  sensing: ['#5CB1D6', '#47A8D1', '#2E8EB8'],
  pen: ['#0FBD8C', '#0DA57A', '#0B8E69'],
  operators: ['#59C059', '#46B946', '#389438'],
  more: ['#FF6680', '#FF4D6A', '#FF3355'],
  textField: ['#FFFFFF', '#FFFFFF', '#FFFFFF'],
}

// Le moteur Scratch 2 attend une couleur tertiaire pour chaque style Blockly.
const scratchTheme = scratchBlocks.Theme.defineTheme('mathalea-scratch', {
  name: 'mathalea-scratch',
  base: scratchBlocks.Themes.Classic,
  blockStyles: {
    ...Object.fromEntries(
      Object.entries(scratchBlocks.Themes.Classic.blockStyles).map(
        ([name, style]) => [
          name,
          {
            ...style,
            colourSecondary: style.colourSecondary ?? style.colourPrimary,
            colourTertiary: style.colourTertiary ?? style.colourPrimary,
          },
        ],
      ),
    ),
    ...Object.fromEntries(
      Object.entries(scratchCategoryColours).map(([name, colours]) => [
        name,
        {
          colourPrimary: colours[0],
          colourSecondary: colours[1],
          colourTertiary: colours[2],
        },
      ]),
    ),
  },
})

type ScratchWorkspaceJson = Record<string, unknown>

export type ScratchToolboxCategory = {
  id: string
  name?: string
  colour?: string
  blocks: Array<
    | string
    | {
        opcode: string
        fields?: Record<string, string | number>
        inputs?: Record<string, string | number>
      }
  >
}

export type ScratchToolboxDefinition = {
  categories: ScratchToolboxCategory[]
}

export type ScratchEditorValue = {
  version: 1
  workspaceXml?: string
  workspaceJson?: ScratchWorkspaceJson
  projectJson?: string
  latex?: string
}

export type ScratchEditorOptions = {
  id?: string
  numeroExercice?: number
  questionIndex?: number
  toolbox?: ScratchToolboxDefinition
  initialBlocks?: ScratchWorkspaceJson
  initialValue?: Partial<ScratchEditorValue>
  enableVm?: boolean
  showCategories?: boolean
  showToolbar?: boolean
  enableRun?: boolean
  enableStep?: boolean
  enableStop?: boolean
  verifyCallbackName?: string
  interactivityOn?: boolean
  height?: string
  width?: string
}

type ScratchVerificationCallbackContext = {
  exercice: IExercice
  questionIndex: number
  editor: ScratchEditorElement
  studentValue: ScratchEditorValue
  expectedRaw: unknown
}

type ScratchVerificationResult = {
  isOk: boolean
  feedback: string
  score?: { nbBonnesReponses: number; nbReponses: number }
}

type ScratchVerificationCallback = (
  ctx: ScratchVerificationCallbackContext,
) => ScratchVerificationResult

let areScratchMessagesTranslated = false

function ensureScratchBlocksFrenchMessages(): void {
  if (areScratchMessagesTranslated) return
  if (scratchBlocks.Msg == null) return

  Object.assign(
    scratchBlocks.Msg,
    scratchFr.commands as Record<string, string>,
    {
      EVENT_WHENFLAGCLICKED: 'quand %1 est cliqué',
      MOTION_TURNRIGHT: 'tourner %1 de %2 degrés',
      MOTION_TURNLEFT: 'tourner %1 de %2 degrés',
    },
  )

  areScratchMessagesTranslated = true
}

const scratchOpcodeByArithmeticOperation: Record<ArithmeticOperation, string> =
  {
    plus: 'operator_add',
    moins: 'operator_subtract',
    multi: 'operator_multiply',
    divise: 'operator_divide',
  }

const arithmeticOperationByScratchOpcode: Record<string, ArithmeticOperation> =
  {
    operator_add: 'plus',
    operator_subtract: 'moins',
    operator_multiply: 'multi',
    operator_divide: 'divise',
  }

/** Identifiant stable d'une variable, partagé par la boîte à outils et les programmes. */
export function scratchVariableId(name: string): string {
  return `scratch-variable-${name}`
}

class ScratchToolboxBuilder {
  static build(
    toolbox?: ScratchToolboxDefinition,
    showCategories = false,
  ): string {
    if (toolbox == null) return this.defaultToolbox(showCategories)
    if (!showCategories) {
      return this.flatToolbox(
        toolbox.categories.flatMap((category) => category.blocks),
      )
    }
    const categories = toolbox.categories
      .map((category) => {
        const colour = category.colour
          ? ` colour="${this.escapeAttribute(category.colour)}"`
          : ''
        const secondaryColour = category.colour
          ? ` secondaryColour="${this.escapeAttribute(category.colour)}"`
          : ''
        const blocks = category.blocks
          .map((block) => {
            return this.blockXml(block)
          })
          .join('')
        return `<category name="${this.escapeAttribute(category.name ?? category.id)}" id="${this.escapeAttribute(category.id)}"${colour}${secondaryColour}>${blocks}</category>`
      })
      .join('')
    return `<xml id="toolbox-categories" style="display: none">${categories}</xml>`
  }

  private static defaultToolbox(showCategories: boolean): string {
    const categories: ScratchToolboxDefinition = {
      categories: [
        {
          id: 'events',
          name: 'Événements',
          colour: '#FFBF00',
          blocks: ['event_whenflagclicked'],
        },
        {
          id: 'looks',
          name: 'Apparence',
          colour: '#9966FF',
          blocks: ['looks_sayforsecs'],
        },
        {
          id: 'operators',
          name: 'Opérateurs',
          colour: '#59C059',
          blocks: [
            'operator_add',
            'operator_subtract',
            'operator_multiply',
            'operator_divide',
          ],
        },
        {
          id: 'values',
          name: 'Valeurs',
          colour: '#FFFFFF',
          blocks: ['math_number'],
        },
      ],
    }
    return this.build(categories, showCategories)
  }

  private static flatToolbox(blocks: ScratchToolboxCategory['blocks']): string {
    return [
      '<xml id="toolbox-blocks" style="display: none">',
      ...blocks.map((block) => {
        return this.blockXml(block)
      }),
      '</xml>',
    ].join('')
  }

  private static blockXml(
    block: ScratchToolboxCategory['blocks'][number],
  ): string {
    const opcode = typeof block === 'string' ? block : block.opcode
    const fields =
      typeof block === 'string'
        ? ''
        : Object.entries(block.fields ?? {})
            .map(
              ([name, value]) =>
                `<field name="${this.escapeAttribute(name)}"${name === 'VARIABLE' ? ` id="${this.escapeAttribute(scratchVariableId(String(value)))}"` : ''}>${this.escapeText(String(value))}</field>`,
            )
            .join('')
    const inputs =
      typeof block === 'string'
        ? ''
        : Object.entries(block.inputs ?? {})
            .map(
              ([name, value]) =>
                `<value name="${this.escapeAttribute(name)}"><shadow type="math_number"><field name="NUM">${this.escapeText(String(value))}</field></shadow></value>`,
            )
            .join('')

    if (opcode === 'looks_sayforsecs') {
      return [
        '<block type="looks_sayforsecs">',
        '<value name="MESSAGE"><shadow type="text"><field name="TEXT">Bonjour !</field></shadow></value>',
        '<value name="SECS"><shadow type="math_number"><field name="NUM">2</field></shadow></value>',
        '</block>',
      ].join('')
    }

    if (opcode.startsWith('operator_')) {
      return [
        `<block type="${this.escapeAttribute(opcode)}">`,
        '<value name="NUM1"><shadow type="math_number"><field name="NUM">0</field></shadow></value>',
        '<value name="NUM2"><shadow type="math_number"><field name="NUM">0</field></shadow></value>',
        '</block>',
      ].join('')
    }

    if (opcode === 'math_number') {
      return '<block type="math_number"><field name="NUM">0</field></block>'
    }

    return `<block type="${this.escapeAttribute(opcode)}">${fields}${inputs}</block>`
  }

  private static escapeAttribute(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
  }

  private static escapeText(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
  }
}

class ScratchWorkspaceAdapter {
  private workspace: ReturnType<typeof scratchBlocks.inject>

  constructor({
    container,
    toolbox,
    showCategories,
    readOnly,
    onChange,
  }: {
    container: HTMLElement
    toolbox?: ScratchToolboxDefinition
    showCategories: boolean
    readOnly: boolean
    onChange: () => void
  }) {
    ensureScratchBlocksFrenchMessages()
    this.workspace = scratchBlocks.inject(container, {
      theme: scratchTheme,
      toolbox: ScratchToolboxBuilder.build(toolbox, showCategories),
      comments: false,
      collapse: false,
      disable: false,
      media: `${import.meta.env.BASE_URL}scratch-blocks/media/`,
      oneBasedIndex: false,
      readOnly,
      scrollbars: true,
      sounds: false,
      toolboxPosition: 'start',
      trashcan: false,
      zoom: {
        controls: !readOnly,
        wheel: false,
        startScale: 0.75,
        maxScale: 2,
        minScale: 0.35,
        scaleSpeed: 1.2,
      },
    })
    this.workspace.addChangeListener((event) => {
      if (event.isUiEvent) return
      onChange()
    })
    this.createToolboxVariables(toolbox)
  }

  /**
   * Les blocs `data_variable` (étiquettes de variable) n'affichent leur nom
   * que si la variable existe dans l'espace de travail et qu'ils la désignent
   * par son identifiant : on crée donc les variables de la boîte à outils.
   */
  private createToolboxVariables(toolbox?: ScratchToolboxDefinition): void {
    const names = new Set<string>()
    for (const category of toolbox?.categories ?? []) {
      for (const block of category.blocks) {
        const name = typeof block === 'string' ? null : block.fields?.VARIABLE
        if (name != null) names.add(String(name))
      }
    }
    for (const name of names) {
      this.workspace
        .getVariableMap()
        .createVariable(name, '', scratchVariableId(name))
    }
    if (names.size > 0) this.workspace.getToolbox()?.refreshSelection()
  }

  exportXml(): string {
    return scratchBlocks.Xml.domToText(
      scratchBlocks.Xml.workspaceToDom(this.workspace),
    )
  }

  loadXml(xml: string): void {
    this.workspace.clear()
    const dom = scratchBlocks.utils.xml.textToDom(xml)
    for (const field of Array.from(dom.querySelectorAll('field')).filter(
      (element) =>
        element.getAttribute('name') === 'VARIABLE' &&
        !element.hasAttribute('id'),
    )) {
      field.setAttribute(
        'id',
        scratchVariableId((field.textContent ?? '').trim()),
      )
    }
    scratchBlocks.Xml.domToWorkspace(dom, this.workspace)
    this.moveBlocksOutOfFlyout()
  }

  /**
   * Le panneau de blocs recouvre la gauche de l'espace de travail : on décale
   * les programmes chargés pour qu'ils restent visibles à côté de celui-ci.
   */
  private moveBlocksOutOfFlyout(): void {
    const flyout = this.workspace.getFlyout()
    if (flyout == null) return
    const left = flyout.getWidth() / this.workspace.scale + 16
    for (const block of this.workspace.getTopBlocks(false)) {
      block.moveBy(left, 0)
    }
  }

  resize(): void {
    scratchBlocks.svgResize(this.workspace)
  }

  dispose(): void {
    this.workspace.dispose()
  }
}
/**
 * @author Jean-Claude Lhote
 */
export class ScratchEditorElement extends MathaleaCustomElement {
  static readonly elementTag = 'scratch-editor'
  private static readonly verificationCallbacks = new Map<
    string,
    ScratchVerificationCallback
  >()

  private editorHeight: string | null = null
  private editorWidth: string | null = null
  private workspaceAdapter: ScratchWorkspaceAdapter | null = null
  private resizeObserver: ResizeObserver | null = null
  private runStatus: HTMLSpanElement | null = null

  static create(options: ScratchEditorOptions): string {
    const id =
      options.id ??
      `${ScratchEditorElement.elementTag}Ex${options.numeroExercice ?? 0}Q${options.questionIndex ?? 0}`

    return super.create({
      id,
      toolbox: options.toolbox,
      initialBlocks: options.initialBlocks,
      initialValue: options.initialValue,
      enableVm: options.enableVm ?? false,
      showCategories: options.showCategories ?? false,
      showToolbar: options.showToolbar ?? false,
      enableRun: options.enableRun ?? false,
      enableStep: options.enableStep ?? false,
      enableStop: options.enableStop ?? false,
      verifyCallbackName: options.verifyCallbackName,
      interactivityOn: options.interactivityOn ?? true,
      height: options.height ?? '260px',
      width: options.width ?? '100%',
    })
  }

  static registerVerificationCallback(
    name: string,
    callback: ScratchVerificationCallback,
  ): void {
    this.verificationCallbacks.set(name, callback)
  }

  static unregisterVerificationCallback(name: string): void {
    this.verificationCallbacks.delete(name)
  }

  static formatStudentAnswer(rawAnswer: string): string {
    try {
      const parsed = JSON.parse(rawAnswer) as ScratchEditorValue
      const ast = scratchWorkspaceXmlToArithmeticAst(parsed.workspaceXml ?? '')
      if (ast == null) return 'aucun bloc'
      return 'programme Scratch'
    } catch {
      return rawAnswer
    }
  }

  static stripFromQuestionHtml(questionHtml: string): string {
    return questionHtml
      .replace(/<scratch-editor[^>]*\/>/gi, '')
      .replace(/<scratch-editor[^>]*>[^]*?<\/scratch-editor>/gi, '')
  }

  static verifQuestion(
    exercice: IExercice,
    i: number,
  ): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    const id = `${ScratchEditorElement.elementTag}Ex${exercice.numeroExercice}Q${i}`
    const editor = document.getElementById(id) as ScratchEditorElement | null
    const spanResultat = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${i}`,
    )
    const divFeedback = document.querySelector(
      `#feedbackEx${exercice.numeroExercice}Q${i}`,
    ) as HTMLElement | null

    if (!editor) {
      if (spanResultat) spanResultat.innerHTML = '☹️'
      return {
        isOk: false,
        feedback: 'Éditeur Scratch introuvable.',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }

    const currentValue = editor.getEditorValue()
    if (exercice.answers == null) exercice.answers = {}
    exercice.answers[id] = JSON.stringify(currentValue)
    editor.interactivityOn = false

    const expectedRaw = exercice.autoCorrection[i]?.valeur?.reponse?.value
    const verifyCallbackName = editor.getAttribute('verify-callback-name')
    const verifyCallback =
      verifyCallbackName == null
        ? undefined
        : ScratchEditorElement.verificationCallbacks.get(verifyCallbackName)

    if (verifyCallback != null) {
      const result = verifyCallback({
        exercice,
        questionIndex: i,
        editor,
        studentValue: currentValue,
        expectedRaw,
      })
      const isOk = result.isOk
      if (spanResultat) spanResultat.innerHTML = isOk ? '😎' : '☹️'
      if (divFeedback) {
        divFeedback.innerHTML = result.feedback
        divFeedback.style.display = 'block'
      }
      return {
        isOk,
        feedback: result.feedback,
        score: result.score ?? {
          nbBonnesReponses: isOk ? 1 : 0,
          nbReponses: 1,
        },
      }
    }

    const studentAst = scratchWorkspaceXmlToArithmeticAst(
      currentValue.workspaceXml ?? '',
    )
    const expectedAst = expectedScratchEditorAst(expectedRaw)
    const isOk =
      studentAst != null &&
      expectedAst != null &&
      areArithmeticAstsEquivalent(studentAst, expectedAst)
    const feedback = isOk
      ? 'Bravo !'
      : studentAst == null
        ? "Impossible d'interpréter ta réponse Scratch en expression arithmétique."
        : 'Le programme ne correspond pas au calcul attendu.'

    if (spanResultat) spanResultat.innerHTML = isOk ? '😎' : '☹️'
    if (divFeedback) {
      divFeedback.innerHTML = feedback
      divFeedback.style.display = 'block'
    }

    return {
      isOk,
      feedback,
      score: { nbBonnesReponses: isOk ? 1 : 0, nbReponses: 1 },
    }
  }

  connectedCallback(): void {
    this.hydrateCommonAttributes()
    this.editorHeight = this.getAttribute('height')
    this.editorWidth = this.getAttribute('width')
    this.render()
  }

  disconnectedCallback(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
    this.workspaceAdapter?.dispose()
    this.workspaceAdapter = null
  }

  get value(): string {
    return JSON.stringify(this.getEditorValue())
  }

  set value(nextValue: string) {
    try {
      this.update(JSON.parse(nextValue) as ScratchEditorValue)
    } catch {
      // Valeur invalide : on ignore sans casser l'interface.
    }
  }

  render(): void {
    const resolvedWidth = this.editorWidth ?? '100%'
    const resolvedHeight = this.editorHeight ?? '260px'
    const isInteractive = this.interactivityOn
    const showToolbar = this.getBooleanAttribute('show-toolbar', false)
    const workspaceHeight = showToolbar
      ? `calc(${resolvedHeight} - 38px)`
      : resolvedHeight
    const overlayInset = showToolbar ? '38px 0 0 0' : '0'

    this.innerHTML = `
      <style>
        scratch-editor .scratch-editor-area .blocklyToolbox {
          border-right: 1px solid #d8dee9;
          box-shadow: 1px 0 0 #eef1f6;
          background: #ffffff;
          z-index: 20;
        }
        scratch-editor .scratch-editor-area .blocklyFlyoutBackground {
          fill: #f7f8fb;
          fill-opacity: 1;
          stroke: #d8dee9;
          stroke-width: 1px;
        }
        scratch-editor .scratch-editor-area .blocklyMainBackground {
          fill: #ffffff;
          stroke: #e5e7eb;
          stroke-width: 1px;
        }
        scratch-editor .scratch-editor-area .blocklyToolboxCategory {
          border-radius: 6px;
          margin: 2px 6px;
        }
      </style>
      <div class="scratch-editor-wrapper" style="position: relative; width: ${resolvedWidth}; min-height: ${resolvedHeight}; border: 1px solid #d9dde7; border-radius: 8px; overflow: hidden; background: #ffffff;">
        ${
          showToolbar
            ? `<div class="scratch-editor-toolbar" style="display: flex; align-items: center; gap: 0.5rem; min-height: 38px; padding: 0.35rem 0.5rem; border-bottom: 1px solid #e6e8ef; background: #f7f8fb;">
          <button type="button" data-action="run" title="Exécuter" style="display: ${this.getBooleanAttribute('enable-run', false) ? 'inline-flex' : 'none'}; align-items: center; justify-content: center; width: 30px; height: 30px; border: 1px solid #cfd5e3; border-radius: 6px; background: #fff; cursor: pointer;">▶</button>
          <button type="button" data-action="stop" title="Arrêter" style="display: ${this.getBooleanAttribute('enable-stop', false) ? 'inline-flex' : 'none'}; align-items: center; justify-content: center; width: 30px; height: 30px; border: 1px solid #cfd5e3; border-radius: 6px; background: #fff; cursor: pointer;">■</button>
          <span class="scratch-editor-status" aria-live="polite" style="font-size: 0.85rem; color: #475569;"></span>
        </div>`
            : ''
        }
        <div class="scratch-editor-area" style="width: ${resolvedWidth}; height: ${workspaceHeight}; min-height: 120px; pointer-events: ${isInteractive ? 'auto' : 'none'};"></div>
        <div class="scratch-editor-overlay" style="display: ${isInteractive ? 'none' : 'block'}; position: absolute; inset: ${overlayInset}; z-index: 1000; pointer-events: auto; background: transparent;"></div>
      </div>
    `

    this.runStatus = this.querySelector('.scratch-editor-status')
    this.querySelector('[data-action="run"]')?.addEventListener('click', () =>
      this.showRunPreview(),
    )
    this.querySelector('[data-action="stop"]')?.addEventListener('click', () =>
      this.clearRunPreview(),
    )

    const area = this.querySelector(
      '.scratch-editor-area',
    ) as HTMLDivElement | null
    if (!area) return

    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
    this.workspaceAdapter?.dispose()
    try {
      this.workspaceAdapter = new ScratchWorkspaceAdapter({
        container: area,
        toolbox: this.getToolboxAttribute(),
        showCategories: this.getBooleanAttribute('show-categories', false),
        readOnly: !isInteractive,
        onChange: () => {
          this.dispatchEvent(
            new CustomEvent('change', { bubbles: true, detail: this.value }),
          )
        },
      })
    } catch (error) {
      this.workspaceAdapter = null
      const message =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : String(error)
      area.innerHTML = `<div style="padding: 0.75rem; color: #b91c1c;">Impossible de charger les blocs Scratch.<br><small>${this.escapeHtml(message)}</small></div>`
      console.error('Impossible de charger les blocs Scratch', error)
      window.notify?.('Impossible de charger les blocs Scratch', { error })
      return
    }

    const initialValue = this.getValueAttribute('initial-value')
    if (initialValue) {
      this.update({ version: 1, ...initialValue })
    } else {
      const initialBlocks = this.getJsonAttribute('initial-blocks')
      if (initialBlocks) {
        this.update({
          version: 1,
          workspaceXml: blocklyWorkspaceJsonToScratchXml(initialBlocks),
        })
      }
    }

    // Un ResizeObserver (plutôt qu'un simple écouteur sur `window`) est
    // nécessaire car en mode « une page par exercice » les exercices non
    // affichés sont montés dans le DOM masqués via `display: none` (taille
    // 0x0) : le workspace Scratch y est injecté avec une taille nulle et
    // seul un changement de taille de la zone (déclenché quand l'exercice
    // redevient visible) permet de le redimensionner correctement.
    // (ResizeObserver n'existe pas dans l'environnement de test jsdom.)
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.workspaceAdapter?.resize()
      })
      this.resizeObserver.observe(area)
    }
  }

  update(value: ScratchEditorValue): void {
    if (value.workspaceXml != null) {
      this.workspaceAdapter?.loadXml(value.workspaceXml)
      return
    }
    if (value.workspaceJson != null) {
      this.workspaceAdapter?.loadXml(
        blocklyWorkspaceJsonToScratchXml(value.workspaceJson),
      )
    }
  }

  getEditorValue(): ScratchEditorValue {
    return {
      version: 1,
      workspaceXml: this.workspaceAdapter?.exportXml() ?? '',
      latex: '',
    }
  }

  protected onInteractivityChanged(isOn: boolean): void {
    const overlay = this.querySelector(
      '.scratch-editor-overlay',
    ) as HTMLDivElement | null
    const area = this.querySelector(
      '.scratch-editor-area',
    ) as HTMLDivElement | null
    if (overlay) overlay.style.display = isOn ? 'none' : 'block'
    if (area) area.style.pointerEvents = isOn ? 'auto' : 'none'
  }

  private getBooleanAttribute(name: string, defaultValue: boolean): boolean {
    if (!this.hasAttribute(name)) return defaultValue
    return this.getAttribute(name) !== 'false'
  }

  private getToolboxAttribute(): ScratchToolboxDefinition | undefined {
    const raw = this.getAttribute('toolbox')
    if (!raw) return undefined
    try {
      return JSON.parse(raw) as ScratchToolboxDefinition
    } catch {
      return undefined
    }
  }

  private getJsonAttribute(name: string): ScratchWorkspaceJson | null {
    const raw = this.getAttribute(name)
    if (!raw) return null
    try {
      return JSON.parse(raw) as ScratchWorkspaceJson
    } catch {
      return null
    }
  }

  private getValueAttribute(
    name: 'initial-value',
  ): Partial<ScratchEditorValue> | null {
    const raw = this.getAttribute(name)
    if (!raw) return null
    try {
      return JSON.parse(raw) as Partial<ScratchEditorValue>
    } catch {
      return null
    }
  }

  private showRunPreview(): void {
    const ast = scratchWorkspaceXmlToArithmeticAst(
      this.getEditorValue().workspaceXml ?? '',
    )
    if (this.runStatus) {
      this.runStatus.textContent =
        ast == null ? 'Programme incomplet' : 'Programme prêt'
    }
  }

  private clearRunPreview(): void {
    if (this.runStatus) this.runStatus.textContent = ''
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
  }
}

export function addScratchEditor(
  exercice: IExercice,
  questionIndex: number,
  options: ScratchEditorOptions,
): string {
  return ScratchEditorElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice,
    questionIndex,
  })
}

function expectedScratchEditorAst(expectedRaw: unknown): ArithmeticAst | null {
  if (typeof expectedRaw !== 'string') return null
  try {
    const parsed = JSON.parse(expectedRaw) as {
      solutionBlocks?: unknown
      solutionScratchXml?: unknown
    }
    if (typeof parsed.solutionScratchXml === 'string') {
      return scratchWorkspaceXmlToArithmeticAst(parsed.solutionScratchXml)
    }
    return blocklyWorkspaceToArithmeticAst(parsed.solutionBlocks)
  } catch {
    return null
  }
}

export function blocklyWorkspaceJsonToScratchXml(
  workspaceJson: unknown,
): string {
  const ast = blocklyWorkspaceToArithmeticAst(workspaceJson)
  if (ast == null)
    return '<xml xmlns="https://developers.google.com/blockly/xml"></xml>'
  return astToScratchWorkspaceXml(ast)
}

function astToScratchWorkspaceXml(ast: ArithmeticAst): string {
  return [
    '<xml xmlns="https://developers.google.com/blockly/xml">',
    '<block type="event_whenflagclicked" x="24" y="24">',
    '<next>',
    '<block type="looks_sayforsecs">',
    '<value name="MESSAGE">',
    astToScratchValueXml(ast),
    '</value>',
    '<value name="SECS"><shadow type="math_number"><field name="NUM">2</field></shadow></value>',
    '</block>',
    '</next>',
    '</block>',
    '</xml>',
  ].join('')
}

function astToScratchValueXml(ast: ArithmeticAst): string {
  if (ast.type === 'number') {
    return `<shadow type="math_number"><field name="NUM">${escapeXmlText(String(ast.value))}</field></shadow>`
  }

  const opcode = scratchOpcodeByArithmeticOperation[ast.op]
  return [
    `<block type="${opcode}">`,
    '<value name="NUM1">',
    astToScratchValueXml(ast.left),
    '</value>',
    '<value name="NUM2">',
    astToScratchValueXml(ast.right),
    '</value>',
    '</block>',
  ].join('')
}

export function scratchWorkspaceXmlToArithmeticAst(
  xml: string,
): ArithmeticAst | null {
  if (xml.trim() === '') return null
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const parseError = doc.querySelector('parsererror')
  if (parseError != null) return null
  const topBlocks = Array.from(doc.documentElement.children).filter(
    (element) => element.tagName.toLowerCase() === 'block',
  )
  for (const block of topBlocks) {
    const valueBlock = findScratchMessageValueBlock(block)
    if (valueBlock == null) continue
    const ast = scratchValueBlockToArithmeticAst(valueBlock)
    if (ast != null) return ast
  }
  return null
}

export function normalizedScratchWorkspaceXml(xml: string): string {
  if (xml.trim() === '') return ''
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.querySelector('parsererror') != null) return xml

  const cleanElement = (element: Element): Record<string, unknown> => {
    const attributes = Array.from(element.attributes)
      .filter(
        (attribute) =>
          !['id', 'variabletype', 'x', 'y', 'xmlns'].includes(attribute.name),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((attribute) => [attribute.name, attribute.value])
    const children = Array.from(element.children)
      .filter((child) => child.tagName.toLowerCase() !== 'variables')
      .map(cleanElement)
    const text =
      children.length === 0 ? (element.textContent ?? '').trim() : undefined

    return {
      tag:
        element.tagName.toLowerCase() === 'shadow'
          ? 'block'
          : element.tagName.toLowerCase(),
      attributes,
      ...(text ? { text } : {}),
      ...(children.length > 0 ? { children } : {}),
    }
  }

  return JSON.stringify(cleanElement(doc.documentElement))
}

export function scratchWorkspaceXmlToScratchblockCode(xml: string): string {
  if (xml.trim() === '') return ''
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.querySelector('parsererror') != null) return ''

  const topBlocks = Array.from(doc.documentElement.children).filter(
    (element) => element.tagName.toLowerCase() === 'block',
  )

  return topBlocks
    .map(scratchStatementBlockToScratchblockLines)
    .flat()
    .join('\n')
}

export function scratchWorkspaceXmlToVariableValues(
  xml: string,
): Record<string, number> | null {
  if (xml.trim() === '') return null
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.querySelector('parsererror') != null) return null

  const variables: Record<string, number> = {}
  const topBlocks = Array.from(doc.documentElement.children).filter(
    (element) => element.tagName.toLowerCase() === 'block',
  )
  for (const block of topBlocks) {
    executeScratchStatementBlock(block, variables)
  }
  return variables
}

function executeScratchStatementBlock(
  block: Element,
  variables: Record<string, number>,
): void {
  if (block.getAttribute('type') === 'data_setvariableto') {
    const variable = readScratchFieldText(block, 'VARIABLE')
    const valueBlock = readScratchValueBlock(block, 'VALUE')
    if (variable !== '' && valueBlock != null) {
      variables[variable] = evaluateScratchValueBlock(valueBlock, variables)
    }
  }

  const nextBlock = firstElement(block, 'next')?.querySelector(':scope > block')
  if (nextBlock != null) executeScratchStatementBlock(nextBlock, variables)
}

function evaluateScratchValueBlock(
  block: Element,
  variables: Record<string, number>,
): number {
  const type = block.getAttribute('type')

  if (type === 'math_number') {
    const value = Number(readScratchFieldText(block, 'NUM').replace(',', '.'))
    return Number.isFinite(value) ? value : Number.NaN
  }

  if (type === 'data_variable') {
    const variable = readScratchFieldText(block, 'VARIABLE')
    return variables[variable] ?? 0
  }

  const operationByType: Record<
    string,
    (left: number, right: number) => number
  > = {
    operator_add: (left, right) => left + right,
    operator_subtract: (left, right) => left - right,
    operator_multiply: (left, right) => left * right,
    operator_divide: (left, right) => left / right,
  }
  const operation = type == null ? undefined : operationByType[type]
  if (operation != null) {
    const leftBlock = readScratchValueBlock(block, 'NUM1')
    const rightBlock = readScratchValueBlock(block, 'NUM2')
    const left =
      leftBlock == null ? 0 : evaluateScratchValueBlock(leftBlock, variables)
    const right =
      rightBlock == null ? 0 : evaluateScratchValueBlock(rightBlock, variables)
    return operation(left, right)
  }

  return Number.NaN
}

function scratchStatementBlockToScratchblockLines(block: Element): string[] {
  const type = block.getAttribute('type')
  const lines: string[] = []

  if (type === 'event_whenflagclicked') {
    lines.push('quand drapeau vert est clique')
  } else if (type === 'data_setvariableto') {
    const variable = readScratchFieldText(block, 'VARIABLE')
    const value = readScratchValueBlock(block, 'VALUE')
    lines.push(
      `mettre ${variable} a ${value == null ? '0' : scratchValueBlockToScratchblockCode(value)}`,
    )
  } else if (type === 'looks_sayforsecs') {
    const message = readScratchValueBlock(block, 'MESSAGE')
    const secs = readScratchValueBlock(block, 'SECS')
    lines.push(
      `dire ${message == null ? '' : scratchValueBlockToScratchblockCode(message)} pendant ${secs == null ? '2' : scratchValueBlockToScratchblockCode(secs)} secondes`,
    )
  }

  const nextBlock = firstElement(block, 'next')?.querySelector(':scope > block')
  if (nextBlock != null) {
    lines.push(...scratchStatementBlockToScratchblockLines(nextBlock))
  }

  return lines
}

function scratchValueBlockToScratchblockCode(block: Element): string {
  const type = block.getAttribute('type')

  if (type === 'math_number') {
    return readScratchFieldText(block, 'NUM') || '0'
  }

  if (type === 'text') {
    return readScratchFieldText(block, 'TEXT')
  }

  if (type === 'data_variable') {
    return readScratchFieldText(block, 'VARIABLE')
  }

  const operatorByType: Record<string, string> = {
    operator_add: '+',
    operator_subtract: '-',
    operator_multiply: '*',
    operator_divide: '/',
  }
  if (type != null && operatorByType[type] != null) {
    const left = readScratchValueBlock(block, 'NUM1')
    const right = readScratchValueBlock(block, 'NUM2')
    return `(${left == null ? '0' : scratchValueBlockToScratchblockCode(left)} ${operatorByType[type]} ${right == null ? '0' : scratchValueBlockToScratchblockCode(right)})`
  }

  return ''
}

function readScratchFieldText(block: Element, fieldName: string): string {
  return firstElement(block, 'field', fieldName)?.textContent?.trim() ?? ''
}

function findScratchMessageValueBlock(block: Element): Element | null {
  if (block.getAttribute('type') === 'looks_sayforsecs') {
    return readScratchValueBlock(block, 'MESSAGE')
  }
  const nextBlock = firstElement(block, 'next')?.querySelector(':scope > block')
  return nextBlock == null ? null : findScratchMessageValueBlock(nextBlock)
}

function scratchValueBlockToArithmeticAst(
  block: Element,
): ArithmeticAst | null {
  const type = block.getAttribute('type')
  if (type === 'math_number') {
    const raw = firstElement(block, 'field', 'NUM')?.textContent ?? ''
    const value = Number(raw.replace(',', '.'))
    return Number.isFinite(value) ? { type: 'number', value } : null
  }

  const operation =
    type == null ? undefined : arithmeticOperationByScratchOpcode[type]
  if (operation == null) return null

  const left = readScratchValueBlock(block, 'NUM1')
  const right = readScratchValueBlock(block, 'NUM2')
  if (left == null || right == null) return null
  const leftAst = scratchValueBlockToArithmeticAst(left)
  const rightAst = scratchValueBlockToArithmeticAst(right)
  if (leftAst == null || rightAst == null) return null

  return {
    type: 'operation',
    op: operation,
    left: leftAst,
    right: rightAst,
  }
}

function readScratchValueBlock(
  block: Element,
  inputName: string,
): Element | null {
  const value = firstElement(block, 'value', inputName)
  if (value == null) return null
  return (
    value.querySelector(':scope > block') ??
    value.querySelector(':scope > shadow')
  )
}

function firstElement(
  parent: Element,
  tagName: string,
  name?: string,
): Element | null {
  return (
    Array.from(parent.children).find((child) => {
      if (child.tagName.toLowerCase() !== tagName) return false
      return name == null || child.getAttribute('name') === name
    }) ?? null
  )
}

function escapeXmlText(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

registerMathaleaCustomElement(ScratchEditorElement)
