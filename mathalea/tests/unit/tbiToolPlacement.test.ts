import { describe, expect, it } from 'vitest'
import { findFreeSpot, TBI_BOTTOM_RESERVE } from '../../src/lib/tbiToolPlacement'
import { tbiTapEffect } from '../../src/lib/tbiControls'

const viewport = { w: 1920, h: 1080 }

describe('findFreeSpot', () => {
  it("place le premier outil en haut à droite", () => {
    expect(findFreeSpot({ w: 300, h: 200 }, [], viewport)).toEqual({
      x: 1920 - 300 - 16,
      y: 16,
    })
  })

  it('ne recouvre pas un outil déjà ouvert', () => {
    const first = { x: 1604, y: 16, w: 300, h: 200 }
    const spot = findFreeSpot({ w: 300, h: 200 }, [first], viewport)
    const apart =
      spot.y >= first.y + first.h ||
      spot.x + 300 <= first.x ||
      spot.x >= first.x + first.w
    expect(apart).toBe(true)
  })

  it('reste au-dessus des commandes du bas de l\'écran', () => {
    const spot = findFreeSpot({ w: 300, h: 900 }, [], viewport)
    expect(spot.y + 900).toBeLessThanOrEqual(1080 - TBI_BOTTOM_RESERVE)
  })

  it("garde l'outil dans l'écran quand il n'y a plus de place", () => {
    const full = { x: 0, y: 0, w: 1920, h: 1080 }
    const spot = findFreeSpot({ w: 300, h: 200 }, [full], viewport)
    expect(spot.x).toBeGreaterThanOrEqual(0)
    expect(spot.y).toBeGreaterThanOrEqual(0)
    expect(spot.x + 300).toBeLessThanOrEqual(1920)
  })
})

describe('tbiTapEffect', () => {
  const tap = {
    isVisible: true,
    isInteractive: false,
    isInCard: false,
    hadOpenPanel: false,
  }

  it('masque les commandes au tapotement sur le fond', () => {
    expect(tbiTapEffect(tap)).toBe('hide')
  })

  it('réveille les commandes masquées', () => {
    expect(tbiTapEffect({ ...tap, isVisible: false })).toBe('wake')
  })

  it("un tapotement sur un exercice ou une commande ne les masque pas", () => {
    expect(tbiTapEffect({ ...tap, isInCard: true })).toBe('wake')
    expect(tbiTapEffect({ ...tap, isInteractive: true })).toBe('wake')
  })

  it('un tapotement qui referme un panneau ne masque pas les commandes', () => {
    expect(tbiTapEffect({ ...tap, hadOpenPanel: true })).toBe('wake')
  })
})
