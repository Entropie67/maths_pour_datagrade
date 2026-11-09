import { get, writable } from 'svelte/store'
import { SESSION_STATE_TYPE, type SessionState } from '../mesFeuilles/library'
import {
  clampGridSize,
  isTbiBoardBackground,
  readSavedStrokes,
  TBI_DEFAULT_GRID_SIZE,
  type TbiBoard,
  type TbiBoardBackground,
  type TbiStroke,
} from '../tbiBoard'
import { partitionByHeight, rescaleFreeCard } from '../tbiLayout'
import {
  currentSessionStore,
  exercicesParams,
  moveExercice,
  tbiParamStore,
} from './generalStore'
import {
  exportTbiLinkViewers,
  readSavedDocuments,
  restoreTbiLinkViewers,
  type TbiSavedDocument,
} from './tbiDocumentStore'
import { isLocalStorageAvailable } from './storage'
import {
  calculatorHeightForWidth,
  getTbiToolMemory,
  openTbiTool,
  resetTbiTools,
  setTbiToolMemory,
  TBI_CALCULATOR_MAX_W,
  TBI_CALCULATOR_MIN_W,
  TBI_CLOCK_MAX_W,
  TBI_CLOCK_MIN_W,
  TBI_SCOPE_ALL,
  TBI_STUDENT_PICKER_MAX_H,
  TBI_STUDENT_PICKER_MAX_W,
  TBI_STUDENT_PICKER_MIN_H,
  TBI_STUDENT_PICKER_MIN_W,
  TBI_TRAFFIC_LIGHT_MAX_H,
  TBI_TRAFFIC_LIGHT_MAX_W,
  TBI_TRAFFIC_LIGHT_MIN_H,
  TBI_TRAFFIC_LIGHT_MIN_W,
  tbiActiveScope,
  tbiTools,
  updateTbiTool,
  type TbiCalculatorKind,
  type TbiClockMode,
  type TbiSimpleToolKind,
  type TbiTool,
  type TbiTrafficLightColor,
} from './tbiToolsStore'
import type { InterfaceParams } from '../types'

export {
  calculatorHeightForWidth,
  TBI_CALCULATOR_ASPECT,
  TBI_CALCULATOR_MAX_W,
  TBI_CALCULATOR_MIN_W,
  TBI_CLOCK_DEFAULT_W,
  TBI_CLOCK_MAX_W,
  TBI_CLOCK_MIN_W,
  TBI_STUDENT_PICKER_MAX_H,
  TBI_STUDENT_PICKER_MAX_W,
  TBI_STUDENT_PICKER_MIN_H,
  TBI_STUDENT_PICKER_MIN_W,
  TBI_TIMER_PRESETS,
  TBI_TRAFFIC_LIGHT_MAX_H,
  TBI_TRAFFIC_LIGHT_MAX_W,
  TBI_TRAFFIC_LIGHT_MIN_H,
  TBI_TRAFFIC_LIGHT_MIN_W,
} from './tbiToolsStore'
export type { TbiCalculatorKind, TbiTrafficLightColor } from './tbiToolsStore'

/**
 * État de la vue TBI (vidéoprojection).
 *
 * Une séance est une suite d'onglets. Chaque onglet a un nom, sa disposition
 * (colonnes ou libre) et, s'il le faut, une couche d'écriture ; il peut être
 * vide. Les exercices (`cards`, alignés par indice sur `exercicesParams`)
 * désignent leur onglet, et les outils aussi (voir `tbiToolsStore`).
 *
 * - La structure de la séance, le zoom et la correction de chaque exercice, les
 *   outils ouverts et leur position sont partageables : ils sont sérialisés
 *   dans l'URL (paramètre tbiParam) par la vue TBI elle-même via tbiParamStore.
 * - Les positions du mode libre et la taille des outils dépendent de l'écran :
 *   elles sont sauvegardées en localStorage. Au chargement, l'URL (si présente)
 *   est appliquée après le localStorage pour que la position partagée d'un
 *   outil prenne le pas sur la sauvegarde locale.
 * - L'écriture du Tableau ne tient pas dans une URL : elle est dans la séance
 *   enregistrée et dans le brouillon de l'onglet du navigateur.
 *
 * Le format de tbiParam reste lisible par les anciens liens : voir
 * `applyTbiSharedState` pour les correspondances.
 */

/** Ancien mode de page, conservé dans l'URL pour les anciens liens */
export type TbiMode = 'columns' | 'free' | 'tabs'
/** Disposition interne d'un onglet */
export type TbiTabLayout = 'columns' | 'free'
/**
 * Alignement horizontal de la colonne quand la disposition en colonnes n'en
 * compte qu'une seule : centrée (défaut, largeur limitée), calée sur la moitié
 * gauche ou droite de l'écran, ou étalée sur toute la largeur.
 */
export type TbiSingleColumnAlign = 'center' | 'left' | 'right' | 'full'

/** Mode d'affichage de la correction d'une carte TBI */
export type TbiCorrectionMode =
  'hidden' | 'below' | 'perQuestion' | 'replace' | 'modal'

/**
 * Niveau de détail de la correction affichée dans une carte TBI :
 * la correction entière, ou réduite à ses réponses mises en évidence
 * (même réglage que « Correction minimale » de la vue Typst).
 */
export type TbiCorrectionDetail = 'full' | 'minimal'

const TBI_CORRECTION_MODES: TbiCorrectionMode[] = [
  'hidden',
  'below',
  'perQuestion',
  'replace',
  'modal',
]
const TBI_CORRECTION_DETAILS: TbiCorrectionDetail[] = ['full', 'minimal']

/** Mode de correction d'un exercice tant que le prof n'en a choisi aucun */
export const TBI_DEFAULT_CORRECTION_MODE = 'perQuestion'

/**
 * Préférence de correction du poste : le dernier mode et le dernier détail
 * choisis servent de point de départ aux exercices suivants, d'une séance à
 * l'autre. Elle ne dit pas d'afficher la correction, seulement comment.
 */
interface TbiCorrectionPreference {
  mode: Exclude<TbiCorrectionMode, 'hidden'>
  detail: TbiCorrectionDetail
}

const TBI_CORRECTION_PREFERENCE_KEY = 'tbiCorrectionPreference'

function readTbiCorrectionPreference(): TbiCorrectionPreference {
  const preference: TbiCorrectionPreference = {
    mode: TBI_DEFAULT_CORRECTION_MODE,
    detail: 'full',
  }
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(TBI_CORRECTION_PREFERENCE_KEY) ?? '{}',
    ) as { mode?: TbiCorrectionMode; detail?: TbiCorrectionDetail }
    if (
      saved.mode &&
      saved.mode !== 'hidden' &&
      TBI_CORRECTION_MODES.includes(saved.mode)
    ) {
      preference.mode = saved.mode
    }
    if (saved.detail && TBI_CORRECTION_DETAILS.includes(saved.detail)) {
      preference.detail = saved.detail
    }
  } catch {
    // stockage indisponible ou illisible : les réglages par défaut
  }
  return preference
}

function saveTbiCorrectionPreference(patch: Partial<TbiCorrectionPreference>) {
  try {
    window.localStorage.setItem(
      TBI_CORRECTION_PREFERENCE_KEY,
      JSON.stringify({ ...readTbiCorrectionPreference(), ...patch }),
    )
  } catch {
    // stockage plein ou indisponible : sans conséquence
  }
}

/** Mode repris par le bouton de correction d'un exercice */
export function tbiCardLastCorrectionMode(
  card?: TbiCardState,
): Exclude<TbiCorrectionMode, 'hidden'> {
  return card?.lastCorrectionMode ?? readTbiCorrectionPreference().mode
}

export const TBI_BASE_WIDTH = 600
export const TBI_MIN_ZOOM = 0.4
export const TBI_MAX_ZOOM = 3
/** Niveaux d'espacement vertical des questions (un niveau vaut 0,5 rem). */
export const TBI_DEFAULT_QUESTION_SPACING = 1
export const TBI_MIN_QUESTION_SPACING = 0

/** Bornes de largeur de carte en mode libre, indépendantes du zoom */
export const TBI_MIN_CARD_WIDTH = 240
export const TBI_MAX_CARD_WIDTH = 1800

export interface TbiCardState {
  /** Zoom d'affichage du contenu (indépendant de la largeur en mode libre) */
  zoom: number
  /** Position et largeur en px dans le canvas du mode libre */
  x: number
  y: number
  w: number
  /** Identifiant de l'onglet de l'exercice */
  tabId: string
  /** Saut de colonne avant cet exercice (dispositions en colonnes) */
  colBreak: boolean
  /** Colonne explicite après glisser-déposer (absente dans les anciens liens). */
  column?: number
  /** Espacement vertical entre deux questions, par pas de 0,5 rem */
  questionSpacing: number
  /** Mode d'affichage de la correction de l'exercice */
  correctionMode: TbiCorrectionMode
  /** Correction entière ou réduite aux réponses mises en évidence */
  correctionDetail: TbiCorrectionDetail
  /**
   * Dernier mode de cet exercice, repris par le bouton de correction ; absent :
   * la préférence du poste. État propre à la session, non sérialisé dans l'URL.
   */
  lastCorrectionMode?: Exclude<TbiCorrectionMode, 'hidden'>
  /**
   * Exercice replié : seul son bandeau reste affiché (disposition libre).
   * État de présentation propre à la session, non sérialisé dans l'URL
   * (mais conservé dans la séance enregistrée).
   */
  collapsed?: boolean
  /** uuid de l'exercice actuellement affiché à cet indice, pour détecter un remplacement */
  uuid?: string
}

export interface TbiTabConfig {
  layout: TbiTabLayout
  nbColumns: number
  /** Alignement de la colonne unique de cet onglet (utilisé quand nbColumns === 1) */
  singleColumnAlign: TbiSingleColumnAlign
}

/** Un onglet de la séance */
export interface TbiTab extends TbiTabConfig {
  id: string
  /** Nom choisi par le prof ; null : le titre de son premier exercice */
  name: string | null
  /** Fond et écriture, absents tant que l'onglet n'en a pas */
  board?: TbiBoard
}

export interface TbiState {
  /** Toujours au moins un onglet */
  tabs: TbiTab[]
  /** Onglet affiché */
  activeTabId: string
  /** Aligné par indice sur exercicesParams */
  cards: TbiCardState[]
}

