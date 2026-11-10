import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildStatsUrl } from './statsUtils'

describe('statsPageTracker', () => {
  let statsPageTracker: typeof import('./statsUtils').statsPageTracker
  let initialUrl: string
  let initialQueue: typeof window._paq

  beforeEach(async () => {
    initialUrl = window.location.href
    initialQueue = window._paq
    vi.resetModules()
    ;({ statsPageTracker } = await import('./statsUtils'))
    window._paq = []
    window.history.replaceState({}, '', '/alea/?uuid=A&uuid=B&v=eleve')
  })

  afterEach(() => {
    window.history.replaceState({}, '', initialUrl)
    window._paq = initialQueue
  })

  it('définit l’URL Matomo avant la page vue sans modifier l’URL du navigateur', () => {
    const pageUrl = window.location.href
    statsPageTracker()
    expect(window._paq).toEqual([
      [
        'setCustomUrl',
        buildStatsUrl(`${window.location.origin}/alea/?uuid=A&uuid=B&v=eleve`),
      ],
      ['trackPageView'],
    ])
    expect(window.location.href).toBe(pageUrl)
    expect(new URL(pageUrl).searchParams.getAll('uuid')).toEqual(['A', 'B'])
  })

  it('compte chaque changement, y compris un retour, sans doubler une URL inchangée', () => {
    statsPageTracker()
    statsPageTracker()
    window.history.pushState({}, '', '/alea/?uuid=B&v=eleve')
    statsPageTracker()
    statsPageTracker()
    window.history.replaceState({}, '', '/alea/?uuid=A&uuid=B&v=eleve')
    statsPageTracker()
    expect(window._paq).toEqual([
      [
        'setCustomUrl',
        buildStatsUrl(`${window.location.origin}/alea/?uuid=A&uuid=B&v=eleve`),
      ],
      ['trackPageView'],
      [
        'setCustomUrl',
        buildStatsUrl(`${window.location.origin}/alea/?uuid=B&v=eleve`),
      ],
      ['trackPageView'],
      [
        'setCustomUrl',
        buildStatsUrl(`${window.location.origin}/alea/?uuid=A&uuid=B&v=eleve`),
      ],
      ['trackPageView'],
    ])
  })

  it('reste inactif sans Matomo et permet son initialisation ultérieure', () => {
    window._paq = undefined as unknown as typeof window._paq
    expect(() => statsPageTracker()).not.toThrow()
    window._paq = []
    statsPageTracker()
    expect(window._paq.at(-1)).toEqual(['trackPageView'])
  })
})
