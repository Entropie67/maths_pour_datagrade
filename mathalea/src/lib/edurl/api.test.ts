import { describe, expect, it, vi } from 'vitest'
import {
  deleteShortLink,
  createShortUrl,
  detectOwnerId,
  extendOneYear,
  fetchVisits,
  isExpired,
  updateShortLink,
  EdurlError,
  edurlErrorMessage,
  edurlLinkTitle,
  forgetShortUrl,
  isMathaleaUrl,
  isTokenInvalid,
  knownShortUrl,
  shortCodeOf,
  slugError,
  listMathaleaLinks,
  renameShortLink,
  shortenUrl,
  shortenUrlOnce,
  type ShortLink,
} from './api'
import { loadEdurlOwnerId } from './token'

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function shlinkPage(
  data: Array<Record<string, unknown>>,
  currentPage = 1,
  pagesCount = 1,
) {
  return json({ shortUrls: { data, pagination: { currentPage, pagesCount } } })
}

function item(
  shortCode: string,
  longUrl: string,
  dateCreated = '2026-05-01T10:00:00+00:00',
) {
  return {
    shortCode,
    shortUrl: `https://edurl.fr/${shortCode}`,
    longUrl,
    title: `titre ${shortCode}`,
    domain: null,
    dateCreated,
    visitsSummary: { total: 3 },
  }
}

describe('edurl.fr : titre et hôtes', () => {
  it('compose le titre avec l’heure locale', () => {
    const now = new Date(2026, 8, 20, 14, 35, 12)
    expect(edurlLinkTitle("Fiche d'exercices", now)).toBe(
      "mathalea-20260920-143512-Fiche d'exercices",
    )
  })

  it('reconnaît coopmaths.fr et mathalea.fr, pas les autres sites', () => {
    expect(isMathaleaUrl('https://coopmaths.fr/alea/?uuid=1')).toBe(true)
    expect(isMathaleaUrl('https://www.coopmaths.fr/alea/')).toBe(true)
    expect(isMathaleaUrl('https://mathalea.fr/?x=1')).toBe(true)
    expect(isMathaleaUrl('https://exemple.fr/?u=coopmaths.fr')).toBe(false)
    expect(isMathaleaUrl('https://notcoopmaths.fr/')).toBe(false)
    expect(isMathaleaUrl('pas une url')).toBe(false)
  })
})

/** Réponse de l'API à une création, telle qu'observée sur edurl.fr */
function created(code: string, ownerId = 'moi') {
  return {
    _id: 'xyz',
    ownerId,
    longUrl: 'https://coopmaths.fr/',
    title: 't',
    enabled: true,
    shortUrl: `https://edurl.fr/${code}`,
    shortCode: code,
    history: [{ event: 'CREATE', date: '2026-10-28T23:59:59.000Z' }],
  }
}

