/**
 * Calculs de mise en page de la vue TBI, sans DOM : répartition des exercices
 * dans les colonnes selon leur hauteur, rangement de la disposition libre,
 * aimantation et remise à l'échelle des positions.
 */

export interface TbiBox {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Découpe une suite d'exercices en `nbColumns` colonnes, sans changer leur
 * ordre, en minimisant la hauteur de la colonne la plus haute.
 * @returns les rangs des exercices qui commencent une nouvelle colonne
 */
export function partitionByHeight(
  heights: number[],
  nbColumns: number,
): number[] {
  const n = heights.length
  if (n === 0 || nbColumns <= 1) return []
  const columns = Math.min(nbColumns, n)
  const prefix = [0]
  for (const height of heights) prefix.push(prefix[prefix.length - 1] + height)
  const sum = (from: number, to: number) => prefix[to] - prefix[from]
  // best[k][i] : meilleure hauteur maximale pour les i premiers en k colonnes
  const best = Array.from({ length: columns + 1 }, () =>
    new Array<number>(n + 1).fill(Infinity),
  )
  const cut = Array.from({ length: columns + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  )
  best[0][0] = 0
  for (let k = 1; k <= columns; k++) {
    for (let i = k; i <= n; i++) {
      for (let j = k - 1; j < i; j++) {
        const value = Math.max(best[k - 1][j], sum(j, i))
        if (value < best[k][i]) {
          best[k][i] = value
          cut[k][i] = j
        }
      }
    }
  }
  const breaks: number[] = []
  let end = n
  for (let k = columns; k > 1; k--) {
    end = cut[k][end]
    breaks.unshift(end)
  }
  return breaks
}

/** Nombre de colonnes du rangement de la disposition libre */
export function freeLayoutColumns(count: number): number {
  return Math.min(3, Math.max(1, Math.ceil(Math.sqrt(count))))
}

/**
 * Range des cartes de même largeur dans la colonne la moins haute, sans
 * recouvrement, dans l'ordre de la séance.
 */
export function packFreeCards(
  heights: number[],
  areaWidth: number,
  gap = 16,
): { x: number; y: number; w: number }[] {
  const nbColumns = freeLayoutColumns(heights.length)
  const w = (areaWidth - gap * (nbColumns - 1)) / nbColumns
  const bottoms = new Array<number>(nbColumns).fill(0)
  return heights.map((height) => {
    const column = bottoms.indexOf(Math.min(...bottoms))
    const position = {
      x: Math.round(column * (w + gap)),
      y: Math.round(bottoms[column]),
      w: Math.round(w),
    }
    bottoms[column] += height + gap
    return position
  })
}

/** Distance (px) en deçà de laquelle une carte s'aimante */
const SNAP_DISTANCE = 12

/** Aimante une carte aux bords de la zone et aux bords des autres cartes */
export function snapFreePosition(
  box: TbiBox,
  others: TbiBox[],
  areaWidth: number,
): { x: number; y: number } {
  const closest = (value: number, candidates: number[]): number => {
    let result = value
    let distance = SNAP_DISTANCE
    for (const candidate of candidates) {
      const gap = Math.abs(candidate - value)
      if (gap < distance) {
        distance = gap
        result = candidate
      }
    }
    return result
  }
  const xs = [0, ...others.flatMap((o) => [o.x, o.x + o.w])]
  const rights = [areaWidth, ...others.flatMap((o) => [o.x, o.x + o.w])]
  const ys = [0, ...others.flatMap((o) => [o.y, o.y + o.h])]
  const bottoms = others.flatMap((o) => [o.y, o.y + o.h])
  const snappedX = closest(box.x, xs)
  const snappedRight = closest(box.x + box.w, rights) - box.w
  const snappedY = closest(box.y, ys)
  const snappedBottom = closest(box.y + box.h, bottoms) - box.h
  return {
    x: snappedX !== box.x ? snappedX : snappedRight,
    y: snappedY !== box.y ? snappedY : snappedBottom,
  }
}

/**
 * Reporte une carte enregistrée sur un écran d'une autre largeur : même place
 * relative, et jamais hors de l'écran.
 */
export function rescaleFreeCard(
  card: { x: number; y: number; w: number },
  fromWidth: number | undefined,
  toWidth: number,
  bounds: { minW: number; maxW: number },
): { x: number; y: number; w: number } {
  const ratio = fromWidth && fromWidth > 0 ? toWidth / fromWidth : 1
  const w = Math.min(
    bounds.maxW,
    Math.max(bounds.minW, Math.min(toWidth, Math.round(card.w * ratio))),
  )
  return {
    x: Math.max(0, Math.min(Math.round(card.x * ratio), toWidth - w)),
    y: Math.max(0, Math.round(card.y * ratio)),
    w,
  }
}
