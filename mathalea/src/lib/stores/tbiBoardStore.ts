import { get, writable } from 'svelte/store'
import type { TbiBoardInk, TbiStroke, TbiStrokeTool } from '../tbiBoard'
import { updateTbiBoard } from './tbiStore'

/**
 * Réglages du stylo et historique des modifications de l'écriture. Ni l'un ni
 * l'autre ne sont enregistrés : seuls les traits font partie de la séance.
 */

export type TbiBoardTool = TbiStrokeTool | 'eraser' | 'move'

export interface TbiBoardPen {
  tool: TbiBoardTool
  color: TbiBoardInk
  /** Épaisseur, relative à la largeur de l'écran */
  size: number
}

export const TBI_BOARD_SIZES: { value: number; label: string; dot: number }[] = [
  { value: 0.0015, label: 'Fin', dot: 8 },
  { value: 0.0025, label: 'Moyen', dot: 13 },
  { value: 0.005, label: 'Épais', dot: 20 },
]

export const TBI_BOARD_INKS: { value: TbiBoardInk; label: string }[] = [
  { value: 'ink', label: 'Encre' },
  { value: 'blue', label: 'Bleu' },
  { value: 'red', label: 'Rouge' },
  { value: 'green', label: 'Vert' },
]

/** Couleurs des encres, lisibles sur le fond de chaque thème */
export function tbiInkColor(ink: TbiBoardInk, isDark: boolean): string {
  const colors: Record<TbiBoardInk, [string, string]> = {
    ink: ['#1f2429', '#e8edf1'],
    blue: ['#216d9a', '#7cc0e8'],
    red: ['#c62828', '#ff8a80'],
    green: ['#2e7d32', '#81c784'],
  }
  return colors[ink][isDark ? 1 : 0]
}

export const tbiBoardPen = writable<TbiBoardPen>({
  tool: 'pen',
  color: 'ink',
  size: TBI_BOARD_SIZES[1].value,
})

interface History {
  undo: TbiStroke[][]
  redo: TbiStroke[][]
}

const histories = new Map<string, History>()

/** Incrémenté à chaque changement, pour griser Annuler et Rétablir */
export const tbiBoardHistoryVersion = writable(0)

function historyOf(tabId: string): History {
  let history = histories.get(tabId)
  if (!history) {
    history = { undo: [], redo: [] }
    histories.set(tabId, history)
  }
  return history
}

function changed() {
  tbiBoardHistoryVersion.update((version) => version + 1)
}

/** Remplace les traits d'un onglet, en gardant la possibilité d'annuler */
export function commitTbiBoardStrokes(
  tabId: string,
  previous: TbiStroke[],
  next: TbiStroke[],
) {
  const history = historyOf(tabId)
  history.undo.push(previous)
  history.redo = []
  updateTbiBoard(tabId, (board) => ({ ...board, strokes: next }))
  changed()
}

export function canUndoTbiBoard(tabId: string): boolean {
  return historyOf(tabId).undo.length > 0
}

export function canRedoTbiBoard(tabId: string): boolean {
  return historyOf(tabId).redo.length > 0
}

export function undoTbiBoard(tabId: string, current: TbiStroke[]) {
  const history = historyOf(tabId)
  const previous = history.undo.pop()
  if (!previous) return
  history.redo.push(current)
  updateTbiBoard(tabId, (board) => ({ ...board, strokes: previous }))
  changed()
}

export function redoTbiBoard(tabId: string, current: TbiStroke[]) {
  const history = historyOf(tabId)
  const next = history.redo.pop()
  if (!next) return
  history.undo.push(current)
  updateTbiBoard(tabId, (board) => ({ ...board, strokes: next }))
  changed()
}

export function resetTbiBoardHistory() {
  histories.clear()
  tbiBoardHistoryVersion.set(get(tbiBoardHistoryVersion) + 1)
}
