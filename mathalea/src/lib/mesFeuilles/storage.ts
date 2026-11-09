import {
  emptyBackupRecord,
  emptyLibrary,
  recordDeletions,
  type BackupRecord,
  type SheetLibrary,
  type SheetPreview,
} from './library'
import { repair } from './libraryFile'

/**
 * Stockage de « Mes sauvegardes » dans ce navigateur (IndexedDB).
 *
 * La bibliothèque (dossiers, feuilles et sélections, quelques kilo-octets) tient dans un
 * seul enregistrement : chaque modification la relit et la réécrit dans la
 * même transaction, pour qu'un onglet ne fasse pas disparaître une feuille
 * qu'un autre vient d'enregistrer. Les aperçus SVG, bien plus lourds, ont
 * leur propre magasin, indexé par l'identifiant de la feuille.
 */

const DB_NAME = 'mathalea-mon-mathalea'
const DB_VERSION = 1
const LIBRARY_STORE = 'bibliotheque'
const LIBRARY_KEY = 'feuilles'
/** État de la sauvegarde (voir `BackupRecord`), dans le même magasin */
const BACKUP_KEY = 'sauvegarde'
/** Fichier de la sauvegarde automatique (voir `autoSave.ts`) */
const AUTO_SAVE_KEY = 'fichierAuto'
const PREVIEW_STORE = 'apercus'
const CHANNEL_NAME = 'mathalea-mes-feuilles'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(LIBRARY_STORE)) {
        db.createObjectStore(LIBRARY_STORE)
      }
      if (!db.objectStoreNames.contains(PREVIEW_STORE)) {
        db.createObjectStore(PREVIEW_STORE)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore<T>(
  storeName: string,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore, done: (value: T) => void) => void,
): Promise<T> {
  const db = await openDb()
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(storeName, mode)
      let result: T
      tx.oncomplete = () => resolve(result)
      tx.onerror = () => reject(tx.error)
      tx.onabort = () => reject(tx.error)
      run(tx.objectStore(storeName), (value) => {
        result = value
      })
    })
  } finally {
    db.close()
  }
}

/** Bibliothèque enregistrée, complétée si elle date d'avant les sélections */
function readLibrary(value: unknown): SheetLibrary {
  const library = value as SheetLibrary | undefined
  return library != null &&
    Array.isArray(library.folders) &&
    Array.isArray(library.sheets)
    ? repair(library)
    : emptyLibrary()
}

export function isStorageAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && window.indexedDB != null
  } catch {
    return false
  }
}

export async function loadLibrary(): Promise<SheetLibrary> {
  return await withStore<SheetLibrary>(
    LIBRARY_STORE,
    'readonly',
    (store, done) => {
      const request = store.get(LIBRARY_KEY)
      request.onsuccess = () => done(readLibrary(request.result))
    },
  )
}

/**
 * Modifie la bibliothèque à partir de sa dernière version enregistrée. Les
 * éléments qui disparaissent laissent une pierre tombale (voir
 * `recordDeletions`).
 * @param change transformation pure (voir `library.ts`)
 * @returns la bibliothèque enregistrée
 */
export async function updateLibrary(
  change: (library: SheetLibrary) => SheetLibrary,
): Promise<SheetLibrary> {
  const saved = await withStore<SheetLibrary>(
    LIBRARY_STORE,
    'readwrite',
    (store, done) => {
      const request = store.get(LIBRARY_KEY)
      request.onsuccess = () => {
        const previous = readLibrary(request.result)
        const next = repair(recordDeletions(previous, change(previous)))
        store.put(next, LIBRARY_KEY)
        done(next)
      }
    },
  )
  notifyChange()
  return saved
}

function readBackup(value: unknown): BackupRecord {
  const record = value as BackupRecord | undefined
  return record != null &&
    typeof record.savedVersions === 'object' &&
    record.savedVersions !== null
    ? record
    : emptyBackupRecord()
}

export async function loadBackupRecord(): Promise<BackupRecord> {
  return await withStore<BackupRecord>(
    LIBRARY_STORE,
    'readonly',
    (store, done) => {
      const request = store.get(BACKUP_KEY)
      request.onsuccess = () => done(readBackup(request.result))
    },
  )
}

/** Modifie l'état de la sauvegarde à partir de sa dernière version */
export async function updateBackupRecord(
  change: (record: BackupRecord) => BackupRecord,
): Promise<BackupRecord> {
  const saved = await withStore<BackupRecord>(
    LIBRARY_STORE,
    'readwrite',
    (store, done) => {
      const request = store.get(BACKUP_KEY)
      request.onsuccess = () => {
        const next = change(readBackup(request.result))
        store.put(next, BACKUP_KEY)
        done(next)
      }
    },
  )
  notifyChange('sauvegarde')
  return saved
}

/** Fichier choisi pour la sauvegarde automatique */
export interface AutoSaveFile {
  handle: FileSystemFileHandle
  fileName: string
}

