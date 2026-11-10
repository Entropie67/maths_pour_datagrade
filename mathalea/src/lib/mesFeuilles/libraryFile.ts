import JSZip from 'jszip'
import { readOmrSavedState } from '../omr/omrSavedState'
import { readWebUrl } from './webLink'
import {
  cleanComment,
  sharedFolders,
  mergeSharedFolderNames,
  type LibraryOrganization,
  emptyLibrary,
  cleanSheetCode,
  folderAndDescendants,
  foldersOf,
  isSessionState,
  sessionExercises,
  toStars,
  type SavedSelection,
  type SelectionShortLink,
  type SavedSession,
  type SavedSheet,
  type SheetFolder,
  type SheetLibrary,
  type SheetPreview,
  type Space,
  type TrashedItem,
} from './library'
import {
  hasSecretSettings,
  hasSettings,
  hasSettingsDeletions,
  readSettings,
  type LibrarySettings,
} from './settings'
import { readTombstones, type Tombstone } from './tombstones'

/**
 * Fichier « .mathalea » : sauvegarde de la bibliothèque « Mes sauvegardes »
 * (feuilles, sélections et séances), à recharger sur un autre navigateur ou après un
 * effacement des données du site. Une archive ZIP qui contient le JSON, aperçus
 * compris ; un ancien fichier en JSON seul reste lisible (`readLibraryFileText`).
 *
 * Les sélections (`selectionFolders`, `selections`), les séances au
 * vidéoprojecteur (`sessionFolders`, `sessions`) puis les réglages
 * (`settings` : lien élève, modèles de la vue Impression, historique des
 * diaporamas, parcours, jeton edurl.fr) ont été ajoutés au format `mon-mathalea/1` sans en changer le
 * numéro : un fichier qui n'en a pas reste valide. De même pour les pierres
 * tombales (`deleted`, voir `tombstones.ts`), utiles à la synchronisation et
 * ignorées à l'import d'un fichier.
 */

export const LIBRARY_FILE_FORMAT = 'mon-mathalea/1'
export const LIBRARY_FILE_EXTENSION = '.mathalea'
/**
 * Type du fichier écrit : pas `application/zip`, pour que le navigateur n'y
 * voie pas une archive à renommer ou à décompresser en la téléchargeant.
 */
export const LIBRARY_FILE_MIME_TYPE = 'application/octet-stream'
/** Nom du JSON dans l'archive */
const LIBRARY_ARCHIVE_ENTRY = 'mes-sauvegardes.json'
const UNREADABLE_FILE = 'Ce fichier n’est pas une sauvegarde MathALÉA lisible.'

export interface LibraryFile {
  organization?: LibraryOrganization
  format: typeof LIBRARY_FILE_FORMAT
  exportedAt: string
  folders: SheetFolder[]
  sheets: (SavedSheet & { preview?: SheetPreview })[]
  selectionFolders: SheetFolder[]
  selections: SavedSelection[]
  sessionFolders: SheetFolder[]
  sessions: SavedSession[]
  /** Seulement dans l'export de toute la bibliothèque */
  settings?: LibrarySettings
  /** Éléments supprimés définitivement (export de toute la bibliothèque) */
  deleted?: Tombstone[]
  /** Corbeille : seulement dans le document de synchronisation (`sync.ts`) */
  trash?: TrashedItem[]
}

/** Dossier exporté seul, avec ses sous-dossiers */
export interface ExportedFolder {
  space: Space
  folderId: string
}

/**
 * Bibliothèque réduite à un dossier et ses sous-dossiers (le dossier devient
 * une racine), ou entière si aucun dossier n'est donné
 */
