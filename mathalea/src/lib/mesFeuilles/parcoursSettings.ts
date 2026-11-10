import { isObjective, isParcours } from '../parcours/parcoursFile'
import {
  emptyLibrary,
  type CreationDefaults,
  type LibraryEntry,
  type TeacherLibrary,
} from '../parcours/parcoursLibrary'
import { mergeObjectives } from '../parcours/parcoursObjectives'
import type { Objective, Parcours } from '../parcours/parcoursTypes'
import { stableStringify, type MergeOptions } from './preferences'
import { notifyContentChange } from './storage'
import {
  mergeTombstones,
  readTombstones,
  recordRemovals,
  type Tombstone,
} from './tombstones'

/**
 * Parcours de l'application (vue `v=parcours`) : la bibliothèque de
 * l'enseignant, avec ses classes et ses objectifs. Gardée dans `localStorage`
 * par la vue Parcours, elle fait partie du fichier `.mathalea` et de la
 * synchronisation comme les modèles de document et l'historique des
 * diaporamas.
 */

export const PARCOURS_KEY = 'mathalea-parcours-bibliotheque'
/** Pierres tombales des parcours supprimés, identifiés par l'identifiant du parcours */
export const PARCOURS_DELETED_KEY = 'mathalea-parcours-supprimes'

export interface ParcoursSettings {
  library: TeacherLibrary
  deleted: Tombstone[]
}

export function emptyParcoursSettings(): ParcoursSettings {
  return { library: emptyLibrary(), deleted: [] }
}

/** Des parcours, des classes ou des objectifs sont enregistrés */
export function hasParcours(parcours: ParcoursSettings): boolean {
  const { library } = parcours
  return (
    library.entries.length > 0 ||
    library.classes.length > 0 ||
    library.objectives.length > 0
  )
}

const EPOCH = new Date(0).toISOString()

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((s): s is string => typeof s === 'string'))]
    : []
}

function readDefaults(value: unknown): CreationDefaults | undefined {
  if (!isRecord(value)) return undefined
  const { niveau, difficulte, presentation, correction } = value
  if (
    typeof niveau !== 'string' ||
    ![1, 2, 3].includes(difficulte as number) ||
    !['une_question_par_page', 'un_exo_par_page', 'liste_exos'].includes(
      presentation as string,
    ) ||
    !['question', 'page', 'parcours'].includes(correction as string)
  ) {
    return undefined
  }
  return {
    niveau,
    difficulte: difficulte as CreationDefaults['difficulte'],
    presentation: presentation as CreationDefaults['presentation'],
    correction: correction as CreationDefaults['correction'],
    ...(typeof value.enTetesMasques === 'boolean'
      ? { enTetesMasques: value.enTetesMasques }
      : {}),
    ...(typeof value.melanger === 'boolean'
      ? { melanger: value.melanger }
      : {}),
  }
}

/**
 * Parcours lu dans le stockage (brouillons tolérés : un parcours en cours de
 * rédaction n'a pas encore tous ses champs) ou dans un fichier (`strict` : le
 * format complet est vérifié, un parcours invalide est écarté).
 */
function readEntry(value: unknown, strict: boolean): LibraryEntry | null {
  if (!isRecord(value) || !isRecord(value.parcours)) return null
  const p = value.parcours
  const ok = strict
    ? isParcours(p)
    : typeof p.id === 'string' &&
      p.id !== '' &&
      typeof p.titre === 'string' &&
      Array.isArray(p.etapes)
  if (!ok) return null
  return {
    parcours: p as unknown as Parcours,
    classes: readStrings(value.classes),
    ...(Number.isInteger(value.published) && (value.published as number) > 0
      ? { published: value.published as number }
      : {}),
    ...(typeof value.updatedAt === 'string' &&
    !Number.isNaN(Date.parse(value.updatedAt))
      ? { updatedAt: new Date(Date.parse(value.updatedAt)).toISOString() }
      : {}),
  }
}

