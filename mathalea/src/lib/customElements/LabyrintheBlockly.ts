import type * as BlocklyType from 'blockly/core'
import type { javascriptGenerator as JsGen } from 'blockly/javascript'
import { loadBlockly } from '../blockly/loader'
import { bleuMathalea } from '../colors'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

type Edge = { from: number[]; to: number[] }

export type LabyrintheBlocklyOptions = {
  graphId: string
  cols: number
  rows: number
  start: [number, number]
  end: [number, number]
  path: number[][]
  edges: Edge[]
  villeParCoord: string[][]
  interactif?: boolean
}

let Blockly!: typeof BlocklyType
let javascriptGenerator!: typeof JsGen

declare module 'blockly/core' {
  interface Workspace {
    idkey?: string
  }
}
/**
 * @author Jean-Claude Lhote
 */
export class LabyrintheBlocklyElement extends MathaleaCustomElement {
  static readonly elementTag = 'labyrinthe-blockly'

  private options: LabyrintheBlocklyOptions | null = null
  private workspace: BlocklyType.WorkspaceSvg | null = null
  private orientation = { angle: 0 }
  private pos = { x: 0, y: 0 }
  private positions: Record<string, [number, number]> = {}
  private readonly scale = 1.2
  private boundListeners: Array<() => void> = []
  private setupPromise: Promise<void> | null = null

  static create(options: LabyrintheBlocklyOptions): string {
    return super.create({
      id: `${LabyrintheBlocklyElement.elementTag}${options.graphId}`,
      options,
      interactivityOn: options.interactif ?? true,
    })
  }

  connectedCallback() {
    this.hydrateCommonAttributes()
    this.options = this.readOptions()
    this.render()
    this.setupPromise = this.setupBlockly()
    document.addEventListener('questionDisplay', this.resizeBlockly)
  }

  disconnectedCallback() {
    document.removeEventListener('questionDisplay', this.resizeBlockly)
    this.removeBoundListeners()
    this.workspace?.dispose()
    this.workspace = null
    super.disconnectedCallback()
  }

  get value(): string {
    return this.workspace ? exportBlocklyJSONUltraLight(this.workspace) : ''
  }

  check(): boolean {
    this.runCode()
    return this.isSolved()
  }

  render() {
    if (!this.options) return
    const { graphId, interactif } = this.options
    this.orientation.angle = 0
    this.pos = { x: this.options.start[0], y: this.options.start[1] }
    this.innerHTML = `
      <div id="${graphId}">
        <div class="svgContainer" style="display: inline-block">
          ${this.buildGraphSvg()}
          <br>
        </div>
        ${this.buildToolbox()}
        <div>
          <button id="runCode" class="px-6 py-2.5" style="display:none">▶️ Exécuter</button>
          <button id="runCodeWithDelay" class="px-6 py-2.5" ${interactif ? 'style="display:none"' : ''}>▶️ Exécuter (pas à pas)</button>
          <button id="resetWorkspace" class="px-6 py-2.5" ${interactif ? 'style="display:none"' : ''}>♻️ Reinit programme</button>
          <button id="resetRobot" class="px-6 py-2.5" ${interactif ? 'style="display:none"' : ''}>🔁 Reinit bus</button>
          <button id="showSolution" class="px-6 py-2.5" style="display:none">💡 Show solution</button>
          <div id="message-correct" style="display: none; margin: 10px; font-weight: bold; color: green; font-size: 1.2em;">🎉 Bravo, le bus est bien arrivé !</div>
          <div id="message-faux" style="display: none; margin: 10px; font-weight: bold; color: red; font-size: 1.2em;">❌ Attention, le bus n'est pas arrivé à sa destination finale!</div>
          <style>@keyframes blink { 50% { opacity: 0; } }</style>
          <div id="message-encours" style="animation: blink 1s step-start infinite; display: none; margin: 10px; font-weight: bold; font-size: 1.2em;">En cours d'exécution...</div>
          <div id="blocklyDiv${graphId}" style="height:300px;width:100%"></div>
        </div>
      </div>
    `
  }

  private readOptions(): LabyrintheBlocklyOptions | null {
    const raw = this.getAttribute('options')
    if (!raw) return null
    try {
      return JSON.parse(raw) as LabyrintheBlocklyOptions
    } catch {
      return null
    }
  }

