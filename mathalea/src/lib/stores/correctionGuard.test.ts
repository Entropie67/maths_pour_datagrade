import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  isSeedBlockedForCorrection,
  pickSeedNotServedWithoutCorrection,
  rememberSeedServedWithoutCorrection,
} from './correctionGuard'

beforeEach(() => {
  // Node ≥ 23 expose son propre localStorage (Web Storage), que vitest
  // n'écrase pas avec celui de jsdom — et l'y accéder jette sans
  // --localstorage-file. On stubbe un stockage en mémoire (contrat
  // getItem/setItem/length/key) pour être indépendant de sa provenance.
  const store = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    get length() {
      return store.size
    },
    key: (index: number) => [...store.keys()][index] ?? null,
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

describe('correctionGuard', () => {
  it('mémorise une graine servie sans correction et la signale ensuite comme bloquée', () => {
    expect(isSeedBlockedForCorrection('6N1E-3', 'abcd')).toBe(false)
    rememberSeedServedWithoutCorrection('6N1E-3', 'abcd')
    expect(isSeedBlockedForCorrection('6N1E-3', 'abcd')).toBe(true)
  })

  it('distingue les exercices et les graines', () => {
    rememberSeedServedWithoutCorrection('6N1E-3', 'abcd')
    expect(isSeedBlockedForCorrection('6N1E-3', 'efgh')).toBe(false)
    expect(isSeedBlockedForCorrection('6N1E-4', 'abcd')).toBe(false)
  })

  it("n'écrit rien et ne bloque rien si la référence ou la graine manque", () => {
    rememberSeedServedWithoutCorrection(undefined, 'abcd')
    rememberSeedServedWithoutCorrection('6N1E-3', undefined)
    expect(window.localStorage.length).toBe(0)
    expect(isSeedBlockedForCorrection(undefined, undefined)).toBe(false)
  })

  it("n'entre pas en collision avec la clé des corrections déjà consultées", () => {
    rememberSeedServedWithoutCorrection('6N1E-3', 'abcd')
    // La vue élève marque une correction consultée via `${id}|${seed}` = 'true'.
    expect(window.localStorage.getItem('6N1E-3|abcd')).toBeNull()
  })

  it('pickSeedNotServedWithoutCorrection saute les graines bloquées', () => {
    rememberSeedServedWithoutCorrection('6N1E-3', 's1')
    rememberSeedServedWithoutCorrection('6N1E-3', 's2')
    const suite = ['s1', 's2', 's3', 's4']
    let i = 0
    const seed = pickSeedNotServedWithoutCorrection('6N1E-3', () => suite[i++])
    expect(seed).toBe('s3')
  })

  it('pickSeedNotServedWithoutCorrection renvoie la dernière graine après 20 essais', () => {
    rememberSeedServedWithoutCorrection('6N1E-3', 'bloquee')
    let appels = 0
    const seed = pickSeedNotServedWithoutCorrection('6N1E-3', () => {
      appels++
      return 'bloquee'
    })
    expect(seed).toBe('bloquee')
    expect(appels).toBe(21) // 1 tirage initial + 20 tentatives
  })
})