/** Bibliothèque lue dans le stockage ou dans un fichier, complétée et revérifiée */
export function readParcoursLibrary(
  value: unknown,
  strict = false,
): TeacherLibrary {
  if (!isRecord(value) || !Array.isArray(value.entries)) return emptyLibrary()
  const seen = new Set<string>()
  const entries: LibraryEntry[] = []
  for (const raw of value.entries) {
    const entry = readEntry(raw, strict)
    if (entry === null || seen.has(entry.parcours.id)) continue
    seen.add(entry.parcours.id)
    entries.push(entry)
  }
  const classes = readStrings(value.classes)
  for (const entry of entries) {
    for (const name of entry.classes) {
      if (!classes.includes(name)) classes.push(name)
    }
  }
  const defaults = readDefaults(value.defaults)
  return {
    classes,
    entries,
    objectives: Array.isArray(value.objectives)
      ? mergeObjectives([], value.objectives.filter(isObjective))
      : [],
    ...(defaults === undefined ? {} : { defaults }),
  }
}

/** Parcours lus dans un fichier `.mathalea` (format vérifié en entier) */
export function readParcoursSettings(value: unknown): ParcoursSettings {
  if (!isRecord(value)) return emptyParcoursSettings()
  const library = readParcoursLibrary(value.library, true)
  const ids = new Set(library.entries.map((e) => e.parcours.id))
  return {
    library,
    deleted: readTombstones(value.deleted).filter((t) => !ids.has(t.id)),
  }
}

// ---------- Fusion ----------

const timeOf = (entry: LibraryEntry) => Date.parse(entry.updatedAt ?? EPOCH)

/**
 * Version à garder de deux copies d'un parcours : la modifiée le plus
 * récemment, sinon la version la plus haute, sinon la plus publiée, sinon un
 * choix identique sur tous les appareils (la fusion de A avec B donne celle de
 * B avec A). À contenu égal, la copie d'ici est gardée.
 */
function newer(local: LibraryEntry, other: LibraryEntry): LibraryEntry {
  if (timeOf(local) !== timeOf(other)) {
    return timeOf(other) > timeOf(local) ? other : local
  }
  if (local.parcours.version !== other.parcours.version) {
    return other.parcours.version > local.parcours.version ? other : local
  }
  if ((local.published ?? 0) !== (other.published ?? 0)) {
    return (other.published ?? 0) > (local.published ?? 0) ? other : local
  }
  const a = stableStringify(local)
  const b = stableStringify(other)
  return b > a ? other : local
}

export interface ParcoursMergeResult {
  parcours: ParcoursSettings
  /** Parcours ajoutés, remplacés ou supprimés */
  imported: number
}

/**
 * Fusionne des parcours importés (rien n'est effacé : un parcours inconnu est
 * ajouté, un parcours connu n'est remplacé que par une version plus récente)
 * ou synchronisés (la modification ou la suppression la plus récente
 * l'emporte). L'ordre est celui d'ici, les nouveaux parcours venant ensuite ;
 * classes et objectifs sont réunis.
 */
export function mergeParcours(
  local: ParcoursSettings,
  imported: ParcoursSettings,
  { sync = false, now = new Date().toISOString() }: MergeOptions = {},
): ParcoursMergeResult {
  const entries = new Map<string, LibraryEntry>(
    local.library.entries.map((e) => [e.parcours.id, e]),
  )
  const removedHere = new Set(local.deleted.map((t) => t.id))
  let count = 0
  for (const entry of imported.library.entries) {
    const id = entry.parcours.id
    const existing = entries.get(id)
    if (existing === undefined) {
      // revenu d'un fichier alors qu'il a été supprimé ici : à rendre aussi aux autres appareils
      entries.set(
        id,
        !sync && removedHere.has(id) ? { ...entry, updatedAt: now } : entry,
      )
      count++
      continue
    }
    const winner = newer(existing, entry)
    if (
      winner !== existing &&
      stableStringify(winner) !== stableStringify(existing)
    ) {
      entries.set(id, winner)
      count++
    }
  }
  let deleted = local.deleted
  if (sync) {
    deleted = mergeTombstones(local.deleted, imported.deleted)
    for (const tombstone of deleted) {
      const entry = entries.get(tombstone.id)
      // modifié après sa suppression ailleurs : il reste
      if (
        entry !== undefined &&
        timeOf(entry) <= Date.parse(tombstone.deletedAt)
      ) {
        entries.delete(tombstone.id)
        // un parcours apporté par l'autre version n'est pas compté deux fois
        if (local.library.entries.some((e) => e.parcours.id === tombstone.id)) {
          count++
        } else {
          count--
        }
      }
    }
  }
  const classes = [...local.library.classes]
  for (const name of [
    ...imported.library.classes,
    ...[...entries.values()].flatMap((e) => e.classes),
  ]) {
    if (!classes.includes(name)) classes.push(name)
  }
  const defaults = local.library.defaults ?? imported.library.defaults
  return {
    parcours: {
      library: {
        classes,
        entries: [...entries.values()],
        objectives: mergeObjectives(
          local.library.objectives,
          imported.library.objectives,
        ),
        ...(defaults === undefined ? {} : { defaults }),
      },
      deleted: deleted.filter((t) => !entries.has(t.id)),
    },
    imported:
      count +
      imported.library.objectives.filter(
        (o: Objective) =>
          !local.library.objectives.some((x) => x.libelle === o.libelle),
      ).length,
  }
}