export function libraryPart(
  library: SheetLibrary,
  scope: ExportedFolder | null,
): SheetLibrary {
  if (scope === null) return library
  const ids = folderAndDescendants(
    foldersOf(library, scope.space),
    scope.folderId,
  )
  const keep = (folders: SheetFolder[]) =>
    folders
      .filter((f) => ids.has(f.id))
      .map((f) => (f.id === scope.folderId ? { ...f, parentId: null } : f))
  const isInside = (item: { folderId: string | null }) =>
    item.folderId !== null && ids.has(item.folderId)
  if (library.organization?.merged) {
    const folders = keep(library.folders)
    return {
      ...emptyLibrary(),
      organization: library.organization,
      folders,
      selectionFolders: folders,
      sessionFolders: folders,
      sheets: library.sheets.filter(isInside),
      selections: library.selections.filter(isInside),
      sessions: library.sessions.filter(isInside),
      trash: [],
      deleted: [],
    }
  }
  const empty = emptyLibrary()
  switch (scope.space) {
    case 'feuilles':
      return {
        ...empty,
        folders: keep(library.folders),
        sheets: library.sheets.filter(isInside),
      }
    case 'selections':
      return {
        ...empty,
        selectionFolders: keep(library.selectionFolders),
        selections: library.selections.filter(isInside),
      }
    case 'seances':
      return {
        ...empty,
        sessionFolders: keep(library.sessionFolders),
        sessions: library.sessions.filter(isInside),
      }
  }
}

/**
 * Contenu du fichier pour toute la bibliothèque, réglages compris, ou pour un
 * dossier et ses sous-dossiers (le dossier exporté devient alors une racine,
 * sans les réglages).
 */
export function buildLibraryFile(
  library: SheetLibrary,
  previews: Map<string, SheetPreview>,
  scope: ExportedFolder | null = null,
  settings: LibrarySettings | null = null,
): LibraryFile {
  const part = libraryPart(library, scope)
  const withSettings =
    scope === null &&
    settings !== null &&
    (hasSettings(settings) ||
      hasSettingsDeletions(settings) ||
      hasSecretSettings(settings))
  return {
    format: LIBRARY_FILE_FORMAT,
    exportedAt: new Date().toISOString(),
    ...(part.organization ? { organization: part.organization } : {}),
    folders: part.folders,
    sheets: part.sheets.map((sheet) => {
      const preview = previews.get(sheet.id)
      return preview === undefined ? sheet : { ...sheet, preview }
    }),
    selectionFolders: part.selectionFolders,
    selections: part.selections,
    sessionFolders: part.sessionFolders,
    sessions: part.sessions,
    ...(withSettings ? { settings } : {}),
    ...(part.deleted.length > 0 ? { deleted: part.deleted } : {}),
  }
}

/** Contenu à écrire dans un fichier `.mathalea` : le JSON, zippé */
export async function zipLibraryFile(file: LibraryFile): Promise<ArrayBuffer> {
  const zip = new JSZip()
  zip.file(LIBRARY_ARCHIVE_ENTRY, JSON.stringify(file))
  return await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' })
}

/**
 * Texte JSON d'un fichier ouvert : celui de l'archive, ou le fichier lui-même
 * s'il n'est pas zippé (ancien `.mathalea`, réglages de la vue TBI).
 * @throws Error avec un message à afficher si l'archive est illisible
 */
export async function readLibraryFileText(
  content: ArrayBuffer,
): Promise<string> {
  const start = new Uint8Array(content, 0, Math.min(2, content.byteLength))
  // « PK » : début d'une archive ZIP, alors qu'un JSON commence par « { »
  if (start[0] !== 0x50 || start[1] !== 0x4b) {
    return new TextDecoder().decode(content)
  }
  try {
    const zip = await JSZip.loadAsync(content)
    return await zip.files[LIBRARY_ARCHIVE_ENTRY].async('string')
  } catch {
    throw new Error(UNREADABLE_FILE)
  }
}