/**
 * Ancien état d'une calculatrice, conservé pour la vue élève : elle n'a pas
 * d'onglets et n'ouvre qu'un exemplaire de chaque modèle.
 */
export interface TbiCalculatorState {
  visible: boolean
  x: number
  y: number
  w: number
  h: number
  z: number
}

export interface CalculatorsState {
  collegeCalculator: TbiCalculatorState
  lyceeCalculator: TbiCalculatorState
  calculette: TbiCalculatorState
}

let nextTabId = 1

function newTabId(): string {
  return `t${nextTabId++}`
}

export function defaultTbiCardState(
  index: number,
  tabId: string,
): TbiCardState {
  return {
    zoom: 1,
    // cascade décalée pour que les cartes ne se recouvrent pas totalement
    x: 40 + (index % 3) * 80,
    y: 40 + index * 100,
    w: TBI_BASE_WIDTH,
    tabId,
    colBreak: false,
    questionSpacing: TBI_DEFAULT_QUESTION_SPACING,
    correctionMode: 'hidden',
    correctionDetail: readTbiCorrectionPreference().detail,
  }
}

export function defaultTbiTabConfig(): TbiTabConfig {
  return { layout: 'columns', nbColumns: 1, singleColumnAlign: 'center' }
}

function newTab(config: Partial<TbiTabConfig> = {}): TbiTab {
  return {
    id: newTabId(),
    name: null,
    ...defaultTbiTabConfig(),
    ...config,
  }
}

export function defaultTbiState(): TbiState {
  const tab = newTab()
  return { tabs: [tab], activeTabId: tab.id, cards: [] }
}

function defaultCalculatorState(kind: TbiCalculatorKind): TbiCalculatorState {
  return {
    visible: false,
    x: 0,
    y: 0,
    w: 260,
    h: calculatorHeightForWidth(kind, 260),
    z: 0,
  }
}

/** Renvoie l'état du widget calculatrice correspondant au modèle demandé */
export function calculatorStateOf(
  state: CalculatorsState,
  kind: TbiCalculatorKind,
): TbiCalculatorState {
  switch (kind) {
    case 'college':
      return state.collegeCalculator
    case 'lycee':
      return state.lyceeCalculator
    case 'calculette':
      return state.calculette
  }
}

export const tbiState = writable<TbiState>(defaultTbiState())

// les outils s'ouvrent dans l'onglet affiché
tbiState.subscribe((state) => tbiActiveScope.set(state.activeTabId))

/** Signal de fin du minuteur, affiché par-dessus toute la vue */
export const tbiTimerAlarm = writable<{ sound: boolean } | null>(null)

/** Calculatrices de la vue élève (autorisées exercice par exercice) */
export const eleveCalculatrices = writable<CalculatorsState>({
  collegeCalculator: defaultCalculatorState('college'),
  lyceeCalculator: defaultCalculatorState('lycee'),
  calculette: defaultCalculatorState('calculette'),
})

/**
 * paramsIndex de la carte dont la correction est actuellement affichée en
 * plein écran, ou null si aucune. Permet de n'avoir qu'une seule boîte de
 * dialogue plein écran ouverte à la fois, même si le mode de correction est
 * un état propre à chaque carte.
 */
export const activeTbiModalCard = writable<number | null>(null)

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function clampZoom(zoom: number): number {
  return clamp(zoom, TBI_MIN_ZOOM, TBI_MAX_ZOOM)
}

/** Fait varier le zoom de tous les exercices de `delta` en même temps */
export function zoomAllCardsBy(delta: number) {
  tbiState.update((state) => {
    for (const card of state.cards) {
      card.zoom = clampZoom(card.zoom + delta)
    }
    return state
  })
}

/** Fait varier le zoom de certains exercices de `delta` */
export function zoomTbiCards(paramsIndices: number[], delta: number) {
  tbiState.update((state) => {
    for (const paramsIndex of paramsIndices) {
      const card = state.cards[paramsIndex]
      if (card) card.zoom = clampZoom(card.zoom + delta)
    }
    return state
  })
}

/** Donne la même taille à plusieurs exercices */
export function setTbiCardsZoom(paramsIndices: number[], zoom: number) {
  tbiState.update((state) => {
    for (const paramsIndex of paramsIndices) {
      const card = state.cards[paramsIndex]
      if (card) card.zoom = clampZoom(zoom)
    }
    return state
  })
}

/** Pas de la taille des exercices, assez grand pour se voir au fond de la classe */
export const TBI_ZOOM_STEP = 0.25

/**
 * Taille suivante ou précédente, sur la grille des pas de 25 % : après un
 * ajustement à l'écran (163 %), A+ donne 175 %.
 */
export function nextTbiZoom(zoom: number, direction: 1 | -1): number {
  const steps = zoom / TBI_ZOOM_STEP
  const next =
    direction > 0 ? Math.floor(steps + 1e-6) + 1 : Math.ceil(steps - 1e-6) - 1
  return clampZoom(next * TBI_ZOOM_STEP)
}

/** A− et A+ : tous les exercices désignés prennent la même taille */
export function stepTbiCardsZoom(paramsIndices: number[], direction: 1 | -1) {
  const first = get(tbiState).cards[paramsIndices[0]]
  if (!first) return
  setTbiCardsZoom(paramsIndices, nextTbiZoom(first.zoom, direction))
}

/** Place et largeur de cartes en disposition libre */
export function setTbiCardsGeometry(
  placements: Map<number, { x?: number; y?: number; w?: number }>,
) {
  tbiState.update((state) => {
    placements.forEach((placement, paramsIndex) => {
      const card = state.cards[paramsIndex]
      // nouvel objet : la disposition lit chaque carte par sa référence
      if (card) state.cards[paramsIndex] = { ...card, ...placement }
    })
    return state
  })
}

/** Vrai si ces cartes sont encore à leur place de cascade par défaut */
export function areTbiCardsAtDefaultPlace(
  state: TbiState,
  paramsIndices: number[],
): boolean {
  return paramsIndices.every((paramsIndex) => {
    const card = state.cards[paramsIndex]
    const initial = defaultTbiCardState(paramsIndex, '')
    return (
      card &&
      card.x === initial.x &&
      card.y === initial.y &&
      card.w === initial.w
    )
  })
}

/**
 * Replie / déplie un exercice en disposition libre : replié, seul son bandeau
 * reste visible (le contenu et la poignée de redimensionnement sont masqués).
 */
export function toggleTbiCardCollapsed(paramsIndex: number) {
  tbiState.update((state) => {
    const card = state.cards[paramsIndex]
    if (card) card.collapsed = !card.collapsed
    return state
  })
}

// ------------------------------------------------------------------
// Onglets
// ------------------------------------------------------------------

/** Onglet affiché (il y en a toujours un) */
export function activeTbiTab(state: TbiState): TbiTab {
  return state.tabs.find((tab) => tab.id === state.activeTabId) ?? state.tabs[0]
}

/** Change l'onglet affiché */
export function setTbiActiveTab(tabId: string) {
  tbiState.update((state) => {
    if (state.tabs.some((tab) => tab.id === tabId)) state.activeTabId = tabId
    return state
  })
}

/** Passe à l'onglet suivant ou précédent, en boucle */
export function stepTbiActiveTab(step: 1 | -1) {
  tbiState.update((state) => {
    const index = state.tabs.findIndex((tab) => tab.id === state.activeTabId)
    const count = state.tabs.length
    state.activeTabId = state.tabs[(index + step + count) % count].id
    return state
  })
}

/** Ajoute un onglet vide après l'onglet affiché, et l'affiche */
export function addTbiTab(): string {
  const tab = newTab()
  tbiState.update((state) => {
    const index = state.tabs.findIndex((t) => t.id === state.activeTabId)
    state.tabs.splice(index + 1, 0, tab)
    state.activeTabId = tab.id
    return state
  })
  return tab.id
}

/** Renomme un onglet ; un nom vide rend son nom par défaut */
export function renameTbiTab(tabId: string, name: string) {
  const trimmed = name.trim()
  tbiState.update((state) => {
    const tab = state.tabs.find((t) => t.id === tabId)
    if (tab) tab.name = trimmed === '' ? null : trimmed
    return state
  })
}

/** Réordonne les onglets (sémantique splice) */
export function moveTbiTab(from: number, to: number) {
  tbiState.update((state) => {
    if (from === to || !state.tabs[from] || to < 0 || to >= state.tabs.length) {
      return state
    }
    state.tabs.splice(to, 0, state.tabs.splice(from, 1)[0])
    return state
  })
}

/**
 * Retire un onglet de la liste, sans toucher à ses exercices ni à ses outils
 * (voir `Tbi.svelte`, qui les retire et propose d'annuler). Il reste toujours
 * un onglet : le dernier est remplacé par un onglet vide.
 */
export function removeTbiTab(tabId: string) {
  tbiState.update((state) => {
    const index = state.tabs.findIndex((tab) => tab.id === tabId)
    if (index === -1) return state
    state.tabs.splice(index, 1)
    if (state.tabs.length === 0) state.tabs.push(newTab())
    if (state.activeTabId === tabId) {
      state.activeTabId = state.tabs[Math.min(index, state.tabs.length - 1)].id
    }
    return state
  })
}

/** Change la disposition (colonnes / libre) d'un onglet */
export function setTbiTabLayout(tabId: string, layout: TbiTabLayout) {
  tbiState.update((state) => {
    const tab = state.tabs.find((t) => t.id === tabId)
    if (tab) tab.layout = layout
    return state
  })
}

/** Change le nombre de colonnes d'un onglet (borné à [1, 4]) */
export function setTbiTabNbColumns(tabId: string, nbColumns: number) {
  nbColumns = Math.min(4, Math.max(1, nbColumns))
  tbiState.update((state) => {
    const tab = state.tabs.find((t) => t.id === tabId)
    if (tab) tab.nbColumns = nbColumns
    return state
  })
}

/** Change l'alignement de la colonne unique d'un onglet (sans effet au-delà d'une colonne) */
export function setTbiTabSingleColumnAlign(
  tabId: string,
  singleColumnAlign: TbiSingleColumnAlign,
) {
  tbiState.update((state) => {
    const tab = state.tabs.find((t) => t.id === tabId)
    if (tab) tab.singleColumnAlign = singleColumnAlign
    return state
  })
}

