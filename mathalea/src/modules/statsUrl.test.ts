// @vitest-environment node

import { describe, expect, it } from 'vitest'
import { buildNormalUrl, buildStatsUrl } from './statsUrl'

describe('buildStatsUrl', () => {
  it('regroupe tous les UUID dans uuids, dans l’ordre de la sélection', () => {
    const url = new URL(
      buildStatsUrl('https://coopmaths.fr/alea/?uuid=A&uuid=B&uuid=A&v=eleve'),
    )
    expect(url.searchParams.getAll('uuids')).toEqual(['A,B,A'])
    expect(url.searchParams.has('uuid')).toBe(false)
    expect(url.searchParams.get('v')).toBe('eleve')
  })

  it('conserve aussi toutes les valeurs des autres paramètres répétés', () => {
    const url = new URL(
      buildStatsUrl(
        'https://coopmaths.fr/alea/?uuid=A&id=6N1E&alea=Xy12&n=4&s=1' +
          '&uuid=B&id=3L11&alea=Ab34&n=5&s=2&v=eleve',
      ),
    )
    expect(url.searchParams.get('id')).toBe('6N1E,3L11')
    expect(url.searchParams.get('alea')).toBe('Xy12,Ab34')
    expect(url.searchParams.get('n')).toBe('4,5')
    expect(url.searchParams.get('s')).toBe('1,2')
    const keys = [...url.searchParams.keys()]
    expect(new Set(keys).size).toBe(keys.length)
  })

  it.each([
    'id',
    'n',
    'd',
    's',
    's2',
    's3',
    's4',
    's5',
    'qcm',
    'coef',
    'alea',
    'i',
    'cd',
    'tip',
    'calc',
    'cols',
  ])('conserve toutes les occurrences du paramètre d’exercice %s', (key) => {
    const url = new URL(
      buildStatsUrl(
        `https://coopmaths.fr/alea/?uuid=A&${key}=premier` +
          `&uuid=B&${key}=&uuid=A&${key}=premier&v=eleve`,
      ),
    )
    expect(url.searchParams.getAll(key)).toEqual(['premier,,premier'])
    expect(url.searchParams.get('uuids')).toBe('A,B,A')
  })

  it('conserve l’origine, le chemin, le fragment et les caractères encodés', () => {
    const url = new URL(
      buildStatsUrl(
        'https://coopmaths.fr/alea/?uuid=bq-ex1&title=%C3%89quations+%26+calcul&v=eleve#exercice-2',
      ),
    )
    expect(url.origin).toBe('https://coopmaths.fr')
    expect(url.pathname).toBe('/alea/')
    expect(url.hash).toBe('#exercice-2')
    expect(url.searchParams.get('uuids')).toBe('bq-ex1')
    expect(url.searchParams.get('title')).toBe('Équations & calcul')
  })

  it('ne crée pas de paramètre uuids quand aucun exercice n’est sélectionné', () => {
    expect(buildStatsUrl('https://coopmaths.fr/alea/')).toBe(
      'https://coopmaths.fr/alea/',
    )
    expect(
      buildNormalUrl(buildStatsUrl('https://coopmaths.fr/alea/?v=eleve')),
    ).toBe('https://coopmaths.fr/alea/?v=eleve')
  })
})

function expectRoundTrip(pageUrl: string) {
  const original = new URL(pageUrl)
  const statsUrl = new URL(buildStatsUrl(pageUrl))
  const restored = new URL(buildNormalUrl(statsUrl.href))
  expect([...restored.searchParams]).toEqual([...original.searchParams])
  expect(restored.origin).toBe(original.origin)
  expect(restored.pathname).toBe(original.pathname)
  expect(restored.hash).toBe(original.hash)
  const keys = [...statsUrl.searchParams.keys()]
  expect(new Set(keys).size).toBe(keys.length)
  expect(buildStatsUrl(restored.href)).toBe(statsUrl.href)
  return { statsUrl, restored }
}