// ---------- Empreinte ----------

/**
 * Ce qui compte pour l'état de la sauvegarde : les parcours, leurs classes et
 * leur ordre, les objectifs. Ni la date de modification, ni l'état de
 * publication (envoyer le fichier aux élèves ne modifie pas les parcours).
 */
export function parcoursContent(parcours: ParcoursSettings): unknown {
  const { library } = parcours
  return {
    classes: library.classes,
    entries: library.entries.map((e) => ({
      parcours: e.parcours,
      classes: e.classes,
    })),
    objectives: library.objectives,
  }
}

// ---------- Stockage ----------

export function loadParcoursSettings(): ParcoursSettings {
  try {
    const raw = window.localStorage.getItem(PARCOURS_KEY)
    const rawDeleted = window.localStorage.getItem(PARCOURS_DELETED_KEY)
    return {
      library:
        raw == null ? emptyLibrary() : readParcoursLibrary(JSON.parse(raw)),
      deleted: rawDeleted == null ? [] : readTombstones(JSON.parse(rawDeleted)),
    }
  } catch {
    return emptyParcoursSettings()
  }
}

function writeParcours(
  previous: ParcoursSettings,
  next: ParcoursSettings,
): ParcoursSettings {
  const tombstones = recordRemovals(
    next.deleted,
    previous.library.entries.map((e) => e.parcours.id),
    new Set(next.library.entries.map((e) => e.parcours.id)),
    new Date().toISOString(),
  )
  const saved: ParcoursSettings = { library: next.library, deleted: tombstones }
  // rien n'a changé : pas de sauvegarde automatique, pas de rechargement des autres onglets
  if (stableStringify(saved) === stableStringify(previous)) return previous
  try {
    window.localStorage.setItem(PARCOURS_KEY, JSON.stringify(saved.library))
    window.localStorage.setItem(
      PARCOURS_DELETED_KEY,
      JSON.stringify(tombstones),
    )
    notifyContentChange()
  } catch {
    // stockage plein ou indisponible : la publication reste le moyen de garder la bibliothèque
    return previous
  }
  return saved
}

/**
 * Enregistre la bibliothèque modifiée dans la vue Parcours. Un parcours ou
 * des classes qui changent sont datés (`updatedAt`) pour la fusion ; un
 * parcours qui disparaît laisse une pierre tombale.
 * @returns les parcours enregistrés
 */
export function saveParcoursLibrary(
  library: TeacherLibrary,
  now: string = new Date().toISOString(),
): ParcoursSettings {
  const previous = loadParcoursSettings()
  const before = new Map(
    previous.library.entries.map((e) => [e.parcours.id, e]),
  )
  const entries = library.entries.map((entry): LibraryEntry => {
    const old = before.get(entry.parcours.id)
    const changed =
      old === undefined ||
      stableStringify({ p: old.parcours, c: old.classes }) !==
        stableStringify({ p: entry.parcours, c: entry.classes })
    const updatedAt = changed ? now : (old?.updatedAt ?? entry.updatedAt)
    const dated = { ...entry, updatedAt }
    if (updatedAt === undefined) delete dated.updatedAt
    return dated
  })
  return writeParcours(previous, {
    library: { ...library, entries },
    deleted: previous.deleted,
  })
}

/** Enregistre des parcours fusionnés (dates et pierres tombales comprises) */
export function saveParcoursSettings(parcours: ParcoursSettings): void {
  writeParcours(loadParcoursSettings(), parcours)
}