/** Indices des exercices d'un onglet, dans l'ordre de la séance */
export function tbiTabCardIndices(state: TbiState, tabId: string): number[] {
  return state.cards.flatMap((card, i) => (card.tabId === tabId ? [i] : []))
}

/**
 * Nom d'un onglet : celui donné par le prof, sinon le titre de son premier
 * exercice. Le même nom partout : dans le bandeau et dans les menus.
 * @param titles titre de chaque exercice, aligné sur `cards`
 */
export function tbiTabLabel(
  tab: TbiTab,
  state: TbiState,
  titles: string[],
): string {
  if (tab.name !== null) return tab.name
  const first = tbiTabCardIndices(state, tab.id)[0]
  const title = first === undefined ? '' : (titles[first] ?? '').trim()
  return title !== '' ? title : 'Nouvel onglet'
}

/** Numéro d'un exercice affiché à la classe : son rang dans son onglet */
export function tbiCardNumber(state: TbiState, paramsIndex: number): number {
  const tabId = state.cards[paramsIndex]?.tabId
  return tabId === undefined
    ? paramsIndex + 1
    : tbiTabCardIndices(state, tabId).indexOf(paramsIndex) + 1
}

/** Déplace un exercice vers un onglet ; `null` : vers un nouvel onglet */
export function moveCardToTab(
  paramsIndex: number,
  tabId: string | null,
): string | null {
  let target = tabId
  tbiState.update((state) => {
    const card = state.cards[paramsIndex]
    if (!card) return state
    if (target === null) {
      const tab = newTab()
      const index = state.tabs.findIndex((t) => t.id === state.activeTabId)
      state.tabs.splice(index + 1, 0, tab)
      target = tab.id
    }
    if (!state.tabs.some((t) => t.id === target)) return state
    card.tabId = target
    // sa colonne n'a pas de sens dans une autre disposition
    delete card.column
    card.colBreak = false
    return state
  })
  return target
}

/** Répartit les exercices d'un onglet dans un onglet chacun */
export function splitTbiTabByExercise(tabId: string) {
  tbiState.update((state) => {
    const indices = tbiTabCardIndices(state, tabId)
    const position = state.tabs.findIndex((tab) => tab.id === tabId)
    if (indices.length < 2 || position === -1) return state
    const created = indices.slice(1).map((paramsIndex) => {
      const tab = newTab()
      const card = state.cards[paramsIndex]
      card.tabId = tab.id
      card.colBreak = false
      delete card.column
      return tab
    })
    state.cards[indices[0]].colBreak = false
    delete state.cards[indices[0]].column
    state.tabs.splice(position + 1, 0, ...created)
    return state
  })
}

function newBoard(): TbiBoard {
  return {
    background: 'blank',
    gridSize: TBI_DEFAULT_GRID_SIZE,
    strokes: [],
  }
}

/** Donne à un onglet son fond et son écriture, sans rien changer d'autre */
export function ensureTbiBoard(tabId: string) {
  tbiState.update((state) => {
    const tab = state.tabs.find((t) => t.id === tabId)
    if (tab && !tab.board) tab.board = newBoard()
    return state
  })
}

/** Change le fond d'un onglet, avec ou sans exercices */
export function setTbiTabBackground(
  tabId: string,
  background: TbiBoardBackground,
) {
  ensureTbiBoard(tabId)
  updateTbiBoard(tabId, (board) => ({ ...board, background }))
}

/** Change la taille du quadrillage d'un onglet */
export function setTbiTabGridSize(tabId: string, gridSize: number) {
  ensureTbiBoard(tabId)
  updateTbiBoard(tabId, (board) => ({
    ...board,
    gridSize: clampGridSize(gridSize),
  }))
}

/** Onglet vide qui sert à écrire : il devient un Tableau, en disposition libre */
export function addTbiBoard(tabId: string) {
  tbiState.update((state) => {
    const tab = state.tabs.find((t) => t.id === tabId)
    if (!tab) return state
    tab.board ??= newBoard()
    tab.layout = 'free'
    if (tab.name === null) {
      const count = state.tabs.filter((t) => t.board).length
      tab.name = `Tableau ${count}`
    }
    return state
  })
}

/** Modifie l'écriture d'un onglet */
export function updateTbiBoard(
  tabId: string,
  update: (board: TbiBoard) => TbiBoard,
) {
  tbiState.update((state) => {
    const tab = state.tabs.find((t) => t.id === tabId)
    if (tab?.board) tab.board = update(tab.board)
    return state
  })
}

/**
 * Une carte est interactive à la demande (paramètre `i` de l'URL), sauf pour
 * un exercice `interactifObligatoire` : sans version HTML non interactive, il
 * l'est toujours, comme dans les autres vues.
 */
export function isTbiCardInteractive(
  exercise: { interactifReady?: boolean; interactifObligatoire?: boolean },
  paramInteractif?: string,
): boolean {
  if (exercise.interactifObligatoire) return true
  return paramInteractif === '1' && Boolean(exercise.interactifReady)
}

/**
 * Change le mode d'affichage de la correction d'une carte. Une seule
 * correction en plein écran à la fois, même si le mode est propre à chaque
 * carte : ouvrir celle-ci ferme celle d'une autre carte.
 */
export function setTbiCardCorrectionMode(
  paramsIndex: number,
  mode: TbiCorrectionMode,
) {
  tbiState.update((state) => {
    const card = state.cards[paramsIndex]
    if (card) {
      card.correctionMode = mode
      if (mode !== 'hidden') card.lastCorrectionMode = mode
    }
    return state
  })
  if (mode === 'modal') {
    activeTbiModalCard.set(paramsIndex)
  } else if (get(activeTbiModalCard) === paramsIndex) {
    activeTbiModalCard.set(null)
  }
}

/**
 * Choisit le mode de correction d'une carte : il est retenu pour le bouton de
 * correction, et appliqué tout de suite si la correction est affichée.
 */
export function chooseTbiCardCorrectionMode(
  paramsIndex: number,
  mode: Exclude<TbiCorrectionMode, 'hidden'>,
) {
  const card = get(tbiState).cards[paramsIndex]
  if (!card) return
  saveTbiCorrectionPreference({ mode })
  if (card.correctionMode === 'hidden') {
    tbiState.update((state) => {
      state.cards[paramsIndex].lastCorrectionMode = mode
      return state
    })
  } else {
    setTbiCardCorrectionMode(paramsIndex, mode)
  }
}

/** Affiche la correction d'une carte avec son dernier mode, ou la masque */
export function toggleTbiCardCorrection(paramsIndex: number) {
  const card = get(tbiState).cards[paramsIndex]
  if (!card) return
  setTbiCardCorrectionMode(
    paramsIndex,
    card.correctionMode === 'hidden'
      ? tbiCardLastCorrectionMode(card)
      : 'hidden',
  )
}

/**
 * Affiche ou masque la correction de plusieurs cartes. Une seule correction
 * pouvant être en plein écran, ce mode devient ici « sous l'énoncé ».
 */
export function setTbiCardsCorrectionShown(
  paramsIndices: number[],
  shown: boolean,
) {
  for (const paramsIndex of paramsIndices) {
    const card = get(tbiState).cards[paramsIndex]
    if (!card) continue
    const last = tbiCardLastCorrectionMode(card)
    setTbiCardCorrectionMode(
      paramsIndex,
      shown ? (last === 'modal' ? 'below' : last) : 'hidden',
    )
  }
}

/** Change le niveau de détail de la correction d'une carte, retenu pour la suite */
export function setTbiCardCorrectionDetail(
  paramsIndex: number,
  detail: TbiCorrectionDetail,
) {
  saveTbiCorrectionPreference({ detail })
  tbiState.update((state) => {
    const card = state.cards[paramsIndex]
    if (card) card.correctionDetail = detail
    return state
  })
}

/**
 * Aligne cards sur la liste d'exercices. Un exercice retrouve sa carte où qu'il
 * soit dans la liste (zoom, position, onglet, correction) : retirer un exercice
 * ne décale pas les réglages des suivants. Un nouvel exercice part des valeurs
 * par défaut, dans l'onglet de celui qu'il remplace à cet indice, sinon dans
 * l'onglet affiché.
 */
export function reconcileTbiCards(uuids: string[]) {
  tbiState.update((state) => {
    const tabIds = new Set(state.tabs.map((tab) => tab.id))
    const previous = state.cards
    const unused = new Set(previous.keys())
    const cards = uuids.map((uuid, i) => {
      const found = [...unused].find((k) => previous[k].uuid === uuid)
      // un état créé sans uuid reste à son indice
      const index =
        found ?? (previous[i]?.uuid === undefined && unused.has(i) ? i : null)
      if (index !== null) unused.delete(index)
      const card =
        index !== null
          ? previous[index]
          : defaultTbiCardState(i, previous[i]?.tabId ?? state.activeTabId)
      card.uuid = uuid
      // Rétrocompatibilité avec les états créés avant l'ajout du réglage.
      if (typeof card.questionSpacing !== 'number') {
        card.questionSpacing = TBI_DEFAULT_QUESTION_SPACING
      }
      if (!tabIds.has(card.tabId)) card.tabId = state.activeTabId
      return card
    })
    state.cards = cards
    return state
  })
}

/**
 * Remet la vue à zéro : ni onglet, ni outil, ni écriture, ni lien vers une
 * séance enregistrée (« Enregistrer » écraserait une séance sans rapport).
 */
function resetTbiSession() {
  tbiState.set(defaultTbiState())
  resetTbiTools()
  tbiTimerAlarm.set(null)
  activeTbiModalCard.set(null)
  tbiParamStore.set('')
  currentSessionStore.set('')
  try {
    window.sessionStorage.removeItem(TBI_DRAFT_KEY)
  } catch {
    // stockage indisponible : il n'y a pas de brouillon à oublier
  }
}

/** Retire les onglets vidés de leurs exercices, sauf s'il y reste du contenu */
function removeEmptiedTbiTabs(previousTabIds: Set<string>) {
  const state = get(tbiState)
  const tools = get(tbiTools)
  for (const tab of [...state.tabs]) {
    if (
      previousTabIds.has(tab.id) &&
      tab.name === null &&
      (tab.board?.strokes.length ?? 0) === 0 &&
      !state.cards.some((card) => card.tabId === tab.id) &&
      !tools.some((tool) => tool.scope === tab.id)
    ) {
      removeTbiTab(tab.id)
    }
  }
}