describe('conversion réversible des URL statistiques', () => {
  it.each([
    'id',
    'n',
    'd',
    's',
    's2',
    's3',
    's4',
    's5',
    'qcm',
    'coef',
    'alea',
    'i',
    'cd',
    'tip',
    'calc',
    'cols',
    'futureParam',
  ])('réaffecte %s aux exercices 1 et 3, sans le créer pour le 2', (key) => {
    const { statsUrl, restored } = expectRoundTrip(
      `https://coopmaths.fr/alea/?uuid=A&${key}=premier` +
        `&uuid=B&uuid=C&${key}=troisieme&v=eleve`,
    )
    expect(statsUrl.searchParams.get(key)).toBe('premier,troisieme')
    expect([...restored.searchParams]).toEqual([
      ['uuid', 'A'],
      [key, 'premier'],
      ['uuid', 'B'],
      ['uuid', 'C'],
      [key, 'troisieme'],
      ['v', 'eleve'],
    ])
  })

  it('distingue les paramètres absents, vides, égaux à zéro ou faux', () => {
    expectRoundTrip(
      'https://coopmaths.fr/alea/?uuid=A&s=&uuid=B&s2=0&uuid=C&s=0&i=false&uuid=D&s=',
    )
  })

  it('conserve un paramètre présent seulement pour le dernier exercice', () => {
    expectRoundTrip(
      'https://coopmaths.fr/alea/?uuid=A&uuid=B&uuid=C&alea=seed&v=eleve',
    )
  })

  it('conserve les doublons d’UUID avec leurs propres paramètres', () => {
    expectRoundTrip(
      'https://coopmaths.fr/alea/?uuid=A&s=1&alea=a&uuid=A&alea=b&uuid=A&s=3&alea=c',
    )
  })

  it('conserve plusieurs occurrences d’un paramètre dans un même exercice', () => {
    expectRoundTrip('https://coopmaths.fr/alea/?uuid=A&s=1&s=&s=3&uuid=B&s=4')
  })

  it('conserve l’ordre des réglages globaux et des paramètres hors exercice', () => {
    expectRoundTrip(
      'https://coopmaths.fr/alea/?v=eleve&n=99&uuid=A&s=1&title=Test' +
        '&uuid=B&beta=1&s2=2&title=Suite&uuid=C&s=3&v=prof',
    )
  })

  it.each([
    '',
    ',',
    ',,',
    'a,b',
    '%2C',
    '%25',
    '%252C',
    '%',
    '\\',
    'é + & = # , %2C',
  ])('échappe sans ambiguïté les valeurs %j', (value) => {
    const url = new URL('https://coopmaths.fr/alea/')
    url.searchParams.append('uuid', 'A')
    url.searchParams.append('s', value)
    url.searchParams.append('uuid', 'B')
    url.searchParams.append('s', '')
    url.searchParams.append('title', value)
    expectRoundTrip(url.href)
  })

  it('échappe les virgules et les % avant de regrouper les valeurs', () => {
    const { statsUrl } = expectRoundTrip(
      'https://coopmaths.fr/alea/?uuid=A&s=a%2Cb&uuid=B&s=%252C',
    )
    expect(statsUrl.searchParams.get('s')).toBe('a%2Cb,%252C')
  })

  it('préserve les collisions avec uuids et les noms des métadonnées', () => {
    expectRoundTrip(
      'https://coopmaths.fr/alea/?uuids=original&uuids_=autre&uuid=A&uuid=B' +
        '&_mathaleaStats=original&_mathaleaStats_=autre&uuids=encore',
    )
  })

  it('conserve les noms de paramètres vides, encodés ou ressemblant à des propriétés JS', () => {
    expectRoundTrip(
      'https://coopmaths.fr/alea/?=vide&__proto__=a&uuid=A&a%2Cb=1' +
        '&constructor=2&uuid=B&__proto__=b&=autre&a%2Cb=3',
    )
  })

  it.each([
    'https://coopmaths.fr/alea/',
    'https://coopmaths.fr/alea/#exercice-2',
    'https://coopmaths.fr/alea/?v=eleve',
    'https://coopmaths.fr/alea/?title=a%2Cb&title=',
    'https://coopmaths.fr/alea/?uuids=autre',
    'https://coopmaths.fr/alea/?uuid=&uuid=',
    'https://user:password@example.org:8080/alea/?uuid=A&s=%C3%A9#exercice-2',
  ])('reconstitue aussi %s', (pageUrl) => {
    expectRoundTrip(pageUrl)
  })

  it('reconstitue une URL statistique depuis ses métadonnées explicites', () => {
    const url = new URL('https://coopmaths.fr/alea/?uuids=A,B,C&s=1,3&v=eleve')
    url.searchParams.set(
      '_mathaleaStats',
      JSON.stringify({
        version: 1,
        keys: ['uuid', 's', 'v'],
        order: [0, 1, 0, 0, 1, 2],
      }),
    )
    expect(buildNormalUrl(url.href)).toBe(
      'https://coopmaths.fr/alea/?uuid=A&s=1&uuid=B&uuid=C&s=3&v=eleve',
    )
  })
})

describe('buildNormalUrl : validation des données', () => {
  it.each([
    'https://coopmaths.fr/alea/?uuids=A,B&s=1,3',
    'https://coopmaths.fr/alea/?uuids=A&_mathaleaStats=invalide',
  ])(
    'rejette une URL non réversible plutôt que de deviner les positions',
    (url) => {
      expect(() => buildNormalUrl(url)).toThrow(/Métadonnées/)
    },
  )

  it.each([
    null,
    { version: 2, keys: ['uuid'], order: [0] },
    { version: 1, keys: ['uuid', 'uuid'], order: [0, 1] },
    { version: 1, keys: ['uuid', 's'], order: [0] },
    { version: 1, keys: ['uuid'], order: [-1] },
    { version: 1, keys: ['uuid'], order: [1] },
    { version: 1, keys: ['uuid'], order: [0.5] },
    { version: 1, keys: ['uuid'], order: ['0'] },
    { version: 1, keys: [0], order: [0] },
  ])('rejette les métadonnées invalides %j', (metadata) => {
    const url = new URL('https://coopmaths.fr/alea/?uuids=A')
    url.searchParams.set('_mathaleaStats', JSON.stringify(metadata))
    expect(() => buildNormalUrl(url.href)).toThrow(/Métadonnées/)
  })

  it.each(['missing', 'extra', 'duplicate', 'tooFew', 'tooMany'])(
    'rejette des paramètres statistiques altérés : %s',
    (kind) => {
      const url = new URL(
        buildStatsUrl('https://coopmaths.fr/alea/?uuid=A&s=1&uuid=B&s=2'),
      )
      if (kind === 'missing') url.searchParams.delete('s')
      if (kind === 'extra') url.searchParams.append('autre', '1')
      if (kind === 'duplicate') url.searchParams.append('s', '3')
      if (kind === 'tooFew') url.searchParams.set('s', '1')
      if (kind === 'tooMany') url.searchParams.set('s', '1,2,3')
      expect(() => buildNormalUrl(url.href)).toThrow(/Paramètres|Nombre/)
    },
  )
})
