import * as Blockly from 'blockly/core'
import * as En from 'blockly/msg/en'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

/**
 * @author Jean-Claude Lhote
 */
Blockly.setLocale(En as unknown as { [key: string]: string })

type BlocklyWorkspaceJson = Record<string, unknown>
type BlocklyEditorScore = { nbBonnesReponses: number; nbReponses: number }

export type BlocklyEditorVerificationResult = {
  isOk: boolean
  feedback?: string
  score?: BlocklyEditorScore
}

export type BlocklyEditorVerificationContext = {
  exercice: IExercice
  questionIndex: number
  editor: BlocklyEditor
  studentJson: BlocklyWorkspaceJson
  expectedRaw: string
  expectedSolution: BlocklyWorkspaceJson | null
}

export type BlocklyEditorVerificationCallback = (
  context: BlocklyEditorVerificationContext,
) => BlocklyEditorVerificationResult

export type BlocklyEditorOptions = {
  toolbox: Blockly.utils.toolbox.ToolboxDefinition
  initialBlocks?: BlocklyWorkspaceJson
  solutionBlocks?: BlocklyWorkspaceJson
  verifyCallbackName?: string
  interactivityOn?: boolean
  height?: string
  width?: string
}

export type BlocklyEditorCreateOptions = {
  id?: string
  numeroExercice?: number
  questionIndex?: number
  options: BlocklyEditorOptions
}

export class BlocklyEditor extends MathaleaCustomElement {
  static readonly elementTag = 'blockly-editor'
  private static readonly verificationCallbacks = new Map<
    string,
    BlocklyEditorVerificationCallback
  >()
  private editorHeight: string | null = null
  private editorWidth: string | null = null
  private workspace: Blockly.WorkspaceSvg | null = null
  private resizeObserver: ResizeObserver | null = null

  static create({
    id,
    numeroExercice,
    questionIndex,
    options,
  }: BlocklyEditorCreateOptions): string {
    const computedId =
      id ??
      `${BlocklyEditor.elementTag}Ex${numeroExercice ?? 0}Q${questionIndex ?? 0}`
    return super.create({
      id: computedId,
      toolbox: options.toolbox,
      initialBlocks: options.initialBlocks,
      solutionBlocks: options.solutionBlocks,
      verifyCallbackName: options.verifyCallbackName,
      interactivityOn: options.interactivityOn ?? true,
      height: options.height ?? '500px',
      width: options.width ?? '100%',
    })
  }

  static createEltToAppendToDom({
    id,
    options,
    readOnly = true,
  }: {
    id?: string
    options: BlocklyEditorOptions
    readOnly?: boolean
  }): BlocklyEditor {
    const elt = document.createElement(
      BlocklyEditor.elementTag,
    ) as BlocklyEditor
    if (id) elt.id = id
    elt.setAttribute('toolbox', JSON.stringify(options.toolbox))
    if (options.initialBlocks != null) {
      elt.setAttribute('initial-blocks', JSON.stringify(options.initialBlocks))
    }
    if (options.solutionBlocks != null) {
      elt.setAttribute(
        'solution-blocks',
        JSON.stringify(options.solutionBlocks),
      )
    }
    if (options.verifyCallbackName) {
      elt.setAttribute('verify-callback-name', options.verifyCallbackName)
    }
    if (options.height) {
      elt.setAttribute('height', options.height)
    }
    if (options.width) {
      elt.setAttribute('width', options.width)
    }
    const interactivityOn = options.interactivityOn ?? !readOnly
    elt.setAttribute('interactivity-on', interactivityOn ? 'true' : 'false')
    elt.style.position = 'absolute'
    elt.style.left = '-9999px'
    elt.style.top = '-9999px'
    elt.style.width = '1px'
    elt.style.height = '1px'
    elt.style.overflow = 'hidden'
    return elt
  }

  static formatStudentAnswer(rawAnswer: string): string {
    try {
      const parsed = JSON.parse(rawAnswer) as BlocklyWorkspaceJson
      const blocks = this.getTopBlocks(parsed)
      const types = this.collectBlockTypes(blocks)
      if (types.length === 0) return 'aucun bloc'
      return `<ol>${types.map((t) => `<li>${t}</li>`).join('')}</ol>`
    } catch {
      return rawAnswer
    }
  }