/**
 * Séance retrouvée en entrant dans la vue, d'après la liste d'exercices :
 * - `opening` : rien en mémoire (chargement de la page) ; l'URL et les
 *   sauvegardes décrivent la vue ;
 * - `kept` : la vue revient sur sa séance, exercices modifiés ou non. L'état en
 *   mémoire fait foi : il est plus récent que l'URL, qui ne suit pas les
 *   exercices déplacés ;
 * - `replaced` : plus aucun exercice en commun, c'est une nouvelle série. Elle
 *   part d'un tableau vide.
 */
export type TbiSeriesEntry = 'opening' | 'kept' | 'replaced'

export function enterTbiSeries(uuids: string[]): TbiSeriesEntry {
  const { tabs, cards } = get(tbiState)
  const isLive =
    cards.length > 0 ||
    tabs.length > 1 ||
    tabs.some((tab) => tab.board) ||
    get(tbiTools).length > 0
  // sans exercice, ce qui a été écrit ou ouvert n'appartient à aucune série
  const isReplaced =
    cards.length > 0 &&
    !cards.some((card) => card.uuid && uuids.includes(card.uuid))
  if (isReplaced) resetTbiSession()
  const previousTabIds = new Set(cards.map((card) => card.tabId))
  reconcileTbiCards(uuids)
  if (isReplaced) return 'replaced'
  if (!isLive) return 'opening'
  removeEmptiedTbiTabs(previousTabIds)
  return 'kept'
}

/**
 * Répartit équitablement (par nombre d'exercices) les sauts de colonne sur
 * `paramsIndices` (ordre d'affichage) pour `nbColumns` colonnes : écrase les
 * sauts existants sur ces indices par la répartition par défaut. Le
 * professeur peut ensuite ajuster la répartition par glisser-déposer.
 */
export function balanceColumnBreaks(
  paramsIndices: number[],
  nbColumns: number,
) {
  const n = paramsIndices.length
  const breakPositions = new Set<number>()
  for (let k = 1; k < nbColumns; k++) {
    const position = Math.round((k * n) / nbColumns)
    if (position > 0 && position < n) breakPositions.add(position)
  }
  tbiState.update((state) => {
    paramsIndices.forEach((paramsIndex, position) => {
      const card = state.cards[paramsIndex]
      if (card) {
        card.colBreak = breakPositions.has(position)
        delete card.column
      }
    })
    return state
  })
}

/** Répartit les exercices dans les colonnes d'après leur hauteur à l'écran */
export function balanceTbiColumnsByHeight(
  paramsIndices: number[],
  heights: number[],
  nbColumns: number,
) {
  const breaks = new Set(partitionByHeight(heights, nbColumns))
  tbiState.update((state) => {
    paramsIndices.forEach((paramsIndex, position) => {
      const card = state.cards[paramsIndex]
      if (card) {
        card.colBreak = breaks.has(position)
        delete card.column
      }
    })
    return state
  })
}

/**
 * Déplace un exercice de la position from à la position to (sémantique
 * splice : l'ordre relatif des autres exercices est préservé). Réordonne
 * exercicesParams (l'ordre canonique, persisté dans l'URL) et les états
 * de carte associés.
 * @returns true si un déplacement a eu lieu
 */
export function reorderTbiCard(from: number, to: number): boolean {
  const params = get(exercicesParams)
  if (from === to || from < 0 || to < 0) return false
  if (from >= params.length || to >= params.length) return false
  exercicesParams.update((list) => moveExercice(list, from, to))
  tbiState.update((state) => {
    state.cards.splice(to, 0, state.cards.splice(from, 1)[0])
    return state
  })
  return true
}

/** Répartition compatible avec les anciens liens portant seulement des sauts. */
export function getTbiColumnGroups(
  indices: number[],
  cards: TbiCardState[],
  nbColumns: number,
): number[][] {
  const groups: number[][] = Array.from({ length: nbColumns }, () => [])
  let legacyColumn = 0
  for (const index of indices) {
    const card = cards[index]
    if (card?.colBreak && legacyColumn < nbColumns - 1) legacyColumn++
    groups[Math.min(card?.column ?? legacyColumn, nbColumns - 1)].push(index)
  }
  return groups
}

/** Applique une destination de dépôt, y compris les colonnes vides, et renvoie le nouvel indice canonique. */
export function moveTbiCardInColumns(
  from: number,
  groups: number[][],
): number | null {
  if (groups.length < 1 || groups.length > 4) return null
  const order = groups.flat()
  const position = order.indexOf(from)
  const state = get(tbiState)
  if (
    position < 0 ||
    new Set(order).size !== order.length ||
    order.some((index) => !state.cards[index])
  )
    return null
  const next = order[position + 1]
  const previous = order[position - 1]
  const to =
    next !== undefined
      ? next - (from < next ? 1 : 0)
      : previous !== undefined
        ? previous + (from > previous ? 1 : 0)
        : from
  tbiState.update((current) => {
    groups.forEach((group, column) =>
      group.forEach((index, i) => {
        current.cards[index].column = column
        current.cards[index].colBreak = column > 0 && i === 0
      }),
    )
    return current
  })
  reorderTbiCard(from, to)
  return to
}

/**
 * Actif brièvement pendant un mélange aléatoire de l'ordre des exercices.
 * Les dispositions ne déclenchent l'animation de glissement des cartes
 * (FLIP) que lorsqu'il est vrai, pour garder le glisser-déposer et les
 * réordonnancements instantanés.
 */
export const tbiIsShuffling = writable(false)

/**
 * Mélange aléatoirement l'ordre des exercices désignés (Fisher-Yates), les
 * autres ne bougeant pas. La même permutation est appliquée à `exercicesParams`
 * (ordre canonique, persisté dans l'URL) et aux états de carte, pour que le zoom
 * et le saut de colonne de chaque exercice le suivent dans sa nouvelle position.
 *
 * Les sauts de colonne se déplaçant avec leur carte, ils peuvent se retrouver
 * mal répartis (jusqu'à une colonne vide) : ils sont ré-équilibrés comme lors
 * d'un changement du nombre de colonnes.
 * @param paramsIndices exercices à mélanger (par défaut, ceux de l'onglet affiché)
 * @returns la permutation appliquée (`order[nouvelIndice] = ancienIndice`),
 *   ou `null` s'il y a moins de deux exercices à mélanger.
 */
export function shuffleTbiCards(paramsIndices?: number[]): number[] | null {
  const state = get(tbiState)
  const tab = activeTbiTab(state)
  const subset = paramsIndices ?? tbiTabCardIndices(state, tab.id)
  const n = get(exercicesParams).length
  if (subset.length < 2) return null
  const shuffled = [...subset]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  // éviter le cas (rare) où le tirage laisse l'ordre inchangé
  if (shuffled.every((oldIndex, position) => oldIndex === subset[position])) {
    ;[shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]
  }
  const order = Array.from({ length: n }, (_, i) => i)
  subset.forEach((position, k) => {
    order[position] = shuffled[k]
  })
  exercicesParams.update((list) => order.map((oldIndex) => list[oldIndex]))
  tbiState.update((current) => {
    current.cards = order.map((oldIndex) => current.cards[oldIndex])
    return current
  })
  if (tab.layout === 'columns') {
    balanceColumnBreaks(subset, tab.nbColumns)
  }
  return order
}

/**
 * Supprime un exercice : retire son entrée de exercicesParams (source
 * canonique, persistée dans l'URL) ainsi que l'état de carte associé. Son onglet
 * reste, même vide.
 */
export function deleteTbiCard(paramsIndex: number) {
  const params = get(exercicesParams)
  if (paramsIndex < 0 || paramsIndex >= params.length) return
  exercicesParams.update((list) => [
    ...list.slice(0, paramsIndex),
    ...list.slice(paramsIndex + 1),
  ])
  tbiState.update((state) => {
    state.cards.splice(paramsIndex, 1)
    return state
  })
}

/** Un outil dans un lien partagé : rang de l'onglet, ou tous les onglets */
export interface TbiSharedTool {
  kind: TbiSimpleToolKind
  scope: number | 'all'
  x: number
  y: number
}

/** Fond d'un onglet dans un lien ; l'écriture n'y est pas, seulement signalée */
export interface TbiSharedBoard {
  background: TbiBoardBackground
  gridSize: number
  hasInk: boolean
}

/**
 * Partie partageable de l'état (sérialisée dans l'URL). Un seul onglet s'écrit
 * comme une page des anciens liens (`mode`, `nbColumns`, `singleColumnAlign`).
 * Les champs des anciens widgets ne sont plus écrits, seulement relus.
 */
export interface TbiSharedState {
  mode: TbiMode
  nbColumns: number
  singleColumnAlign: TbiSingleColumnAlign
  /** Rang de l'onglet de chaque exercice (plusieurs onglets) */
  tabs: number[]
  breaks: number[]
  columns?: (number | null)[]
  tabConfigs: TbiTabConfig[]
  /** Rang de l'onglet affiché */
  activeTab: number
  /** Nom donné à chaque onglet */
  tabNames?: (string | null)[]
  /** Fond de chaque onglet qui en a un */
  boards?: (TbiSharedBoard | null)[]
  tools?: TbiSharedTool[]
  /** Zoom de chaque exercice, aligné par indice sur exercicesParams */
  zooms: number[]
  /** Espacement des questions de chaque exercice, aligné sur exercicesParams */
  questionSpacings: number[]
  /** Mode d'affichage de la correction de chaque exercice, aligné sur exercicesParams */
  corrections: TbiCorrectionMode[]
  /** Niveau de détail de la correction de chaque exercice, aligné sur exercicesParams */
  correctionDetails: TbiCorrectionDetail[]
  // anciens liens
  widgetVisible?: boolean
  trafficLightVisible?: boolean
  studentPickerVisible?: boolean
  collegeCalculatorVisible?: boolean
  lyceeCalculatorVisible?: boolean
  calculetteVisible?: boolean
  widgetX?: number
  widgetY?: number
  trafficLightX?: number
  trafficLightY?: number
  studentPickerX?: number
  studentPickerY?: number
  collegeCalculatorX?: number
  collegeCalculatorY?: number
  lyceeCalculatorX?: number
  lyceeCalculatorY?: number
  calculetteX?: number
  calculetteY?: number
}

