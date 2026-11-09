/**
 * Actions Svelte de glisser-déposer et de redimensionnement à la souris,
 * au stylet ou au doigt (pointer events).
 * Utilisées par la vue TBI (mode libre et widget horloge).
 *
 * Les écouteurs move/up sont posés sur `window` : le geste continue même
 * quand le pointeur quitte la poignée (poignées petites, mouvements
 * rapides), et un pointerup n'est jamais manqué. `setPointerCapture`
 * est demandé en complément pour suivre le pointeur jusqu'en dehors de
 * la fenêtre, mais le geste n'en dépend pas.
 */

export interface PointerGestureOptions {
  /** Appelé au début du geste, avec la poignée (pour capturer l'état initial) */
  onStart?: (node: HTMLElement) => void
  /** Appelé à chaque déplacement avec le décalage depuis le dernier événement */
  onMove: (dx: number, dy: number) => void
  /** Appelé au relâchement du pointeur */
  onEnd?: () => void
}

export interface ResizableOptions extends PointerGestureOptions {
  /**
   * Curseur affiché sur la poignée (par défaut 'nwse-resize'). À préciser
   * pour les poignées en diagonale opposée (coins nord-est/sud-ouest), sans
   * quoi le curseur par défaut serait incorrect pour ces coins.
   */
  cursor?: string
}

function startGesture(
  node: HTMLElement,
  getOptions: () => PointerGestureOptions,
) {
  let lastX = 0
  let lastY = 0
  let activePointerId: number | null = null

  function onPointerDown(event: PointerEvent) {
    // ne pas capturer les clics sur les éléments interactifs de la poignée
    if (
      event.target instanceof Element &&
      event.target.closest('button, input, select, a, textarea')
    ) {
      return
    }
    // un geste précédent n'a pas été nettoyé correctement (pointerup
    // manqué...) : on le termine avant d'en démarrer un nouveau
    if (activePointerId !== null) {
      stopTracking()
    }
    event.preventDefault()
    activePointerId = event.pointerId
    lastX = event.clientX
    lastY = event.clientY
    try {
      node.setPointerCapture(event.pointerId)
    } catch {
      // pointeur déjà inactif (événement synthétique) : sans conséquence
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    getOptions().onStart?.(node)
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerId !== activePointerId) return
    getOptions().onMove(event.clientX - lastX, event.clientY - lastY)
    lastX = event.clientX
    lastY = event.clientY
  }

  function onPointerUp(event: PointerEvent) {
    if (event.pointerId !== activePointerId) return
    stopTracking()
    getOptions().onEnd?.()
  }

  function stopTracking() {
    if (activePointerId !== null) {
      try {
        node.releasePointerCapture(activePointerId)
      } catch {
        // capture jamais obtenue ou déjà relâchée : sans conséquence
      }
    }
    activePointerId = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)
  }

  node.style.touchAction = 'none'
  node.addEventListener('pointerdown', onPointerDown)
  return () => {
    node.removeEventListener('pointerdown', onPointerDown)
    stopTracking()
  }
}

/** Poignée de déplacement : onMove reçoit les décalages (dx, dy) en px */
export function draggable(node: HTMLElement, options: PointerGestureOptions) {
  let current = options
  const destroy = startGesture(node, () => current)
  node.style.cursor = 'move'
  return {
    update(next: PointerGestureOptions) {
      current = next
    },
    destroy,
  }
}

/**
 * Position (x, y) d'un widget de largeur w et de hauteur h ramenée dans la
 * fenêtre : le widget reste entier à l'écran quand il y tient, sinon son coin
 * supérieur gauche (où se trouve la barre de déplacement) reste visible.
 * Sans cela, un widget lâché hors de l'écran ne pouvait plus être récupéré :
 * sa position est enregistrée et relue au chargement suivant.
 */
export function clampToViewport(
  x: number,
  y: number,
  w: number,
  h: number,
  bottomReserve = 0,
): { x: number; y: number } {
  const maxX = Math.max(0, window.innerWidth - w)
  const maxY = Math.max(0, window.innerHeight - bottomReserve - h)
  return {
    x: Math.min(Math.max(0, x), maxX),
    y: Math.min(Math.max(0, y), maxY),
  }
}

/**
 * Vrai si la barre de déplacement d'un widget (bande de `GRIP_HEIGHT` px en
 * haut du widget de largeur w) reste assez visible pour être saisie.
 */
const GRIP_HEIGHT = 32
const GRIP_MIN_VISIBLE = 40
export function isGripReachable(x: number, y: number, w: number): boolean {
  return (
    y >= 0 &&
    y <= window.innerHeight - GRIP_HEIGHT &&
    x <= window.innerWidth - GRIP_MIN_VISIBLE &&
    x + w >= GRIP_MIN_VISIBLE
  )
}

/** Poignée de redimensionnement : onMove reçoit les décalages (dw, dh) en px */
export function resizable(node: HTMLElement, options: ResizableOptions) {
  let current = options
  const destroy = startGesture(node, () => current)
  node.style.cursor = options.cursor ?? 'nwse-resize'
  return {
    update(next: ResizableOptions) {
      current = next
      node.style.cursor = next.cursor ?? 'nwse-resize'
    },
    destroy,
  }
}