describe('edurl.fr : raccourcir', () => {
  it('crée le lien avec tous les champs que l’API exige, et renvoie l’URL courte', async () => {
    const fetchImpl = vi.fn(async () => json(created('abc'), 201))
    const url = await shortenUrl(
      'https://coopmaths.fr/alea/',
      'titre',
      'tok',
      fetchImpl,
    )
    expect(url).toBe('https://edurl.fr/abc')
    const [target, init] = fetchImpl.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(target).toBe(
      'https://raccourcisseur.apps.education.fr/api/shortUrls',
    )
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>)['x-auth-token']).toBe('tok')
    // sans ces cinq champs, l'API répond « emptyContent »
    expect(JSON.parse(init.body as string)).toEqual({
      longUrl: 'https://coopmaths.fr/alea/',
      title: 'titre',
      enabled: true,
      tags: [],
      groups: [],
      expireAt: null,
      deleteAt: null,
    })
  })

  it('signale un jeton refusé', async () => {
    const fetchImpl = vi.fn(async () => json({ error: 'Unauthorized' }, 401))
    await expect(
      shortenUrl('https://coopmaths.fr/', 't', 'mauvais', fetchImpl),
    ).rejects.toMatchObject({ code: 'TOKEN_INVALID' })
  })

  it('signale un edurl.fr injoignable', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('Failed to fetch')
    })
    const error = await shortenUrl(
      'https://coopmaths.fr/',
      't',
      'tok',
      fetchImpl,
    ).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(EdurlError)
    expect((error as EdurlError).code).toBe('NETWORK')
    expect(edurlErrorMessage(error)).toMatch(/inaccessible/)
  })

  it('refuse une réponse sans lien court', async () => {
    const fetchImpl = vi.fn(async () => json({ ok: true }, 201))
    await expect(
      shortenUrl('https://coopmaths.fr/', 't', 'tok', fetchImpl),
    ).rejects.toThrow(/pas renvoyé/)
  })

  it('ne raccourcit qu’une fois la même URL', async () => {
    forgetShortUrl()
    const fetchImpl = vi.fn(async () => json(created('x'), 201))
    await shortenUrlOnce('https://coopmaths.fr/a', 't', 'tok', fetchImpl)
    await shortenUrlOnce('https://coopmaths.fr/a', 't', 'tok', fetchImpl)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    forgetShortUrl('https://edurl.fr/x')
    await shortenUrlOnce('https://coopmaths.fr/a', 't', 'tok', fetchImpl)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('garde le propriétaire du jeton lu dans la réponse', async () => {
    window.localStorage.clear()
    const fetchImpl = vi.fn(async () => json(created('own', 'u-42'), 201))
    await shortenUrl('https://coopmaths.fr/own', 't', 'tok', fetchImpl)
    expect(loadEdurlOwnerId('tok')).toBe('u-42')
    expect(loadEdurlOwnerId('autre')).toBeNull()
  })
})