export interface ParsedLibraryFile {
  library: SheetLibrary
  previews: Map<string, SheetPreview>
  /** `null` si le fichier n'a pas de réglages (export d'un dossier) */
  settings: LibrarySettings | null
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readDate(value: unknown): string {
  return isString(value) && !Number.isNaN(Date.parse(value))
    ? value
    : new Date(0).toISOString()
}

function readFolder(value: unknown): SheetFolder | null {
  if (!isRecord(value) || !isString(value.id) || value.id === '') return null
  return {
    id: value.id,
    name:
      isString(value.name) && value.name.trim() !== '' ? value.name : 'Dossier',
    parentId: isString(value.parentId) ? value.parentId : null,
    createdAt: readDate(value.createdAt),
    updatedAt: readDate(value.updatedAt),
  }
}

function readPreview(value: unknown): SheetPreview | undefined {
  if (!isRecord(value) || !isString(value.svg)) return undefined
  const numbers = [value.pageWidth, value.pageHeight, value.pageCount]
  if (
    !numbers.every((n) => typeof n === 'number' && Number.isFinite(n) && n > 0)
  ) {
    return undefined
  }
  return {
    svg: stripScripts(value.svg),
    pageWidth: value.pageWidth as number,
    pageHeight: value.pageHeight as number,
    pageCount: value.pageCount as number,
  }
}

function readSheet(
  value: unknown,
): { sheet: SavedSheet; preview?: SheetPreview } | null {
  if (!isRecord(value) || !isString(value.id) || value.id === '') return null
  // seule une requête d'URL est acceptée : jamais une adresse complète, qui
  // pourrait emmener ailleurs que sur MathALÉA
  if (!isString(value.query) || !value.query.startsWith('?')) return null
  const code = cleanSheetCode(value.code)
  return {
    sheet: {
      id: value.id,
      name:
        isString(value.name) && value.name.trim() !== ''
          ? value.name
          : 'Feuille',
      folderId: isString(value.folderId) ? value.folderId : null,
      query: value.query,
      exercises: Array.isArray(value.exercises)
        ? value.exercises.filter(isString)
        : [],
      ...(code === undefined ? {} : { code }),
      ...(value.omr === undefined ? {} : { omr: readOmrSavedState(value.omr) }),
      createdAt: readDate(value.createdAt),
      updatedAt: readDate(value.updatedAt),
    },
    preview: readPreview(value.preview),
  }
}

function readSelection(value: unknown): SavedSelection | null {
  if (!isRecord(value) || !isString(value.id) || value.id === '') return null
  if (!isString(value.query) || !value.query.startsWith('?')) return null
  let externalUrl: string | undefined
  if (value.externalUrl !== undefined) {
    if (!isString(value.externalUrl)) return null
    try {
      externalUrl = readWebUrl(value.externalUrl).href
    } catch {
      return null
    }
  }
  return {
    id: value.id,
    ...(externalUrl === undefined ? {} : { externalUrl }),
    name:
      isString(value.name) && value.name.trim() !== ''
        ? value.name
        : 'Sélection',
    folderId: isString(value.folderId) ? value.folderId : null,
    query: value.query,
    exercises: Array.isArray(value.exercises)
      ? value.exercises.filter(isString)
      : [],
    stars: toStars(value.stars),
    comment: isString(value.comment) ? cleanComment(value.comment) : '',
    newDataEachTime:
      externalUrl === undefined && value.newDataEachTime === true,
    ...readShortLink(value.shortLink),
    createdAt: readDate(value.createdAt),
    updatedAt: readDate(value.updatedAt),
  }
}

/** Lien raccourci d'une sélection : deux adresses `http(s)`, sinon rien */
function readShortLink(value: unknown): { shortLink?: SelectionShortLink } {
  if (!isRecord(value) || !isString(value.url) || !isString(value.longUrl)) {
    return {}
  }
  const isHttp = (url: string) => /^https?:\/\//.test(url)
  return isHttp(value.url) && isHttp(value.longUrl)
    ? { shortLink: { url: value.url, longUrl: value.longUrl } }
    : {}
}

function readSession(value: unknown): SavedSession | null {
  if (!isRecord(value) || !isString(value.id) || value.id === '') return null
  // l'état doit être celui de la vue TBI, avec la liste (éventuellement vide)
  // de ses exercices
  if (!isSessionState(value.state)) return null
  const state = value.state
  return {
    id: value.id,
    name:
      isString(value.name) && value.name.trim() !== '' ? value.name : 'Séance',
    folderId: isString(value.folderId) ? value.folderId : null,
    state,
    exercises: sessionExercises(state),
    createdAt: readDate(value.createdAt),
    updatedAt: readDate(value.updatedAt),
  }
}

function readTrashedItem(value: unknown): TrashedItem | null {
  if (!isRecord(value) || !isString(value.deletedAt)) return null
  if (Number.isNaN(Date.parse(value.deletedAt))) return null
  const place = {
    deletedAt: value.deletedAt,
    location: Array.isArray(value.location)
      ? value.location.filter(isString)
      : [],
  }
  if (value.kind === 'sheet') {
    const read = readSheet(value.item)
    return read === null ? null : { kind: 'sheet', item: read.sheet, ...place }
  }
  if (value.kind === 'selection') {
    const item = readSelection(value.item)
    return item === null ? null : { kind: 'selection', item, ...place }
  }
  if (value.kind === 'session') {
    const item = readSession(value.item)
    return item === null ? null : { kind: 'session', item, ...place }
  }
  return null
}

/**
 * Lit un fichier `.mathalea`.
 * @throws Error avec un message à afficher si le fichier n'est pas une
 *   sauvegarde de « Mes sauvegardes »
 */
export function parseLibraryFile(text: string): ParsedLibraryFile {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(UNREADABLE_FILE)
  }
  if (!isRecord(data) || data.format !== LIBRARY_FILE_FORMAT) {
    throw new Error(
      'Ce fichier n’est pas une sauvegarde de « Mes sauvegardes ».',
    )
  }
  const folders = (Array.isArray(data.folders) ? data.folders : [])
    .map(readFolder)
    .filter((f): f is SheetFolder => f !== null)
  const sheets: SavedSheet[] = []
  const previews = new Map<string, SheetPreview>()
  for (const raw of Array.isArray(data.sheets) ? data.sheets : []) {
    const read = readSheet(raw)
    if (read === null) continue
    sheets.push(read.sheet)
    if (read.preview !== undefined) previews.set(read.sheet.id, read.preview)
  }
  const selectionFolders = (
    Array.isArray(data.selectionFolders) ? data.selectionFolders : []
  )
    .map(readFolder)
    .filter((f): f is SheetFolder => f !== null)
  const selections = (Array.isArray(data.selections) ? data.selections : [])
    .map(readSelection)
    .filter((s): s is SavedSelection => s !== null)
  const sessionFolders = (
    Array.isArray(data.sessionFolders) ? data.sessionFolders : []
  )
    .map(readFolder)
    .filter((f): f is SheetFolder => f !== null)
  const sessions = (Array.isArray(data.sessions) ? data.sessions : [])
    .map(readSession)
    .filter((s): s is SavedSession => s !== null)
  const trash = (Array.isArray(data.trash) ? data.trash : [])
    .map(readTrashedItem)
    .filter((entry): entry is TrashedItem => entry !== null)
  return {
    library: repair({
      organization: readOrganization(data.organization),
      folders,
      sheets,
      selectionFolders,
      selections,
      sessionFolders,
      sessions,
      trash,
      deleted: readTombstones(data.deleted),
    }),
    previews,
    settings: readSettings(data.settings),
  }
}

