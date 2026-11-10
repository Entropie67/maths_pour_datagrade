/**
 * Placement des outils de la vue TBI (horloge, feu tricolore, calculatrices,
 * documents…) : un outil s'ouvre sur une place libre, en partant du haut à
 * droite, du côté opposé au début de l'énoncé. Fonctions sans DOM.
 */

export interface TbiRect {
  x: number
  y: number
  w: number
  h: number
}

/** Marge autour des outils et du bord de l'écran (px) */
const MARGIN = 16
/** Pas de recherche d'une place (px) */
const STEP = 24
/** Hauteur réservée en bas de l'écran pour le bandeau (px) */
export const TBI_BOTTOM_RESERVE = 96

function overlaps(a: TbiRect, b: TbiRect): boolean {
  return (
    a.x < b.x + b.w + MARGIN &&
    a.x + a.w + MARGIN > b.x &&
    a.y < b.y + b.h + MARGIN &&
    a.y + a.h + MARGIN > b.y
  )
}

/**
 * Première place libre pour un outil de taille `size`. Quand l'écran est plein,
 * l'outil s'ouvre en cascade depuis le coin haut droit plutôt que hors de vue.
 */
export function findFreeSpot(
  size: { w: number; h: number },
  occupied: TbiRect[],
  viewport: { w: number; h: number },
): { x: number; y: number } {
  const maxX = viewport.w - size.w - MARGIN
  const maxY = viewport.h - size.h - TBI_BOTTOM_RESERVE
  for (let x = maxX; x >= MARGIN; x -= STEP) {
    for (let y = MARGIN; y <= maxY; y += STEP) {
      const candidate = { w: size.w, h: size.h, x, y }
      if (!occupied.some((rect) => overlaps(candidate, rect))) return { x, y }
    }
  }
  const offset = (occupied.length % 8) * STEP
  return {
    x: Math.max(0, maxX - offset),
    y: Math.min(Math.max(0, maxY), MARGIN + offset),
  }
}
