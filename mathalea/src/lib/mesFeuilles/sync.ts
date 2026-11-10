import {
  emptyLibrary,
  type SavedSelection,
  type SavedSession,
  type SavedSheet,
  type SheetFolder,
  type SheetLibrary,
  type TrashedItem,
} from './library'
import {
  buildLibraryFile,
  parseLibraryFile,
  repair,
  type LibraryFile,
} from './libraryFile'
import {
  emptySettings,
  mergeSettings,
  withoutSecrets,
  type LibrarySettings,
} from './settings'
import { latest, type Candidate, type Tombstone } from './tombstones'

/**
 * Synchronisation de « Mes sauvegardes » entre appareils (compte en ligne,
 * voir `documentation/projets/mon-mathalea-cahier-des-charges.md`).
 *
 * Le serveur garde un seul document par compte : le fichier `.mathalea` de
 * toute la bibliothèque, corbeille et pierres tombales comprises, sans les
 * aperçus. Il ne fusionne rien : c'est le client qui fusionne sa version avec
 * celle du serveur (`mergeSyncDocuments`) avant de la renvoyer. Contrairement
 * à l'import d'un fichier, la fusion applique les suppressions : pour chaque
 * élément, la modification, la mise à la corbeille ou la suppression la plus
 * récente l'emporte.
 */

/** Ce que l'appareil et le serveur s'échangent */
export interface SyncDocument {
  library: SheetLibrary
  settings: LibrarySettings
}

export { emptySettings }

/**
 * Document envoyé au serveur : sans les aperçus, trop lourds, ni les secrets
 * (jeton edurl.fr), qui restent sur l'appareil
 */
export function buildSyncFile(document: SyncDocument): LibraryFile {
  const file = buildLibraryFile(
    document.library,
    new Map(),
    null,
    withoutSecrets(document.settings),
  )
  return document.library.trash.length > 0
    ? { ...file, trash: document.library.trash }
    : file
}

/**
 * Lit le document reçu du serveur.
 * @throws Error si ce n'est pas un fichier `.mathalea`
 */
export function parseSyncFile(text: string): SyncDocument {
  const parsed = parseLibraryFile(text)
  return {
    library: parsed.library,
    settings: parsed.settings ?? emptySettings(),
  }
}

/** Place d'un élément dans la bibliothèque */
type Placed =
  | {
      place: 'folders' | 'selectionFolders' | 'sessionFolders'
      value: SheetFolder
    }
  | { place: 'sheets'; value: SavedSheet }
  | { place: 'selections'; value: SavedSelection }
  | { place: 'sessions'; value: SavedSession }
  | { place: 'trash'; value: TrashedItem }
  | { place: 'deleted'; value: Tombstone }

/** À date égale, la suppression l'emporte sur la corbeille, qui l'emporte sur une modification */
const RANKS: Record<Placed['place'], number> = {
  folders: 0,
  selectionFolders: 0,
  sessionFolders: 0,
  sheets: 0,
  selections: 0,
  sessions: 0,
  trash: 1,
  deleted: 2,
}

function versions(library: SheetLibrary): Candidate<Placed>[] {
  const active = (
    placed: Exclude<Placed, { place: 'trash' | 'deleted' }>,
  ): Candidate<Placed> => ({
    time: placed.value.updatedAt,
    rank: RANKS[placed.place],
    value: placed,
  })
  return [
    ...library.folders.map((value) => active({ place: 'folders', value })),
    ...(library.organization?.merged ? [] : library.selectionFolders).map(
      (value) => active({ place: 'selectionFolders', value }),
    ),
    ...(library.organization?.merged ? [] : library.sessionFolders).map(
      (value) => active({ place: 'sessionFolders', value }),
    ),
    ...library.sheets.map((value) => active({ place: 'sheets', value })),
    ...library.selections.map((value) =>
      active({ place: 'selections', value }),
    ),
    ...library.sessions.map((value) => active({ place: 'sessions', value })),
    ...library.trash.map((value) => ({
      time: value.deletedAt,
      rank: RANKS.trash,
      value: { place: 'trash' as const, value },
    })),
    ...library.deleted.map((value) => ({
      time: value.deletedAt,
      rank: RANKS.deleted,
      value: { place: 'deleted' as const, value },
    })),
  ]
}

