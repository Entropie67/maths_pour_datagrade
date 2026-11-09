import { renderMathInElement } from 'mathlive'
import seedrandom from 'seedrandom'
import { tex2typst } from 'tex2typst'
import { context } from '../../modules/context'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

/**
 * Types du modèle, du moteur de rendu et du snapshot pour le composant Labyrinthe.
 * L'objectif est de séparer strictement la logique métier (modèle) du rendu (DOM),
 * au moyen d'un snapshot immuable échangé entre ces deux couches.
 * Ce fichier ne contient que des définitions de types et d'interfaces (aucune logique d'exécution).
 */

/**
 * Orientation globale du chemin à générer.
 */
export type Orientation = 'horizontal' | 'vertical'

/**
 * Coordonnées d'une cellule (ligne/colonne, indexées à partir de 0).
 */
export interface Coords {
  row: number
  col: number
}

/**
 * État d'une cellule tel qu'utilisé par le modèle et transmis au renderer.
 * - isGood: appartient au bon chemin
 * - clicked: a été cliquée par l'utilisateur
 * - text: contenu textuel/LaTeX à afficher (optionnel si non encore fourni)
 */
export interface CellState {
  isGood: boolean
  clicked: boolean
  text?: string
}

/**
 * Grille de cellules.
 */
export type CellGrid = CellState[][]

/**
 * Représentation sérialisée de l'état utilisateur.
 * Exemple actuel: "r-c|r-c|..." (p. ex. "0-1|2-3").
 * Cette représentation est interne et peut évoluer.
 */
export type SerializedState = string

/**
 * Données complètes et immuables décrivant l'état du jeu et de la grille.
 * Le renderer consomme uniquement ce snapshot pour produire le DOM.
 */
export interface GameSnapshot {
  seed: string | null
  orientation: Orientation
  rows: number
  cols: number
  start: Coords
  end: Coords
  grid: CellGrid

  // État de partie
  win: boolean
  gameOver: boolean
  correctClicks: number
  badAnswers: number
}

/**
 * Détail de l'événement de fin de partie émis par le Custom Element.
 */
export interface GameEndDetail {
  win: boolean
  correctClicks: number
  totalGood: number
  totalBad: number
  state: SerializedState
}

/**
 * Options de configuration du modèle.
 */
export interface ModelConfig {
  seed?: string | null
  orientation?: Orientation
  rows?: number
  cols?: number
  width?: number | null
  height?: number | null
}

/**
 * Interface du moteur de rendu mathématique (ex: KaTeX, MathLive, ...).
 * Le renderer DOM peut déléguer la composition mathématique via cette interface.
 */
export interface LatexOptions {
  correction?: boolean
  align?: 'c' | 'l' | 'r'
  borders?: boolean
  rowSeparators?: boolean
}

export interface MathRenderer {
  typeset(root: Element | ShadowRoot): void
}

/**
 * Interface du renderer DOM (sans logique métier).
 * Il ne fait que projeter un snapshot dans le Shadow DOM.
 */
export interface LabyrintheRenderer {
  /**
   * Construit/Met à jour la vue en fonction du snapshot.
   * @param width Largeur optionnelle d'une cellule en em
   * @param height Hauteur optionnelle d'une cellule en em
   */
  render(
    root: ShadowRoot,
    snapshot: GameSnapshot,
    width?: number | null,
    height?: number | null,
  ): void

  /**
   * Affiche la correction visuelle (met en évidence toutes les bonnes cases).
   */
  showCorrection(root: ShadowRoot, snapshot: GameSnapshot): void

  /**
   * Active/Désactive l'interaction visuelle (accessibilité, pointeurs, etc.).
   */
  setDisabled(root: ShadowRoot, disabled: boolean): void
}

/**
 * Interface du modèle (logique métier pure, sans DOM).
 * Il gère la génération du chemin, l'état de jeu, la sérialisation et le contenu.
 */
export interface LabyrintheModel {
  /**
   * Met à jour la configuration (seed, orientation, dimensions, ...).
   */
  configure(opts: ModelConfig): void

  /**
   * Régénère une nouvelle grille/chemin selon la configuration courante.
   * Remet à zéro l'état de partie (clics, victoire/défaite).
   */
  regenerate(): void

  /**
   * Enregistre les bonnes et mauvaises valeurs qui seront distribuées dans la grille.
   * Le modèle associe ces valeurs aux cellules selon le masque du chemin.
   */
  setValues(good: string[], bad: string[]): void

  /**
   * Applique le clic utilisateur sur une cellule.
   */
  clickCell(row: number, col: number): void

  /**
   * Expose un snapshot immuable de l'état courant.
   */
  snapshot(): GameSnapshot

  /**
   * Sérialise l'état utilisateur (au format interne).
   */
  serializeState(): SerializedState

  /**
   * Restaure l'état utilisateur depuis une chaîne sérialisée.
   */
  restoreState(state: SerializedState): void

  /**
   * Métriques utiles (dérivables mais souvent demandées).
   */
  numberOfGoodAnswers(): number
  numberOfIncorrectAnswers(): number

  // LaTeX export helpers
  generateLatex(options?: LatexOptions): string
  generateLatexCorrection(options?: Omit<LatexOptions, 'correction'>): string

  // Deterministic random number generation (uses seeded RNG if available)
  randomInt(min: number, max: number): number
  random(): number
}

/**
 * Implémentation pure (sans DOM) du modèle de labyrinthe.
 * - Génère un chemin unique (8-voisins) entre deux bords selon l'orientation.
 * - Gère l'état de jeu: clics, victoire/défaite.
 * - Sérialise/Restaure l'état utilisateur indépendamment du DOM.
 * - Distribue les valeurs (bonnes/mauvaises) dans la grille.
 */
export class Labyrinthe implements LabyrintheModel {
  private rows: number = 8
  private cols: number = 8

  private seed: string | null = null
  private rnd: () => number = Math.random

  // Expose a seeded random generator for deterministic value generation
  private valuesRnd: (() => number) | null = null

  // 'random' permet de tirer l'orientation à chaque génération
  private orientationMode: Orientation | 'random' = 'random'
  private lastOrientation: Orientation = 'vertical'

  private start: Coords = { row: 0, col: 0 }
  private end: Coords = { row: 0, col: 0 }

  private grid: CellGrid = []
  private correctClicks: number = 0
  private badClicks: number = 0
  private win: boolean = false
  private gameOver: boolean = false

  private goodAnswers: string[] = []
  private badAnswers: string[] = []

  // Dimensions des cellules en em
  private width: number | null = null
  private height: number | null = null