/**
 * Rattache à la racine les dossiers, feuilles, sélections et séances dont le
 * parent manque, et casse les boucles de dossiers (A dans B, B dans A).
 * Complète une bibliothèque enregistrée avant l'ajout des sélections, des
 * séances, de la corbeille ou des pierres tombales.
 */
function readOrganization(value: unknown): LibraryOrganization | undefined {
  if (!isRecord(value) || typeof value.merged !== 'boolean') return undefined
  return { merged: value.merged, updatedAt: readDate(value.updatedAt) }
}

export function repair(library: Partial<SheetLibrary>): SheetLibrary {
  const organization = readOrganization(library.organization)
  const folders = organization?.merged
    ? sharedFolders({
        folders: library.folders ?? [],
        selectionFolders: library.selectionFolders ?? [],
        sessionFolders: library.sessionFolders ?? [],
      })
    : (library.folders ?? [])
  const tree = repairTree(folders, library.sheets ?? [])
  const selectionTree = repairTree(
    organization?.merged ? folders : (library.selectionFolders ?? []),
    library.selections ?? [],
  )
  const sessionTree = repairTree(
    organization?.merged ? folders : (library.sessionFolders ?? []),
    library.sessions ?? [],
  )
  // un élément rendu à la bibliothèque (import d'un fichier) quitte la corbeille
  const active = new Set(
    [...tree.items, ...selectionTree.items, ...sessionTree.items].map(
      (item) => item.id,
    ),
  )
  const trash = (Array.isArray(library.trash) ? library.trash : []).filter(
    (entry) =>
      entry != null &&
      (entry.kind === 'sheet' ||
        entry.kind === 'selection' ||
        entry.kind === 'session') &&
      entry.item != null &&
      !active.has(entry.item.id),
  )
  // un élément présent n'est pas supprimé
  const present = new Set([
    ...active,
    ...trash.map((entry) => entry.item.id),
    ...tree.folders.map((f) => f.id),
    ...selectionTree.folders.map((f) => f.id),
    ...sessionTree.folders.map((f) => f.id),
  ])
  const repaired: SheetLibrary = {
    ...(organization ? { organization } : {}),
    folders: tree.folders,
    sheets: tree.items,
    selectionFolders: selectionTree.folders,
    selections: selectionTree.items,
    sessionFolders: sessionTree.folders,
    sessions: sessionTree.items,
    trash,
    deleted: readTombstones(library.deleted).filter((t) => !present.has(t.id)),
  }
  return organization?.merged
    ? mergeSharedFolderNames(
        repaired,
        [
          organization.updatedAt,
          ...tree.folders.map((f) => f.updatedAt),
          ...tree.items.map((s) => s.updatedAt),
          ...selectionTree.items.map((s) => s.updatedAt),
          ...sessionTree.items.map((s) => s.updatedAt),
        ]
          .sort()
          .at(-1)!,
      )
    : repaired
}