describe('edurl.fr : gestion des liens (API du raccourcisseur)', () => {
  const link: ShortLink = {
    shortCode: 'a b',
    shortUrl: 'https://edurl.fr/a b',
    longUrl: 'https://coopmaths.fr/',
    title: 'ancien',
    ownerId: 'moi',
    dateCreated: '',
    expireAt: null,
    deleteAt: null,
    enabled: true,
    visits: null,
  }

  function callOf(fetchImpl: ReturnType<typeof vi.fn>, call = 0) {
    const [url, init] = fetchImpl.mock.calls[call] as unknown as [
      string,
      RequestInit,
    ]
    return {
      url,
      init,
      headers: init.headers as Record<string, string>,
      body:
        init.body === undefined ? undefined : JSON.parse(init.body as string),
    }
  }

  function apiLink(
    shortCode: string,
    longUrl: string,
    ownerId: string,
    extra: Record<string, unknown> = {},
  ) {
    return {
      shortCode,
      longUrl,
      ownerId,
      title: `titre ${shortCode}`,
      ...extra,
    }
  }

  it('lit tous les liens avec le jeton et ne garde que ceux vers MathALÉA, du plus récent au plus ancien', async () => {
    const fetchImpl = vi.fn(async () =>
      json([
        apiLink('a', 'https://coopmaths.fr/alea/?x=1', 'u1', {
          history: [{ event: 'CREATE', date: '2026-05-01T10:00:00Z' }],
        }),
        apiLink('b', 'https://exemple.fr/?u=coopmaths.fr', 'u1'),
        apiLink('c', 'https://mathalea.fr/?x=2', 'u2', {
          dateCreated: '2026-06-01T10:00:00Z',
          shortUrl: 'https://edurl.fr/cc',
          visitsSummary: { total: 7 },
        }),
        { shortCode: 'incomplet' },
      ]),
    )
    const links = await listMathaleaLinks('tok', fetchImpl)
    expect(links.map((l) => l.shortCode)).toEqual(['c', 'a'])
    expect(links[0]).toMatchObject({
      shortUrl: 'https://edurl.fr/cc',
      visits: 7,
      ownerId: 'u2',
    })
    // sans `shortUrl` ni visites dans la réponse
    expect(links[1]).toMatchObject({
      shortUrl: 'https://edurl.fr/a',
      visits: null,
      dateCreated: '2026-05-01T10:00:00Z',
    })
    const { url, headers } = callOf(fetchImpl)
    expect(url).toMatch(
      /^https:\/\/raccourcisseur\.apps\.education\.fr\/api\/shortUrls\?/,
    )
    expect(headers['x-auth-token']).toBe('tok')
  })

  it('lit aussi les réponses enveloppées (`body`, enveloppe Shlink)', async () => {
    const item = apiLink('a', 'https://coopmaths.fr/', 'u1')
    for (const data of [
      { body: [item] },
      { shortUrls: { data: [item] } },
      { body: { shortUrls: { data: [item] } } },
    ]) {
      const fetchImpl = vi.fn(async () => json(data))
      expect(await listMathaleaLinks('tok', fetchImpl)).toHaveLength(1)
    }
  })

  it('renomme et supprime un lien', async () => {
    const fetchImpl = vi.fn(async () => json({}))
    await renameShortLink(link, 'nouveau', 'tok', fetchImpl)
    await deleteShortLink(link, 'tok', fetchImpl)
    const rename = callOf(fetchImpl, 0)
    expect(rename.url).toBe(
      'https://raccourcisseur.apps.education.fr/api/shortUrls/a%20b',
    )
    expect(rename.init.method).toBe('PATCH')
    expect(rename.headers['x-auth-token']).toBe('tok')
    expect(rename.body).toEqual({ title: 'nouveau' })
    expect(callOf(fetchImpl, 1).init.method).toBe('DELETE')
  })

  it('lit les dates de fin et l’état du lien', async () => {
    const fetchImpl = vi.fn(async () =>
      json([
        apiLink('a', 'https://coopmaths.fr/', 'u1', {
          expireAt: '2026-12-31T00:00:00.000Z',
          deleteAt: '2027-06-30T00:00:00.000Z',
        }),
        apiLink('b', 'https://coopmaths.fr/', 'u1', { enabled: false }),
      ]),
    )
    const [a, b] = await listMathaleaLinks('tok', fetchImpl)
    const byCode = Object.fromEntries([a, b].map((l) => [l.shortCode, l]))
    expect(byCode.a).toMatchObject({
      expireAt: '2026-12-31T00:00:00.000Z',
      deleteAt: '2027-06-30T00:00:00.000Z',
      enabled: true,
    })
    expect(byCode.b.enabled).toBe(false)
  })

  it('modifie la destination et les dates : seuls les réglages donnés partent', async () => {
    const fetchImpl = vi.fn(async () => json({}))
    await updateShortLink(
      link,
      {
        longUrl: 'https://coopmaths.fr/nouveau',
        expireAt: '2026-12-31',
        deleteAt: null,
      },
      'tok',
      fetchImpl,
    )
    const { init, body } = callOf(fetchImpl)
    expect(init.method).toBe('PATCH')
    expect(body).toEqual({
      longUrl: 'https://coopmaths.fr/nouveau',
      expireAt: '2026-12-31',
      deleteAt: null,
    })
  })

  it('reconnaît un lien expiré ou désactivé', () => {
    const now = new Date('2026-07-01T00:00:00Z')
    expect(isExpired({ expireAt: null, enabled: true }, now)).toBe(false)
    expect(isExpired({ expireAt: '2026-08-01', enabled: true }, now)).toBe(
      false,
    )
    expect(isExpired({ expireAt: '2026-06-01', enabled: true }, now)).toBe(true)
    expect(isExpired({ expireAt: null, enabled: false }, now)).toBe(true)
  })

  it('lit le nombre de visites sous ses différentes formes', async () => {
    for (const [data, expected] of [
      [12, 12],
      ['7', 7],
      [{ nbVisits: 5 }, 5],
      [{ body: { visits: 3 } }, 3],
      [{ visitsSummary: { total: 9 } }, 9],
      [{ autre: 1 }, null],
      [null, null],
    ] as const) {
      const fetchImpl = vi.fn(async () => json(data))
      expect(await fetchVisits(link, 'tok', fetchImpl)).toBe(expected)
      expect(callOf(fetchImpl).url).toBe(
        'https://raccourcisseur.apps.education.fr/api/shortUrls/a%20b/nbVisits',
      )
    }
  })

  it('401 sans « notPermitted » : jeton refusé', async () => {
    const fetchImpl = vi.fn(async () => json({ error: 'Unauthorized' }, 401))
    const error = await listMathaleaLinks('tok', fetchImpl).catch(
      (e: unknown) => e,
    )
    expect((error as EdurlError).code).toBe('TOKEN_INVALID')
    expect(isTokenInvalid(error)).toBe(true)
  })

  it('401 « notPermitted » : le lien est à quelqu’un d’autre', async () => {
    const fetchImpl = vi.fn(async () =>
      json({ error: 'refusé [api.shortUrls.update.notPermitted]' }, 401),
    )
    const error = await deleteShortLink(link, 'tok', fetchImpl).catch(
      (e: unknown) => e,
    )
    expect((error as EdurlError).code).toBe('NOT_OWNER')
  })

  it('rapporte le message d’une erreur', async () => {
    const fetchImpl = vi.fn(async () =>
      json({ error: 'Impossible de supprimer ce lien.' }, 422),
    )
    await expect(deleteShortLink(link, 'tok', fetchImpl)).rejects.toThrow(
      'Impossible de supprimer ce lien.',
    )
  })
})