  constructor(opts?: ModelConfig) {
    if (opts) this.configure(opts)
    // Ne pas régénérer automatiquement - laissez l'appelant le faire explicitement
    // Cela évite les régénérations multiples non-déterministes
  }

  get cellWidth(): number | null {
    return this.width
  }

  get cellHeight(): number | null {
    return this.height
  }

  configure(opts: ModelConfig): void {
    if (opts.seed !== undefined) {
      this.seed = opts.seed ?? null
      this.rnd = this.seed != null ? seedrandom(this.seed) : Math.random
      // Create a separate RNG for values generation with a derived seed
      this.valuesRnd =
        this.seed != null ? seedrandom(this.seed + '-values') : null
    }
    if (opts.orientation !== undefined) {
      this.orientationMode = opts.orientation
    }
    if (opts.rows !== undefined) {
      const n = Math.floor(Number(opts.rows))
      if (Number.isFinite(n) && n > 0) this.rows = n
    }
    if (opts.cols !== undefined) {
      const n = Math.floor(Number(opts.cols))
      if (Number.isFinite(n) && n > 0) this.cols = n
    }
    if (opts.width !== undefined) {
      this.width = opts.width
    }
    if (opts.height !== undefined) {
      this.height = opts.height
    }
  }

  regenerate(): void {
    // Réinitialise l'état de jeu
    this.correctClicks = 0
    this.badClicks = 0
    this.win = false
    this.gameOver = false

    // IMPORTANT: Réinitialiser le RNG pour garantir le déterminisme
    // Chaque appel à regenerate() avec le même seed doit produire le même labyrinthe
    if (this.seed != null) {
      this.rnd = seedrandom(this.seed)
      // Reset the values RNG as well for deterministic value generation
      this.valuesRnd = seedrandom(this.seed + '-values')
    }

    // Génère un masque de chemin (0/1) puis convertit en grille de CellState
    const { mask, start, end, orientation } = this.generateNewPathMask()
    this.start = start
    this.end = end
    this.lastOrientation = orientation

    this.grid = Array(this.rows)
      .fill(0)
      .map((_, r) =>
        Array(this.cols)
          .fill(0)
          .map((__, c): CellState => ({
            isGood: mask[r][c] === 1,
            clicked: false,
            text: '',
          })),
      )

    // Redistribue les valeurs si elles ont été fournies auparavant
    // (mais seulement si on a effectivement des valeurs à distribuer)
    if (this.goodAnswers.length > 0 || this.badAnswers.length > 0) {
      this.assignValuesToGrid()
    }
  }

  setValues(good: string[], bad: string[]): void {
    this.goodAnswers = Array.isArray(good) ? good.map(String) : []
    this.badAnswers = Array.isArray(bad) ? bad.map(String) : []
    this.assignValuesToGrid()
  }

  clickCell(row: number, col: number): void {
    if (this.gameOver) return
    if (!this.inBounds(row, col)) return

    const cell = this.grid[row][col]
    if (cell.clicked) return

    cell.clicked = true
    if (cell.isGood) {
      this.correctClicks++
      // On considère que le joueur n'a pas besoin de cliquer Départ/Arrivée pour gagner.
      // Donc win si toutes les bonnes cases sauf 2 (Départ/Arrivée) ont été trouvées.
      if (this.correctClicks >= this.numberOfGoodAnswers() - 2) {
        this.win = true
        this.gameOver = true
      }
    } else {
      this.badClicks++
      this.win = false
      this.gameOver = true
    }
  }

  snapshot(): GameSnapshot {
    return {
      seed: this.seed,
      orientation: this.lastOrientation,
      rows: this.rows,
      cols: this.cols,
      start: { ...this.start },
      end: { ...this.end },
      grid: this.cloneGrid(this.grid),

      win: this.win,
      gameOver: this.gameOver,
      correctClicks: this.correctClicks,
      badAnswers: this.badClicks,
    }
  }

  serializeState(): SerializedState {
    // Format JSON compact :
    //  - c: correct clicks
    //  - b: bad clicks
    //  - g: matrice 0/1 des clics utilisateur
    const clicked = this.grid.map((row) => row.map((c) => (c.clicked ? 1 : 0)))
    return JSON.stringify({
      c: this.correctClicks,
      b: this.badClicks,
      g: clicked,
    })
  }

  restoreState(state: SerializedState): void {
    try {
      const parsed = JSON.parse(state)
      const g = parsed?.g
      if (Array.isArray(g)) {
        for (let r = 0; r < this.rows; r++) {
          for (let c = 0; c < this.cols; c++) {
            const v = g?.[r]?.[c]
            this.grid[r][c].clicked = v === 1
          }
        }
      }

      // Recalcule les compteurs à partir de la grille (source de vérité)
      let correct = 0
      let wrong = 0
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const cell = this.grid[r][c]
          if (cell.clicked) {
            if (cell.isGood) correct++
            else wrong++
          }
        }
      }
      this.correctClicks = correct
      this.badClicks = wrong

