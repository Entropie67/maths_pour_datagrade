import { describe, expect, it } from 'vitest'
import { nextFitZoom } from '../../src/lib/components/tbiFit'
import { popoverPosition } from '../../src/lib/components/tbiPopup'

describe('nextFitZoom', () => {
  const bounds = { min: 1, max: 3 }

  it('agrandit un contenu qui a de la place', () => {
    expect(nextFitZoom(1, 400, 800, bounds)).toBe(2)
  })

  it('réduit un contenu qui déborde', () => {
    expect(nextFitZoom(2, 1000, 800, bounds)).toBe(1.6)
  })

  it('reste dans ses bornes', () => {
    expect(nextFitZoom(1, 100, 1000, bounds)).toBe(3)
    expect(nextFitZoom(1, 2000, 100, bounds)).toBe(1)
  })

  it('ne change rien sans mesure', () => {
    expect(nextFitZoom(1.5, 0, 800, bounds)).toBe(1.5)
  })
})

describe('popoverPosition', () => {
  const viewport = { width: 1920, height: 1080 }
  const panel = { width: 400, height: 500 }

  it('ouvre le panneau à droite de son bouton', () => {
    const anchor = { left: 100, right: 150, top: 200 }
    expect(popoverPosition(anchor, panel, viewport)).toEqual({
      left: 158,
      top: 200,
    })
  })

  it('passe à gauche quand il sortirait de l’écran', () => {
    const anchor = { left: 1800, right: 1850, top: 200 }
    expect(popoverPosition(anchor, panel, viewport).left).toBe(1392)
  })

  it('reste au-dessus du bandeau', () => {
    const anchor = { left: 100, right: 150, top: 900 }
    const { top } = popoverPosition(anchor, panel, viewport)
    expect(top + panel.height).toBeLessThanOrEqual(1080 - 88)
  })
})