describe('edurl.fr : propriétaire du jeton', () => {
  const links: ShortLink[] = [
    ['a', 'u1'],
    ['b', 'u1'],
    ['c', 'u2'],
    ['d', 'moi'],
    ['e', null],
  ].map(([shortCode, ownerId]) => ({
    shortCode: shortCode as string,
    shortUrl: `https://edurl.fr/${shortCode}`,
    longUrl: `https://coopmaths.fr/?${shortCode}`,
    title: '',
    ownerId,
    dateCreated: '',
    expireAt: null,
    deleteAt: null,
    enabled: true,
    visits: null,
  }))

  it('trouve le propriétaire en réécrivant un lien de chacun, le plus fourni d’abord', async () => {
    const tried: string[] = []
    const fetchImpl = vi.fn(
      async (input: RequestInfo | URL, init?: RequestInit) => {
        tried.push(String(input).split('/').pop() as string)
        expect(JSON.parse(init?.body as string)).toHaveProperty('longUrl')
        return String(input).endsWith('/d')
          ? json({})
          : json({ error: '[api.shortUrls.update.notPermitted]' }, 401)
      },
    )
    expect(await detectOwnerId(links, 'tok', fetchImpl)).toBe('moi')
    // u1 (2 liens) puis u2, puis moi : un seul essai par propriétaire
    expect(tried).toEqual(['a', 'c', 'd'])
  })

  it('renvoie null quand aucun lien n’est à nous', async () => {
    const fetchImpl = vi.fn(async () =>
      json({ error: '[api.shortUrls.update.notPermitted]' }, 401),
    )
    expect(await detectOwnerId(links, 'tok', fetchImpl)).toBeNull()
  })

  it('s’arrête sur un jeton refusé', async () => {
    const fetchImpl = vi.fn(async () => json({ error: 'Unauthorized' }, 401))
    await expect(detectOwnerId(links, 'tok', fetchImpl)).rejects.toMatchObject({
      code: 'TOKEN_INVALID',
    })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})

describe('edurl.fr : prolonger d’un an', () => {
  const now = new Date('2026-07-01T10:00:00Z')

  it('ajoute un an à une date à venir', () => {
    expect(extendOneYear('2026-12-31T00:00:00.000Z', now)).toBe('2027-12-31')
    expect(extendOneYear('2026-12-31', now)).toBe('2027-12-31')
  })

  it('compte un an à partir d’aujourd’hui pour une date déjà passée', () => {
    expect(extendOneYear('2026-01-31T00:00:00.000Z', now)).toBe('2027-07-01')
  })

  it('refuse une date illisible', () => {
    expect(extendOneYear('bientôt', now)).toBeNull()
  })
})

describe('edurl.fr : lien court choisi', () => {
  it('valide le code souhaité', () => {
    expect(slugError('')).toBeNull()
    expect(slugError('  ')).toBeNull()
    expect(slugError('maths-6e_A')).toBeNull()
    expect(slugError('maths 6e')).toMatch(/lettres sans accent/)
    expect(slugError('élèves')).toMatch(/lettres sans accent/)
    expect(slugError('a/b')).toMatch(/lettres sans accent/)
    expect(slugError('x'.repeat(61))).toMatch(/60 caractères/)
  })

  it('extrait le code d’une adresse courte', () => {
    expect(shortCodeOf('https://edurl.fr/abc')).toBe('abc')
    expect(shortCodeOf('https://edurl.fr/abc/')).toBe('abc')
    expect(shortCodeOf('https://edurl.fr/abc?x=1')).toBe('abc')
  })

  it('sans code souhaité, n’envoie pas de customSlug', async () => {
    const fetchImpl = vi.fn(async () => json(created('auto'), 201))
    const url = await createShortUrl(
      'https://coopmaths.fr/s1',
      't',
      'tok',
      '',
      fetchImpl,
    )
    expect(url).toBe('https://edurl.fr/auto')
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(JSON.parse(init.body as string)).not.toHaveProperty('customSlug')
    expect(knownShortUrl('https://coopmaths.fr/s1')).toBe(
      'https://edurl.fr/auto',
    )
  })

  it('avec un code souhaité, l’envoie à l’API avec les champs complets', async () => {
    const fetchImpl = vi.fn(async () => json(created('maths6'), 201))
    const url = await createShortUrl(
      'https://coopmaths.fr/s2',
      'Titre',
      'tok',
      ' maths6 ',
      fetchImpl,
    )
    expect(url).toBe('https://edurl.fr/maths6')
    const [, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit]
    expect(JSON.parse(init.body as string)).toEqual({
      longUrl: 'https://coopmaths.fr/s2',
      title: 'Titre',
      enabled: true,
      tags: [],
      groups: [],
      expireAt: null,
      deleteAt: null,
      customSlug: 'maths6',
    })
  })

  it('lit la réponse même enveloppée dans `body`', async () => {
    const fetchImpl = vi.fn(async () =>
      json({ body: created('enveloppe') }, 201),
    )
    expect(
      await createShortUrl(
        'https://coopmaths.fr/s5',
        '',
        'tok',
        'enveloppe',
        fetchImpl,
      ),
    ).toBe('https://edurl.fr/enveloppe')
  })

  it('signale un code déjà pris (409, ou message qui le dit)', async () => {
    for (const response of [
      () => json({ error: 'slug in use' }, 409),
      () =>
        json({ error: 'Custom slug already exists [api.x.slugTaken]' }, 400),
    ]) {
      const error = await createShortUrl(
        'https://coopmaths.fr/s3',
        '',
        'tok',
        'pris',
        vi.fn(async () => response()),
      ).catch((e: unknown) => e)
      expect((error as EdurlError).message).toBe(
        'Ce lien court est déjà pris. Choisissez-en un autre.',
      )
    }
  })

  it('un autre refus du serveur n’est pas pris pour un code déjà pris', async () => {
    const fetchImpl = vi.fn(async () =>
      json(
        {
          error:
            'Empty or invalid content [api.createOneShortUrl.emptyContent]',
        },
        400,
      ),
    )
    await expect(
      createShortUrl('https://coopmaths.fr/s6', '', 'tok', 'libre', fetchImpl),
    ).rejects.toThrow(/Empty or invalid content/)
  })

  it('refuse un code invalide sans appeler edurl.fr', async () => {
    const fetchImpl = vi.fn(async () => json({}))
    await expect(
      createShortUrl(
        'https://coopmaths.fr/s4',
        '',
        'tok',
        'pas valide',
        fetchImpl,
      ),
    ).rejects.toThrow(/lettres sans accent/)
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})
