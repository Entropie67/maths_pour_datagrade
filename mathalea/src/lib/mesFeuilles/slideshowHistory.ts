import type { SlideshowHistoryOptions } from '../../components/setup/diaporama/types'
import type { InterfaceParams } from '../types'
import { newId } from './library'
import { notifyContentChange } from './storage'
import {
  mergeTombstones,
  readTombstones,
  recordRemovals,
  type Tombstone,
} from './tombstones'

/**
 * Historique des diaporamas (fenêtre « Historique » des réglages du
 * diaporama). Gardé dans `localStorage`, comme avant « Mes sauvegardes »,
 * et repris dans le fichier `.mathalea` (voir `libraryFile.ts`).
 */

export const SLIDESHOW_HISTORY_KEY = 'mathalea:slideshow-history'
/**
 * Pierres tombales des diaporamas supprimés de l'historique, identifiés par
 * leur signature (voir `tombstones.ts`)
 */
export const SLIDESHOW_DELETED_KEY = 'mathalea:slideshow-history-deleted'

export type SlideshowHistoryEntry = {
  id: string
  title: string
  createdAt: string
  lastUsedAt: string
  /**
   * Dernière modification du contenu (titre) : à la fusion, le contenu le
   * plus récemment modifié l'emporte, la dernière utilisation la plus récente
   * est gardée
   */
  updatedAt: string
  /** Réglages et exercices : deux entrées de même signature sont un même diaporama */
  signature: string
  options: SlideshowHistoryOptions
  exercicesParams: InterfaceParams[]
  summary: {
    exercises: string
    exercisesTooltip?: string
    exercisesTruncated: boolean
    settings: string
  }
}

export function buildSlideshowSignature(
  options: SlideshowHistoryOptions,
  params: InterfaceParams[],
): string {
  return JSON.stringify({
    options: {
      nbVues: options.nbVues,
      flow: options.flow,
      screenBetweenSlides: options.screenBetweenSlides,
      sound: options.sound,
      shuffle: options.shuffle,
      manualMode: options.manualMode,
      pauseAfterEachQuestion: options.pauseAfterEachQuestion,
      isImagesOnSides: options.isImagesOnSides,
      select: options.select ?? [],
      order: options.order ?? [],
      durationGlobal: options.durationGlobal ?? null,
      durationCorrection: options.durationCorrection ?? null,
    },
    params: params.map((param) => ({
      uuid: param.uuid,
      id: param.id ?? null,
      alea: param.alea ?? null,
      nbQuestions: param.nbQuestions ?? null,
      duration: param.duration ?? null,
      sup: param.sup ?? null,
      sup2: param.sup2 ?? null,
      sup3: param.sup3 ?? null,
      sup4: param.sup4 ?? null,
      sup5: param.sup5 ?? null,
      cd: param.cd ?? null,
      cols: param.cols ?? null,
      interactif: param.interactif ?? null,
      versionQcm: param.versionQcm ?? null,
    })),
  })
}

export function defaultSlideshowTitle(): string {
  return `Diaporama ${new Date().toLocaleString('fr-FR')}`
}

/** Du plus récemment utilisé au plus ancien */
export function sortSlideshowHistory(
  items: SlideshowHistoryEntry[],
): SlideshowHistoryEntry[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime(),
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readDate(value: unknown, fallback: string): string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
    ? value
    : fallback
}

/**
 * Entrée lue dans `localStorage` ou dans un fichier : complétée, ou `null`
 * si elle n'a ni réglages ni exercices
 */
export function readSlideshowEntry(
  value: unknown,
): SlideshowHistoryEntry | null {
  if (
    !isRecord(value) ||
    !isRecord(value.options) ||
    !Array.isArray(value.exercicesParams)
  ) {
    return null
  }
  const item = value as Partial<SlideshowHistoryEntry> & {
    options: SlideshowHistoryOptions
    exercicesParams: InterfaceParams[]
  }
  const exercicesParams = item.exercicesParams.filter(
    (param) => isRecord(param) && typeof param.uuid === 'string',
  )
  const createdAt = readDate(item.createdAt, new Date().toISOString())
  const summary: Record<string, unknown> = isRecord(item.summary)
    ? item.summary
    : {}
  return {
    id: typeof item.id === 'string' && item.id !== '' ? item.id : newId(),
    title:
      typeof item.title === 'string' && item.title.trim() !== ''
        ? item.title
        : defaultSlideshowTitle(),
    createdAt,
    lastUsedAt: readDate(item.lastUsedAt, createdAt),
    // entrée enregistrée avant ce champ : son titre date de sa création
    updatedAt: readDate(item.updatedAt, createdAt),
    signature:
      typeof item.signature === 'string' && item.signature !== ''
        ? item.signature
        : buildSlideshowSignature(item.options, exercicesParams),
    options: item.options,
    exercicesParams,
    summary: {
      exercises:
        typeof summary.exercises === 'string'
          ? summary.exercises
          : `${exercicesParams.length} exercices`,
      exercisesTooltip:
        typeof summary.exercisesTooltip === 'string'
          ? summary.exercisesTooltip
          : undefined,
      exercisesTruncated: summary.exercisesTruncated === true,
      settings: typeof summary.settings === 'string' ? summary.settings : '',
    },
  }
}

export function readSlideshowEntries(value: unknown): SlideshowHistoryEntry[] {
  return Array.isArray(value)
    ? value
        .map(readSlideshowEntry)
        .filter((item): item is SlideshowHistoryEntry => item !== null)
    : []
}