      // Déduit la fin de partie: si mauvaise case cliquée -> perdu
      if (wrong > 0) {
        this.win = false
        this.gameOver = true
      } else if (correct >= this.numberOfGoodAnswers() - 2 && correct > 0) {
        // Si toutes les bonnes (sauf départ/arrivée) sont cliquées -> gagné
        this.win = true
        this.gameOver = true
      } else {
        this.win = false
        this.gameOver = false
      }
    } catch {
      // État invalide: ignorer (pas d'exception)
    }
  }

  numberOfGoodAnswers(): number {
    let count = 0
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid?.[r]?.[c]?.isGood) count++
      }
    }
    return count
  }

  numberOfIncorrectAnswers(): number {
    return this.rows * this.cols - this.numberOfGoodAnswers()
  }

  // ========================
  // Logique de génération
  // ========================

  private generateNewPathMask(): {
    mask: number[][]
    start: Coords
    end: Coords
    orientation: Orientation
  } {
    const MAX_ATTEMPTS = 200
    const orientation = this.chooseOrientation()

    // Stratégie déterministe: on génère tous les chemins possibles avec le même RNG
    // et on retourne le premier succès. Avec le même seed, on aura toujours le même résultat.
    // Note: le RNG a été réinitialisé dans regenerate() pour garantir la reproductibilité.
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const result = this.tryGeneratePathOnce(orientation)
      if (result) return result
    }
    // Fallback: chemin en ligne droite
    return this.generateFallbackStraightPath(orientation)
  }

  private tryGeneratePathOnce(
    orientation: Orientation,
  ): {
    mask: number[][]
    start: Coords
    end: Coords
    orientation: Orientation
  } | null {
    const mask = this.zeroMask()

    // Point de départ
    let currentRow: number
    let currentCol: number
    if (orientation === 'vertical') {
      currentRow = 0
      currentCol = Math.floor(this.rnd() * this.cols)
    } else {
      currentRow = Math.floor(this.rnd() * this.rows)
      currentCol = 0
    }

    mask[currentRow][currentCol] = 1
    const path: Array<[number, number]> = [[currentRow, currentCol]]

    const touchesOnlyCurrent = (
      r: number,
      c: number,
      curR: number,
      curC: number,
    ) => {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          const nr = r + dr
          const nc = c + dc
          if (nr === curR && nc === curC) continue
          if (this.inBounds(nr, nc) && mask[nr][nc] === 1) {
            return false
          }
        }
      }
      return true
    }

    const maxSteps = this.rows * this.cols * 4
    let steps = 0

    while (true) {
      if (++steps > maxSteps) return null

      const neighbors: Array<[number, number]> = []
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          const newRow = currentRow + dr
          const newCol = currentCol + dc
          if (
            this.inBounds(newRow, newCol) &&
            mask[newRow][newCol] === 0 &&
            touchesOnlyCurrent(newRow, newCol, currentRow, currentCol)
          ) {
            neighbors.push([newRow, newCol])
          }
        }
      }

      if (neighbors.length === 0) {
        // retour en arrière : on démarque la case courante
        mask[currentRow][currentCol] = 0
        path.pop()
        if (path.length === 0) return null
        ;[currentRow, currentCol] = path[path.length - 1]
        continue
      }

      // avance vers un voisin aléatoire
      const [nextRow, nextCol] =
        neighbors[Math.floor(this.rnd() * neighbors.length)]
      mask[nextRow][nextCol] = 1
      path.push([nextRow, nextCol])
      ;[currentRow, currentCol] = [nextRow, nextCol]

      // sortie atteinte ?
      if (orientation === 'vertical' && currentRow === this.rows - 1) break
      if (orientation === 'horizontal' && currentCol === this.cols - 1) break
    }

    if (!this.isUniquePath(mask)) return null

    const start: Coords = { row: path[0][0], col: path[0][1] }
    const end: Coords = {
      row: path[path.length - 1][0],
      col: path[path.length - 1][1],
    }

    return { mask, start, end, orientation }
  }

  private generateFallbackStraightPath(orientation: Orientation): {
    mask: number[][]
    start: Coords
    end: Coords
    orientation: Orientation
  } {
    const mask = this.zeroMask()
    if (orientation === 'vertical') {
      const col = Math.floor(this.rnd() * this.cols)
      for (let r = 0; r < this.rows; r++) mask[r][col] = 1
      return {
        mask,
        start: { row: 0, col },
        end: { row: this.rows - 1, col },
        orientation,
      }
    } else {
      const row = Math.floor(this.rnd() * this.rows)
      for (let c = 0; c < this.cols; c++) mask[row][c] = 1
      return {
        mask,
        start: { row, col: 0 },
        end: { row, col: this.cols - 1 },
        orientation,
      }
    }
  }

  // Unicité du chemin:
  // - exactement 2 noeuds de degré 1
  // - tous les autres noeuds de degré 2
  // - composante connexe
  // Les voisins considérés sont les 8-voisins (diagonales incluses),
  // cohérent avec la génération.
  private isUniquePath(mask: number[][]): boolean {
    const key = (r: number, c: number) => `${r},${c}`
    const open = new Set<string>()
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (mask[r][c] === 1) open.add(key(r, c))
      }
    }
    if (open.size < 2) return false

    const inOpen = (r: number, c: number) =>
      this.inBounds(r, c) && open.has(key(r, c))

    const neighbors8 = (r: number, c: number) => {
      const out: Array<[number, number]> = []
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          const nr = r + dr
          const nc = c + dc
          if (inOpen(nr, nc)) out.push([nr, nc])
        }
      }
      return out
    }

    const deg1: Array<[number, number]> = []
    for (const id of open) {
      const [r, c] = id.split(',').map(Number)
      const d = neighbors8(r, c).length
      if (d === 1) deg1.push([r, c])
      else if (d !== 2) return false
    }
    if (deg1.length !== 2) return false

    // vérifie la connexité
    const start = deg1[0]
    const stack = [start]
    const visited = new Set<string>([key(start[0], start[1])])
    while (stack.length) {
      const popped = stack.pop()
      if (!popped) break
      const [r, c] = popped
      for (const [nr, nc] of neighbors8(r, c)) {
        const k = key(nr, nc)
        if (!visited.has(k)) {
          visited.add(k)
          stack.push([nr, nc])
        }
      }
    }
    return visited.size === open.size
  }

  // ========================
  // Helpers internes
  // ========================

  private inBounds(r: number, c: number): boolean {
    return r >= 0 && r < this.rows && c >= 0 && c < this.cols
  }

  private zeroMask(): number[][] {
    return Array(this.rows)
      .fill(0)
      .map(() => Array(this.cols).fill(0))
  }

  private chooseOrientation(): Orientation {
    if (this.orientationMode === 'random') {
      return this.rnd() > 0.5 ? 'vertical' : 'horizontal'
    }
    return this.orientationMode
  }

  private assignValuesToGrid(): void {
    if (!this.grid || this.grid.length === 0) return

    let gi = 0
    let bi = 0
    let emptyCells = 0
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.grid[r][c]
        if (cell.isGood) {
          cell.text = this.goodAnswers?.[gi++] ?? ''
          if (cell.text === '') emptyCells++
        } else {
          cell.text = this.badAnswers?.[bi++] ?? ''
          if (cell.text === '') emptyCells++
        }
      }
    }

    if (emptyCells > 0) {
      console.warn(
        `assignValuesToGrid: ${emptyCells} cellules vides détectées`,
        {
          goodUsed: gi,
          goodAvailable: this.goodAnswers.length,
          badUsed: bi,
          badAvailable: this.badAnswers.length,
        },
      )
    }
  }

  private cloneGrid(grid: CellGrid): CellGrid {
    return grid.map((row) =>
      row.map((c) => ({ isGood: c.isGood, clicked: c.clicked, text: c.text })),
    )
  }

  /**
   * Generate a deterministic random integer between min and max (inclusive).
   * Uses the seeded RNG if available, otherwise falls back to Math.random.
   */
  randomInt(min: number, max: number): number {
    const rng = this.valuesRnd ?? Math.random
    return Math.floor(rng() * (max - min + 1)) + min
  }

  /**
   * Generate a deterministic random number between 0 and 1.
   * Uses the seeded RNG if available, otherwise falls back to Math.random.
   */
  random(): number {
    return this.valuesRnd ? this.valuesRnd() : Math.random()
  }
  private escapeForTabular(s: string): string {
    if (s == null) return ''
    return String(s).replace(/&/g, '\\&').replace(/\r?\n/g, ' ')
  }

  generateLatex(options: LatexOptions = {}): string {
    const {
      correction = false,
      align = 'c',
      borders = true,
      rowSeparators = true,
    } = options
    const snap = this.snapshot()
    const rows = snap.rows
    const cols = snap.cols

    const colSpec = borders
      ? '|' + `${align}|`.repeat(cols)
      : `${align}`.repeat(cols)
    const out: string[] = []
    out.push(`\\begin{tabular}{${colSpec}}`)
    if (rowSeparators) out.push(`\\hline`)

    for (let i = 0; i < rows; i++) {
      const cells: string[] = []
      for (let j = 0; j < cols; j++) {
        const cell = snap.grid?.[i]?.[j]
        const isGood = !!cell?.isGood
        let text = cell?.text ?? ''
        if (correction && isGood) {
          text = `\\textbf{${text}}`
        }

        // Griser le départ/arrivée, et en mode correction griser aussi les bonnes cases
        const isStart = snap.start.row === i && snap.start.col === j
        const isEnd = snap.end.row === i && snap.end.col === j
        const shouldShade = isStart || isEnd || (correction && isGood)

        let cellLatex = this.escapeForTabular(text)
        if (shouldShade) {
          if (cellLatex.trim() === '') {
            cellLatex = `\\cellcolor{gray!20}~`
          } else {
            cellLatex = `\\cellcolor{gray!20}${cellLatex}`
          }
        }

        cells.push(cellLatex)
      }
      if (rowSeparators) {
        out.push(`${cells.join(' & ')} \\\\ \\hline`)
      } else {
        out.push(`${cells.join(' & ')} \\\\`)
      }
    }

    out.push(`\\end{tabular}`)
    return out.join('\n')
  }

  generateLatexCorrection(
    options: Omit<LatexOptions, 'correction'> = {},
  ): string {
    return this.generateLatex({ ...options, correction: true })
  }
}

