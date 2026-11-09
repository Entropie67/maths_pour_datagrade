import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  loadVitrineHtml,
  prepareVitrineHtml,
  resetVitrineCache,
  vitrineOrigin,
} from './vitrineAsso'

const fragment = `<div class="vitrine-alea"><style>.vitrine-alea{color:red}</style>
<a href="https://coopmaths.fr/www/about">À propos</a>
<a href="mailto:contact@coopmaths.fr">Contact</a>
<script>alert(1)</script></div>`

describe('prepareVitrineHtml', () => {
  it('renvoie null si le HTML ne contient pas la vitrine', () => {
    expect(prepareVitrineHtml('<h1>404 Not Found</h1>')).toBeNull()
    expect(prepareVitrineHtml('')).toBeNull()
  })

  it('ne garde que le conteneur de la vitrine, sans script', () => {
    const html = prepareVitrineHtml(`<p>bruit</p>${fragment}`)
    expect(html).not.toBeNull()
    expect(html).toMatch(/^<div class="vitrine-alea">/)
    expect(html).not.toContain('bruit')
    expect(html).not.toContain('<script')
    expect(html).toContain('<style>')
  })

  it('ouvre les liens dans un nouvel onglet, sauf les mailto', () => {
    const html = prepareVitrineHtml(fragment) ?? ''
    expect(html).toContain(
      '<a href="https://coopmaths.fr/www/about" target="_blank" rel="noopener noreferrer">',
    )
    expect(html).toContain('<a href="mailto:contact@coopmaths.fr">')
  })
})

describe('loadVitrineHtml', () => {
  afterEach(() => {
    resetVitrineCache()
    vi.unstubAllGlobals()
  })

  it('récupère le fragment sur l’origine courante en développement et mémorise le résultat', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(fragment),
    })
    vi.stubGlobal('fetch', fetchMock)
    const first = await loadVitrineHtml()
    const second = await loadVitrineHtml()
    expect(first).toContain('vitrine-alea')
    expect(second).toBe(first)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][0]).toBe(
      `${window.location.origin}/www/vitrine/fragment/`,
    )
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ cache: 'no-store' })
  })

  it('récupère le fragment sur coopmaths.fr en production, quelle que soit l’origine courante', async () => {
    vi.stubEnv('DEV', false)
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(fragment),
    })
    vi.stubGlobal('fetch', fetchMock)
    const html = await loadVitrineHtml()
    expect(html).toContain('vitrine-alea')
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://coopmaths.fr/www/vitrine/fragment/',
    )
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ cache: 'no-store' })
  })

  it('renvoie null si le serveur répond en erreur', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, text: () => Promise.resolve('') }),
    )
    expect(await loadVitrineHtml()).toBeNull()
  })

  it('renvoie null si la requête échoue', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    expect(await loadVitrineHtml()).toBeNull()
  })
})

describe('prepareVitrineHtml, adresses relatives', () => {
  it('complète les adresses relatives avec l’origine du site qui a servi le fragment', () => {
    const html =
      prepareVitrineHtml(
        '<div class="vitrine-alea"><img src="/www/_astro/logo.webp"><a href="/www/about">À propos</a></div>',
        'https://staging.coopmaths.fr',
      ) ?? ''
    expect(html).toContain(
      '<img src="https://staging.coopmaths.fr/www/_astro/logo.webp">',
    )
    expect(html).toContain(
      '<a href="https://staging.coopmaths.fr/www/about" target="_blank" rel="noopener noreferrer">',
    )
  })
})

describe('vitrineOrigin', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('lit le fragment sur le site courant sur un nom coopmaths et sur l’adresse technique du conteneur', () => {
    vi.stubEnv('DEV', false)
    expect(
      vitrineOrigin({
        hostname: 'staging.coopmaths.fr',
        origin: 'https://staging.coopmaths.fr',
      }),
    ).toBe('https://staging.coopmaths.fr')
    expect(
      vitrineOrigin({
        hostname: 'coopmaths.fr',
        origin: 'https://coopmaths.fr',
      }),
    ).toBe('https://coopmaths.fr')
    expect(
      vitrineOrigin({
        hostname: 'mathaleastaging.functions.fnc.fr-par.scw.cloud',
        origin: 'https://mathaleastaging.functions.fnc.fr-par.scw.cloud',
      }),
    ).toBe('https://mathaleastaging.functions.fnc.fr-par.scw.cloud')
  })

  it('lit le fragment sur le nom coopmaths jumeau d’un nom mathalea', () => {
    vi.stubEnv('DEV', false)
    expect(
      vitrineOrigin({
        hostname: 'staging.mathalea.fr',
        origin: 'https://staging.mathalea.fr',
      }),
    ).toBe('https://staging.coopmaths.fr')
    expect(
      vitrineOrigin({ hostname: 'mathalea.fr', origin: 'https://mathalea.fr' }),
    ).toBe('https://coopmaths.fr')
    expect(
      vitrineOrigin({
        hostname: 'www.mathalea.fr',
        origin: 'https://www.mathalea.fr',
      }),
    ).toBe('https://www.coopmaths.fr')
    expect(
      vitrineOrigin({
        hostname: 'staging.mathalea.education-nationale.eu',
        origin: 'https://staging.mathalea.education-nationale.eu',
      }),
    ).toBe('https://staging.coopmaths.education-nationale.eu')
  })

  it('lit le fragment sur coopmaths.fr ailleurs, et sur le site courant en développement', () => {
    vi.stubEnv('DEV', false)
    expect(
      vitrineOrigin({
        hostname: 'capytale2.ac-paris.fr',
        origin: 'https://capytale2.ac-paris.fr',
      }),
    ).toBe('https://coopmaths.fr')
    vi.stubEnv('DEV', true)
    expect(
      vitrineOrigin({ hostname: 'localhost', origin: 'http://localhost:5173' }),
    ).toBe('http://localhost:5173')
  })
})