  private buildToolbox(): string {
    return `
      <xml id="toolbox" style="display: none">
        <category name="Déplacement">
          <block type="move_forward"></block>
          <block type="turn_left"></block>
          <block type="turn_right"></block>
        </category>
        <category name="Contrôle">
          <block type="start"></block>
          <block type="controls_repeat_ext">
            <value name="TIMES"><shadow type="math_number"><field name="NUM">2</field></shadow></value>
          </block>
        </category>
      </xml>
    `
  }

  private buildGraphSvg(): string {
    if (!this.options) return ''
    const { graphId, cols, rows, start, end, edges, path, villeParCoord } =
      this.options
    const svgWidth = cols * 100
    const svgHeight = rows * 100
    this.positions = {}
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        this.positions[`${x},${y}`] = [x * 100 + 50, y * 100 + 50]
      }
    }

    const lines: string[] = []
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const [cx, cy] = this.positions[`${x},${y}`]
        for (const [dx, dy] of [
          [1, 0],
          [0, 1],
        ]) {
          const nx = x + dx
          const ny = y + dy
          if (nx < cols && ny < rows) {
            const [ncx, ncy] = this.positions[`${nx},${ny}`]
            lines.push(
              `<line x1="${cx}" y1="${cy}" x2="${ncx}" y2="${ncy}" stroke="black" stroke-width="1"></line>`,
            )
          }
        }
      }
    }

    const nodes: string[] = []
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const [cx, cy] = this.positions[`${x},${y}`]
        const fill =
          x === start[0] && y === start[1]
            ? 'green'
            : x === end[0] && y === end[1]
              ? bleuMathalea
              : '#ccc'
        nodes.push(
          `<ellipse cx="${cx}" cy="${cy}" rx="40" ry="20" fill="${fill}"></ellipse>`,
          `<text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="12">${removeFirstWord(villeParCoord[x][y] || 'Ville inconnue')}</text>`,
        )
      }
    }

    const pathLines = path.slice(0, -1).map((point, index) => {
      const [x1, y1] = this.positions[`${point[0]},${point[1]}`]
      const next = path[index + 1]
      const [x2, y2] = this.positions[`${next[0]},${next[1]}`]
      return this.drawArrow(x1, y1, x2, y2, graphId)
    })
    const [px, py] = this.positions[`${start[0]},${start[1]}`]
    const _edges = edges
    void _edges
    return `
      <svg class="mathalea2d" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg" style="border: 1px solid black; display: inline-block">
        <defs>
          <marker id="arrowhead${graphId}" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth" viewBox="0 0 6 6">
            <path d="M 0 0 L 6 3 L 0 6 L 2 3 Z" fill="red"></path>
          </marker>
        </defs>
        ${lines.join('\n')}
        ${nodes.join('\n')}
        <path id="robot" d="M -8,-2 L 4,-2 L 4,-6 L 12,0 L 4,6 L 4,2 L -8,2 Z" fill="grey" stroke="red" transform="translate(${px}, ${py}) rotate(0) scale(${this.scale})"></path>
        ${pathLines.join('\n')}
      </svg>
    `
  }

  private drawArrow(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    graphId: string,
  ): string {
    const rx = 40
    const ry = 20
    const angle = Math.atan2(y2 - y1, x2 - x1)
    const startX = x1 + rx * Math.cos(angle)
    const startY = y1 + ry * Math.sin(angle)
    const endX = x2 - rx * Math.cos(angle)
    const endY = y2 - ry * Math.sin(angle)
    return `<line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="red" stroke-width="2" marker-end="url(#arrowhead${graphId})"></line>`
  }

  private async setupBlockly() {
    if (!this.options) return
    ;({ Blockly, javascriptGenerator } = await loadBlockly())
    this.defineBlocks()
    this.bindControls()
    const toolboxElement = this.querySelector('#toolbox')
    const blocklyDiv = this.querySelector(`#blocklyDiv${this.options.graphId}`)
    if (!toolboxElement || !(blocklyDiv instanceof HTMLElement)) return

    this.workspace?.dispose()
    const mediaPath = `${import.meta.env.BASE_URL}blockly/media/`
    this.workspace = Blockly.inject(blocklyDiv, {
      media: mediaPath,
      toolbox: toolboxElement,
      sounds: false,
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.8,
        maxScale: 2.5,
        minScale: 0.3,
        scaleSpeed: 1.2,
        pinch: false,
      },
    })
    this.workspace.idkey = `blocklyDiv${this.options.graphId}`
    this.loadStartBlock()
    Blockly.ContextMenuRegistry.registry.reset()
    const zoomControls = this.querySelector('.blocklyZoomReset')
    if (zoomControls) (zoomControls as HTMLElement).style.display = 'none'
    this.resizeBlockly()
  }

  private defineBlocks() {
    Blockly.Msg['CONTROLS_REPEAT_TITLE'] = 'répéter %1 fois'
    Blockly.Msg['CONTROLS_REPEAT_INPUT_DO'] = 'faire'
    if (!Blockly.Blocks['start']) {
      Blockly.defineBlocksWithJsonArray([
        {
          type: 'start',
          message0: 'Démarrer',
          nextStatement: null,
          colour: 20,
          hat: 'true',
        },
        {
          type: 'move_forward',
          message0: 'avancer',
          previousStatement: null,
          nextStatement: null,
          colour: 160,
        },
        {
          type: 'turn_left',
          message0: 'tourner à gauche',
          previousStatement: null,
          nextStatement: null,
          colour: 210,
        },
        {
          type: 'turn_right',
          message0: 'tourner à droite',
          previousStatement: null,
          nextStatement: null,
          colour: 210,
        },
      ])
    }

    javascriptGenerator.forBlock['start'] = (block: BlocklyType.Block) =>
      javascriptGenerator.statementToCode(block, '')
    javascriptGenerator.forBlock['move_forward'] = () => 'avancer();\n'
    javascriptGenerator.forBlock['turn_left'] = () => 'tourner(-1);\n'
    javascriptGenerator.forBlock['turn_right'] = () => 'tourner(1);\n'
  }

  private bindControls() {
    this.removeBoundListeners()
    this.bind('#btn-av', 'click', () => this.avancer())
    this.bind('#btn-left', 'click', () => this.tourner(-1))
    this.bind('#btn-right', 'click', () => this.tourner(1))
    this.bind('#resetRobot', 'click', () => this.resetRobot())
    this.bind('#resetWorkspace', 'click', () => this.resetWorkspace())
    this.bind('#showSolution', 'click', () => this.createSolution())
    this.bind('#runCode', 'click', () => this.runCode())
    this.bind('#runCodeWithDelay', 'click', () => void this.runCodeWithDelay())
  }

  private bind(selector: string, type: string, listener: EventListener) {
    const element = this.querySelector(selector)
    if (!element) return
    element.addEventListener(type, listener)
    this.boundListeners.push(() => element.removeEventListener(type, listener))
  }

  private removeBoundListeners() {
    this.boundListeners.forEach((destroy) => destroy())
    this.boundListeners = []
  }

  private readonly resizeBlockly = (event?: Event) => {
    if (event instanceof CustomEvent && this.options?.graphId != null) {
      const uuid = event.detail?.uuid
      if (uuid != null && uuid !== 'f320c') return
    }
    if (this.workspace && this.workspace.getInjectionDiv().offsetParent) {
      Blockly.svgResize(this.workspace)
    }
  }

  private loadStartBlock() {
    if (!this.workspace) return
    const startXml =
      '<xml xmlns="https://developers.google.com/blockly/xml"><block type="start" deletable="false" movable="false" x="10" y="5"></block></xml>'
    Blockly.Xml.domToWorkspace(
      Blockly.utils.xml.textToDom(startXml),
      this.workspace,
    )
  }

  private resetWorkspace() {
    if (!this.workspace) return
    this.workspace.clear()
    this.loadStartBlock()
  }

  private ajouterBlocALaSuite(type: string) {
    if (!this.workspace) return
    const topBlocks = this.workspace.getTopBlocks(true)
    if (topBlocks.length === 0) return
    let lastBlock = topBlocks[0]
    while (lastBlock.getNextBlock()) {
      const next = lastBlock.getNextBlock()
      if (!next) break
      lastBlock = next
    }
    const childBlock = Blockly.serialization.blocks.append(
      { type },
      this.workspace,
    )
    if (lastBlock.nextConnection && childBlock.previousConnection) {
      lastBlock.nextConnection.connect(childBlock.previousConnection)
    }
  }

  private avancer() {
    if (this.orientation.angle === 0) this.moveDir(1, 0)
    else if (this.orientation.angle === 90) this.moveDir(0, 1)
    else if (this.orientation.angle === 180) this.moveDir(-1, 0)
    else if (this.orientation.angle === 270) this.moveDir(0, -1)
  }

  private tourner(num: number) {
    if (num === 1) {
      this.orientation.angle = (this.orientation.angle + 90) % 360
    } else {
      this.orientation.angle = (this.orientation.angle - 90 + 360) % 360
    }
    this.rotate(this.orientation.angle)
  }

  private moveDir(dx: number, dy: number): boolean {
    if (!this.options) return false
    const target = [this.pos.x + dx, this.pos.y + dy]
    const exists = this.options.edges.find(
      (edge) =>
        edge.from[0] === this.pos.x &&
        edge.from[1] === this.pos.y &&
        edge.to[0] === target[0] &&
        edge.to[1] === target[1],
    )
    if (!exists) return false
    this.pos.x += dx
    this.pos.y += dy
    const [cx, cy] = this.positions[`${this.pos.x},${this.pos.y}`]
    this.robot?.setAttribute(
      'transform',
      `translate(${cx}, ${cy}) rotate(${this.orientation.angle}) scale(${this.scale})`,
    )
    return true
  }

  private rotate(angle: number) {
    const transform = this.robot?.getAttribute('transform') || ''
    this.robot?.setAttribute(
      'transform',
      transform.replace(/rotate\(\d+\)/, `rotate(${angle})`),
    )
  }

  private get robot(): SVGPathElement | null {
    return this.querySelector('#robot')
  }

  private resetRobot() {
    if (!this.options) return
    const [px, py] =
      this.positions[`${this.options.start[0]},${this.options.start[1]}`]
    this.pos.x = this.options.start[0]
    this.pos.y = this.options.start[1]
    this.orientation.angle = 0
    this.robot?.setAttribute(
      'transform',
      `translate(${px}, ${py}) rotate(0) scale(${this.scale})`,
    )
    this.hideMessage('#message-correct')
    this.hideMessage('#message-faux')
  }

  private runCode() {
    if (!this.workspace) return
    this.resetRobot()
    javascriptGenerator.init(this.workspace)
    const startBlock = this.workspace
      .getTopBlocks(true)
      .find((block) => block.type === 'start')
    if (!startBlock) {
      alert('Ajoutez un bloc "Démarrer"')
      return
    }
    let code = javascriptGenerator.blockToCode(startBlock)
    if (Array.isArray(code)) code = code[0]
    try {
      const avancer = () => this.avancer()
      const tourner = (direction: number) => this.tourner(direction)

      new Function('avancer', 'tourner', String(code))(avancer, tourner)
    } catch (error) {
      console.error(error)
    }
    this.hideMessage('#message-encours')
    this.showResultMessage()
  }

  private async runCodeWithDelay() {
    if (!this.workspace) return
    this.resetRobot()
    javascriptGenerator.init(this.workspace)
    const startBlock = this.workspace
      .getTopBlocks(true)
      .find((block) => block.type === 'start')
    if (!startBlock) {
      alert('Ajoutez un bloc "Démarrer"')
      return
    }
    let code = javascriptGenerator.blockToCode(startBlock)
    if (Array.isArray(code)) code = code[0]
    this.hideMessage('#message-correct')
    this.hideMessage('#message-faux')
    this.showMessage('#message-encours')
    try {
      const avancer = () => this.avancer()
      const tourner = (direction: number) => this.tourner(direction)
      const sleep = (ms: number) =>
        new Promise((resolve) => window.setTimeout(resolve, ms))
      const delayedCode = String(code)
        .split('\n')
        .filter((line) => line.trim() !== '')
        .map((line) => `${line}\nawait sleep(1000);`)
        .join('\n')

      await new Function(
        'avancer',
        'tourner',
        'sleep',
        `return (async () => { ${delayedCode} })()`,
      )(avancer, tourner, sleep)
    } catch (error) {
      console.error(error)
    }
    this.hideMessage('#message-encours')
    this.showResultMessage()
  }

  private showResultMessage() {
    if (this.isSolved()) this.showMessage('#message-correct')
    else this.showMessage('#message-faux')
  }

  private isSolved() {
    const lastEdge = this.options?.edges.at(-1)
    if (!lastEdge) return false
    return this.pos.x === lastEdge.to[0] && this.pos.y === lastEdge.to[1]
  }

  private createSolution() {
    if (!this.options) return
    this.resetRobot()
    this.resetWorkspace()
    for (const instruction of createSolutionStr(this.options.edges)) {
      const type = instruction.split('-')[0]
      this.ajouterBlocALaSuite(type)
    }
    this.orientation.angle = 0
  }

  private showMessage(selector: string) {
    const element = this.querySelector<HTMLElement>(selector)
    if (element) element.style.display = 'block'
  }

  private hideMessage(selector: string) {
    const element = this.querySelector<HTMLElement>(selector)
    if (element) element.style.display = 'none'
  }
}