function repairTree<T extends { folderId: string | null }>(
  allFolders: SheetFolder[],
  allItems: T[],
): { folders: SheetFolder[]; items: T[] } {
  const byId = new Map(allFolders.map((f) => [f.id, f]))
  const folders = allFolders.map((folder) => {
    if (folder.parentId === null) return folder
    if (!byId.has(folder.parentId)) return { ...folder, parentId: null }
    // remonte les parents : revenir sur le dossier de départ signale une boucle
    const seen = new Set([folder.id])
    let parentId: string | null = folder.parentId
    while (parentId !== null) {
      if (seen.has(parentId)) return { ...folder, parentId: null }
      seen.add(parentId)
      parentId = byId.get(parentId)?.parentId ?? null
    }
    return folder
  })
  const folderIds = new Set(folders.map((f) => f.id))
  const items = allItems.map((item) =>
    item.folderId !== null && !folderIds.has(item.folderId)
      ? { ...item, folderId: null }
      : item,
  )
  return { folders, items }
}

export interface MergeResult {
  library: SheetLibrary
  /** Feuilles nouvelles ou plus récentes dans le fichier : leur aperçu est à reprendre */
  importedSheetIds: string[]
  /** Feuilles, sélections et séances ajoutées */
  added: number
  updated: number
  unchanged: number
}

