import { get, writable } from 'svelte/store'
import type { TbiViewerContent } from '../tbiLink'
import { findFreeSpot, type TbiRect } from '../tbiToolPlacement'

/**
 * Outils de la vue TBI : horloge, feu tricolore, tirage au sort, calculatrices,
 * documents (PDF, image, vidéo, page web, note, figure). Une seule liste, et un
 * même fonctionnement : plusieurs exemplaires possibles, une position, un plan.
 *
 * Un outil appartient à l'onglet où il a été ouvert (`scope`), ou à tous les
 * onglets une fois épinglé. Il reste monté quand on change d'onglet, simplement
 * masqué : un minuteur continue de tourner et une NumWorks garde ses calculs.
 */

export type TbiCalculatorKind = 'college' | 'lycee' | 'calculette'
export type TbiTrafficLightColor = 'red' | 'orange' | 'green'
export type TbiClockMode = 'clock' | 'timer' | 'stopwatch'

/** Outil affiché sur tous les onglets */
export const TBI_SCOPE_ALL = 'all'

interface TbiToolBase {
  id: number
  /** Identifiant de l'onglet de l'outil, ou `TBI_SCOPE_ALL` */
  scope: string
  x: number
  y: number
  w: number
  h: number
  z: number
}

export interface TbiClockTool extends TbiToolBase {
  kind: 'clock'
  mode: TbiClockMode
  /** Durée choisie pour le minuteur (ms) */
  timerDurationMs: number
  /** Temps restant du minuteur à l'arrêt ou en pause (ms) */
  timerRemainingMs: number
  /** Horodatage de fin du minuteur en marche, robuste au throttling des onglets */
  timerEndAt: number | null
  /** Temps cumulé du chronomètre avant sa dernière reprise (ms) */
  stopwatchElapsedMs: number
  stopwatchStartAt: number | null
  /** Signal sonore à la fin du minuteur */
  sound: boolean
}

export interface TbiTrafficLightTool extends TbiToolBase {
  kind: 'trafficLight'
  active: TbiTrafficLightColor
}

export interface TbiStudentPickerTool extends TbiToolBase {
  kind: 'studentPicker'
  /**
   * Classe choisie (identifiant d'une classe de « Mes sauvegardes »). Propre
   * à ce navigateur, comme les classes : jamais dans l'URL.
   */
  classId: string | null
}

export interface TbiCalculatorTool extends TbiToolBase {
  kind: TbiCalculatorKind
}

export interface TbiDocumentTool extends TbiToolBase {
  kind: 'document'
  /** Document affiché, ou null pour un visualiseur vide (saisie d'un lien) */
  content: TbiViewerContent | null
}

export type TbiTool =
  | TbiClockTool
  | TbiTrafficLightTool
  | TbiStudentPickerTool
  | TbiCalculatorTool
  | TbiDocumentTool

export type TbiToolKind = TbiTool['kind']
/** Outils qui s'ouvrent sans contenu particulier */
export type TbiSimpleToolKind = Exclude<TbiToolKind, 'document'>

export const TBI_CLOCK_MIN_W = 360
export const TBI_CLOCK_MAX_W = 1000
export const TBI_CLOCK_DEFAULT_W = 420
/** Durées proposées pour le minuteur (s) */
export const TBI_TIMER_PRESETS = [30, 60, 180, 300, 600]
export const TBI_TIMER_DEFAULT_MS = 300_000

export const TBI_TRAFFIC_LIGHT_MIN_W = 130
export const TBI_TRAFFIC_LIGHT_MAX_W = 500
export const TBI_TRAFFIC_LIGHT_MIN_H = 220
export const TBI_TRAFFIC_LIGHT_MAX_H = 1200

export const TBI_STUDENT_PICKER_MIN_W = 220
export const TBI_STUDENT_PICKER_MAX_W = 1200
export const TBI_STUDENT_PICKER_MIN_H = 220
export const TBI_STUDENT_PICKER_MAX_H = 900

export const TBI_CALCULATOR_MIN_W = 160
export const TBI_CALCULATOR_MAX_W = 480