function exportBlocklyJSONUltraLight(workspace: BlocklyType.Workspace): string {
  const fullJson = Blockly.serialization.workspaces.save(workspace)
  const keysToRemove = new Set([
    'id',
    'x',
    'y',
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

  const clean = (obj: unknown): unknown => {
    if (Array.isArray(obj)) return obj.map(clean)
    if (obj && typeof obj === 'object') {
      const cleaned: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(obj)) {
        if (!keysToRemove.has(key)) cleaned[key] = clean(value)
      }
      return cleaned
    }
    return obj
  }

  return JSON.stringify(clean(fullJson), null, 2)
}

function removeFirstWord(city: string) {
  const town = city.replace(/^(les|la|le|l’|l')\s*/i, '').trim()
  return town.charAt(0).toUpperCase() + town.slice(1).toLowerCase()
}

function createSolutionStr(edges: Edge[]): string[] {
  const orientation = { angle: 0 }
  const result: string[] = []
  for (const edge of edges) {
    const dx = edge.to[0] - edge.from[0]
    const dy = edge.to[1] - edge.from[1]
    if (dx === 1 && dy === 0) {
      if (orientation.angle === 0) result.push('move_forward-Avancer')
      else if (orientation.angle === 270) {
        result.push('turn_right-Tourner à droite', 'move_forward-Avancer')
        orientation.angle = 0
      } else if (orientation.angle === 180) {
        result.push(
          'turn_left-Tourner à gauche',
          'turn_left-Tourner à gauche',
          'move_forward-Avancer',
        )
        orientation.angle = 0
      } else if (orientation.angle === 90) {
        result.push('turn_left-Tourner à gauche', 'move_forward-Avancer')
        orientation.angle = 0
      }
    } else if (dx === -1 && dy === 0) {
      if (orientation.angle === 180) result.push('move_forward-Avancer')
      else if (orientation.angle === 0) {
        result.push(
          'turn_left-Tourner à gauche',
          'turn_left-Tourner à gauche',
          'move_forward-Avancer',
        )
        orientation.angle = 180
      } else if (orientation.angle === 90) {
        result.push('turn_right-Tourner à droite', 'move_forward-Avancer')
        orientation.angle = 180
      } else if (orientation.angle === 270) {
        result.push('turn_left-Tourner à gauche', 'move_forward-Avancer')
        orientation.angle = 180
      }
    } else if (dx === 0 && dy === 1) {
      if (orientation.angle === 90) result.push('move_forward-Avancer')
      else if (orientation.angle === 0) {
        result.push('turn_right-Tourner à droite', 'move_forward-Avancer')
        orientation.angle = 90
      } else if (orientation.angle === 180) {
        result.push('turn_left-Tourner à gauche', 'move_forward-Avancer')
        orientation.angle = 90
      } else if (orientation.angle === 270) {
        result.push(
          'turn_left-Tourner à gauche',
          'turn_left-Tourner à gauche',
          'move_forward-Avancer',
        )
      }
    } else if (dx === 0 && dy === -1) {
      if (orientation.angle === 270) result.push('move_forward-Avancer')
      else if (orientation.angle === 0) {
        result.push('turn_left-Tourner à gauche', 'move_forward-Avancer')
        orientation.angle = 270
      } else if (orientation.angle === 90) {
        result.push(
          'turn_left-Tourner à gauche',
          'turn_left-Tourner à gauche',
          'move_forward-Avancer',
        )
        orientation.angle = 270
      } else if (orientation.angle === 180) {
        result.push('turn_right-Tourner à droite', 'move_forward-Avancer')
        orientation.angle = 270
      }
    }
  }
  return result
}

registerMathaleaCustomElement(LabyrintheBlocklyElement)