function placedId(placed: Placed): string {
  return placed.place === 'trash' ? placed.value.item.id : placed.value.id
}

/**
 * Fusionne deux versions de la bibliothèque : pour chaque dossier, feuille,
 * sélection ou séance, la version la plus récente l'emporte (modification, mise à la
 * corbeille, ou suppression définitive). Le résultat ne dépend pas de l'ordre
 * des deux versions.
 */
export function syncLibraries(
  local: SheetLibrary,
  remote: SheetLibrary,
): SheetLibrary {
  const winners = new Map<string, Candidate<Placed>>()
  for (const version of [...versions(local), ...versions(remote)]) {
    const id = placedId(version.value)
    const current = winners.get(id)
    winners.set(id, current === undefined ? version : latest(current, version))
  }
  const organization = [local.organization, remote.organization]
    .filter((value) => value !== undefined)
    .sort(
      (a, b) =>
        b.updatedAt.localeCompare(a.updatedAt) ||
        Number(b.merged) - Number(a.merged),
    )[0]
  const merged: SheetLibrary = { ...emptyLibrary(), organization }
  for (const { value: placed } of winners.values()) {
    // chaque place reçoit les éléments de son type
    ;(merged[placed.place] as Placed['value'][]).push(placed.value)
  }
  merged.trash.sort((a, b) => Date.parse(b.deletedAt) - Date.parse(a.deletedAt))
  return repair(merged)
}

/**
 * Fusionne la version de l'appareil et celle du serveur : bibliothèque
 * (`syncLibraries`) et réglages (modèles et diaporamas supprimés compris).
 */
export function mergeSyncDocuments(
  local: SyncDocument,
  remote: SyncDocument,
): SyncDocument {
  return {
    library: syncLibraries(local.library, remote.library),
    settings: mergeSettings(local.settings, remote.settings, { sync: true })
      .settings,
  }
}

// ---------- Version du serveur ----------

/**
 * Version du document en ligne. `epoch` est tiré au hasard par le serveur à
 * la création du compte et à chaque « Effacer mes données en ligne » ; `rev`
 * augmente à chaque envoi accepté.
 */
export interface RemoteVersion {
  account: string
  epoch: string
  rev: number
}

/** Dernière version du serveur fusionnée par cet appareil, `null` s'il ne s'est jamais synchronisé */
export type SyncState = RemoteVersion | null

/**
 * Que faire en découvrant la version du serveur :
 * - `premiere` : appareil jamais synchronisé avec ce compte, la fusion de la
 *   bibliothèque locale avec celle du compte est à proposer ;
 * - `effacee` : les données en ligne ont été effacées depuis un autre
 *   appareil ; ne rien renvoyer avant que l'utilisateur ait choisi entre
 *   effacer aussi cet appareil et renvoyer ses données ;
 * - `recuperer` : le serveur a changé, fusionner sa version avant d'envoyer ;
 * - `a-jour` : rien de nouveau, envoyer seulement les modifications locales.
 */
export type SyncStep = 'premiere' | 'effacee' | 'recuperer' | 'a-jour'

export function nextSyncStep(
  state: SyncState,
  remote: RemoteVersion,
): SyncStep {
  if (state === null || state.account !== remote.account) return 'premiere'
  if (state.epoch !== remote.epoch) return 'effacee'
  // une révision plus ancienne (serveur restauré d'une sauvegarde) se
  // fusionne aussi : la fusion ne perd rien
  return state.rev === remote.rev ? 'a-jour' : 'recuperer'
}