/**
 * Renderer DOM pour Labyrinthe qui consomme un snapshot pur et le projette dans un ShadowRoot.
 * - Aucune logique métier ici.
 * - Aucun binding d’événements (le contrôleur s’en charge via data-row/data-col).
 * - La composition mathématique est déléguée au MathRenderer fourni (optionnel).
 * @author Rémi Angot
 */
export class DomLabyrintheRenderer implements LabyrintheRenderer {
  private math?: MathRenderer

  constructor(math?: MathRenderer) {
    this.math = math
  }

  render(
    root: ShadowRoot,
    snapshot: GameSnapshot,
    width?: number | null,
    height?: number | null,
  ): void {
    this.ensureStyle(root)
    const container = this.ensureContainer(root)

    // Apply custom width if provided
    if (width != null && width > 0) {
      container.style.setProperty('--cell-width', `${width}em`)
    } else {
      container.style.removeProperty('--cell-width')
    }

    // Apply custom height if provided
    if (height != null && height > 0) {
      container.style.setProperty('--cell-height', `${height}em`)
    } else {
      container.style.removeProperty('--cell-height')
    }

    // Update dynamic grid template via inline styles (repeat() can't use CSS variables reliably)
    container.style.gridTemplateColumns = `repeat(${snapshot.cols}, var(--cell-width))`
    container.style.gridTemplateRows = `repeat(${snapshot.rows}, var(--cell-height))`

    // Clear existing cells
    this.removeGridCells(container)

    // Rebuild cells
    for (let r = 0; r < snapshot.rows; r++) {
      for (let c = 0; c < snapshot.cols; c++) {
        const cellState = snapshot.grid[r]?.[c]
        const cell = document.createElement('div')
        cell.className = 'grid-cell'
        cell.dataset.row = String(r)
        cell.dataset.col = String(c)

        // Start/End markers
        if (snapshot.start.row === r && snapshot.start.col === c) {
          cell.classList.add('start')
        }
        if (snapshot.end.row === r && snapshot.end.col === c) {
          cell.classList.add('end')
        }

        // Clicked state visualization
        if (cellState?.clicked) {
          if (cellState.isGood) cell.classList.add('correct')
          else cell.classList.add('incorrect')
        }

        // Content
        cell.textContent = cellState?.text ?? ''

        container.appendChild(cell)
      }
    }

    // No overlay: game over handled by disabling at component level

    // Delegate math typesetting to the provided renderer (if any)
    this.math?.typeset(container)
  }

  showCorrection(root: ShadowRoot, snapshot: GameSnapshot): void {
    const container = root.querySelector(
      '.grid-container',
    ) as HTMLDivElement | null
    if (!container) return
    for (let r = 0; r < snapshot.rows; r++) {
      for (let c = 0; c < snapshot.cols; c++) {
        const cell = container.querySelector(
          `.grid-cell[data-row="${r}"][data-col="${c}"]`,
        ) as HTMLDivElement | null
        if (!cell) continue
        const isGood = snapshot.grid[r]?.[c]?.isGood
        if (isGood) {
          cell.classList.add('correct')
          cell.classList.remove('incorrect')
        }
      }
    }
  }

  setDisabled(root: ShadowRoot, disabled: boolean): void {
    const container = root.querySelector(
      '.grid-container',
    ) as HTMLDivElement | null
    if (!container) return
    if (disabled) {
      container.classList.add('disabled')
      container.setAttribute('aria-disabled', 'true')
      container.style.opacity = '0.6'
      container.style.pointerEvents = 'none'
    } else {
      container.classList.remove('disabled')
      container.removeAttribute('aria-disabled')
      container.style.opacity = ''
      container.style.pointerEvents = ''
    }
  }

  // Internals

