/**
 * Identifiant persistant du navigateur pour le mode multi-joueurs (V2).
 *
 * Le serveur l'utilise pour restituer le siège d'un joueur (points conservés)
 * ou le contrôle d'une room (créateur) après un rechargement de page ou une
 * coupure réseau : il est transmis au handshake Socket.IO (`auth.clientId`).
 */

const STORAGE_KEY = 'quizzClientId'

/**
 * uuid v4 sans dépendre de `crypto.randomUUID`, réservé aux contextes
 * sécurisés (HTTPS ou localhost) : en test depuis un appareil du réseau
 * local (`pnpm dev --host`, page servie en http://192.168.x.x), il est
 * absent. `crypto.getRandomValues`, lui, est disponible partout ; en dernier
 * recours, un tirage pseudo-aléatoire suffit pour un identifiant de siège.
 */
function randomUuidV4(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  ) {
    const bytes = crypto.getRandomValues(new Uint8Array(16))
    bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80 // variante RFC 4122
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'))
    return (
      hex.slice(0, 4).join('') +
      '-' +
      hex.slice(4, 6).join('') +
      '-' +
      hex.slice(6, 8).join('') +
      '-' +
      hex.slice(8, 10).join('') +
      '-' +
      hex.slice(10).join('')
    )
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16)
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

/**
 * Renvoie l'identifiant du navigateur, en créant un (uuid v4) à la première
 * utilisation. Repli sur un identifiant de session si localStorage est
 * indisponible (navigation privée stricte) : la reconnexion ne survivra pas
 * au rechargement, mais la partie reste jouable.
 */
export function getQuizzClientId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY)
    if (existing != null && existing.length > 0 && existing.length <= 64) {
      return existing
    }
    const clientId = randomUuidV4()
    localStorage.setItem(STORAGE_KEY, clientId)
    return clientId
  } catch {
    return randomUuidV4()
  }
}