function tabScopeIndex(state: TbiState, scope: string): number | 'all' {
  if (scope === TBI_SCOPE_ALL) return 'all'
  const index = state.tabs.findIndex((tab) => tab.id === scope)
  return index === -1 ? 'all' : index
}

export function getTbiSharedState(
  state: TbiState,
  tools: TbiTool[] = get(tbiTools),
): TbiSharedState {
  const single = state.tabs.length === 1 ? state.tabs[0] : null
  const tabPosition = (tabId: string) =>
    Math.max(
      0,
      state.tabs.findIndex((tab) => tab.id === tabId),
    )
  return {
    mode: single ? single.layout : 'tabs',
    nbColumns: single ? single.nbColumns : 1,
    singleColumnAlign: single ? single.singleColumnAlign : 'center',
    tabs: state.cards.map((card) => tabPosition(card.tabId)),
    breaks: state.cards.flatMap((card, i) => (card.colBreak ? [i] : [])),
    columns: state.cards.map((card) => card.column ?? null),
    tabConfigs: single
      ? []
      : state.tabs.map(({ layout, nbColumns, singleColumnAlign }) => ({
          layout,
          nbColumns,
          singleColumnAlign,
        })),
    activeTab: tabPosition(state.activeTabId),
    tabNames: state.tabs.map((tab) => tab.name),
    boards: state.tabs.map((tab) =>
      tab.board
        ? {
            background: tab.board.background,
            gridSize: tab.board.gridSize,
            hasInk: tab.board.strokes.length > 0,
          }
        : null,
    ),
    tools: tools.flatMap((tool): TbiSharedTool[] =>
      tool.kind === 'document'
        ? []
        : [
            {
              kind: tool.kind,
              scope: tabScopeIndex(state, tool.scope),
              x: tool.x,
              y: tool.y,
            },
          ],
    ),
    zooms: state.cards.map((card) => card.zoom),
    questionSpacings: state.cards.map((card) => card.questionSpacing),
    corrections: state.cards.map((card) => card.correctionMode),
    correctionDetails: state.cards.map((card) => card.correctionDetail),
  }
}

const TBI_MODES: TbiMode[] = ['columns', 'free', 'tabs']
const TBI_TAB_LAYOUTS: TbiTabLayout[] = ['columns', 'free']
const TBI_SINGLE_COLUMN_ALIGNS: TbiSingleColumnAlign[] = [
  'center',
  'left',
  'right',
  'full',
]

/**
 * Encodage lisible du tbiParam (paramètre d'URL partageable), pensé pour
 * être modifié à la main : `clé-valeur`, champs séparés par `_`, listes
 * séparées par `.`. Seuls les champs qui s'écartent de leur valeur par
 * défaut sont inclus, pour rester court (ex. "c-2" pour 2 colonnes).
 * Limité à [a-z0-9-_.] : les autres caractères sont échappés par
 * URLSearchParams, ce qui rendrait le paramètre illisible dans l'URL.
 */
const TBI_PARAM_FIELD_SEP = '_'
const TBI_PARAM_LIST_SEP = '.'

/** Codes des outils dans le champ `o` de tbiParam */
const TBI_TOOL_CODES: Record<TbiSimpleToolKind, string> = {
  clock: 'h',
  trafficLight: 'f',
  studentPicker: 'ta',
  calculette: 'ct',
  college: 'cc',
  lycee: 'cl',
}

function isEachCardInItsTab(tabs: number[]): boolean {
  return tabs.every((tab, i) => tab === i)
}

function isDefaultTabConfigs(tabConfigs: TbiTabConfig[]): boolean {
  return tabConfigs.every(
    (c) =>
      c.layout === 'columns' &&
      c.nbColumns === 1 &&
      c.singleColumnAlign === 'center',
  )
}

function isDefaultZooms(zooms: number[]): boolean {
  return zooms.every((zoom) => zoom === 1)
}

function isDefaultQuestionSpacings(spacings: number[]): boolean {
  return spacings.every((spacing) => spacing === TBI_DEFAULT_QUESTION_SPACING)
}

/** Codes d'une lettre des modes et niveaux de correction dans tbiParam */
const TBI_CORRECTION_MODE_CODES: Record<TbiCorrectionMode, string> = {
  hidden: 'h',
  below: 'b',
  perQuestion: 'p',
  replace: 'r',
  modal: 'm',
}
const TBI_CORRECTION_DETAIL_CODES: Record<TbiCorrectionDetail, string> = {
  full: 'f',
  minimal: 'm',
}

function isDefaultCorrections(corrections: TbiCorrectionMode[]): boolean {
  return corrections.every((mode) => mode === 'hidden')
}

function isDefaultCorrectionDetails(details: TbiCorrectionDetail[]): boolean {
  return details.every((detail) => detail === 'full')
}

function decodePosition(value: string): { x: number; y: number } | undefined {
  const [x, y] = value.split(TBI_PARAM_LIST_SEP).map(Number)
  if (Number.isNaN(x) || Number.isNaN(y)) return undefined
  return { x, y }
}

