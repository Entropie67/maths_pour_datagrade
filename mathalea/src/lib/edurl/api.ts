/**
 * Appels à edurl.fr, le raccourcisseur de liens de l'éducation nationale.
 *
 * Le jeton d'accès personnel du portail (`token.ts`) n'est pas une clé de
 * l'API Shlink d'edurl.fr, mais celle de l'API REST de l'application du
 * raccourcisseur (`API_URL`, en-tête `x-auth-token`, CORS ouvert), qui sert à
 * créer, lister, modifier et supprimer ses liens.
 *
 * Cette API liste les liens de tous les utilisateurs (`ownerId`) et ne refuse
 * qu'à l'écriture ceux qui ne sont pas les nôtres : l'identifiant du
 * propriétaire du jeton se lit dans la réponse d'une création, sinon
 * `detectOwnerId` le retrouve, comme le fait UrledManager
 * (urledmanager.forge.apps.education.fr).
 */

import { saveEdurlOwnerId } from './token'

export const API_URL = 'https://raccourcisseur.apps.education.fr/api/shortUrls'
const SHORT_URL_ORIGIN = 'https://edurl.fr'

/**
 * - `TOKEN_INVALID` : edurl.fr refuse le jeton (il est à ressaisir) ;
 * - `NOT_OWNER` : le lien appartient à quelqu'un d'autre ;
 */
export type EdurlErrorCode =
  'TOKEN_INVALID' | 'NOT_OWNER' | 'HTTP_ERROR' | 'NETWORK'

export class EdurlError extends Error {
  code: EdurlErrorCode
  /** Code HTTP de la réponse, s'il y en a une */
  status?: number
  constructor(code: EdurlErrorCode, message: string, status?: number) {
    super(message)
    this.name = 'EdurlError'
    this.code = code
    this.status = status
  }
}

/** Message à montrer à l'enseignant pour une erreur d'appel à edurl.fr */
export function edurlErrorMessage(error: unknown): string {
  if (error instanceof EdurlError) {
    return error.code === 'TOKEN_INVALID'
      ? "Ce jeton n'est plus valide. Merci d'en saisir un nouveau."
      : error.message
  }
  return 'Une erreur est survenue.'
}

