import { libraryItems, recordBackup } from './library'
import {
  buildLibraryFile,
  LIBRARY_FILE_EXTENSION,
  LIBRARY_FILE_MIME_TYPE,
  zipLibraryFile,
} from './libraryFile'
import { loadSettings, settingsFingerprint } from './settings'
import {
  loadAutoSaveFile,
  loadLibrary,
  loadPreviews,
  onLocalChange,
  saveAutoSaveFile,
  updateBackupRecord,
  type AutoSaveFile,
} from './storage'

/**
 * Sauvegarde automatique de « Mes sauvegardes » dans un fichier
 * `.mathalea` choisi par l'enseignant (API File System Access : Chrome, Edge
 * et autres navigateurs Chromium). Le fichier est réécrit après chaque
 * modification ; placé dans un dossier synchronisé (client Nextcloud
 * d'apps.education.fr, OneDrive…), il part aussi dans le nuage, sans serveur
 * MathALÉA.
 *
 * Le navigateur garde l'accès au fichier pendant la session ; ensuite, il
 * faut le réautoriser d'un clic (« Reprendre »), sauf si l'enseignant a
 * choisi « Autoriser à chaque visite ».
 */

/** Méthodes de l'API File System Access absentes des types du DOM */
interface PermissionHandle extends FileSystemFileHandle {
  queryPermission?: (descriptor: {
    mode: 'readwrite'
  }) => Promise<PermissionState>
  requestPermission?: (descriptor: {
    mode: 'readwrite'
  }) => Promise<PermissionState>
}

type SaveFilePicker = (options: {
  suggestedName: string
  types: { description: string; accept: Record<string, string[]> }[]
}) => Promise<FileSystemFileHandle>

export type AutoSaveState =
  /** Navigateur sans API File System Access (Firefox, Safari) */
  | { kind: 'unsupported' }
  | { kind: 'off' }
  | { kind: 'active'; fileName: string }
  /** Accès au fichier à réautoriser (nouvelle session du navigateur) */
  | { kind: 'paused'; fileName: string }
  | { kind: 'error'; fileName: string }

/** Délai de regroupement des modifications avant écriture */
const WRITE_DELAY = 1500

export const AUTO_SAVE_FILE_NAME = `mes-sauvegardes${LIBRARY_FILE_EXTENSION}`

let lastWriteFailed = false
const stateListeners = new Set<() => void>()

function notifyState() {
  for (const listener of stateListeners) listener()
}

/**
 * Appelle `listener` quand l'état de la sauvegarde automatique change dans
 * cet onglet (fichier choisi, écriture réussie ou échouée).
 */
export function onAutoSaveStateChange(listener: () => void): () => void {
  stateListeners.add(listener)
  return () => stateListeners.delete(listener)
}

export function isAutoSaveSupported(): boolean {
  return typeof window !== 'undefined' && 'showSaveFilePicker' in window
}

async function permission(
  handle: FileSystemFileHandle,
): Promise<PermissionState> {
  const query = (handle as PermissionHandle).queryPermission
  if (query === undefined) return 'granted'
  return await query.call(handle, { mode: 'readwrite' })
}

export async function getAutoSaveState(): Promise<AutoSaveState> {
  if (!isAutoSaveSupported()) return { kind: 'unsupported' }
  const file = await loadAutoSaveFile()
  if (file === null) return { kind: 'off' }
  if (lastWriteFailed) return { kind: 'error', fileName: file.fileName }
  const state = await permission(file.handle)
  return state === 'granted'
    ? { kind: 'active', fileName: file.fileName }
    : { kind: 'paused', fileName: file.fileName }
}

/**
 * Fait choisir le fichier de sauvegarde (à appeler depuis un clic) et y écrit
 * aussitôt toute la bibliothèque.
 * @returns `false` si l'enseignant a fermé la fenêtre sans choisir
 */