/** Nom d'onglet dans tbiParam, sans les séparateurs des champs et des listes */
function encodeTabName(name: string): string {
  return encodeURIComponent(name).replace(
    /[-_.!~*'()]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  )
}

function decodeTabName(value: string): string | null {
  if (value === '') return null
  try {
    return decodeURIComponent(value)
  } catch {
    return null
  }
}

export function encodeTbiParam(shared: TbiSharedState): string {
  const fields: string[] = []
  const isSeveralTabs = shared.mode === 'tabs'
  if (shared.mode !== 'columns') fields.push(`m-${shared.mode}`)
  if (shared.nbColumns !== 1) fields.push(`c-${shared.nbColumns}`)
  if (shared.singleColumnAlign !== 'center') {
    fields.push(`sc-${shared.singleColumnAlign}`)
  }
  if (isSeveralTabs && !isEachCardInItsTab(shared.tabs)) {
    fields.push(`t-${shared.tabs.join(TBI_PARAM_LIST_SEP)}`)
  }
  if (shared.breaks.length > 0) {
    fields.push(`b-${shared.breaks.join(TBI_PARAM_LIST_SEP)}`)
  }
  if (shared.columns?.some((column) => column !== null)) {
    fields.push(
      `p-${shared.columns.map((column) => column ?? 'x').join(TBI_PARAM_LIST_SEP)}`,
    )
  }
  // le nombre d'onglets se déduit de `t`, sauf s'il y a des onglets vides
  const impliedCount = isEachCardInItsTab(shared.tabs)
    ? shared.tabs.length
    : new Set(shared.tabs).size
  if (
    isSeveralTabs &&
    (!isDefaultTabConfigs(shared.tabConfigs) ||
      shared.tabConfigs.length !== impliedCount)
  ) {
    fields.push(
      `g-${shared.tabConfigs
        .map((c) => `${c.layout}-${c.nbColumns}-${c.singleColumnAlign}`)
        .join(TBI_PARAM_LIST_SEP)}`,
    )
  }
  if (shared.activeTab) fields.push(`at-${shared.activeTab}`)
  if (shared.tabNames?.some((name) => name !== null)) {
    fields.push(
      `n-${shared.tabNames
        .map((name) => (name === null ? '' : encodeTabName(name)))
        .join(TBI_PARAM_LIST_SEP)}`,
    )
  }
  if (shared.boards?.some((board) => board !== null)) {
    fields.push(
      `bd-${shared.boards
        .flatMap((board, tab) =>
          board === null
            ? []
            : [
                `${tab}-${board.background}-${Math.round(board.gridSize * 100)}-${board.hasInk ? 1 : 0}`,
              ],
        )
        .join(TBI_PARAM_LIST_SEP)}`,
    )
  }
  if (shared.tools && shared.tools.length > 0) {
    fields.push(
      `o-${shared.tools
        .map(
          (tool) =>
            `${TBI_TOOL_CODES[tool.kind]}-${tool.scope === 'all' ? 'a' : tool.scope}-${Math.max(0, Math.round(tool.x))}-${Math.max(0, Math.round(tool.y))}`,
        )
        .join(TBI_PARAM_LIST_SEP)}`,
    )
  }
  // état d'une séance enregistrée avant la liste d'outils (lien à partager)
  for (const [key, code, codeXY, x, y] of [
    ['widgetVisible', 'w', 'wp', shared.widgetX, shared.widgetY],
    [
      'trafficLightVisible',
      'f',
      'fp',
      shared.trafficLightX,
      shared.trafficLightY,
    ],
    [
      'studentPickerVisible',
      'ta',
      'tap',
      shared.studentPickerX,
      shared.studentPickerY,
    ],
    [
      'collegeCalculatorVisible',
      'cc',
      'ccp',
      shared.collegeCalculatorX,
      shared.collegeCalculatorY,
    ],
    [
      'lyceeCalculatorVisible',
      'cl',
      'clp',
      shared.lyceeCalculatorX,
      shared.lyceeCalculatorY,
    ],
    ['calculetteVisible', 'ct', 'ctp', shared.calculetteX, shared.calculetteY],
  ] as const) {
    if (shared[key]) fields.push(`${code}-1`)
    if (
      typeof x === 'number' &&
      typeof y === 'number' &&
      (x !== 0 || y !== 0)
    ) {
      fields.push(
        `${codeXY}-${Math.round(x)}${TBI_PARAM_LIST_SEP}${Math.round(y)}`,
      )
    }
  }
  if (!isDefaultZooms(shared.zooms)) {
    fields.push(
      `zp-${shared.zooms
        .map((zoom) => Math.round(zoom * 100))
        .join(TBI_PARAM_LIST_SEP)}`,
    )
  }
  if (!isDefaultQuestionSpacings(shared.questionSpacings)) {
    fields.push(`qs-${shared.questionSpacings.join(TBI_PARAM_LIST_SEP)}`)
  }
  if (!isDefaultCorrections(shared.corrections)) {
    fields.push(
      `co-${shared.corrections
        .map((mode) => TBI_CORRECTION_MODE_CODES[mode])
        .join(TBI_PARAM_LIST_SEP)}`,
    )
  }
  if (!isDefaultCorrectionDetails(shared.correctionDetails)) {
    fields.push(
      `cd-${shared.correctionDetails
        .map((detail) => TBI_CORRECTION_DETAIL_CODES[detail])
        .join(TBI_PARAM_LIST_SEP)}`,
    )
  }
  return fields.join(TBI_PARAM_FIELD_SEP)
}

export function decodeTbiParam(param: string): Partial<TbiSharedState> {
  const shared: Partial<TbiSharedState> = {}
  if (param.length === 0) return shared
  for (const field of param.split(TBI_PARAM_FIELD_SEP)) {
    const separatorIndex = field.indexOf('-')
    if (separatorIndex === -1) continue
    const key = field.slice(0, separatorIndex)
    const value = field.slice(separatorIndex + 1)
    switch (key) {
      case 'm':
        shared.mode = value as TbiMode
        break
      case 'c': {
        const n = Number(value)
        if (!Number.isNaN(n)) shared.nbColumns = n
        break
      }
      case 'sc':
        shared.singleColumnAlign = value as TbiSingleColumnAlign
        break
      case 't':
        shared.tabs = value
          .split(TBI_PARAM_LIST_SEP)
          .map(Number)
          .filter((n) => !Number.isNaN(n))
        break
      case 'b':
        shared.breaks = value
          .split(TBI_PARAM_LIST_SEP)
          .map(Number)
          .filter((n) => !Number.isNaN(n))
        break
      case 'p':
        shared.columns = value.split(TBI_PARAM_LIST_SEP).map((entry) => {
          const column = Number(entry)
          return entry !== '' &&
            Number.isInteger(column) &&
            column >= 0 &&
            column < 4
            ? column
            : null
        })
        break
      case 'g':
        // format : layout-nbColumns[-singleColumnAlign] ; le 3e segment est
        // absent des liens partagés avant son introduction, d'où le
        // fallback (sur 'center') appliqué par applyTbiSharedState.
        shared.tabConfigs = value.split(TBI_PARAM_LIST_SEP).map((entry) => {
          const [layout, nbColumnsStr, singleColumnAlign] = entry.split('-')
          const nbColumns = Number(nbColumnsStr)
          return {
            layout: layout as TbiTabLayout,
            nbColumns: Number.isNaN(nbColumns) ? 1 : nbColumns,
            singleColumnAlign: singleColumnAlign as TbiSingleColumnAlign,
          }
        })
        break
      case 'at': {
        const n = Number(value)
        if (!Number.isNaN(n)) shared.activeTab = n
        break
      }
      case 'n':
        shared.tabNames = value.split(TBI_PARAM_LIST_SEP).map(decodeTabName)
        break
      case 'bd': {
        const boards: (TbiSharedBoard | null)[] = []
        for (const entry of value.split(TBI_PARAM_LIST_SEP)) {
          const [tab, background, size, ink] = entry.split('-')
          const index = Number(tab)
          const gridSize = Number(size) / 100
          if (Number.isInteger(index) && isTbiBoardBackground(background)) {
            boards[index] = {
              background,
              gridSize: Number.isFinite(gridSize)
                ? clampGridSize(gridSize)
                : TBI_DEFAULT_GRID_SIZE,
              hasInk: ink === '1',
            }
          }
        }
        shared.boards = Array.from(boards, (board) => board ?? null)
        break
      }
      case 'o':
        shared.tools = value.split(TBI_PARAM_LIST_SEP).flatMap((entry) => {
          const [code, scope, x, y] = entry.split('-')
          const kind = (
            Object.keys(TBI_TOOL_CODES) as TbiSimpleToolKind[]
          ).find((candidate) => TBI_TOOL_CODES[candidate] === code)
          const index = Number(scope)
          const position = { x: Number(x), y: Number(y) }
          if (
            kind === undefined ||
            Number.isNaN(position.x) ||
            Number.isNaN(position.y) ||
            (scope !== 'a' && !Number.isInteger(index))
          ) {
            return []
          }
          return [{ kind, scope: scope === 'a' ? 'all' : index, ...position }]
        })
        break
      case 'zp':
        shared.zooms = value
          .split(TBI_PARAM_LIST_SEP)
          .map((n) => Number(n) / 100)
          .filter((n) => !Number.isNaN(n))
        break
      case 'w':
        shared.widgetVisible = value === '1'
        break
      case 'f':
        shared.trafficLightVisible = value === '1'
        break
      case 'ta':
        shared.studentPickerVisible = value === '1'
        break
      case 'cc':
        shared.collegeCalculatorVisible = value === '1'
        break
      case 'cl':
        shared.lyceeCalculatorVisible = value === '1'
        break
      case 'ct':
        shared.calculetteVisible = value === '1'
        break
      case 'z':
        shared.zooms = value
          .split(TBI_PARAM_LIST_SEP)
          .map((n) => Number(n) / 10)
          .filter((n) => !Number.isNaN(n))
        break
      case 'qs':
        shared.questionSpacings = value
          .split(TBI_PARAM_LIST_SEP)
          .map(Number)
          .filter((n) => !Number.isNaN(n))
        break
      case 'co':
        // un code inconnu donne 'hidden' : la liste reste alignée par indice
        shared.corrections = value
          .split(TBI_PARAM_LIST_SEP)
          .map(
            (code) =>
              (
                Object.keys(TBI_CORRECTION_MODE_CODES) as TbiCorrectionMode[]
              ).find((mode) => TBI_CORRECTION_MODE_CODES[mode] === code) ??
              'hidden',
          )
        break
      case 'cd':
        shared.correctionDetails = value
          .split(TBI_PARAM_LIST_SEP)
          .map(
            (code) =>
              (
                Object.keys(
                  TBI_CORRECTION_DETAIL_CODES,
                ) as TbiCorrectionDetail[]
              ).find(
                (detail) => TBI_CORRECTION_DETAIL_CODES[detail] === code,
              ) ?? 'full',
          )
        break
      case 'wp': {
        const position = decodePosition(value)
        if (position) {
          shared.widgetX = position.x
          shared.widgetY = position.y
        }
        break
      }
      case 'fp': {
        const position = decodePosition(value)
        if (position) {
          shared.trafficLightX = position.x
          shared.trafficLightY = position.y
        }
        break
      }
      case 'tap': {
        const position = decodePosition(value)
        if (position) {
          shared.studentPickerX = position.x
          shared.studentPickerY = position.y
        }
        break
      }
      case 'ccp': {
        const position = decodePosition(value)
        if (position) {
          shared.collegeCalculatorX = position.x
          shared.collegeCalculatorY = position.y
        }
        break
      }
      case 'clp': {
        const position = decodePosition(value)
        if (position) {
          shared.lyceeCalculatorX = position.x
          shared.lyceeCalculatorY = position.y
        }
        break
      }
      case 'ctp': {
        const position = decodePosition(value)
        if (position) {
          shared.calculetteX = position.x
          shared.calculetteY = position.y
        }
        break
      }
    }
  }
  return shared
}

/** Configuration d'onglet lue dans un lien, valeurs inconnues écartées */
function readTabConfig(config?: Partial<TbiTabConfig>): TbiTabConfig {
  return {
    layout: TBI_TAB_LAYOUTS.includes(config?.layout as TbiTabLayout)
      ? (config?.layout as TbiTabLayout)
      : 'columns',
    nbColumns:
      typeof config?.nbColumns === 'number' &&
      config.nbColumns >= 1 &&
      config.nbColumns <= 4
        ? Math.round(config.nbColumns)
        : 1,
    singleColumnAlign: TBI_SINGLE_COLUMN_ALIGNS.includes(
      config?.singleColumnAlign as TbiSingleColumnAlign,
    )
      ? (config?.singleColumnAlign as TbiSingleColumnAlign)
      : 'center',
  }
}

/**
 * Construit les onglets décrits par un lien. Les liens d'avant les onglets de
 * plein droit restent valides :
 * - `m-columns` (ou rien) et `m-free` : un seul onglet ;
 * - `m-tabs` : plusieurs onglets, avec les exercices sans `t` chacun dans le
 *   sien, et des numéros d'onglets éventuellement à trous.
 */
function applySharedTabs(
  state: TbiState,
  shared: Partial<TbiSharedState>,
): void {
  const previous = state.tabs
  const previousOfCards = state.cards.map((card) =>
    previous.findIndex((tab) => tab.id === card.tabId),
  )
  const reuse = (index: number, config: TbiTabConfig): TbiTab => {
    const tab = previous[index] ?? newTab()
    return { ...tab, ...config }
  }
  const mode: TbiMode = TBI_MODES.includes(shared.mode as TbiMode)
    ? (shared.mode as TbiMode)
    : 'columns'
  if (mode !== 'tabs') {
    const tab = reuse(0, {
      ...readTabConfig({
        nbColumns: shared.nbColumns ?? previous[0]?.nbColumns,
        singleColumnAlign:
          shared.singleColumnAlign ?? previous[0]?.singleColumnAlign,
      }),
      layout: mode,
    })
    state.tabs = [tab]
    state.activeTabId = tab.id
    for (const card of state.cards) card.tabId = tab.id
  } else {
    const raw =
      shared.tabs && shared.tabs.length > 0
        ? state.cards.map((_, i) => shared.tabs?.[i] ?? shared.tabs?.[0] ?? i)
        : state.cards.map((_, i) => i)
    const configs = Array.isArray(shared.tabConfigs) ? shared.tabConfigs : []
    const used = [...new Set(raw)].sort((a, b) => a - b)
    // les onglets vides n'existent que dans les liens qui décrivent chaque onglet
    const isDirect =
      configs.length > 0 && raw.every((tab) => tab < configs.length)
    const tabOfCard = raw.map((tab) => (isDirect ? tab : used.indexOf(tab)))
    const count = Math.max(isDirect ? configs.length : used.length, 1)
    state.tabs = Array.from({ length: count }, (_, i) =>
      reuse(i, readTabConfig(configs[i])),
    )
    state.cards.forEach((card, i) => {
      card.tabId = state.tabs[tabOfCard[i]].id
    })
    const active =
      typeof shared.activeTab === 'number' && shared.activeTab >= 0
        ? Math.min(Math.round(shared.activeTab), count - 1)
        : 0
    state.activeTabId = state.tabs[active].id
  }
  // une carte sans onglet connu rejoint l'onglet affiché
  state.cards.forEach((card, i) => {
    if (!state.tabs.some((tab) => tab.id === card.tabId)) {
      card.tabId = state.tabs[previousOfCards[i]]?.id ?? state.activeTabId
    }
  })
}

const LEGACY_TOOLS: {
  kind: TbiSimpleToolKind
  visible: keyof TbiSharedState
  x: keyof TbiSharedState
  y: keyof TbiSharedState
}[] = [
  {
    kind: 'clock',
    visible: 'widgetVisible',
    x: 'widgetX',
    y: 'widgetY',
  },
  {
    kind: 'trafficLight',
    visible: 'trafficLightVisible',
    x: 'trafficLightX',
    y: 'trafficLightY',
  },
  {
    kind: 'studentPicker',
    visible: 'studentPickerVisible',
    x: 'studentPickerX',
    y: 'studentPickerY',
  },
  {
    kind: 'college',
    visible: 'collegeCalculatorVisible',
    x: 'collegeCalculatorX',
    y: 'collegeCalculatorY',
  },
  {
    kind: 'lycee',
    visible: 'lyceeCalculatorVisible',
    x: 'lyceeCalculatorX',
    y: 'lyceeCalculatorY',
  },
  {
    kind: 'calculette',
    visible: 'calculetteVisible',
    x: 'calculetteX',
    y: 'calculetteY',
  },
]

/** Outils des anciens liens : un exemplaire de chaque, sur tous les onglets */
function applyLegacySharedTools(shared: Partial<TbiSharedState>) {
  for (const { kind, visible, x, y } of LEGACY_TOOLS) {
    const px = shared[x]
    const py = shared[y]
    const hasPosition = typeof px === 'number' && typeof py === 'number'
    if (hasPosition) setTbiToolMemory(kind, { x: px, y: py })
    const wanted = shared[visible]
    const existing = get(tbiTools).find((tool) => tool.kind === kind)
    if (typeof wanted === 'boolean') {
      if (wanted && !existing) {
        openTbiTool(kind, {
          scope: TBI_SCOPE_ALL,
          position: hasPosition ? { x: px, y: py } : 'memory',
        })
      } else if (!wanted && existing) {
        tbiTools.update((tools) => tools.filter((tool) => tool.kind !== kind))
      }
    }
    if (hasPosition && existing && wanted !== false) {
      updateTbiTool(existing.id, { x: px, y: py })
    }
  }
}

/** Outils d'un lien : la liste remplace les outils (hors documents) ouverts */
function applySharedTools(tools: TbiSharedTool[], tabs: TbiTab[]) {
  tbiTools.update((list) => list.filter((tool) => tool.kind === 'document'))
  for (const tool of tools) {
    const scope =
      tool.scope === 'all'
        ? TBI_SCOPE_ALL
        : (tabs[tool.scope]?.id ?? TBI_SCOPE_ALL)
    openTbiTool(tool.kind, { scope, position: { x: tool.x, y: tool.y } })
  }
}

export function applyTbiSharedState(shared: Partial<TbiSharedState>) {
  tbiState.update((state) => {
    const describesTabs =
      shared.mode !== undefined ||
      shared.nbColumns !== undefined ||
      shared.singleColumnAlign !== undefined ||
      shared.tabs !== undefined ||
      shared.tabConfigs !== undefined
    if (describesTabs) applySharedTabs(state, shared)
    else if (typeof shared.activeTab === 'number' && shared.activeTab >= 0) {
      const tab = state.tabs[Math.round(shared.activeTab)]
      if (tab) state.activeTabId = tab.id
    }
    if (Array.isArray(shared.tabNames)) {
      shared.tabNames.forEach((name, i) => {
        if (state.tabs[i] && (typeof name === 'string' || name === null)) {
          state.tabs[i].name = name
        }
      })
    }
    if (Array.isArray(shared.boards)) {
      shared.boards.forEach((board, i) => {
        const tab = state.tabs[i]
        if (tab && board && isTbiBoardBackground(board.background)) {
          tab.board = {
            background: board.background,
            gridSize: clampGridSize(board.gridSize),
            strokes: tab.board?.strokes ?? [],
          }
        }
      })
    }
    if (Array.isArray(shared.breaks)) {
      state.cards.forEach((card, i) => {
        card.colBreak = shared.breaks!.includes(i)
      })
    }
    if (Array.isArray(shared.columns) || Array.isArray(shared.breaks)) {
      state.cards.forEach((card, i) => {
        const column = shared.columns?.[i]
        if (
          typeof column === 'number' &&
          Number.isInteger(column) &&
          column >= 0 &&
          column < 4
        )
          card.column = column
        else delete card.column
      })
    }
    if (Array.isArray(shared.zooms)) {
      shared.zooms.forEach((zoom, i) => {
        if (state.cards[i] && typeof zoom === 'number') {
          state.cards[i].zoom = clampZoom(zoom)
        }
      })
    }
    if (Array.isArray(shared.questionSpacings)) {
      shared.questionSpacings.forEach((spacing, i) => {
        if (state.cards[i] && typeof spacing === 'number') {
          state.cards[i].questionSpacing = Math.max(
            TBI_MIN_QUESTION_SPACING,
            Math.round(spacing),
          )
        }
      })
    }
    if (Array.isArray(shared.corrections)) {
      shared.corrections.forEach((mode, i) => {
        if (state.cards[i] && TBI_CORRECTION_MODES.includes(mode)) {
          state.cards[i].correctionMode = mode
        }
      })
    }
    if (Array.isArray(shared.correctionDetails)) {
      shared.correctionDetails.forEach((detail, i) => {
        if (state.cards[i] && TBI_CORRECTION_DETAILS.includes(detail)) {
          state.cards[i].correctionDetail = detail
        }
      })
    }
    return state
  })
  if (Array.isArray(shared.tools)) {
    applySharedTools(shared.tools, get(tbiState).tabs)
  }
  applyLegacySharedTools(shared)
  // une seule correction en plein écran à la fois : on garde la première
  const modalIndex = get(tbiState).cards.findIndex(
    (card) => card.correctionMode === 'modal',
  )
  if (modalIndex !== -1) {
    tbiState.update((state) => {
      state.cards.forEach((card, i) => {
        if (i !== modalIndex && card.correctionMode === 'modal') {
          card.correctionMode = 'hidden'
        }
      })
      return state
    })
    activeTbiModalCard.set(modalIndex)
  }
}

/** Partie locale de l'état (positions dépendantes de l'écran, en localStorage) */
interface TbiLocalLayout {
  cards: { x: number; y: number; w: number; zoom: number }[]
  /** Largeur de l'écran de la sauvegarde : les positions y sont reportées */
  viewportWidth?: number
  /** `zoom` : anciennes sauvegardes, où l'horloge était mise à l'échelle */
  widget?: { x?: number; y?: number; w?: number; zoom?: number }
  trafficLight?: {
    x?: number
    y?: number
    w?: number
    h?: number
    active?: TbiTrafficLightColor
  }
  studentPicker?: {
    x?: number
    y?: number
    w?: number
    h?: number
    classId?: string | null
  }
  collegeCalculator?: { x?: number; y?: number; w?: number; h?: number }
  lyceeCalculator?: { x?: number; y?: number; w?: number; h?: number }
  calculette?: { x?: number; y?: number; w?: number; h?: number }
}

/** Largeur de référence du zoom des anciennes sauvegardes de l'horloge */
const TBI_CLOCK_LEGACY_BASE_W = 224

function tbiStorageKey(uuids: string[]): string {
  return `tbiLayout:${uuids.join(',')}`
}

function buildTbiLocalLayout(state: TbiState): TbiLocalLayout {
  const memory = getTbiToolMemory()
  const pick = (
    kind: TbiSimpleToolKind,
    keys: string[],
  ): Record<string, unknown> =>
    Object.fromEntries(
      keys.flatMap((key) => {
        const value = (memory[kind] as Record<string, unknown> | undefined)?.[
          key
        ]
        return value === undefined ? [] : [[key, value]]
      }),
    )
  const place = ['x', 'y', 'w', 'h']
  return {
    cards: state.cards.map(({ x, y, w, zoom }) => ({ x, y, w, zoom })),
    viewportWidth: window.innerWidth,
    widget: pick('clock', ['x', 'y', 'w']),
    trafficLight: pick('trafficLight', [...place, 'active']),
    studentPicker: pick('studentPicker', [...place, 'classId']),
    collegeCalculator: pick('college', place),
    lyceeCalculator: pick('lycee', place),
    calculette: pick('calculette', place),
  }
}

export function saveTbiLocalLayout(uuids: string[]) {
  if (!isLocalStorageAvailable()) return
  const layout = buildTbiLocalLayout(get(tbiState))
  try {
    window.localStorage.setItem(tbiStorageKey(uuids), JSON.stringify(layout))
  } catch {
    // stockage plein ou indisponible : sans conséquence
  }
}

export function loadTbiLocalLayout(uuids: string[]) {
  if (!isLocalStorageAvailable()) return
  let layout: TbiLocalLayout
  try {
    const saved = window.localStorage.getItem(tbiStorageKey(uuids))
    if (saved == null) return
    layout = JSON.parse(saved)
  } catch {
    return
  }
  applyTbiLocalLayout(layout)
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number'
}

function applyToolMemory(kind: TbiSimpleToolKind, patch: Partial<TbiTool>) {
  setTbiToolMemory(kind, patch)
  for (const tool of get(tbiTools)) {
    if (tool.kind === kind) updateTbiTool(tool.id, patch)
  }
}

function applyTbiLocalLayout(layout: TbiLocalLayout) {
  tbiState.update((state) => {
    if (Array.isArray(layout.cards)) {
      layout.cards.forEach((card, i) => {
        if (
          state.cards[i] &&
          typeof card?.x === 'number' &&
          typeof card?.y === 'number' &&
          typeof card?.w === 'number'
        ) {
          Object.assign(
            state.cards[i],
            rescaleFreeCard(card, layout.viewportWidth, window.innerWidth, {
              minW: TBI_MIN_CARD_WIDTH,
              maxW: TBI_MAX_CARD_WIDTH,
            }),
          )
          // rétrocompatibilité : anciennes sauvegardes sans zoom propre,
          // où la largeur pilotait encore le zoom
          state.cards[i].zoom =
            typeof card.zoom === 'number'
              ? clampZoom(card.zoom)
              : clampZoom(Math.round((card.w / TBI_BASE_WIDTH) * 100) / 100)
        }
      })
    }
    return state
  })
  const position = (saved?: { x?: number; y?: number }) =>
    isNumber(saved?.x) && isNumber(saved?.y) ? { x: saved.x, y: saved.y } : {}

  const clock = layout.widget
  const clockWidth = isNumber(clock?.w)
    ? clock.w
    : isNumber(clock?.zoom)
      ? clock.zoom * TBI_CLOCK_LEGACY_BASE_W
      : undefined
  applyToolMemory('clock', {
    ...position(clock),
    ...(clockWidth === undefined
      ? {}
      : { w: clamp(clockWidth, TBI_CLOCK_MIN_W, TBI_CLOCK_MAX_W) }),
  })

  const light = layout.trafficLight
  applyToolMemory('trafficLight', {
    ...position(light),
    ...(isNumber(light?.w)
      ? { w: clamp(light.w, TBI_TRAFFIC_LIGHT_MIN_W, TBI_TRAFFIC_LIGHT_MAX_W) }
      : {}),
    ...(isNumber(light?.h)
      ? { h: clamp(light.h, TBI_TRAFFIC_LIGHT_MIN_H, TBI_TRAFFIC_LIGHT_MAX_H) }
      : {}),
    ...(light?.active === 'red' ||
    light?.active === 'orange' ||
    light?.active === 'green'
      ? { active: light.active }
      : {}),
  } as Partial<TbiTool>)

  const picker = layout.studentPicker
  applyToolMemory('studentPicker', {
    ...position(picker),
    ...(isNumber(picker?.w)
      ? {
          w: clamp(
            picker.w,
            TBI_STUDENT_PICKER_MIN_W,
            TBI_STUDENT_PICKER_MAX_W,
          ),
        }
      : {}),
    ...(isNumber(picker?.h)
      ? {
          h: clamp(
            picker.h,
            TBI_STUDENT_PICKER_MIN_H,
            TBI_STUDENT_PICKER_MAX_H,
          ),
        }
      : {}),
    ...(typeof picker?.classId === 'string' || picker?.classId === null
      ? { classId: picker.classId }
      : {}),
  } as Partial<TbiTool>)

  for (const [key, kind] of [
    ['collegeCalculator', 'college'],
    ['lyceeCalculator', 'lycee'],
    ['calculette', 'calculette'],
  ] as const) {
    const saved = layout[key]
    // la hauteur est toujours dérivée de la largeur (ratio fixe) : une
    // ancienne sauvegarde au ratio différent est ainsi corrigée au chargement
    const w = isNumber(saved?.w)
      ? clamp(saved.w, TBI_CALCULATOR_MIN_W, TBI_CALCULATOR_MAX_W)
      : undefined
    applyToolMemory(kind, {
      ...position(saved),
      ...(w === undefined ? {} : { w, h: calculatorHeightForWidth(kind, w) }),
    })
  }
}

/** La fenêtre change de largeur : les cartes libres gardent leur place relative */
export function rescaleTbiFreeCards(fromWidth: number, toWidth: number) {
  tbiState.update((state) => {
    state.cards = state.cards.map((card) => ({
      ...card,
      ...rescaleFreeCard(card, fromWidth, toWidth, {
        minW: TBI_MIN_CARD_WIDTH,
        maxW: TBI_MAX_CARD_WIDTH,
      }),
    }))
    return state
  })
}

/**
 * Fichier de réglages de la vue TBI, état d'une séance enregistrée dans « Mes
 * séances au vidéoprojecteur » (voir `exportTbiSession`) : tous les
 * réglages d'affichage — la partie partageable (URL), la partie dépendante de
 * l'écran (localStorage) et les états de présentation propres à la session
 * (repli des cartes, mode de l'horloge, colonnes internes de chaque exercice)
 * ainsi que la liste des exercices (paramètres compris). Les réglages sont
 * appliqués par indice aux exercices affichés.
 */
export interface TbiSettingsFile {
  type: typeof TBI_SETTINGS_FILE_TYPE
  version: number
  shared: Partial<TbiSharedState>
  layout: TbiLocalLayout
  collapsed: boolean[]
  widgetMode: TbiClockMode
  /** Nombre de colonnes de questions de chaque exercice (1 = défaut) */
  cols: number[]
  /** Exercices affichés, avec leurs paramètres (graine, nombre de questions…) */
  exercices: InterfaceParams[]
  /**
   * Visualiseurs ouverts depuis un lien (document, vidéo, page web), notes et
   * figures, avec leur position et leur taille. Absent des séances enregistrées
   * avant leur ajout.
   */
  documents?: TbiSavedDocument[]
  /** Écriture de chaque onglet qui en a une (rang de l'onglet, traits) */
  boards?: { tab: number; strokes: TbiStroke[] }[]
}

export const TBI_SETTINGS_FILE_TYPE = SESSION_STATE_TYPE
export const TBI_SETTINGS_FILE_VERSION = 2
const TBI_WIDGET_MODES: TbiClockMode[] = ['clock', 'timer', 'stopwatch']

function exportTbiBoards(state: TbiState) {
  return state.tabs.flatMap((tab, i) =>
    tab.board && tab.board.strokes.length > 0
      ? [{ tab: i, strokes: tab.board.strokes }]
      : [],
  )
}

export function applyTbiBoards(value: unknown) {
  if (!Array.isArray(value)) return
  tbiState.update((state) => {
    for (const entry of value as { tab?: unknown; strokes?: unknown }[]) {
      const tab =
        typeof entry?.tab === 'number' ? state.tabs[entry.tab] : undefined
      if (tab?.board) tab.board.strokes = readSavedStrokes(entry.strokes)
    }
    return state
  })
}

export function exportTbiSettings(): TbiSettingsFile {
  const state = get(tbiState)
  const clockMemory = getTbiToolMemory().clock as { mode?: TbiClockMode }
  return {
    type: TBI_SETTINGS_FILE_TYPE,
    version: TBI_SETTINGS_FILE_VERSION,
    shared: getTbiSharedState(state),
    layout: buildTbiLocalLayout(state),
    collapsed: state.cards.map((card) => Boolean(card.collapsed)),
    widgetMode: clockMemory?.mode ?? 'clock',
    cols: get(exercicesParams).map((params) => params.cols ?? 1),
    exercices: get(exercicesParams).map((params) => ({ ...params })),
    documents: exportTbiLinkViewers((scope) => tabScopeIndex(state, scope)),
    boards: exportTbiBoards(state),
  }
}

/** État de la vue pour « Mes séances au vidéoprojecteur » (voir `library.ts`) */
export function exportTbiSession(): SessionState {
  return { ...exportTbiSettings() }
}

export function isTbiSettingsFile(data: unknown): data is TbiSettingsFile {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as TbiSettingsFile).type === TBI_SETTINGS_FILE_TYPE
  )
}

