import { describe, expect, it } from 'vitest'
import {
  freeLayoutColumns,
  packFreeCards,
  partitionByHeight,
  rescaleFreeCard,
  snapFreePosition,
} from '../../src/lib/tbiLayout'

describe('partitionByHeight', () => {
  it('équilibre par la hauteur, pas par le nombre', () => {
    // une carte haute puis trois petites : 1 + 3 plutôt que 2 + 2
    expect(partitionByHeight([600, 100, 100, 100], 2)).toEqual([1])
  })

  it('garde l’ordre des exercices sur plusieurs colonnes', () => {
    expect(partitionByHeight([100, 100, 100, 100, 100, 100], 3)).toEqual([2, 4])
  })

  it('ne crée pas de colonne vide', () => {
    expect(partitionByHeight([100, 100], 4)).toEqual([1])
    expect(partitionByHeight([], 3)).toEqual([])
    expect(partitionByHeight([100, 200], 1)).toEqual([])
  })
})

describe('packFreeCards', () => {
  it('range les cartes sans recouvrement et occupe la largeur', () => {
    const heights = [300, 200, 400, 100, 150]
    const cards = packFreeCards(heights, 1888)
    expect(freeLayoutColumns(heights.length)).toBe(3)
    for (let i = 0; i < cards.length; i++) {
      expect(cards[i].x + cards[i].w).toBeLessThanOrEqual(1888)
      for (let j = i + 1; j < cards.length; j++) {
        const apartX =
          cards[i].x + cards[i].w <= cards[j].x ||
          cards[j].x + cards[j].w <= cards[i].x
        const apartY =
          cards[i].y + heights[i] <= cards[j].y ||
          cards[j].y + heights[j] <= cards[i].y
        expect(apartX || apartY).toBe(true)
      }
    }
    // la moitié droite n'est plus vide
    expect(Math.max(...cards.map((c) => c.x + c.w))).toBeGreaterThan(1800)
  })

  it('une carte seule occupe la largeur', () => {
    expect(packFreeCards([300], 1000)).toEqual([{ x: 0, y: 0, w: 1000 }])
  })
})

describe('snapFreePosition', () => {
  const other = { x: 100, y: 100, w: 200, h: 200 }

  it('aimante au bord de la zone et aux autres cartes', () => {
    expect(snapFreePosition({ x: 5, y: 8, w: 100, h: 100 }, [], 1000)).toEqual({
      x: 0,
      y: 0,
    })
    expect(
      snapFreePosition({ x: 305, y: 104, w: 100, h: 100 }, [other], 1000),
    ).toEqual({ x: 300, y: 100 })
  })

  it('aimante le bord droit', () => {
    expect(
      snapFreePosition({ x: 895, y: 500, w: 100, h: 100 }, [], 1000).x,
    ).toBe(900)
  })

  it('laisse une carte loin de tout', () => {
    expect(
      snapFreePosition({ x: 500, y: 500, w: 100, h: 100 }, [other], 1000),
    ).toEqual({ x: 500, y: 500 })
  })
})

describe('rescaleFreeCard', () => {
  const bounds = { minW: 240, maxW: 1800 }

  it('garde la place relative sur un écran plus petit', () => {
    expect(
      rescaleFreeCard({ x: 960, y: 200, w: 600 }, 1920, 960, bounds),
    ).toEqual({ x: 480, y: 100, w: 300 })
  })

  it('ramène dans l’écran une carte sans largeur de référence', () => {
    expect(
      rescaleFreeCard({ x: 1500, y: 40, w: 600 }, undefined, 1000, bounds),
    ).toEqual({ x: 400, y: 40, w: 600 })
  })
})