  private ensureStyle(root: ShadowRoot): HTMLStyleElement {
    let style = root.querySelector(
      'style[data-labyrinthe-style="1"]',
    ) as HTMLStyleElement | null
    if (style) return style

    style = document.createElement('style')
    style.setAttribute('data-labyrinthe-style', '1')
    // Les longueurs sont en em, jamais en px ni en vw seuls : le zoom des vues
    // prof, élève et TBI pose une font-size sur le conteneur de l'énoncé (voir
    // resizeContent()), héritée à travers le shadow DOM. Une variable en em se
    // résout sur l'élément qui l'utilise : --cell-radius est donc rapportée à la
    // police de .grid-cell (14px à l'échelle 1), et non à celle de :host.
    style.textContent = `
      :host {
        --cell-width: 4.5em;
        --cell-height: 4.5em;
        --gap: 0.375em;
        --radius: 0.875em;
        --cell-radius: calc(12em / 14);

        --bg-start: #f8fafc; /* slate-50 */
        --bg-end: #eef2f7;   /* subtle */
        --border: 1px solid rgba(2, 6, 23, 0.08);

        --cell-bg-start: #ffffff;
        --cell-bg-end: #f3f6fb;

        --accent: #3b82f6;       /* blue-500 */
        --correct-1: #34d399;    /* emerald-400 */
        --correct-2: #10b981;    /* emerald-500 */
        --incorrect-1: #f87171;  /* red-400 */
        --incorrect-2: #ef4444;  /* red-500 */
        --start-1: #60a5fa;      /* blue-400 */
        --start-2: #3b82f6;      /* blue-500 */
        --end-1: #a78bfa;        /* violet-400 */
        --end-2: #8b5cf6;        /* violet-500 */

        --shadow: 0 6px 16px rgba(2, 6, 23, 0.09), 0 2px 6px rgba(2, 6, 23, 0.05);
        --shadow-hover: 0 10px 24px rgba(2, 6, 23, 0.12), 0 3px 8px rgba(2, 6, 23, 0.06);

        display: inline-block;
        vertical-align: top;
        /* Sur téléphone, la grille utilise aussi la marge à droite de la colonne. */
        max-width: calc(100% + 16px);
      }

      /* Une grille agrandie par le zoom défile dans ce cadre plutôt que de déborder
         de la colonne de l'énoncé. Padding et marges opposés laissent la place à
         l'ombre, que le défilement rognerait, sans décaler la grille. Ils sont
         en px comme l'ombre : en em, le cadre déborderait de la page à fort zoom.
         Pas sur :host, où la remise à zéro de Tailwind les annulerait. */
      .grid-scroller {
        margin: 0 -16px -16px;
        padding: 0 16px 16px;
        overflow-x: auto;
        overflow-y: hidden;
      }

      .grid-container {
        display: grid;
        width: max-content;
        gap: var(--gap);
        margin: 0.5em auto;
        padding: calc(var(--gap) + 0.375em);
        background: linear-gradient(180deg, var(--bg-start) 0%, var(--bg-end) 100%);
        border-radius: var(--radius);
        border: var(--border);
        box-shadow: var(--shadow);
        position: relative;
      }



      .grid-cell {
        /* La taille vient des pistes de la grille : var(--cell-width) donnerait
           ici une autre valeur, car la police de la case diffère de celle de la grille. */
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font: 600 0.875em/1 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, "Helvetica Neue", Arial, "Apple Color Emoji", "Segoe UI Emoji";
        color: #0f172a; /* slate-900 */
        letter-spacing: 0.2px;

        background: linear-gradient(180deg, var(--cell-bg-start) 0%, var(--cell-bg-end) 100%);
        border-radius: var(--cell-radius);
        border: 1px solid rgba(2, 6, 23, 0.08);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.65) inset,
          0 1.5px 3px rgba(2, 6, 23, 0.06);

        cursor: pointer;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;

        transition:
          transform 0.18s ease,
          background 0.25s ease,
          box-shadow 0.25s ease,
          color 0.25s ease,
          border-color 0.25s ease;
      }

      .grid-cell * {
        user-select: none;
        pointer-events: none;
      }

      .grid-cell:hover {
        background: linear-gradient(180deg, #eef2ff 0%, #e5e9f2 100%);
        transform: translateY(-1px);
        box-shadow: var(--shadow-hover);
        border-color: rgba(2, 6, 23, 0.12);
      }

      .grid-cell:active {
        transform: translateY(0);
        box-shadow: 0 2px 6px rgba(2, 6, 23, 0.10);
      }

      .grid-cell.start,
      .grid-cell.start.correct {
        background: linear-gradient(180deg, var(--start-1) 0%, var(--start-2) 100%);
        color: #fff;
        border-color: transparent;
        position: relative;
      }

      .grid-cell.end,
      .grid-cell.end.correct {
        background: linear-gradient(180deg, var(--end-1) 0%, var(--end-2) 100%);
        color: #fff;
        border-color: transparent;
        position: relative;
      }

      .grid-cell.start::after,
      .grid-cell.end::after {
        position: absolute;
        top: 0.6em;
        left: 0.6em;
        padding: 0.2em 0.6em;
        border-radius: 999px;
        font-size: calc(1em * 10 / 14);
        line-height: 1;
        letter-spacing: .2px;
        background: rgba(255,255,255,.85);
        color: #0f172a;
        border: 1px solid rgba(2,6,23,.08);
        box-shadow: 0 1px 0 rgba(255,255,255,.6) inset, 0 1px 2px rgba(2,6,23,.08);
        pointer-events: none;
        content: '';
      }
      .grid-cell.start::after { content: "Départ"; }
      .grid-cell.end::after { content: "Arrivée"; }

      @keyframes pop {
        0% { transform: scale(0.96); }
        60% { transform: scale(1.03); }
        100% { transform: scale(1); }
      }

      .grid-cell.correct,
      .grid-cell.incorrect {
        color: #fff;
        border-color: transparent;
        animation: pop 180ms ease-out;
      }

      .grid-cell.correct {
        background: linear-gradient(180deg, var(--correct-1) 0%, var(--correct-2) 100%);
        box-shadow:
          0 2px 10px rgba(16, 185, 129, 0.25),
          0 1px 0 rgba(255, 255, 255, 0.35) inset;
      }

      .grid-cell.incorrect {
        background: linear-gradient(180deg, var(--incorrect-1) 0%, var(--incorrect-2) 100%);
        box-shadow:
          0 2px 10px rgba(239, 68, 68, 0.25),
          0 1px 0 rgba(255, 255, 255, 0.35) inset;
      }




      /* Sur écran étroit, la grille doit tenir dans la largeur à l'échelle 1. */
      @media (max-width: 800px) {
        :host {
          --cell-width: clamp(2.75em, 9vw, 4.5em);
          --cell-height: clamp(2.75em, 9vw, 4.5em);
        }
      }

      @media (max-width: 720px) {
        :host {
          --gap: 0.3125em;
          --cell-radius: calc(10em / 13);
        }
        .grid-container {
          padding: calc(var(--gap) + 0.25em);
        }
        .grid-cell {
          font-weight: 600;
          font-size: 0.8125em;
        }
        .grid-cell.start::after,
        .grid-cell.end::after {
          display: none;
        }
      }
    `
    root.appendChild(style)
    return style
  }

