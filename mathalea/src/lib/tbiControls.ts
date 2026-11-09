import { get, writable } from 'svelte/store'

/**
 * Affichage des commandes de la vue TBI, commun à la barre, aux cartes et aux
 * outils : comme sur un lecteur vidéo, elles viennent à la demande puis
 * s'effacent pour laisser l'écran au contenu.
 *
 * - souris ou stylet qui survole : tout mouvement les réveille ;
 * - doigt : un tapotement sur le fond les affiche ou les masque, sans agir sur
 *   le contenu ; un tapotement sur un exercice les réveille seulement ;
 * - clavier : prendre le focus sur une commande masquée la réveille.
 *
 * Elles ne s'effacent jamais tant que le pointeur est sur une commande, qu'une
 * commande a le focus clavier, qu'un panneau ou une fenêtre est ouvert, ou
 * qu'un geste est en cours (voir `isHeld`).
 */

export const TBI_CONTROLS_HIDE_DELAY = 4000

/** Marque une zone de commandes : le pointeur ou le focus y suspend le masquage */
export const TBI_CHROME_SELECTOR = '[data-tbi-chrome]'
/** Marque un panneau ouvert : sa présence suspend le masquage */
export const TBI_PANEL_SELECTOR = '[data-tbi-panel]'

/** Déplacement maximal (px) pour qu'un toucher reste un tapotement */
const TAP_TOLERANCE = 12

/** Ce qui réagit à un tapotement : le reste de l'écran est le « fond » */
const INTERACTIVE_SELECTOR =
  'button, a, input, select, textarea, label, summary, [role="button"], math-field, iframe, canvas, dialog, [data-tbi-tool], [data-tbi-board], ' +
  TBI_CHROME_SELECTOR

export const tbiControlsVisible = writable(true)

/**
 * Mise en page en cours : poignées, disposition et alignement sont proposés.
 * Le reste du temps, seules les commandes d'animation le sont, pour qu'un élève
 * au tableau ne déplace pas un exercice par accident.
 */
export const tbiEditing = writable(false)

/**
 * Écriture en cours : le pointeur écrit partout, y compris par-dessus les
 * exercices, et le bandeau présente les commandes du stylo. Le reste du temps,
 * l'écriture reste affichée sans gêner l'usage des exercices.
 */
export const tbiWriting = writable(false)

/** Vue en plein écran (l'interface du navigateur disparaît de la projection) */
export const tbiFullscreen = writable(false)

export async function toggleTbiFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen()
  } catch {
    // refusé par le navigateur : la vue reste utilisable dans sa fenêtre
  }
}

const MIRROR_KEY = 'tbiBarMirrored'

function readMirrored(): boolean {
  try {
    return window.localStorage.getItem(MIRROR_KEY) === '1'
  } catch {
    return false
  }
}

/** Bandeau inversé, selon le côté du tableau où se tient le prof (sur ce poste) */
export const tbiBarMirrored = writable(readMirrored())

export function setTbiBarMirrored(mirrored: boolean) {
  tbiBarMirrored.set(mirrored)
  try {
    window.localStorage.setItem(MIRROR_KEY, mirrored ? '1' : '0')
  } catch {
    // préférence perdue au prochain chargement : sans conséquence
  }
}

/** Panneau ouvert depuis le bandeau */
export type TbiBarPanel = 'tools' | 'session' | 'background' | 'shapes' | 'ink'
export const tbiOpenPanel = writable<TbiBarPanel | null>(null)

/** Onglet survolé pendant le glisser d'un exercice, qui peut y être déposé */
export const tbiDropTabId = writable<string | null>(null)

/** Onglet du bandeau sous ce point de l'écran */
export function tbiTabIdAtPoint(x: number, y: number): string | null {
  return (
    document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-tbi-tab-id]')
      ?.dataset.tbiTabId ?? null
  )
}

/** Dernière position du pointeur, quel qu'il soit */
export const tbiPointer = { x: 0, y: 0 }

let hideTimer: ReturnType<typeof setTimeout> | undefined
let lastPointerType = 'mouse'
let isPointerDown = false
/** Les commandes restent affichées, quoi qu'il arrive (écriture au tableau) */
let isForced = false

function isHeld(): boolean {
  if (isForced || isPointerDown) return true
  if (document.querySelector(`${TBI_PANEL_SELECTOR}, dialog[open]`)) return true
  if (
    lastPointerType === 'mouse' &&
    document.querySelector(`${TBI_CHROME_SELECTOR}:hover`)
  ) {
    return true
  }
  const active = document.activeElement
  return (
    active instanceof HTMLElement &&
    active.matches(':focus-visible') &&
    active.closest(TBI_CHROME_SELECTOR) !== null
  )
}