export interface SlideshowMergeResult {
  items: SlideshowHistoryEntry[]
  /** Pierres tombales des diaporamas absents de `items` */
  deleted: Tombstone[]
  added: number
  updated: number
  /** Diaporamas retirés (synchronisation seulement) */
  removed: number
}

export interface SlideshowMergeOptions {
  /** Pierres tombales de l'historique `current` */
  currentDeleted?: Tombstone[]
  /** Pierres tombales de l'historique `imported` */
  importedDeleted?: Tombstone[]
  /**
   * Synchronisation entre appareils : les suppressions s'appliquent quand
   * elles sont plus récentes que la dernière utilisation ou modification. Sinon (import d'un
   * fichier), rien n'est effacé et un diaporama supprimé ici revient, comme
   * s'il venait d'être utilisé.
   */
  sync?: boolean
  /** Date de l'import */
  now?: string
}

/** Renomme un diaporama de l'historique (titre vide ou inchangé : sans effet) */
export function renameSlideshow(
  items: SlideshowHistoryEntry[],
  id: string,
  title: string,
  now: string = new Date().toISOString(),
): SlideshowHistoryEntry[] {
  const trimmed = title.trim()
  return items.map((item) =>
    item.id === id && trimmed !== '' && trimmed !== item.title
      ? { ...item, title: trimmed, updatedAt: now }
      : item,
  )
}

/** La plus récente des deux dates ISO */
function later(a: string, b: string): string {
  return Date.parse(a) >= Date.parse(b) ? a : b
}

/**
 * Fusionne un historique importé ou synchronisé : un diaporama est reconnu à
 * sa signature ; son contenu (titre) est celui de la version modifiée le plus
 * récemment (`updatedAt`), sa dernière utilisation la plus récente des deux.
 */
export function mergeSlideshowHistory(
  current: SlideshowHistoryEntry[],
  imported: SlideshowHistoryEntry[],
  {
    currentDeleted = [],
    importedDeleted = [],
    sync = false,
    now = new Date().toISOString(),
  }: SlideshowMergeOptions = {},
): SlideshowMergeResult {
  const bySignature = new Map<string, SlideshowHistoryEntry>()
  for (const item of current) bySignature.set(item.signature, item)
  const removedHere = new Set(currentDeleted.map((t) => t.id))
  let added = 0
  let updated = 0
  let removed = 0
  for (const item of imported) {
    const existing = bySignature.get(item.signature)
    if (existing === undefined) {
      bySignature.set(
        item.signature,
        !sync && removedHere.has(item.signature)
          ? { ...item, lastUsedAt: now }
          : item,
      )
      added++
      continue
    }
    const content =
      Date.parse(item.updatedAt) > Date.parse(existing.updatedAt)
        ? item
        : existing
    const lastUsedAt = later(existing.lastUsedAt, item.lastUsedAt)
    if (content !== existing || lastUsedAt !== existing.lastUsedAt) {
      bySignature.set(item.signature, {
        ...content,
        id: existing.id,
        createdAt:
          later(existing.createdAt, item.createdAt) === existing.createdAt
            ? item.createdAt
            : existing.createdAt,
        lastUsedAt,
      })
      updated++
    }
  }
  let deleted = currentDeleted
  if (sync) {
    deleted = mergeTombstones(currentDeleted, importedDeleted)
    for (const tombstone of deleted) {
      const item = bySignature.get(tombstone.id)
      // utilisé ou renommé après sa suppression ailleurs : il reste
      if (
        item !== undefined &&
        Date.parse(later(item.lastUsedAt, item.updatedAt)) <=
          Date.parse(tombstone.deletedAt)
      ) {
        bySignature.delete(tombstone.id)
        // un diaporama apporté par l'autre historique n'est pas compté deux fois
        if (current.some((c) => c.signature === tombstone.id)) removed++
        else added--
      }
    }
  }
  return {
    items: sortSlideshowHistory([...bySignature.values()]),
    deleted: deleted.filter((t) => !bySignature.has(t.id)),
    added,
    updated,
    removed,
  }
}

export function loadSlideshowHistory(): SlideshowHistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(SLIDESHOW_HISTORY_KEY)
    if (raw == null) return []
    return sortSlideshowHistory(readSlideshowEntries(JSON.parse(raw)))
  } catch {
    return []
  }
}

export function loadSlideshowDeletions(): Tombstone[] {
  try {
    const raw = window.localStorage.getItem(SLIDESHOW_DELETED_KEY)
    return raw == null ? [] : readTombstones(JSON.parse(raw))
  } catch {
    return []
  }
}

/**
 * Enregistre l'historique et prévient « Mes sauvegardes » (sauvegarde
 * automatique, autres onglets). Un diaporama qui disparaît laisse une pierre
 * tombale.
 * @param deleted pierres tombales à partir desquelles compter les
 *   suppressions (par défaut, celles enregistrées)
 * @returns l'historique trié
 */
export function saveSlideshowHistory(
  items: SlideshowHistoryEntry[],
  deleted: Tombstone[] = loadSlideshowDeletions(),
): SlideshowHistoryEntry[] {
  const sorted = sortSlideshowHistory(items)
  const tombstones = recordRemovals(
    deleted,
    loadSlideshowHistory().map((item) => item.signature),
    new Set(sorted.map((item) => item.signature)),
    new Date().toISOString(),
  )
  try {
    window.localStorage.setItem(SLIDESHOW_HISTORY_KEY, JSON.stringify(sorted))
    window.localStorage.setItem(
      SLIDESHOW_DELETED_KEY,
      JSON.stringify(tombstones),
    )
    notifyContentChange()
  } catch {
    // stockage plein ou indisponible : l'historique reste celui de la fenêtre
  }
  return sorted
}