  private ensureContainer(root: ShadowRoot): HTMLDivElement {
    let container = root.querySelector(
      '.grid-container',
    ) as HTMLDivElement | null
    if (!container) {
      container = document.createElement('div')
      container.className = 'grid-container mx-auto'
      const scroller = document.createElement('div')
      scroller.className = 'grid-scroller'
      scroller.appendChild(container)
      root.appendChild(scroller)
    }
    return container
  }

  private removeGridCells(container: HTMLDivElement) {
    const cells = container.querySelectorAll('.grid-cell')
    cells.forEach((el) => {
      el.remove()
    })
  }

  // overlay removed
}

export type MathaleaLabyrintheOptions = {
  id: string
  seed: string
  rows: number
  cols: number
  orientation?: Orientation
  goodAnswers: string[]
  badAnswers: string[]
  correction?: boolean
  disabled?: boolean
  numeroExercice?: number
  feedback?: boolean
  questionIndex?: number
  interactivityOn?: boolean
  verifyCallbackName?: string
  verifyCallback?: MathaleaLabyrintheVerificationCallback
}

export type MathaleaLabyrintheVerificationResult = {
  isOk: boolean
  feedback?: string
  score?: { nbBonnesReponses: number; nbReponses: number }
}

export type MathaleaLabyrintheVerificationContext = {
  exercice: IExercice
  questionIndex: number
  element: MathaleaLabyrintheElement
}

export type MathaleaLabyrintheVerificationCallback = (
  context: MathaleaLabyrintheVerificationContext,
) => MathaleaLabyrintheVerificationResult

export type MathaleaLabyrintheCellCounts = {
  goodAnswers: number
  badAnswers: number
}

function stripMathDelimiters(value: string): string {
  const trimmed = value.trim()
  return trimmed.startsWith('$') && trimmed.endsWith('$') && trimmed.length > 1
    ? trimmed.slice(1, -1)
    : trimmed
}

function typstCellContent(value: string): string {
  const trimmed = value.trim()
  if (trimmed === '') return '[]'
  const wasMath =
    trimmed.startsWith('$') && trimmed.endsWith('$') && trimmed.length > 1
  if (!wasMath) return `[${trimmed.replace(/]/g, '\\]')}]`
  return `[$${tex2typst(stripMathDelimiters(trimmed))}$]`
}

export default class MathaleaLabyrintheElement extends MathaleaCustomElement {
  static readonly elementTag = 'mathalea-labyrinthe'
  private static readonly verificationCallbacks = new Map<
    string,
    MathaleaLabyrintheVerificationCallback
  >()

  ready = false
  gameOver = false
  win = false

  private readonly root: ShadowRoot
  private readonly model = new Labyrinthe()
  private readonly renderer = new DomLabyrintheRenderer(new MathliveRenderer())
  private readonly onGridClick = (event: Event) => this.handleGridClick(event)
  private pendingSerializedState: string | null = null
  private staticOptions: MathaleaLabyrintheOptions | null = null

  static get observedAttributes() {
    return [
      'state',
      'disabled',
      'seed',
      'rows',
      'cols',
      'orientation',
      'width',
      'height',
      'interactivity-on',
    ]
  }

  constructor() {
    super()
    this.root = this.attachShadow({ mode: 'closed' })
  }

  static create(options: MathaleaLabyrintheOptions): string {
    const createElementForStaticRender = () => {
      const element = new MathaleaLabyrintheElement()
      element.staticOptions = options
      return element
    }

    if (context.isTypst) {
      return `<mathalea-typst>${createElementForStaticRender().renderTypst()}</mathalea-typst>`
    }
    if (!context.isHtml) return createElementForStaticRender().renderLatex()

    const html = super.create({
      id: options.id,
      seed: options.seed,
      rows: options.rows,
      cols: options.cols,
      orientation: options.orientation,
      goodAnswers: options.goodAnswers,
      badAnswers: options.badAnswers,
      correction: options.correction ?? false,
      disabled: options.disabled ?? false,
      numeroExercice: options.numeroExercice,
      interactivityOn:
        options.interactivityOn ?? (options.disabled ? false : true),
      verifyCallbackName:
        options.verifyCallbackName ??
        this.registerInlineVerificationCallback(options.verifyCallback),
    })
    if (!options.feedback) return html
    return `${html}<span id="resultatCheckEx${options.numeroExercice}Q${options.questionIndex ?? 0}"></span>
      <div id="feedbackEx${options.numeroExercice}Q${options.questionIndex ?? 0}"
        class="ml-2 py-2 text-coopmaths-warn-darkest dark:text-coopmathsdark-warn-darkest"></div>`
  }

  private static registerInlineVerificationCallback(
    callback?: MathaleaLabyrintheVerificationCallback,
  ): string | undefined {
    if (callback == null) return undefined
    const name = `mathalea-labyrinthe-callback-${MathaleaLabyrintheElement.verificationCallbacks.size}`
    MathaleaLabyrintheElement.registerVerificationCallback(name, callback)
    return name
  }

  static registerVerificationCallback(
    name: string,
    callback: MathaleaLabyrintheVerificationCallback,
  ): void {
    if (name.trim().length === 0) {
      throw new Error('Le nom du vérificateur labyrinthe ne peut pas être vide')
    }
    MathaleaLabyrintheElement.verificationCallbacks.set(name, callback)
  }

  static unregisterVerificationCallback(name: string): void {
    MathaleaLabyrintheElement.verificationCallbacks.delete(name)
  }

  static getCellCounts(
    options: Pick<
      MathaleaLabyrintheOptions,
      'seed' | 'rows' | 'cols' | 'orientation'
    >,
  ): MathaleaLabyrintheCellCounts {
    const labyrinthe = new Labyrinthe({
      seed: options.seed,
      rows: options.rows,
      cols: options.cols,
      orientation: options.orientation,
    })
    labyrinthe.regenerate()
    return {
      goodAnswers: labyrinthe.numberOfGoodAnswers(),
      badAnswers: labyrinthe.numberOfIncorrectAnswers(),
    }
  }

  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    const id = `labyrintheEx${exercice.numeroExercice}Q${questionIndex}`
    const element = document.getElementById(
      id,
    ) as MathaleaLabyrintheElement | null
    const finish = (result: MathaleaLabyrintheVerificationResult) => {
      const isOk = result.isOk
      const feedback = result.feedback ?? (isOk ? 'Bravo !' : '')
      const spanResultat = document.querySelector(
        `#resultatCheckEx${exercice.numeroExercice}Q${questionIndex}`,
      )
      const divFeedback = document.querySelector(
        `#feedbackEx${exercice.numeroExercice}Q${questionIndex}`,
      ) as HTMLElement | null
      if (spanResultat) spanResultat.innerHTML = isOk ? '😎' : '☹️'
      if (divFeedback) divFeedback.innerHTML = feedback
      return {
        isOk,
        feedback,
        score: result.score ?? {
          nbBonnesReponses: isOk ? 4 : 0,
          nbReponses: 4,
        },
      }
    }

