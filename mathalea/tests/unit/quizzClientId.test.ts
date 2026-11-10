import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getQuizzClientId } from '../../src/lib/quizz/quizzClientId'

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

describe('getQuizzClientId', () => {
  beforeEach(() => {
    // Node ≥ 23 expose son propre localStorage (Web Storage), que vitest
    // n'écrase pas avec celui de jsdom — et l'y accéder jette sans
    // --localstorage-file. On stubbe un stockage en mémoire (contrat
    // getItem/setItem) pour rendre le test indépendant de sa provenance.
    const store = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, String(value))
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
      clear: () => store.clear(),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('génère un uuid v4 et le persiste entre deux appels', () => {
    const first = getQuizzClientId()
    expect(first).toMatch(UUID_V4_REGEX)
    expect(localStorage.getItem('quizzClientId')).toBe(first)
    expect(getQuizzClientId()).toBe(first)
  })

  it('fonctionne sans crypto.randomUUID (contexte non sécurisé : http://IP-du-LAN)', () => {
    // crypto.getRandomValues reste disponible hors contexte sécurisé.
    vi.stubGlobal('crypto', {
      getRandomValues: (buffer: Uint8Array) => {
        buffer.fill(0xab)
        return buffer
      },
    })
    const clientId = getQuizzClientId()
    expect(clientId).toMatch(UUID_V4_REGEX)
    expect(getQuizzClientId()).toBe(clientId)
  })

  it('a un dernier repli sans aucune API crypto', () => {
    vi.stubGlobal('crypto', undefined)
    expect(getQuizzClientId()).toMatch(UUID_V4_REGEX)
  })

  it('rejoue un uuid de session si localStorage est indisponible', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('denied')
      },
      setItem: () => {
        throw new Error('denied')
      },
    })
    const first = getQuizzClientId()
    expect(first).toMatch(UUID_V4_REGEX)
    // Sans persistance, un nouvel identifiant est généré à chaque appel.
    expect(getQuizzClientId()).not.toBe(first)
  })
})