/** Fusionne des éléments par identifiant, la version la plus récente l'emportant */
function mergeById<T extends { id: string; updatedAt: string }>(
  local: T[],
  imported: T[],
  onImport: (item: T, isNew: boolean) => void = () => {},
  onUnchanged: () => void = () => {},
): T[] {
  const byId = new Map(local.map((item) => [item.id, item]))
  for (const item of imported) {
    const existing = byId.get(item.id)
    if (existing !== undefined && item.updatedAt <= existing.updatedAt) {
      onUnchanged()
      continue
    }
    byId.set(item.id, item)
    onImport(item, existing === undefined)
  }
  return [...byId.values()]
}

/**
 * Fusionne une bibliothèque importée dans la bibliothèque locale, sans rien
 * effacer : un élément inconnu est ajouté, un élément connu n'est remplacé
 * que si la version du fichier est plus récente.
 *
 * Un élément du fichier qui était à la corbeille ou supprimé définitivement
 * revient : importer une sauvegarde sert à récupérer. Il prend la date de
 * l'import, pour revenir aussi sur les appareils synchronisés. Les pierres
 * tombales du fichier sont ignorées (voir `syncLibraries` pour la
 * synchronisation).
 */
export function mergeLibraries(
  local: SheetLibrary,
  imported: SheetLibrary,
  date: string = new Date().toISOString(),
): MergeResult {
  const removed = new Set([
    ...local.trash.map((entry) => entry.item.id),
    ...local.deleted.map((t) => t.id),
  ])
  const revive = <T extends { id: string; updatedAt: string }>(item: T): T =>
    removed.has(item.id) ? { ...item, updatedAt: date } : item
  let added = 0
  let updated = 0
  let unchanged = 0
  const count = (_item: unknown, isNew: boolean) => {
    if (isNew) added++
    else updated++
  }
  const countUnchanged = () => unchanged++
  const importedSheetIds: string[] = []
  const sheets = mergeById(
    local.sheets,
    imported.sheets.map(revive),
    (sheet, isNew) => {
      count(sheet, isNew)
      importedSheetIds.push(sheet.id)
    },
    countUnchanged,
  )
  const selections = mergeById(
    local.selections,
    imported.selections.map(revive),
    count,
    countUnchanged,
  )
  return {
    library: repair({
      organization: local.organization ?? imported.organization,
      folders: mergeById(local.folders, imported.folders.map(revive)),
      sheets,
      selectionFolders: mergeById(
        local.selectionFolders,
        imported.selectionFolders.map(revive),
      ),
      selections,
      sessionFolders: mergeById(
        local.sessionFolders,
        imported.sessionFolders.map(revive),
      ),
      sessions: mergeById(
        local.sessions,
        imported.sessions.map(revive),
        count,
        countUnchanged,
      ),
      trash: local.trash,
      // `repair` retire celles des éléments revenus
      deleted: local.deleted,
    }),
    importedSheetIds,
    added,
    updated,
    unchanged,
  }
}

/**
 * Retire les `<script>` du SVG d'aperçu de typst.ts : inutiles pour une
 * vignette, et un fichier importé ne doit rien pouvoir exécuter (l'aperçu
 * est de toute façon affiché dans une balise `<img>`, qui n'exécute rien).
 */
export function stripScripts(svg: string): string {
  return svg.replace(/<script\b[\s\S]*?<\/script\s*>/gi, '')
}

/**
 * Nom du fichier exporté, avec la date et l'heure locales à la seconde : deux
 * exports du même jour ont des noms distincts. Sans cela, Safari renomme le
 * second en `….mathalea-2`, qui perd son extension.
 */
export function exportFileName(name: string, date: Date = new Date()): string {
  const base = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const pad = (n: number) => String(n).padStart(2, '0')
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  const time = `${pad(date.getHours())}h${pad(date.getMinutes())}m${pad(date.getSeconds())}`
  return `${base || 'mes-sauvegardes'}-${day}-${time}${LIBRARY_FILE_EXTENSION}`
}