/**
 * Applique un fichier de réglages (déjà passé par JSON.parse) à la vue TBI.
 * @returns false si le contenu n'est pas un fichier de réglages TBI
 */
export function importTbiSettings(data: unknown): boolean {
  if (!isTbiSettingsFile(data)) return false
  const file = data as Partial<TbiSettingsFile>
  // même ordre qu'au chargement de la vue : positions locales puis partage
  if (typeof file.layout === 'object' && file.layout !== null) {
    applyTbiLocalLayout(file.layout)
  }
  if (typeof file.shared === 'object' && file.shared !== null) {
    applyTbiSharedState(file.shared)
  }
  tbiState.update((state) => {
    if (Array.isArray(file.collapsed)) {
      file.collapsed.forEach((collapsed, i) => {
        if (state.cards[i]) state.cards[i].collapsed = collapsed === true
      })
    }
    return state
  })
  if (file.widgetMode && TBI_WIDGET_MODES.includes(file.widgetMode)) {
    applyToolMemory('clock', { mode: file.widgetMode } as Partial<TbiTool>)
  }
  applyTbiBoards(file.boards)
  if (file.documents !== undefined) {
    const { tabs } = get(tbiState)
    restoreTbiLinkViewers(
      readSavedDocuments(file.documents),
      (index) => tabs[index]?.id,
    )
  }
  if (Array.isArray(file.cols)) {
    const cols = file.cols
    exercicesParams.update((list) => {
      list.forEach((params, i) => {
        const n = cols[i]
        if (typeof n === 'number') {
          const clamped = Math.min(4, Math.max(1, Math.round(n)))
          params.cols = clamped === 1 ? undefined : clamped
        }
      })
      return list
    })
  }
  return true
}

