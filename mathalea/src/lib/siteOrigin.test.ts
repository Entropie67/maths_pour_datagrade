import { afterEach, describe, expect, it, vi } from 'vitest'
import { siteOrigin } from './siteOrigin'

const at = (origin: string) => ({ hostname: new URL(origin).hostname, origin })

describe('siteOrigin', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('sert depuis le site courant sur nos noms', () => {
    vi.stubEnv('DEV', false)
    for (const origin of [
      'https://coopmaths.fr',
      'https://www.coopmaths.fr',
      'https://mathalea.fr',
      'https://www.mathalea.fr',
      'https://staging.mathalea.fr',
      'https://staging.coopmaths.education-nationale.eu',
      'https://mathaleastaging.functions.fnc.fr-par.scw.cloud',
      'http://staging.mathalea.fr:8082',
    ]) {
      expect(siteOrigin(at(origin))).toBe(origin)
    }
  })

  it('sert depuis coopmaths.fr sur une copie hébergée ailleurs, en aperçu local ou hors navigateur', () => {
    vi.stubEnv('DEV', false)
    expect(siteOrigin(at('https://capytale2.ac-paris.fr'))).toBe(
      'https://coopmaths.fr',
    )
    expect(siteOrigin(at('http://localhost:4173'))).toBe('https://coopmaths.fr')
    expect(siteOrigin(at('https://monmathalea.fr'))).toBe(
      'https://coopmaths.fr',
    )
    expect(siteOrigin(undefined)).toBe('https://coopmaths.fr')
  })

  it('sert depuis le site courant en développement, où Vite proxifie ces chemins', () => {
    vi.stubEnv('DEV', true)
    expect(siteOrigin(at('http://localhost:5173'))).toBe(
      'http://localhost:5173',
    )
  })
})
