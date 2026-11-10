/**
 * Ajustement d'une taille de contenu à la place disponible. Le contenu grandit
 * à peu près proportionnellement à son zoom, mais pas exactement (retours à la
 * ligne, figures) : l'estimation est reprise jusqu'à ce qu'il tienne.
 */

/** Prochain zoom à essayer pour que `contentHeight` tienne dans `available` */
export function nextFitZoom(
  zoom: number,
  contentHeight: number,
  available: number,
  bounds: { min: number; max: number },
): number {
  if (contentHeight <= 0 || available <= 0) return zoom
  const estimate = zoom * (available / contentHeight)
  // arrondi par défaut au centième : un zoom trop fin ne se voit pas
  const rounded = Math.floor(estimate * 100) / 100
  return Math.min(bounds.max, Math.max(bounds.min, rounded))
}

/**
 * Cherche le zoom pour lequel le contenu tient dans la place disponible.
 * @param apply applique un zoom au contenu
 * @param measure renvoie la hauteur du contenu et la place disponible, une fois
 * le zoom rendu
 */
export async function fitZoom(options: {
  start: number
  bounds: { min: number; max: number }
  apply: (zoom: number) => void
  measure: () => { content: number; available: number }
  iterations?: number
}): Promise<number> {
  const { start, bounds, apply, measure, iterations = 4 } = options
  const nextFrame = () =>
    new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    })
  let zoom = start
  for (let i = 0; i < iterations; i++) {
    await nextFrame()
    const { content, available } = measure()
    const next = nextFitZoom(zoom, content, available, bounds)
    if (Math.abs(next - zoom) < 0.01) {
      if (content <= available) break
      zoom = Math.max(bounds.min, zoom - 0.05)
    } else {
      zoom = next
    }
    apply(zoom)
  }
  await nextFrame()
  const final = measure()
  // dernière garantie : le contenu ne déborde pas si le zoom peut baisser
  let guard = 0
  while (final.content > final.available && zoom > bounds.min && guard < 6) {
    zoom = Math.max(bounds.min, zoom - 0.05)
    apply(zoom)
    await nextFrame()
    const check = measure()
    final.content = check.content
    final.available = check.available
    guard++
  }
  return zoom
}