function armHideTimer() {
  if (hideTimer !== undefined) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    if (isHeld()) armHideTimer()
    else tbiControlsVisible.set(false)
  }, TBI_CONTROLS_HIDE_DELAY)
}

export function wakeTbiControls() {
  tbiControlsVisible.set(true)
  armHideTimer()
}

export function hideTbiControls() {
  if (hideTimer !== undefined) clearTimeout(hideTimer)
  if (!isForced) tbiControlsVisible.set(false)
}

/** Garde les commandes affichées (true), ou rétablit leur masquage (false) */
export function forceTbiControls(forced: boolean) {
  isForced = forced
  if (forced) wakeTbiControls()
}

/**
 * Décide de l'effet d'un tapotement : `wake` pour réveiller les commandes,
 * `hide` pour les masquer. Fonction pure, sans DOM.
 */
export function tbiTapEffect(options: {
  isVisible: boolean
  /** Le tapotement vise une commande, un outil, un champ, un bouton… */
  isInteractive: boolean
  /** Le tapotement vise un exercice (son texte) */
  isInCard: boolean
  /** Un panneau était ouvert : le tapotement sert à le refermer */
  hadOpenPanel: boolean
}): 'wake' | 'hide' {
  const { isVisible, isInteractive, isInCard, hadOpenPanel } = options
  if (!isVisible || isInteractive || isInCard || hadOpenPanel) return 'wake'
  return 'hide'
}

/**
 * Installe les écouteurs de la vue TBI.
 * @returns la fonction qui les retire
 */
export function installTbiControls(): () => void {
  let tapStart: { x: number; y: number; hadPanel: boolean } | null = null

  function onPointerMove(event: PointerEvent) {
    tbiPointer.x = event.clientX
    tbiPointer.y = event.clientY
    if (event.pointerType === 'touch') return
    lastPointerType = event.pointerType
    wakeTbiControls()
  }

  function onPointerDown(event: PointerEvent) {
    tbiPointer.x = event.clientX
    tbiPointer.y = event.clientY
    lastPointerType = event.pointerType
    isPointerDown = true
    tapStart = {
      x: event.clientX,
      y: event.clientY,
      hadPanel: document.querySelector(TBI_PANEL_SELECTOR) !== null,
    }
    if (event.pointerType === 'mouse') wakeTbiControls()
  }

  function onPointerUp(event: PointerEvent) {
    isPointerDown = false
    if (event.pointerType === 'mouse') return
    const start = tapStart
    tapStart = null
    const isTap =
      start !== null &&
      Math.hypot(event.clientX - start.x, event.clientY - start.y) <
        TAP_TOLERANCE
    if (!isTap) {
      wakeTbiControls()
      return
    }
    const target = event.target instanceof Element ? event.target : null
    const effect = tbiTapEffect({
      isVisible: get(tbiControlsVisible),
      isInteractive: target?.closest(INTERACTIVE_SELECTOR) != null,
      isInCard: target?.closest('[data-tbi-card-content]') != null,
      hadOpenPanel: start.hadPanel,
    })
    if (effect === 'wake') wakeTbiControls()
    else hideTbiControls()
  }

  function onPointerCancel() {
    isPointerDown = false
    tapStart = null
  }

  function onFocusIn(event: FocusEvent) {
    const target = event.target
    if (
      target instanceof HTMLElement &&
      target.matches(':focus-visible') &&
      target.closest(TBI_CHROME_SELECTOR)
    ) {
      wakeTbiControls()
    }
  }

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerdown', onPointerDown, true)
  window.addEventListener('pointerup', onPointerUp, true)
  window.addEventListener('pointercancel', onPointerCancel, true)
  function onFullscreenChange() {
    tbiFullscreen.set(document.fullscreenElement !== null)
  }

  window.addEventListener('focusin', onFocusIn)
  document.addEventListener('fullscreenchange', onFullscreenChange)
  wakeTbiControls()
  return () => {
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerdown', onPointerDown, true)
    window.removeEventListener('pointerup', onPointerUp, true)
    window.removeEventListener('pointercancel', onPointerCancel, true)
    window.removeEventListener('focusin', onFocusIn)
    document.removeEventListener('fullscreenchange', onFullscreenChange)
    if (hideTimer !== undefined) clearTimeout(hideTimer)
    isForced = false
    isPointerDown = false
  }
}