/**
 * Ratio largeur/hauteur de la zone opaque (calculatrice) de l'image WebP de
 * chaque modèle, une fois recadrée pour exclure la marge transparente
 * (ombre portée) qui l'entoure — voir le recadrage en CSS dans
 * public/calculators/numworks-*.html (.col-calculator / .calculator-container).
 * La hauteur du widget est toujours dérivée de sa largeur via ce ratio, pour
 * qu'aucun fond ne dépasse de la calculatrice quel que soit le
 * redimensionnement.
 */
export const TBI_CALCULATOR_ASPECT: Record<TbiCalculatorKind, number> = {
  college: 0.571,
  lycee: 0.5159,
  calculette: 0.72,
}

/**
 * Hors de la zone d'affichage de la calculatrice elle-même (qui doit suivre
 * TBI_CALCULATOR_ASPECT), le cadre des outils ajoute une bordure (1px de chaque
 * côté) et un en-tête de 44px : la largeur totale doit en tenir compte pour que
 * l'iframe (zone sous l'en-tête) ait exactement le ratio de l'image, sans quoi
 * un bandeau gris apparaît dans l'iframe.
 */
const TBI_CALCULATOR_BORDER_PX = 2
const TBI_CALCULATOR_HEADER_PX = 44

/** Hauteur totale du widget pour une largeur `w` donnée, sans fond parasite */
export function calculatorHeightForWidth(
  kind: TbiCalculatorKind,
  w: number,
): number {
  const contentW = w - TBI_CALCULATOR_BORDER_PX
  return Math.round(
    TBI_CALCULATOR_HEADER_PX +
      TBI_CALCULATOR_BORDER_PX +
      contentW / TBI_CALCULATOR_ASPECT[kind],
  )
}

/** Hauteur de l'horloge, qui suit son contenu, pour lui réserver une place */
export function clockHeightForWidth(w: number): number {
  return Math.round(w * 0.6)
}

export function isCalculatorKind(kind: string): kind is TbiCalculatorKind {
  return kind === 'college' || kind === 'lycee' || kind === 'calculette'
}

export const tbiTools = writable<TbiTool[]>([])

/** Onglet affiché : les outils s'ouvrent dans cet onglet (voir `tbiStore`) */
export const tbiActiveScope = writable<string>('')

let nextToolId = 1

export function newTbiToolId(): number {
  return nextToolId++
}

export function isTbiToolShown(tool: TbiTool, scope: string): boolean {
  return tool.scope === TBI_SCOPE_ALL || tool.scope === scope
}

/** Outils affichés sur l'onglet courant */
export function shownTbiTools(tools = get(tbiTools)): TbiTool[] {
  const scope = get(tbiActiveScope)
  return tools.filter((tool) => isTbiToolShown(tool, scope))
}

export function occupiedTbiRects(): TbiRect[] {
  return shownTbiTools().map(({ x, y, w, h }) => ({ x, y, w, h }))
}

/** Plan situé au-dessus de tous les outils */
export function nextTbiToolZ(): number {
  return get(tbiTools).reduce((max, tool) => Math.max(max, tool.z), 0) + 1
}

/**
 * Dernières valeurs de chaque type d'outil (taille, position, réglages). Un
 * outil rouvert les retrouve. C'est aussi ce qui est sauvegardé pour cet écran.
 */
export type TbiToolMemory = Partial<Record<TbiSimpleToolKind, Partial<TbiTool>>>
let toolMemory: TbiToolMemory = {}

export function getTbiToolMemory(): TbiToolMemory {
  return toolMemory
}

export function setTbiToolMemory(
  kind: TbiSimpleToolKind,
  patch: Partial<TbiTool>,
) {
  toolMemory[kind] = { ...toolMemory[kind], ...patch } as Partial<TbiTool>
}

/** Vide la liste et la mémoire des outils */
export function resetTbiTools() {
  tbiTools.set([])
  toolMemory = {}
}

function defaultSize(kind: TbiSimpleToolKind): { w: number; h: number } {
  switch (kind) {
    case 'clock':
      return {
        w: TBI_CLOCK_DEFAULT_W,
        h: clockHeightForWidth(TBI_CLOCK_DEFAULT_W),
      }
    case 'trafficLight':
      return { w: 240, h: 460 }
    case 'studentPicker':
      return { w: 340, h: 320 }
    default:
      return { w: 260, h: calculatorHeightForWidth(kind, 260) }
  }
}

