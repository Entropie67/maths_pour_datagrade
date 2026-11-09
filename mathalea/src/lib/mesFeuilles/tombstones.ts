/**
 * Pierres tombales de « Mes sauvegardes » : la trace d'un élément supprimé
 * définitivement (feuille, sélection, dossier, modèle de document,
 * diaporama de l'historique).
 *
 * Sans elles, fusionner deux copies de la bibliothèque (synchronisation entre
 * appareils) ferait revenir un élément supprimé sur l'une depuis l'autre. Une
 * pierre tombale est datée : un élément modifié après sa suppression sur un
 * autre appareil l'emporte (la date la plus récente gagne).
 */

export interface Tombstone {
  /** Identifiant de l'élément (signature pour un diaporama de l'historique) */
  id: string
  deletedAt: string
}

/**
 * Durée de conservation d'une pierre tombale, en jours : un appareil resté
 * hors ligne plus longtemps pourrait faire revenir un élément supprimé.
 */
export const TOMBSTONE_DAYS = 365
const DAY_MS = 24 * 60 * 60 * 1000

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Garde, pour chaque identifiant, la suppression la plus récente */
function latestById(tombstones: Iterable<Tombstone>): Tombstone[] {
  const byId = new Map<string, Tombstone>()
  for (const tombstone of tombstones) {
    const existing = byId.get(tombstone.id)
    if (existing === undefined || tombstone.deletedAt > existing.deletedAt) {
      byId.set(tombstone.id, tombstone)
    }
  }
  return [...byId.values()]
}

/** Pierres tombales lues dans le stockage ou dans un fichier, revérifiées */
export function readTombstones(value: unknown): Tombstone[] {
  if (!Array.isArray(value)) return []
  return latestById(
    value
      .filter(
        (t): t is Tombstone =>
          isRecord(t) &&
          typeof t.id === 'string' &&
          t.id !== '' &&
          typeof t.deletedAt === 'string' &&
          !Number.isNaN(Date.parse(t.deletedAt)),
      )
      .map((t) => ({
        id: t.id,
        deletedAt: new Date(Date.parse(t.deletedAt)).toISOString(),
      })),
  )
}

/** Réunit deux listes, la suppression la plus récente l'emportant */
export function mergeTombstones(
  a: readonly Tombstone[],
  b: readonly Tombstone[],
): Tombstone[] {
  return latestById([...a, ...b])
}

/** Retire les pierres tombales de plus de `TOMBSTONE_DAYS` jours */
export function purgeTombstones(
  tombstones: readonly Tombstone[],
  date: string,
): Tombstone[] {
  const limit = Date.parse(date) - TOMBSTONE_DAYS * DAY_MS
  return tombstones.filter((t) => Date.parse(t.deletedAt) > limit)
}

/**
 * Pierres tombales après une modification : une pour chaque élément qui a
 * disparu, aucune pour un élément présent (recréé, ou rendu par un import).
 * @param before identifiants avant la modification
 * @param after identifiants après la modification
 */
export function recordRemovals(
  tombstones: readonly Tombstone[],
  before: Iterable<string>,
  after: ReadonlySet<string>,
  date: string,
): Tombstone[] {
  const kept = tombstones.filter((t) => !after.has(t.id))
  const known = new Set(kept.map((t) => t.id))
  for (const id of before) {
    if (after.has(id) || known.has(id)) continue
    kept.push({ id, deletedAt: date })
    known.add(id)
  }
  return purgeTombstones(kept, date)
}

/**
 * Version d'un élément sur un appareil, pour la fusion : sa date (dernière
 * modification, mise à la corbeille, suppression) et son rang, qui départage
 * deux dates égales (une suppression l'emporte sur une modification).
 */
export interface Candidate<T> {
  time: string
  rank: number
  value: T
}

/**
 * La version la plus récente ; à date et rang égaux, un choix arbitraire mais
 * identique sur tous les appareils, pour que la fusion de A avec B donne la
 * même chose que celle de B avec A.
 */
export function latest<T>(a: Candidate<T>, b: Candidate<T>): Candidate<T> {
  const timeA = Date.parse(a.time)
  const timeB = Date.parse(b.time)
  if (timeA !== timeB) return timeA > timeB ? a : b
  if (a.rank !== b.rank) return a.rank > b.rank ? a : b
  return sortedJson(a.value) >= sortedJson(b.value) ? a : b
}

/** JSON aux clés triées : l'ordre des clés peut changer d'un appareil à l'autre */
function sortedJson(value: unknown): string {
  return JSON.stringify(value, (_key, inner: unknown) =>
    isRecord(inner)
      ? Object.fromEntries(
          Object.keys(inner)
            .sort()
            .map((key) => [key, inner[key]]),
        )
      : inner,
  )
}
