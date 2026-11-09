import { notifyContentChange } from '../mesFeuilles/storage'

/**
 * Jeton d'accès personnel à edurl.fr (portail.apps.education.fr → Mon profil →
 * Jeton d'accès), nécessaire pour raccourcir des liens et gérer ses liens
 * raccourcis.
 *
 * Gardé dans `localStorage` sous la clé historique `mathalea-edurl-token`
 * (la valeur seule), avec la date de sa dernière modification dans une
 * seconde clé. Il fait partie du fichier `.mathalea` (voir `settings.ts`).
 */

export const EDURL_TOKEN_KEY = 'mathalea-edurl-token'
export const EDURL_TOKEN_DATE_KEY = 'mathalea-edurl-token-date'

const MAX_TOKEN_LENGTH = 2000

export interface EdurlToken {
  /** `null` : pas de jeton (jamais saisi, ou oublié) */
  value: string | null
  /** Date de la dernière modification (le plus récent l'emporte à l'import) */
  updatedAt: string
}

const EPOCH = new Date(0).toISOString()

export function emptyEdurlToken(): EdurlToken {
  return { value: null, updatedAt: EPOCH }
}

export function hasEdurlToken(token: EdurlToken): boolean {
  return token.value !== null
}

/** Jeton nettoyé, `null` s'il est vide ou trop long pour en être un */
export function cleanEdurlToken(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' || trimmed.length > MAX_TOKEN_LENGTH ? null : trimmed
}

/** Jeton lu dans un fichier `.mathalea`, revérifié */
export function readEdurlToken(value: unknown): EdurlToken {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return emptyEdurlToken()
  }
  const record = value as Record<string, unknown>
  const token = cleanEdurlToken(record.value)
  if (token === null) return emptyEdurlToken()
  const date = record.updatedAt
  return {
    value: token,
    updatedAt:
      typeof date === 'string' && !Number.isNaN(Date.parse(date))
        ? date
        : EPOCH,
  }
}

/**
 * Fusionne le jeton d'un fichier importé : il n'est repris que s'il est plus
 * récent que celui de ce navigateur. Un jeton oublié ici le reste si le
 * fichier est plus ancien ; un fichier sans jeton n'efface rien.
 */
export function mergeEdurlToken(
  local: EdurlToken,
  imported: EdurlToken,
): { token: EdurlToken; imported: number } {
  if (
    imported.value !== null &&
    imported.value !== local.value &&
    imported.updatedAt > local.updatedAt
  ) {
    return { token: imported, imported: 1 }
  }
  return { token: local, imported: 0 }
}

// ---------- Stockage ----------

export function loadEdurlToken(): EdurlToken {
  try {
    const value = cleanEdurlToken(window.localStorage.getItem(EDURL_TOKEN_KEY))
    const date = window.localStorage.getItem(EDURL_TOKEN_DATE_KEY)
    return {
      value,
      updatedAt:
        date !== null && !Number.isNaN(Date.parse(date)) ? date : EPOCH,
    }
  } catch {
    return emptyEdurlToken()
  }
}

/** Jeton à utiliser, `null` si l'enseignant n'en a pas enregistré */
export function getEdurlToken(): string | null {
  return loadEdurlToken().value
}

/**
 * Enregistre un jeton tel quel (import ou saisie) et prévient « Mes
 * sauvegardes » : la sauvegarde automatique réécrit le fichier.
 */
export function saveEdurlToken(token: EdurlToken): void {
  try {
    if (token.value === null) {
      window.localStorage.removeItem(EDURL_TOKEN_KEY)
    } else {
      window.localStorage.setItem(EDURL_TOKEN_KEY, token.value)
    }
    window.localStorage.setItem(EDURL_TOKEN_DATE_KEY, token.updatedAt)
    notifyContentChange()
  } catch {
    // stockage indisponible (navigation privée, quota…) : le jeton sera
    // simplement redemandé la prochaine fois
  }
}

/** @returns `false` si la valeur n'est pas un jeton utilisable */
export function setEdurlToken(
  value: string,
  now: string = new Date().toISOString(),
): boolean {
  const token = cleanEdurlToken(value)
  if (token === null) return false
  saveEdurlToken({ value: token, updatedAt: now })
  return true
}

/** Oublie le jeton (il ne reviendra pas d'un fichier plus ancien) */
export function clearEdurlToken(now: string = new Date().toISOString()): void {
  saveEdurlToken({ value: null, updatedAt: now })
}

// ---------- Propriétaire du jeton ----------

const EDURL_OWNER_KEY = 'mathalea-edurl-owner'

/** Empreinte du jeton (FNV-1a) : le cache du propriétaire n'en garde pas de copie */
function tokenPrint(token: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < token.length; i++) {
    hash ^= token.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36)
}

/**
 * Identifiant du propriétaire du jeton chez edurl.fr (voir `detectOwnerId`),
 * retrouvé une première fois puis gardé dans ce navigateur, hors du fichier
 * `.mathalea` : il ne concerne que ce jeton.
 */
export function loadEdurlOwnerId(token: string): string | null {
  try {
    const raw = window.localStorage.getItem(EDURL_OWNER_KEY)
    const data = raw === null ? null : (JSON.parse(raw) as unknown)
    if (typeof data !== 'object' || data === null) return null
    const { print, ownerId } = data as Record<string, unknown>
    return print === tokenPrint(token) && typeof ownerId === 'string'
      ? ownerId
      : null
  } catch {
    return null
  }
}

export function saveEdurlOwnerId(token: string, ownerId: string): void {
  try {
    window.localStorage.setItem(
      EDURL_OWNER_KEY,
      JSON.stringify({ print: tokenPrint(token), ownerId }),
    )
  } catch {
    // stockage indisponible : la recherche sera refaite
  }
}