export async function chooseAutoSaveFile(): Promise<boolean> {
  const picker = (window as unknown as { showSaveFilePicker?: SaveFilePicker })
    .showSaveFilePicker
  if (picker === undefined) return false
  let handle: FileSystemFileHandle
  try {
    handle = await picker({
      suggestedName: AUTO_SAVE_FILE_NAME,
      types: [
        {
          description: 'Sauvegarde MathALÉA',
          accept: { [LIBRARY_FILE_MIME_TYPE]: [LIBRARY_FILE_EXTENSION] },
        },
      ],
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return false
    }
    throw error
  }
  await useAutoSaveFile({ handle, fileName: handle.name })
  return true
}

/** Adopte un fichier de sauvegarde et y écrit aussitôt la bibliothèque */
export async function useAutoSaveFile(file: AutoSaveFile): Promise<void> {
  await saveAutoSaveFile(file)
  lastWriteFailed = false
  await writeAutoSave()
}

/**
 * Réautorise l'écriture dans le fichier (à appeler depuis un clic), puis
 * l'écrit aussitôt.
 */
export async function resumeAutoSave(): Promise<boolean> {
  const file = await loadAutoSaveFile()
  if (file === null) return false
  const request = (file.handle as PermissionHandle).requestPermission
  const state =
    request === undefined
      ? 'granted'
      : await request.call(file.handle, { mode: 'readwrite' })
  if (state !== 'granted') return false
  lastWriteFailed = false
  return await writeAutoSave()
}

export async function stopAutoSave(): Promise<void> {
  clearTimeout(timer)
  lastWriteFailed = false
  await saveAutoSaveFile(null)
  notifyState()
}

let writing: Promise<boolean> | null = null
let rewriteRequested = false

/**
 * Réécrit le fichier avec toute la bibliothèque, si l'accès est autorisé.
 * Les écritures ne se chevauchent pas : une demande pendant une écriture en
 * relance une à la fin.
 * @returns `true` si le fichier a été écrit
 */
export async function writeAutoSave(): Promise<boolean> {
  if (writing !== null) {
    rewriteRequested = true
    return await writing
  }
  writing = write()
  try {
    return await writing
  } finally {
    writing = null
    if (rewriteRequested) {
      rewriteRequested = false
      void writeAutoSave()
    }
  }
}

async function write(): Promise<boolean> {
  const file = await loadAutoSaveFile()
  if (file === null || (await permission(file.handle)) !== 'granted') {
    return false
  }
  try {
    const library = await loadLibrary()
    const previews = await loadPreviews(library.sheets.map((s) => s.id))
    const settings = loadSettings()
    const content = buildLibraryFile(library, previews, null, settings)
    const zipped = await zipLibraryFile(content)
    const writable = await file.handle.createWritable()
    await writable.write(zipped)
    await writable.close()
    lastWriteFailed = false
    await updateBackupRecord((record) => ({
      ...recordBackup(
        record,
        libraryItems(library),
        null,
        settingsFingerprint(settings),
        library.organization?.updatedAt ?? '',
      ),
      lastAutoSaveAt: content.exportedAt,
    }))
    notifyState()
    return true
  } catch (error) {
    // fichier supprimé ou déplacé, disque plein…
    console.error('Sauvegarde automatique impossible', error)
    lastWriteFailed = true
    notifyState()
    return false
  }
}

let timer: ReturnType<typeof setTimeout> | undefined
let watchers = 0
let stopListening: (() => void) | null = null

/**
 * Réécrit le fichier après chaque modification du contenu faite dans cet
 * onglet (à appeler au montage des vues qui modifient la bibliothèque).
 * @returns la fonction qui arrête la surveillance
 */
export function watchAutoSave(): () => void {
  if (!isAutoSaveSupported()) return () => {}
  watchers++
  if (stopListening === null) {
    stopListening = onLocalChange((kind) => {
      if (kind !== 'contenu') return
      clearTimeout(timer)
      timer = setTimeout(() => void writeAutoSave(), WRITE_DELAY)
    })
  }
  return () => {
    watchers--
    if (watchers === 0 && stopListening !== null) {
      // une écriture en attente part quand même : la modification est faite
      stopListening()
      stopListening = null
    }
  }
}
