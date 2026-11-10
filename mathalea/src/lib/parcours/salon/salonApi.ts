/**
 * Salons MathALÉA : édition de parcours à plusieurs, sur un serveur de salons
 * (dépôt mathalea-salons). Salons, comptes et invitations sont gérés par
 * l'administrateur sur le serveur ; ce module ne fait que se connecter à
 * l'API JSON. La synchronisation des parcours est dans `salonConnection.ts`.
 */

/** Adresse du serveur de salons (VITE_SALONS_URL pour un autre serveur) */
export const SALONS_URL: string =
  import.meta.env.VITE_SALONS_URL ?? 'https://parcours.gemaths.net'

const SESSION_KEY = 'mathalea-salons-session'

export interface Salon {
  id: string
  nom: string
  description: string
}

export interface Account {
  id: number
  nom: string
  admin: boolean
  salons: Salon[]
}

export interface Member {
  id: number
  nom: string
}

/** Même règle que le serveur */
export const PASSWORD_RULE =
  'au moins 8 caractères, dont une majuscule, une minuscule et un chiffre'
export const strongPassword = (m: string) =>
  m.length >= 8 && /[A-ZÀ-Ý]/.test(m) && /[a-zß-ÿ]/.test(m) && /\d/.test(m)

export function storedToken(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

function storeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(SESSION_KEY, token)
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    // Stockage refusé : la connexion vaut pour cette visite
  }
}

export class SalonError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
  }
}

async function call<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown,
): Promise<T> {
  const token = storedToken()
  let response: Response
  try {
    response = await fetch(`${SALONS_URL}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new SalonError('Le serveur des salons ne répond pas.', 0)
  }
  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  if (!response.ok) {
    if (response.status === 401 && path !== '/api/connexion') storeToken(null)
    throw new SalonError(data?.erreur ?? 'Erreur du serveur.', response.status)
  }
  return data as T
}

export async function login(nom: string, motDePasse: string) {
  const r = await call<{ jeton: string; compte: Account }>(
    'POST',
    '/api/connexion',
    { nom, motDePasse },
  )
  storeToken(r.jeton)
  return r.compte
}

export async function signUp(code: string, nom: string, motDePasse: string) {
  const r = await call<{ jeton: string; compte: Account }>(
    'POST',
    '/api/inscription',
    { code, nom, motDePasse },
  )
  storeToken(r.jeton)
  return r.compte
}

export async function logout() {
  try {
    await call('POST', '/api/deconnexion')
  } finally {
    storeToken(null)
  }
}

export const me = () => call<Account>('GET', '/api/moi')
export const invitationInfo = (code: string) =>
  call<{ salon: { id: string; nom: string } | null }>(
    'GET',
    `/api/invitations/${encodeURIComponent(code)}`,
  )
export const joinWithInvitation = (code: string) =>
  call<Account>(
    'POST',
    `/api/invitations/${encodeURIComponent(code)}/rejoindre`,
  )
export const salonMembers = (salon: string) =>
  call<Member[]>('GET', `/api/salons/${salon}/membres`)
/** Dates des copies d'un salon (une par heure au plus), la plus récente d'abord */
export const salonVersions = (salon: string) =>
  call<string[]>('GET', `/api/salons/${salon}/versions`)
/** Une copie : état Yjs du salon en base64 */
export const salonVersion = (salon: string, le: string) =>
  call<{ le: string; etat: string }>(
    'GET',
    `/api/salons/${salon}/versions/${encodeURIComponent(le)}`,
  )
export const changePassword = (ancien: string, nouveau: string) =>
  call<null>('POST', '/api/mot-de-passe', { ancien, nouveau })

/** Adresse WebSocket du serveur */
export const salonsSocketUrl = () => `${SALONS_URL.replace(/^http/, 'ws')}/sync`