export async function loadAutoSaveFile(): Promise<AutoSaveFile | null> {
  return await withStore<AutoSaveFile | null>(
    LIBRARY_STORE,
    'readonly',
    (store, done) => {
      const request = store.get(AUTO_SAVE_KEY)
      request.onsuccess = () =>
        done((request.result as AutoSaveFile | undefined) ?? null)
    },
  )
}

/** Enregistre (ou oublie, avec `null`) le fichier de la sauvegarde automatique */
export async function saveAutoSaveFile(
  file: AutoSaveFile | null,
): Promise<void> {
  await withStore<undefined>(LIBRARY_STORE, 'readwrite', (store) => {
    if (file === null) store.delete(AUTO_SAVE_KEY)
    else store.put(file, AUTO_SAVE_KEY)
  })
  notifyChange('sauvegarde')
}

export async function savePreview(
  sheetId: string,
  preview: SheetPreview,
): Promise<void> {
  await withStore<undefined>(PREVIEW_STORE, 'readwrite', (store) => {
    store.put(preview, sheetId)
  })
  notifyChange()
}

export async function savePreviews(
  previews: Map<string, SheetPreview>,
): Promise<void> {
  if (previews.size === 0) return
  await withStore<undefined>(PREVIEW_STORE, 'readwrite', (store) => {
    for (const [sheetId, preview] of previews) store.put(preview, sheetId)
  })
  notifyChange()
}

export async function loadPreview(
  sheetId: string,
): Promise<SheetPreview | undefined> {
  return await withStore<SheetPreview | undefined>(
    PREVIEW_STORE,
    'readonly',
    (store, done) => {
      const request = store.get(sheetId)
      request.onsuccess = () => done(request.result as SheetPreview | undefined)
    },
  )
}

export async function loadPreviews(
  sheetIds: string[],
): Promise<Map<string, SheetPreview>> {
  return await withStore<Map<string, SheetPreview>>(
    PREVIEW_STORE,
    'readonly',
    (store, done) => {
      const previews = new Map<string, SheetPreview>()
      done(previews)
      for (const id of sheetIds) {
        const request = store.get(id)
        request.onsuccess = () => {
          if (request.result != null) previews.set(id, request.result)
        }
      }
    },
  )
}

export async function deletePreviews(sheetIds: string[]): Promise<void> {
  if (sheetIds.length === 0) return
  await withStore<undefined>(PREVIEW_STORE, 'readwrite', (store) => {
    for (const id of sheetIds) store.delete(id)
  })
}

/**
 * Demande au navigateur de ne pas effacer ces données pour faire de la place
 * (Safari, notamment, efface le stockage d'un site peu visité).
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage?.persist == null) return false
    if (await navigator.storage.persisted()) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}

// ---------- Synchronisation entre onglets ----------

function channel(): BroadcastChannel | null {
  return typeof BroadcastChannel === 'undefined'
    ? null
    : new BroadcastChannel(CHANNEL_NAME)
}

/**
 * Nature d'une modification : le contenu (dossiers, feuilles, sélections, aperçus), qui
 * déclenche la sauvegarde automatique, ou seulement l'état de la sauvegarde
 * (qui ne doit pas la redéclencher).
 */
export type ChangeKind = 'contenu' | 'sauvegarde'

const localListeners = new Set<(kind: ChangeKind) => void>()

function notifyChange(kind: ChangeKind = 'contenu') {
  for (const listener of localListeners) listener(kind)
  const ch = channel()
  ch?.postMessage(kind)
  ch?.close()
}

/**
 * Signale une modification des réglages gardés hors d'IndexedDB (modèles
 * Typst, lien élève, historique des diaporamas, dans `localStorage`) : ils
 * font partie du fichier `.mathalea`.
 */
export function notifyContentChange(): void {
  notifyChange('contenu')
}

/**
 * Appelle `listener` après chaque modification faite dans cet onglet.
 * @returns la fonction qui arrête l'écoute
 */
export function onLocalChange(
  listener: (kind: ChangeKind) => void,
): () => void {
  localListeners.add(listener)
  return () => localListeners.delete(listener)
}

/**
 * Appelle `listener` quand un autre onglet modifie la bibliothèque.
 * @returns la fonction qui arrête l'écoute
 */
export function onLibraryChange(listener: () => void): () => void {
  const ch = channel()
  if (ch === null) return () => {}
  ch.onmessage = () => listener()
  return () => ch.close()
}

// ---------- Sélection en cours de modification ----------

/**
 * Sélection dont les exercices sont ouverts dans la conception de document
 * (« Modifier les exercices ») : « Ajouter à mes sélections » propose alors
 * de la mettre à jour. Gardée pour l'onglet seulement (`sessionStorage`).
 */
const EDITED_SELECTION_KEY = 'mathalea-selection-modifiee'

export function rememberEditedSelection(selectionId: string | null): void {
  try {
    if (selectionId === null) sessionStorage.removeItem(EDITED_SELECTION_KEY)
    else sessionStorage.setItem(EDITED_SELECTION_KEY, selectionId)
  } catch {
    // stockage de session indisponible : la mise à jour n'est pas proposée
  }
}

export function editedSelectionId(): string | null {
  try {
    return sessionStorage.getItem(EDITED_SELECTION_KEY)
  } catch {
    return null
  }
}
