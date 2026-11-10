/**
 * Actions Svelte des panneaux de la vue TBI : déplacer un panneau à la racine de
 * la vue, pour qu'il passe au-dessus des cartes et des outils, et le fermer
 * quand on touche ailleurs ou qu'on appuie sur Échap.
 */

/** Place l'élément à la fin de la vue (`<main>`), hors des contextes d'empilement */
export function portalToMain(node: HTMLElement) {
  document.querySelector('main')?.append(node)
  return {
    destroy() {
      node.remove()
    },
  }
}

export interface DismissOptions {
  onDismiss: () => void
  /** Éléments dont le toucher ne ferme pas le panneau (son bouton d'ouverture) */
  ignore?: () => (Element | null | undefined)[]
}

/** Ferme le panneau quand on touche ailleurs, sauf dans une fenêtre qu'il a ouverte */
export function dismissable(node: HTMLElement, options: DismissOptions) {
  let current = options

  function onPointerDown(event: PointerEvent) {
    const target = event.target
    if (!(target instanceof Element)) return
    if (node.contains(target) || target.closest('dialog')) return
    if (current.ignore?.().some((element) => element?.contains(target))) return
    current.onDismiss()
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') current.onDismiss()
  }

  window.addEventListener('pointerdown', onPointerDown, true)
  window.addEventListener('keydown', onKeydown)
  return {
    update(next: DismissOptions) {
      current = next
    },
    destroy() {
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.removeEventListener('keydown', onKeydown)
    },
  }
}

/**
 * Position d'un panneau à côté de son bouton : à droite s'il y tient, sinon à
 * gauche, sans sortir de l'écran ni passer sous le bandeau. Fonction sans DOM.
 */
export function popoverPosition(
  anchor: { left: number; right: number; top: number },
  panel: { width: number; height: number },
  viewport: { width: number; height: number },
  bottomReserve = 88,
): { left: number; top: number } {
  const gap = 8
  const fitsRight = anchor.right + gap + panel.width <= viewport.width - gap
  const left = fitsRight
    ? anchor.right + gap
    : Math.max(gap, anchor.left - gap - panel.width)
  const maxTop = viewport.height - bottomReserve - panel.height
  return { left, top: Math.max(gap, Math.min(anchor.top, maxTop)) }
}