function newSimpleTool(kind: TbiSimpleToolKind, base: TbiToolBase): TbiTool {
  switch (kind) {
    case 'clock':
      return {
        ...base,
        kind,
        mode: 'clock',
        timerDurationMs: TBI_TIMER_DEFAULT_MS,
        timerRemainingMs: TBI_TIMER_DEFAULT_MS,
        timerEndAt: null,
        stopwatchElapsedMs: 0,
        stopwatchStartAt: null,
        sound: false,
      }
    case 'trafficLight':
      return { ...base, kind, active: 'red' }
    case 'studentPicker':
      return { ...base, kind, classId: null }
    default:
      return { ...base, kind }
  }
}

/**
 * Ouvre un outil dans l'onglet courant, sur une place libre et au premier plan.
 * @param options.scope portée imposée (lien partagé, séance enregistrée)
 * @param options.position position imposée ; `'memory'` reprend la dernière
 * position enregistrée de ce type d'outil
 */
export function openTbiTool(
  kind: TbiSimpleToolKind,
  options: {
    scope?: string
    position?: { x: number; y: number } | 'memory'
  } = {},
): TbiTool {
  const memory = toolMemory[kind] ?? {}
  const size = {
    w: memory.w ?? defaultSize(kind).w,
    h: memory.h ?? defaultSize(kind).h,
  }
  let position: { x: number; y: number }
  if (
    options.position === 'memory' &&
    typeof memory.x === 'number' &&
    typeof memory.y === 'number'
  ) {
    position = { x: memory.x, y: memory.y }
  } else if (options.position && options.position !== 'memory') {
    position = options.position
  } else {
    position = findFreeSpot(size, occupiedTbiRects(), {
      w: window.innerWidth,
      h: window.innerHeight,
    })
  }
  const {
    x: _x,
    y: _y,
    id: _id,
    scope: _scope,
    z: _z,
    ...settings
  } = memory as Partial<TbiToolBase>
  const tool = {
    ...newSimpleTool(kind, {
      id: newTbiToolId(),
      scope: options.scope ?? get(tbiActiveScope),
      ...position,
      ...size,
      z: nextTbiToolZ(),
    }),
    ...settings,
    ...size,
  } as TbiTool
  tbiTools.update((tools) => [...tools, tool])
  return tool
}

export function updateTbiTool(id: number, patch: Partial<TbiTool>) {
  tbiTools.update((tools) =>
    tools.map((tool) => {
      if (tool.id !== id) return tool
      const next = { ...tool, ...patch } as TbiTool
      if (next.kind !== 'document') {
        const { x, y, w, h } = next
        setTbiToolMemory(next.kind, { x, y, w, h, ...patch })
      }
      return next
    }),
  )
}

/** Retire un outil, sans proposer d'annuler */
export function removeTbiTool(id: number) {
  tbiTools.update((tools) => tools.filter((tool) => tool.id !== id))
}

/** Passe un outil au premier plan, sans rien changer s'il y est déjà */
export function bringTbiToolToFront(id: number) {
  const tools = get(tbiTools)
  const tool = tools.find((candidate) => candidate.id === id)
  if (!tool) return
  const next = nextTbiToolZ()
  if (
    tool.z === next - 1 &&
    tools.filter((other) => other.z === tool.z).length === 1
  ) {
    return
  }
  tbiTools.update((list) =>
    list.map((other) => (other.id === id ? { ...other, z: next } : other)),
  )
}

/** Épingle un outil sur tous les onglets, ou le ramène sur l'onglet courant */
export function toggleTbiToolPin(id: number) {
  const scope = get(tbiActiveScope)
  tbiTools.update((tools) =>
    tools.map((tool) =>
      tool.id === id
        ? {
            ...tool,
            scope: tool.scope === TBI_SCOPE_ALL ? scope : TBI_SCOPE_ALL,
          }
        : tool,
    ),
  )
}

/** Temps restant d'un minuteur (ms) */
export function timerLeftMs(tool: TbiClockTool, now: number): number {
  return tool.timerEndAt === null
    ? tool.timerRemainingMs
    : Math.max(0, tool.timerEndAt - now)
}