  static stripFromQuestionHtml(questionHtml: string): string {
    return questionHtml
      .replace(/<blockly-editor[^>]*\/>/gi, '')
      .replace(/<blockly-editor[^>]*>[^]*?<\/blockly-editor>/gi, '')
  }

  static verifQuestion(
    exercice: IExercice,
    i: number,
  ): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    const id = `${BlocklyEditor.elementTag}Ex${exercice.numeroExercice}Q${i}`
    const editor = document.getElementById(id) as BlocklyEditor | null
    if (!editor) {
      return {
        isOk: false,
        feedback: 'Editeur Blockly introuvable.',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }
    const spanResultat = document.querySelector(
      `#resultatCheckEx${exercice.numeroExercice}Q${i}`,
    )
    const divFeedback = document.querySelector(
      `#feedbackEx${exercice.numeroExercice}Q${i}`,
    ) as HTMLElement | null

    const expectedRaw = exercice.autoCorrection[i]?.valeur?.reponse?.value
    const studentJson = editor.getWorkspaceSerialization()

    if (exercice.answers == null) exercice.answers = {}
    exercice.answers[id] = JSON.stringify(studentJson)
    editor.interactivityOn = false

    if (typeof expectedRaw !== 'string') {
      if (spanResultat) spanResultat.innerHTML = '☹️'
      if (divFeedback) {
        divFeedback.innerHTML = 'Réponse attendue absente.'
        divFeedback.style.display = 'block'
      }
      return {
        isOk: false,
        feedback: 'Réponse attendue absente.',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }

    let expectedSolution: BlocklyWorkspaceJson | null = null
    try {
      const parsed = JSON.parse(expectedRaw) as { solutionBlocks?: unknown }
      expectedSolution = (parsed.solutionBlocks ??
        null) as BlocklyWorkspaceJson | null
    } catch {
      expectedSolution = null
    }

    const callbackName = editor.getAttribute('verify-callback-name')
    if (callbackName) {
      const callback = BlocklyEditor.verificationCallbacks.get(callbackName)
      if (!callback) {
        if (spanResultat) spanResultat.innerHTML = '☹️'
        const missingFeedback = `Vérificateur Blockly introuvable: ${callbackName}`
        if (divFeedback) {
          divFeedback.innerHTML = missingFeedback
          divFeedback.style.display = 'block'
        }
        return {
          isOk: false,
          feedback: missingFeedback,
          score: { nbBonnesReponses: 0, nbReponses: 1 },
        }
      }

      try {
        const callbackResult = callback({
          exercice,
          questionIndex: i,
          editor,
          studentJson,
          expectedRaw,
          expectedSolution,
        })
        const callbackIsOk = callbackResult?.isOk === true
        const callbackFeedback = callbackResult?.feedback ?? ''
        const callbackScore = callbackResult?.score ?? {
          nbBonnesReponses: callbackIsOk ? 1 : 0,
          nbReponses: 1,
        }

        if (spanResultat) spanResultat.innerHTML = callbackIsOk ? '😎' : '☹️'
        if (divFeedback && callbackFeedback !== '') {
          divFeedback.innerHTML = callbackFeedback
          divFeedback.style.display = 'block'
        }

        return {
          isOk: callbackIsOk,
          feedback: callbackFeedback,
          score: callbackScore,
        }
      } catch (error) {
        if (spanResultat) spanResultat.innerHTML = '☹️'
        const callbackErrorFeedback = `Erreur dans le vérificateur Blockly ${callbackName}`
        if (divFeedback) {
          divFeedback.innerHTML = callbackErrorFeedback
          divFeedback.style.display = 'block'
        }
        window.notify(callbackErrorFeedback, { error, callbackName })
        return {
          isOk: false,
          feedback: callbackErrorFeedback,
          score: { nbBonnesReponses: 0, nbReponses: 1 },
        }
      }
    }

    if (expectedSolution == null) {
      if (spanResultat) spanResultat.innerHTML = '☹️'
      if (divFeedback) {
        divFeedback.innerHTML = 'Réponse attendue invalide.'
        divFeedback.style.display = 'block'
      }
      return {
        isOk: false,
        feedback: 'Réponse attendue invalide.',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }

    const normalizedStudent = BlocklyEditor.normalizeWorkspaceJson(studentJson)
    const normalizedSolution =
      BlocklyEditor.normalizeWorkspaceJson(expectedSolution)

    const isOk = normalizedStudent === normalizedSolution
    if (spanResultat) spanResultat.innerHTML = isOk ? '😎' : '☹️'

    const feedback = isOk
      ? ''
      : 'La suite de blocs ne correspond pas à la rédaction attendue (ordre strict).'

    if (divFeedback && feedback !== '') {
      divFeedback.innerHTML = feedback
      divFeedback.style.display = 'block'
    }

    return {
      isOk,
      feedback,
      score: { nbBonnesReponses: isOk ? 1 : 0, nbReponses: 1 },
    }
  }

  connectedCallback() {
    this.hydrateCommonAttributes()
    this.editorHeight = this.getAttribute('height')
    this.editorWidth = this.getAttribute('width')
    this.render()
  }

  disconnectedCallback() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
    if (this.workspace) {
      this.workspace.dispose()
      this.workspace = null
    }
  }

  get value(): string {
    return JSON.stringify(this.getWorkspaceSerialization())
  }

  set value(nextValue: string) {
    try {
      const parsed = JSON.parse(nextValue) as BlocklyWorkspaceJson
      this.loadWorkspace(parsed)
    } catch {
      // Valeur invalide : on ignore sans casser l'interface.
    }
  }

  protected onInteractivityChanged(isOn: boolean): void {
    const overlay = this.querySelector(
      '.blockly-editor-overlay',
    ) as HTMLDivElement | null
    const area = this.querySelector(
      '.blockly-editor-area',
    ) as HTMLDivElement | null
    const injectionDiv = this.querySelector(
      '.injectionDiv',
    ) as HTMLDivElement | null
    if (overlay) {
      overlay.style.display = isOn ? 'none' : 'block'
    }
    if (area) {
      area.style.pointerEvents = isOn ? 'auto' : 'none'
    }
    if (injectionDiv) {
      injectionDiv.style.pointerEvents = isOn ? 'auto' : 'none'
    }
  }

  render() {
    const resolvedWidth = this.editorWidth ?? '100%'
    const resolvedHeight = this.editorHeight ?? '500px'
    const isInteractive = this.interactivityOn
    this.innerHTML = `
      <div class="blockly-editor-wrapper" style="position: relative; width: ${resolvedWidth}; min-height: ${resolvedHeight};">
        <div class="blockly-editor-area" style="width: ${resolvedWidth}; height: ${resolvedHeight}; pointer-events: ${isInteractive ? 'auto' : 'none'};"></div>
        <div class="blockly-editor-overlay" style="display: ${isInteractive ? 'none' : 'block'}; position: absolute; inset: 0; z-index: 1000; pointer-events: auto; background: transparent;"></div>
      </div>
    `

    const area = this.querySelector(
      '.blockly-editor-area',
    ) as HTMLDivElement | null
    if (!area) return

    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
    if (this.workspace) {
      this.workspace.dispose()
      this.workspace = null
    }

    const mediaPath = `${import.meta.env.BASE_URL}blockly/media/`

    this.workspace = Blockly.inject(area, {
      media: mediaPath,
      toolbox: this.getToolboxDefinition(),
      collapse: false,
      comments: false,
      disable: false,
      maxBlocks: Infinity,
      trashcan: false,
      horizontalLayout: false,
      toolboxPosition: 'start',
      css: true,
      rtl: false,
      scrollbars: false,
      sounds: false,
      oneBasedIndex: false,
      readOnly: !this.interactivityOn,
      zoom: {
        controls: isInteractive,
        wheel: false,
        startScale: 0.8,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2,
        pinch: false,
      },
    })

    const initialBlocks = this.getWorkspaceBlocksAttribute('initial-blocks')
    if (initialBlocks) {
      Blockly.serialization.workspaces.load(initialBlocks, this.workspace)
    }

    // Un ResizeObserver (plutôt qu'un simple écouteur sur `window`) est
    // nécessaire car en mode « une page par exercice » les exercices non
    // affichés sont montés dans le DOM masqués via `display: none` (taille
    // 0x0) : le workspace Blockly y est injecté avec une taille nulle et
    // seul un changement de taille de la zone (déclenché quand l'exercice
    // redevient visible) permet de le redimensionner correctement.
    // (ResizeObserver n'existe pas dans l'environnement de test jsdom.)
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.workspace) Blockly.svgResize(this.workspace)
      })
      this.resizeObserver.observe(area)
    }
  }

  getWorkspaceSerialization(): BlocklyWorkspaceJson {
    if (!this.workspace) return {}
    return Blockly.serialization.workspaces.save(
      this.workspace,
    ) as BlocklyWorkspaceJson
  }

  private loadWorkspace(workspaceJson: BlocklyWorkspaceJson): void {
    if (!this.workspace) return
    this.workspace.clear()
    Blockly.serialization.workspaces.load(workspaceJson, this.workspace)
  }

  private getToolboxDefinition(): Blockly.utils.toolbox.ToolboxDefinition {
    const raw = this.getAttribute('toolbox')
    if (!raw) return { kind: 'flyoutToolbox', contents: [] }
    try {
      return JSON.parse(raw) as Blockly.utils.toolbox.ToolboxDefinition
    } catch {
      return { kind: 'flyoutToolbox', contents: [] }
    }
  }

  private getWorkspaceBlocksAttribute(
    attributeName: 'initial-blocks' | 'solution-blocks',
  ): BlocklyWorkspaceJson | null {
    const raw = this.getAttribute(attributeName)
    if (!raw) return null
    try {
      return JSON.parse(raw) as BlocklyWorkspaceJson
    } catch {
      return null
    }
  }

  private static normalizeWorkspaceJson(
    workspaceJson: BlocklyWorkspaceJson,
  ): string {
    const keysToRemove = new Set([
      'id',
      'x',
      'y',
      'languageVersion',
      'collapsed',
      'deletable',
      'movable',
      'editable',
      'enabled',
      'inline',
      'inputsInline',
      'data',
      'extraState',
      'isShadow',
      'disabled',
    ])

    const clean = (value: unknown): unknown => {
      if (Array.isArray(value)) return value.map(clean)
      if (value && typeof value === 'object') {
        const output: Record<string, unknown> = {}
        const entries = Object.entries(value as Record<string, unknown>).sort(
          ([a], [b]) => a.localeCompare(b),
        )
        for (const [key, child] of entries) {
          if (!keysToRemove.has(key)) {
            output[key] = clean(child)
          }
        }
        return output
      }
      return value
    }

    return JSON.stringify(clean(workspaceJson))
  }

  private static getTopBlocks(
    workspaceJson: BlocklyWorkspaceJson,
  ): Array<Record<string, unknown>> {
    const root = workspaceJson.blocks as Record<string, unknown> | undefined
    const blocks = root?.blocks
    return Array.isArray(blocks)
      ? (blocks as Array<Record<string, unknown>>)
      : []
  }

  private static collectBlockTypes(
    blocks: Array<Record<string, unknown>>,
  ): string[] {
    const types: string[] = []

    const walkBlock = (block: Record<string, unknown>) => {
      const type = block.type
      if (typeof type === 'string') types.push(type)

      const next = block.next as Record<string, unknown> | undefined
      const nextBlock = next?.block as Record<string, unknown> | undefined
      if (nextBlock) walkBlock(nextBlock)

      const inputs = block.inputs as Record<string, unknown> | undefined
      if (!inputs) return
      for (const value of Object.values(inputs)) {
        const inputObj = value as Record<string, unknown>
        const child = inputObj?.block as Record<string, unknown> | undefined
        if (child) walkBlock(child)
      }
    }

    for (const block of blocks) {
      walkBlock(block)
    }
    return types
  }

  static registerVerificationCallback(
    name: string,
    callback: BlocklyEditorVerificationCallback,
  ): void {
    if (name.trim().length === 0) {
      throw new Error('Le nom du vérificateur Blockly ne peut pas être vide')
    }
    BlocklyEditor.verificationCallbacks.set(name, callback)
  }

  static unregisterVerificationCallback(name: string): void {
    BlocklyEditor.verificationCallbacks.delete(name)
  }
}

export function addBloklyEditor(
  exercice: IExercice,
  questionIndex: number,
  options: BlocklyEditorOptions,
): string {
  return BlocklyEditor.create({
    numeroExercice: exercice.numeroExercice,
    questionIndex,
    options,
  })
}

registerMathaleaCustomElement(BlocklyEditor)