export function isTokenInvalid(error: unknown): boolean {
  return error instanceof EdurlError && error.code === 'TOKEN_INVALID'
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** `mathalea-<date>-<hhmmss>-<titre>`, heure locale du poste */
export function edurlLinkTitle(title: string, now: Date = new Date()): string {
  const date = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`
  const time = `${pad2(now.getHours())}${pad2(now.getMinutes())}${pad2(now.getSeconds())}`
  return `mathalea-${date}-${time}-${title}`
}

/** Texte d'erreur d'une réponse JSON : `detail` (Shlink), `error` ou `message` */
function errorText(data: unknown): string {
  if (typeof data !== 'object' || data === null) return ''
  const record = data as Record<string, unknown>
  for (const key of ['detail', 'error', 'message']) {
    if (typeof record[key] === 'string') return record[key]
  }
  return ''
}

async function send(
  url: string,
  init: RequestInit,
  fetchImpl: typeof fetch,
): Promise<Response> {
  let response: Response
  try {
    response = await fetchImpl(url, init)
  } catch {
    throw new EdurlError(
      'NETWORK',
      'edurl.fr est inaccessible. Vérifiez votre connexion.',
    )
  }
  if (response.ok) return response
  const detail = errorText(await response.json().catch(() => null))
  if (response.status === 401) {
    // l'API répond aussi 401 (pas 403) pour un lien qui n'est pas le nôtre
    if (/notPermitted/i.test(detail)) {
      throw new EdurlError('NOT_OWNER', 'Ce lien ne vous appartient pas.')
    }
    throw new EdurlError('TOKEN_INVALID', 'Jeton refusé.')
  }
  if (response.status === 429) {
    throw new EdurlError(
      'HTTP_ERROR',
      'Trop de requêtes en peu de temps. Merci de patienter quelques secondes.',
    )
  }
  throw new EdurlError(
    'HTTP_ERROR',
    detail || `Erreur ${response.status}`,
    response.status,
  )
}

const shortened = new Map<string, string>()

/** Lien court déjà créé pour cette URL pendant la visite, s'il y en a un */
export function knownShortUrl(longUrl: string): string | undefined {
  return shortened.get(longUrl)
}

/** Ce que l'enseignant peut choisir : lettres, chiffres, tiret et tiret bas */
const SLUG_PATTERN = /^[A-Za-z0-9_-]+$/
const MAX_SLUG_LENGTH = 60

/**
 * Vérifie un lien court souhaité (la fin de `edurl.fr/…`).
 * @returns le message d'erreur, `null` si le code est valable (ou vide : edurl.fr
 * en génère un)
 */
export function slugError(slug: string): string | null {
  const value = slug.trim()
  if (value === '') return null
  if (value.length > MAX_SLUG_LENGTH) {
    return `Le lien court ne peut pas dépasser ${MAX_SLUG_LENGTH} caractères.`
  }
  return SLUG_PATTERN.test(value)
    ? null
    : 'Le lien court ne peut contenir que des lettres sans accent, des chiffres, des tirets (-) et des tirets bas (_).'
}

/** Le serveur dit que le code souhaité est déjà utilisé */
function isSlugTaken(error: unknown): boolean {
  return (
    error instanceof EdurlError &&
    error.code === 'HTTP_ERROR' &&
    (error.status === 409 ||
      /slug|already|exist|déjà|duplicate|taken|used/i.test(error.message))
  )
}

/**
 * Crée un lien court, avec le code souhaité si `customSlug` est donné (sinon
 * edurl.fr en génère un). L'identifiant du propriétaire de la réponse est
 * gardé : il permet de reconnaître ses liens dans la liste.
 * @param title titre du lien dans edurl.fr (voir `edurlLinkTitle`)
 * @returns l'adresse courte
 */
export async function createShortUrl(
  longUrl: string,
  title: string,
  token: string,
  customSlug = '',
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const slug = customSlug.trim()
  const message = slugError(slug)
  if (message !== null) throw new EdurlError('HTTP_ERROR', message)
  let response: Response
  try {
    response = await send(
      API_URL,
      {
        method: 'POST',
        headers: headers(token, true),
        // l'API refuse la création si l'un de ces champs manque
        body: JSON.stringify({
          longUrl,
          title,
          enabled: true,
          tags: [],
          groups: [],
          expireAt: null,
          deleteAt: null,
          ...(slug === '' ? {} : { customSlug: slug }),
        }),
      },
      fetchImpl,
    )
  } catch (error) {
    if (slug !== '' && isSlugTaken(error)) {
      throw new EdurlError(
        'HTTP_ERROR',
        'Ce lien court est déjà pris. Choisissez-en un autre.',
        409,
      )
    }
    throw error
  }
  const link = readShortLink(unwrap(await response.json().catch(() => null)))
  if (link === null) {
    throw new EdurlError(
      'HTTP_ERROR',
      "edurl.fr n'a pas renvoyé de lien court.",
    )
  }
  if (link.ownerId !== null) saveEdurlOwnerId(token, link.ownerId)
  shortened.set(longUrl, link.shortUrl)
  return link.shortUrl
}

/**
 * Raccourcit une URL (code généré par edurl.fr).
 * @returns l'URL courte
 */
export async function shortenUrl(
  longUrl: string,
  title: string,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  return await createShortUrl(longUrl, title, token, '', fetchImpl)
}

/** Réponse de l'API, éventuellement dans `body` */
function unwrap(data: unknown): unknown {
  return typeof data === 'object' && data !== null && 'body' in data
    ? (data as { body: unknown }).body
    : data
}

/**
 * Comme `shortenUrl`, mais une même URL longue n'est raccourcie qu'une fois
 * par visite : rouvrir une fenêtre de partage ne crée pas un doublon dans
 * edurl.fr.
 */
export async function shortenUrlOnce(
  longUrl: string,
  title: string,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  return (
    knownShortUrl(longUrl) ??
    (await createShortUrl(longUrl, title, token, '', fetchImpl))
  )
}

/** Code d'une adresse courte (`https://edurl.fr/abc` → `abc`) */
export function shortCodeOf(shortUrl: string): string {
  return shortUrl.split(/[?#]/)[0].replace(/\/+$/, '').split('/').pop() ?? ''
}

/** Oublie un lien court (supprimé, ou créé avec un autre jeton) */
export function forgetShortUrl(shortUrl?: string): void {
  for (const [longUrl, known] of shortened) {
    if (shortUrl === undefined || known === shortUrl) shortened.delete(longUrl)
  }
}

// ---------- Liens raccourcis vers MathALÉA ----------

/** Lien raccourci, réduit à ce qu'on affiche */
export interface ShortLink {
  shortCode: string
  shortUrl: string
  longUrl: string
  title: string
  /** Propriétaire du lien (voir `detectOwnerId`) */
  ownerId: string | null
  dateCreated: string
  /** Fin de validité (`AAAA-MM-JJ…`) : après, le lien court ne redirige plus */
  expireAt: string | null
  /** Suppression prévue : le lien est effacé d'edurl.fr à cette date */
  deleteAt: string | null
  /** `false` : lien désactivé */
  enabled: boolean
  /** `null` : pas (encore) lu, voir `fetchVisits` */
  visits: number | null
}

/** Sites dont on gère les liens raccourcis (et leurs sous-domaines) */
const MATHALEA_HOSTS = ['coopmaths.fr', 'mathalea.fr']

/** L'URL longue pointe vers coopmaths.fr ou mathalea.fr */
export function isMathaleaUrl(longUrl: string): boolean {
  let host: string
  try {
    host = new URL(longUrl).hostname.toLowerCase()
  } catch {
    return false
  }
  return MATHALEA_HOSTS.some(
    (site) => host === site || host.endsWith(`.${site}`),
  )
}

/** Lien raccourci tel que le renvoie l'API, réduit à ce qu'on affiche */
function readShortLink(value: unknown): ShortLink | null {
  if (typeof value !== 'object' || value === null) return null
  const item = value as Record<string, unknown>
  if (typeof item.shortCode !== 'string' || typeof item.longUrl !== 'string') {
    return null
  }
  // la date de création est celle de l'événement CREATE de l'historique
  const history = Array.isArray(item.history)
    ? (item.history as Array<Record<string, unknown>>)
    : []
  const created = history.find((event) => event?.event === 'CREATE')
  const date =
    typeof item.dateCreated === 'string'
      ? item.dateCreated
      : typeof created?.date === 'string'
        ? created.date
        : ''
  const summary = item.visitsSummary as { total?: unknown } | undefined
  return {
    shortCode: item.shortCode,
    shortUrl:
      typeof item.shortUrl === 'string' && item.shortUrl !== ''
        ? item.shortUrl
        : `${SHORT_URL_ORIGIN}/${item.shortCode}`,
    longUrl: item.longUrl,
    title: typeof item.title === 'string' ? item.title : '',
    ownerId: typeof item.ownerId === 'string' ? item.ownerId : null,
    dateCreated: date,
    expireAt: typeof item.expireAt === 'string' ? item.expireAt : null,
    deleteAt: typeof item.deleteAt === 'string' ? item.deleteAt : null,
    enabled: item.enabled !== false && item.expired !== true,
    visits:
      typeof item.visits === 'number'
        ? item.visits
        : typeof summary?.total === 'number'
          ? summary.total
          : null,
  }
}

function headers(token: string, json = false): Record<string, string> {
  return json
    ? { 'x-auth-token': token, 'Content-Type': 'application/json' }
    : { 'x-auth-token': token }
}

/**
 * Liens raccourcis qui mènent à coopmaths.fr ou mathalea.fr, de tous les
 * utilisateurs, du plus récent au plus ancien (voir `detectOwnerId` pour ne
 * garder que les siens).
 */
export async function listMathaleaLinks(
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ShortLink[]> {
  // l'instance n'applique pas fiablement recherche, tri et pagination : on
  // lit tout et on filtre ici
  const response = await send(
    `${API_URL}?page=1&itemsPerPage=1000`,
    { headers: headers(token) },
    fetchImpl,
  )
  const data = (await response.json()) as unknown
  // tableau brut, éventuellement dans `body`, ou enveloppe Shlink
  const body = unwrap(data)
  const items: unknown[] = Array.isArray(body)
    ? body
    : ((body as { shortUrls?: { data?: unknown[] } } | null)?.shortUrls?.data ??
      [])
  const byCode = new Map<string, ShortLink>()
  for (const item of items) {
    const link = readShortLink(item)
    if (link !== null && isMathaleaUrl(link.longUrl)) {
      byCode.set(link.shortCode, link)
    }
  }
  return [...byCode.values()].sort((a, b) =>
    a.dateCreated < b.dateCreated ? 1 : a.dateCreated > b.dateCreated ? -1 : 0,
  )
}

function linkUrl(link: Pick<ShortLink, 'shortCode'>): string {
  return `${API_URL}/${encodeURIComponent(link.shortCode)}`
}

/** Réglages modifiables d'un lien (le code du lien court, lui, ne change pas) */
export interface ShortLinkChanges {
  /** `null` pour retirer le titre */
  title?: string | null
  /** URL de destination */
  longUrl?: string
  /** `AAAA-MM-JJ`, `null` pour retirer la date */
  expireAt?: string | null
  deleteAt?: string | null
}

/** Modifie un lien raccourci : seuls les réglages donnés sont envoyés */
export async function updateShortLink(
  link: Pick<ShortLink, 'shortCode'>,
  changes: ShortLinkChanges,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  await send(
    linkUrl(link),
    {
      method: 'PATCH',
      headers: headers(token, true),
      body: JSON.stringify(changes),
    },
    fetchImpl,
  )
}

/** Change le titre d'un lien raccourci */
export async function renameShortLink(
  link: ShortLink,
  title: string,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  await updateShortLink(link, { title }, token, fetchImpl)
}

/** Le lien a dépassé sa fin de validité ou a été désactivé */
export function isExpired(
  link: Pick<ShortLink, 'expireAt' | 'enabled'>,
  now: Date = new Date(),
): boolean {
  if (!link.enabled) return true
  if (link.expireAt === null) return false
  const until = new Date(link.expireAt)
  return !Number.isNaN(until.getTime()) && now > until
}

/**
 * Date de fin repoussée d'un an, au format `AAAA-MM-JJ`. Une date déjà passée
 * compte un an à partir d'aujourd'hui : prolonger un lien expiré le rend
 * valable un an, pas un an de moins aujourd'hui.
 */
export function extendOneYear(
  iso: string,
  now: Date = new Date(),
): string | null {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const base = date > now ? date : now
  const result = new Date(
    Date.UTC(base.getUTCFullYear() + 1, base.getUTCMonth(), base.getUTCDate()),
  )
  return result.toISOString().slice(0, 10)
}

/** Nombre de visites dans la réponse de `nbVisits` : un nombre, ou un objet qui le porte */
export function readVisitsCount(data: unknown): number | null {
  if (typeof data === 'number') {
    return Number.isFinite(data) && data >= 0 ? data : null
  }
  if (typeof data === 'string' && /^\d+$/.test(data.trim())) {
    return Number(data)
  }
  if (typeof data !== 'object' || data === null) return null
  const record = data as Record<string, unknown>
  for (const key of ['nbVisits', 'visits', 'total', 'count', 'body']) {
    const count = readVisitsCount(record[key])
    if (count !== null) return count
  }
  return readVisitsCount(record.visitsSummary)
}

/** Nombre de visites d'un lien (`null` si l'API ne le donne pas) */
export async function fetchVisits(
  link: Pick<ShortLink, 'shortCode'>,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<number | null> {
  const response = await send(
    `${linkUrl(link)}/nbVisits`,
    { headers: headers(token) },
    fetchImpl,
  )
  return readVisitsCount(await response.json().catch(() => null))
}

/** Supprime un lien raccourci : le lien court cesse de fonctionner */
export async function deleteShortLink(
  link: ShortLink,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  await send(
    linkUrl(link),
    { method: 'DELETE', headers: headers(token) },
    fetchImpl,
  )
  forgetShortUrl(link.shortUrl)
}

/**
 * Identifiant du propriétaire du jeton parmi ceux des liens listés.
 *
 * L'API ne dit pas à qui est le jeton : on essaie, pour chaque propriétaire
 * (le plus de liens d'abord), de réécrire l'URL longue d'un de ses liens à
 * l'identique. L'écriture n'aboutit que pour les nôtres ; l'API répond sinon
 * « notPermitted ».
 * @returns `null` si aucun des liens n'est à nous (pas encore de lien créé),
 * ou si la recherche dépasse `timeoutMs`
 */
export async function detectOwnerId(
  links: ShortLink[],
  token: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 15000,
): Promise<string | null> {
  const owners = new Map<string, { count: number; sample: ShortLink }>()
  for (const link of links) {
    if (link.ownerId === null) continue
    const known = owners.get(link.ownerId)
    owners.set(link.ownerId, {
      count: (known?.count ?? 0) + 1,
      sample: known?.sample ?? link,
    })
  }
  const startedAt = Date.now()
  const candidates = [...owners.entries()].sort(
    (a, b) => b[1].count - a[1].count,
  )
  for (const [ownerId, { sample }] of candidates) {
    if (Date.now() - startedAt >= timeoutMs) return null
    try {
      await send(
        linkUrl(sample),
        {
          method: 'PATCH',
          headers: headers(token, true),
          body: JSON.stringify({ longUrl: sample.longUrl }),
        },
        fetchImpl,
      )
      return ownerId
    } catch (error) {
      if (error instanceof EdurlError && error.code === 'NOT_OWNER') continue
      throw error
    }
  }
  return null
}