    if (element == null) {
      return finish({
        isOk: false,
        feedback: 'Labyrinthe introuvable.',
      })
    }

    exercice.answers ??= {}
    exercice.answers[element.id] = element.value
    element.interactivityOn = false

    const callbackName = element.getAttribute('verify-callback-name')
    const callback =
      callbackName == null
        ? undefined
        : MathaleaLabyrintheElement.verificationCallbacks.get(callbackName)
    if (callback != null) {
      return finish(callback({ exercice, questionIndex, element }))
    }
    return finish(element.defaultVerificationResult())
  }

  connectedCallback() {
    this.hydrateCommonAttributes()
    this.configureModelFromAttributes()
    this.model.regenerate()
    const state = this.getAttribute('state')
    if (state != null) {
      this.pendingSerializedState = state
      this.applyPendingState()
    }
    this.renderAndPersist()
    this.renderer.setDisabled(this.root, this.shouldDisable())
    this.root.addEventListener('click', this.onGridClick)
    this.ready = true
    if (this.isCorrection()) this.interactivityOn = false
  }

  disconnectedCallback() {
    this.root.removeEventListener('click', this.onGridClick)
    super.disconnectedCallback()
  }

  get value(): string {
    return this.state
  }

  set value(nextValue: string) {
    this.state = nextValue
  }

  get state(): string {
    return this.getAttribute('state') ?? ''
  }

  set state(nextState: string) {
    const state = nextState == null ? '' : String(nextState)
    if (this.getAttribute('state') !== state) {
      this.setAttribute('state', state)
    }
  }

  get disabled(): boolean {
    return this.hasAttribute('disabled')
  }

  set disabled(isDisabled: boolean) {
    if (isDisabled) this.setAttribute('disabled', '')
    else this.removeAttribute('disabled')
  }

  get correctClicks(): number {
    return this.model.snapshot().correctClicks
  }

  get totalGood(): number {
    return this.model.numberOfGoodAnswers()
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null,
  ) {
    if (!this.isConnected) return
    switch (name) {
      case 'state':
        this.pendingSerializedState = newValue ?? ''
        this.applyPendingState()
        this.renderAndPersist()
        break
      case 'disabled':
      case 'interactivity-on':
        this.hydrateCommonAttributes()
        this.renderer.setDisabled(this.root, this.shouldDisable())
        break
      case 'seed':
      case 'rows':
      case 'cols':
      case 'orientation':
        this.configureModelFromAttributes()
        this.model.regenerate()
        if (this.pendingSerializedState != null) this.applyPendingState()
        this.renderAndPersist()
        this.renderer.setDisabled(this.root, this.shouldDisable())
        break
      case 'width':
      case 'height':
        this.renderAndPersist()
        break
    }
  }

  render(): string | void {
    if (!context.isHtml || context.isTypst) return this.renderLatex()
    if (!this.ready) return
    this.renderAndPersist()
  }

  protected onInteractivityChanged(isOn: boolean): void {
    this.renderer.setDisabled(this.root, !isOn || this.disabled)
  }

  private configureModelFromAttributes(): void {
    this.model.configure({
      seed: this.getAttribute('seed') ?? null,
      rows: this.readPositiveIntegerAttribute('rows', 6),
      cols: this.readPositiveIntegerAttribute('cols', 6),
      orientation: this.readOrientation() ?? undefined,
      width: this.readPositiveNumberAttribute('width'),
      height: this.readPositiveNumberAttribute('height'),
    })
    this.model.setValues(
      this.readStringArrayAttribute('good-answers'),
      this.readStringArrayAttribute('bad-answers'),
    )
  }

  private handleGridClick(event: Event): void {
    if (this.gameOver || this.shouldDisable()) return
    const target = event
      .composedPath()
      .find(
        (node) =>
          node instanceof HTMLElement && node.classList.contains('grid-cell'),
      ) as HTMLElement | undefined
    if (target == null) return
    const row = Number(target.dataset.row)
    const col = Number(target.dataset.col)
    if (!Number.isInteger(row) || !Number.isInteger(col)) return

    const before = this.model.snapshot().gameOver
    this.model.clickCell(row, col)
    this.renderAndPersist()

    const snapshot = this.model.snapshot()
    this.gameOver = snapshot.gameOver
    this.win = snapshot.win
    if (!before && snapshot.gameOver) {
      this.interactivityOn = false
      const detail: GameEndDetail = {
        win: snapshot.win,
        correctClicks: snapshot.correctClicks,
        totalGood: this.model.numberOfGoodAnswers(),
        totalBad: this.model.numberOfIncorrectAnswers(),
        state: this.state,
      }
      this.dispatchEvent(
        new CustomEvent('labyrinthe:gameend', {
          detail,
          bubbles: true,
          composed: true,
        }),
      )
      const numeroExercice = this.getAttribute('numero-exercice')
      if (numeroExercice != null) {
        document
          .querySelector<HTMLButtonElement>(`#buttonScoreEx${numeroExercice}`)
          ?.click()
      }
    }
  }

  private readStringArrayAttribute(attributeName: string): string[] {
    const rawValue = this.getAttribute(attributeName)
    if (rawValue == null) return []
    try {
      const values = JSON.parse(rawValue)
      return Array.isArray(values) ? values.map(String) : []
    } catch {
      return []
    }
  }

  private readPositiveIntegerAttribute(
    attributeName: string,
    fallback: number,
  ): number {
    const value = Number(this.getAttribute(attributeName))
    return Number.isInteger(value) && value > 0 ? value : fallback
  }

  private readPositiveNumberAttribute(attributeName: string): number | null {
    const value = Number(this.getAttribute(attributeName))
    return Number.isFinite(value) && value > 0 ? value : null
  }

  private readOrientation(): Orientation | null {
    const value = this.getAttribute('orientation')
    return value === 'horizontal' || value === 'vertical' ? value : null
  }

  private isCorrection(): boolean {
    return this.getAttribute('correction') === 'true'
  }

  private shouldDisable(): boolean {
    return !this.interactivityOn || this.getAttribute('disabled') === 'true'
  }

  private renderAndPersist(): void {
    const snapshot = this.model.snapshot()
    this.renderer.render(
      this.root,
      snapshot,
      this.readPositiveNumberAttribute('width'),
      this.readPositiveNumberAttribute('height'),
    )
    // À chaque rendu, car il reconstruit les cases : le navigateur livre le
    // changement de l'attribut `state` en différé, ce qui relance un rendu après
    // le connectedCallback et effacerait une correction posée une seule fois.
    if (this.isCorrection()) this.renderer.showCorrection(this.root, snapshot)
    this.persistState()
    this.gameOver = snapshot.gameOver
    this.win = snapshot.win
  }

  private persistState(): void {
    const state = this.model.serializeState()
    if (this.getAttribute('state') !== state) {
      this.setAttribute('state', state)
    }
  }

  private applyPendingState(): void {
    if (this.pendingSerializedState == null) return
    const raw = this.pendingSerializedState
    this.pendingSerializedState = null
    const trimmed = raw.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      this.model.restoreState(trimmed)
      return
    }

    const snapshot = this.model.snapshot()
    const clicked = Array(snapshot.rows)
      .fill(0)
      .map(() => Array(snapshot.cols).fill(0))
    const tokens = trimmed
      .split('|')
      .map((token) => token.trim())
      .filter((token) => token.length > 0)
    for (const token of tokens) {
      const [rawRow, rawCol] = token.split('-')
      const row = Number(rawRow)
      const col = Number(rawCol)
      if (
        Number.isInteger(row) &&
        Number.isInteger(col) &&
        row >= 0 &&
        row < snapshot.rows &&
        col >= 0 &&
        col < snapshot.cols
      ) {
        clicked[row][col] = 1
      }
    }
    this.model.restoreState(JSON.stringify({ c: 0, b: 0, g: clicked }))
  }

  private defaultVerificationResult(): MathaleaLabyrintheVerificationResult {
    if (this.win) {
      return {
        isOk: true,
        feedback: 'Bravo !',
        score: { nbBonnesReponses: 4, nbReponses: 4 },
      }
    }
    const ratio = this.totalGood === 0 ? 0 : this.correctClicks / this.totalGood
    if (ratio <= 0.25) {
      return {
        isOk: false,
        score: { nbBonnesReponses: 0, nbReponses: 4 },
      }
    }
    if (ratio <= 0.5) {
      return {
        isOk: false,
        score: { nbBonnesReponses: 1, nbReponses: 4 },
      }
    }
    return {
      isOk: false,
      score: { nbBonnesReponses: 2, nbReponses: 4 },
    }
  }

  static pointsMaxQuestion(): number {
    return 4
  }

  protected renderLatex(): string {
    const options = this.getStaticOptions()
    const labyrinthe = this.createStaticLabyrinthe(options)
    const latex = options.correction
      ? labyrinthe.generateLatexCorrection()
      : labyrinthe.generateLatex()
    return options.correction
      ? `{\\renewcommand{\\arraystretch}{2}${latex}}`
      : `\n\n\\bigskip\n{\\renewcommand{\\arraystretch}{2}${latex}}`
  }

  protected renderTypst(): string {
    const options = this.getStaticOptions()
    const labyrinthe = this.createStaticLabyrinthe(options)
    const snapshot = labyrinthe.snapshot()
    const cells: string[] = []
    for (let row = 0; row < snapshot.rows; row++) {
      for (let col = 0; col < snapshot.cols; col++) {
        const cell = snapshot.grid?.[row]?.[col]
        const isGood = Boolean(cell?.isGood)
        const isStart = snapshot.start.row === row && snapshot.start.col === col
        const isEnd = snapshot.end.row === row && snapshot.end.col === col
        const shouldShade = isStart || isEnd || (options.correction && isGood)
        const body = typstCellContent(String(cell?.text ?? ''))
        const content =
          options.correction && isGood ? `[#strong(${body})]` : body
        cells.push(
          `table.cell(fill: ${shouldShade ? 'luma(90%)' : 'none'}, ${content})`,
        )
      }
    }
    return [
      '#block[',
      '#set text(size: 10pt)',
      '#align(center)[',
      '#table(',
      `  columns: ${snapshot.cols},`,
      '  stroke: 0.6pt + black,',
      '  inset: (x: 5pt, y: 8pt),',
      `  ${cells.join(',\n  ')}`,
      ')',
      ']',
      ']',
    ].join('\n')
  }

  private getStaticOptions(): MathaleaLabyrintheOptions {
    if (this.staticOptions != null) return this.staticOptions
    return {
      id: this.id,
      seed: this.getAttribute('seed') ?? '',
      rows: this.readPositiveIntegerAttribute('rows', 6),
      cols: this.readPositiveIntegerAttribute('cols', 6),
      orientation: this.readOrientation() ?? undefined,
      goodAnswers: this.readStringArrayAttribute('good-answers'),
      badAnswers: this.readStringArrayAttribute('bad-answers'),
      correction: this.isCorrection(),
      disabled: this.shouldDisable(),
      numeroExercice: Number(this.getAttribute('numero-exercice')),
    }
  }

  private createStaticLabyrinthe(options: MathaleaLabyrintheOptions) {
    const labyrinthe = new Labyrinthe({
      seed: options.seed,
      rows: options.rows,
      cols: options.cols,
      orientation: options.orientation,
    })
    labyrinthe.regenerate()
    labyrinthe.setValues(options.goodAnswers, options.badAnswers)
    return labyrinthe
  }
}

registerMathaleaCustomElement(MathaleaLabyrintheElement)

class MathliveRenderer implements MathRenderer {
  typeset(root: Element | ShadowRoot): void {
    const shadow = root instanceof ShadowRoot ? root : root.getRootNode()
    const hostShadow = shadow instanceof ShadowRoot ? shadow : null
    if (
      hostShadow &&
      !hostShadow.querySelector('style[data-mathlive-style="1"]')
    ) {
      const style = document.createElement('style')
      style.setAttribute('data-mathlive-style', '1')
      style.textContent =
        '@import url("https://cdn.jsdelivr.net/npm/mathlive/mathlive-static.css");'
      hostShadow.appendChild(style)
    }

    if (root instanceof HTMLElement) {
      renderMathInElement(root, {
        TeX: {
          delimiters: {
            inline: [
              ['$', '$'],
              ['\\(', '\\)'],
            ],
            display: [],
          },
        },
      })
    }
  }
}