// ------------------------------------------------------------------
// Brouillon
// ------------------------------------------------------------------

/**
 * Brouillon de la séance, le temps d'un onglet du navigateur : l'écriture du
 * Tableau et les notes ne tiennent pas dans une URL. Un rechargement de la page
 * les retrouve, sans qu'ils réapparaissent dans une autre vue plus tard.
 */
const TBI_DRAFT_KEY = 'tbiDraft'

interface TbiDraft {
  key: string
  boards: { tab: number; strokes: TbiStroke[] }[]
  documents: TbiSavedDocument[]
}

export function saveTbiDraft(uuids: string[]) {
  const state = get(tbiState)
  const draft: TbiDraft = {
    key: uuids.join(','),
    boards: exportTbiBoards(state),
    documents: exportTbiLinkViewers((scope) => tabScopeIndex(state, scope)),
  }
  try {
    window.sessionStorage.setItem(TBI_DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // brouillon trop volumineux ou stockage indisponible : la séance reste
    // enregistrable à la main
  }
}

/**
 * Reprend le brouillon de cette séance.
 * @returns vrai si un brouillon a été repris
 */
export function loadTbiDraft(uuids: string[]): boolean {
  let draft: TbiDraft | null = null
  try {
    const saved = window.sessionStorage.getItem(TBI_DRAFT_KEY)
    draft = saved === null ? null : (JSON.parse(saved) as TbiDraft)
  } catch {
    return false
  }
  if (!draft || draft.key !== uuids.join(',')) return false
  applyTbiBoards(draft.boards)
  if (Array.isArray(draft.documents) && draft.documents.length > 0) {
    const { tabs } = get(tbiState)
    restoreTbiLinkViewers(
      readSavedDocuments(draft.documents),
      (index) => tabs[index]?.id,
    )
  }
  return true
}
