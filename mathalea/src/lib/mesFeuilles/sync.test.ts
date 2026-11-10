import { beforeEach, describe, expect, it } from 'vitest'
import type { SlideshowHistoryOptions } from '../../components/setup/diaporama/types'
import {
  addSheet,
  createFolder,
  deleteFolder,
  deleteForever,
  emptyLibrary,
  recordDeletions,
  renameSheet,
  restoreItems,
  trashItems,
  type SheetLibrary,
} from './library'
import {
  buildLibraryFile,
  mergeLibraries,
  parseLibraryFile,
} from './libraryFile'
import {
  addTypstModel,
  deleteTypstModel,
  emptyPreferences,
  loadPreferences,
  mergePreferences,
  updatePreferences,
} from './preferences'
import { loadSettings, mergeSettings } from './settings'
import {
  buildSlideshowSignature,
  loadSlideshowDeletions,
  mergeSlideshowHistory,
  readSlideshowEntries,
  renameSlideshow,
  saveSlideshowHistory,
  type SlideshowHistoryEntry,
} from './slideshowHistory'
import {
  buildSyncFile,
  emptySettings,
  mergeSyncDocuments,
  nextSyncStep,
  parseSyncFile,
  syncLibraries,
} from './sync'
import { recordRemovals, TOMBSTONE_DAYS } from './tombstones'

const JAN = '2026-01-01T00:00:00.000Z'
const FEB = '2026-02-01T00:00:00.000Z'
const MAR = '2026-03-01T00:00:00.000Z'

/** Bibliothèque : Contrôles › Contrôle 1, et Évaluation à la racine */
function sample() {
  const folder = createFolder(emptyLibrary(), 'Contrôles', null)
  const first = addSheet(folder.library, 'Contrôle 1', folder.folder.id, {
    query: '?uuid=a&v=typst',
    exercises: ['6N1E'],
  })
  const second = addSheet(first.library, 'Évaluation', null, {
    query: '?uuid=b&v=typst',
    exercises: ['5R10'],
  })
  // dates fixes, pour comparer les versions des deux appareils
  const lib: SheetLibrary = {
    ...second.library,
    folders: second.library.folders.map((f) => ({
      ...f,
      createdAt: JAN,
      updatedAt: JAN,
    })),
    sheets: second.library.sheets.map((s) => ({
      ...s,
      createdAt: JAN,
      updatedAt: JAN,
    })),
  }
  return {
    lib,
    folderId: folder.folder.id,
    sheetId: first.sheet.id,
    otherId: second.sheet.id,
  }
}

function sorted(library: SheetLibrary) {
  const byId = <T extends { id: string }>(items: T[]) =>
    [...items].sort((a, b) => (a.id < b.id ? -1 : 1))
  return {
    ...library,
    folders: byId(library.folders),
    sheets: byId(library.sheets),
    deleted: byId(library.deleted),
  }
}

const slideshowOptions: SlideshowHistoryOptions = {
  nbVues: 1,
  flow: 0,
  screenBetweenSlides: false,
  sound: 0,
  shuffle: false,
  manualMode: false,
  pauseAfterEachQuestion: false,
  isImagesOnSides: false,
}

function slideshow(uuid: string, lastUsedAt: string): SlideshowHistoryEntry {
  const exercicesParams = [{ uuid, alea: 'Ab12' }]
  return {
    id: uuid,
    title: `Diaporama ${uuid}`,
    createdAt: JAN,
    lastUsedAt,
    updatedAt: JAN,
    signature: buildSlideshowSignature(slideshowOptions, exercicesParams),
    options: slideshowOptions,
    exercicesParams,
    summary: {
      exercises: '1 exercice',
      exercisesTruncated: false,
      settings: '',
    },
  }
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('Pierres tombales : bibliothèque', () => {
  it('en laisse une pour un élément supprimé, pas pour la corbeille', () => {
    const { lib, sheetId, folderId } = sample()
    const trashed = recordDeletions(lib, trashItems(lib, [sheetId]), FEB)
    expect(trashed.deleted).toEqual([])
    const removed = deleteForever(trashed, [sheetId]).library
    expect(recordDeletions(trashed, removed, MAR).deleted).toEqual([
      { id: sheetId, deletedAt: MAR },
    ])
    // le dossier supprimé laisse aussi une pierre tombale
    const withoutFolder = deleteFolder(lib, folderId).library
    expect(
      recordDeletions(lib, withoutFolder, FEB).deleted.map((t) => t.id),
    ).toEqual([folderId])
  })

  it('oublie la pierre tombale d’un élément revenu, et les plus anciennes', () => {
    const date = '2027-06-01T00:00:00.000Z'
    const old = new Date(
      Date.parse(date) - (TOMBSTONE_DAYS + 1) * 24 * 3600 * 1000,
    ).toISOString()
    const tombstones = recordRemovals(
      [
        { id: 'revenu', deletedAt: FEB },
        { id: 'ancien', deletedAt: old },
      ],
      ['supprime', 'garde'],
      new Set(['revenu', 'garde']),
      date,
    )
    expect(tombstones).toEqual([{ id: 'supprime', deletedAt: date }])
  })

  it('garde les pierres tombales dans le fichier de toute la bibliothèque', () => {
    const { lib, otherId } = sample()
    const library = { ...lib, deleted: [{ id: 'efface', deletedAt: FEB }] }
    const file = buildLibraryFile(library, new Map())
    expect(file.deleted).toEqual([{ id: 'efface', deletedAt: FEB }])
    expect(parseLibraryFile(JSON.stringify(file)).library.deleted).toEqual(
      file.deleted,
    )
    // une pierre tombale d'un élément présent est ignorée
    const present = { ...lib, deleted: [{ id: otherId, deletedAt: FEB }] }
    expect(
      parseLibraryFile(JSON.stringify(buildLibraryFile(present, new Map())))
        .library.deleted,
    ).toEqual([])
  })

  it('fait revenir à l’import un élément supprimé ou à la corbeille', () => {
    const { lib, sheetId, otherId } = sample()
    const local = {
      ...trashItems(
        deleteForever(trashItems(lib, [sheetId]), [sheetId]).library,
        [otherId],
      ),
      deleted: [{ id: sheetId, deletedAt: FEB }],
    }
    const result = mergeLibraries(local, lib, MAR)
    expect(result.added).toBe(2)
    expect(result.library.sheets.map((s) => s.updatedAt)).toEqual([MAR, MAR])
    expect(result.library.trash).toEqual([])
    expect(result.library.deleted).toEqual([])
  })
})

describe('Synchronisation : bibliothèque', () => {
  it('applique une suppression faite sur l’autre appareil', () => {
    const { lib, sheetId } = sample()
    const remote = {
      ...deleteForever(trashItems(lib, [sheetId], FEB), [sheetId]).library,
      deleted: [{ id: sheetId, deletedAt: FEB }],
    }
    const merged = syncLibraries(lib, remote)
    expect(merged.sheets.map((s) => s.id)).not.toContain(sheetId)
    expect(merged.deleted).toEqual([{ id: sheetId, deletedAt: FEB }])
  })

  it('garde un élément modifié après sa suppression ailleurs', () => {
    const { lib, sheetId } = sample()
    const local = {
      ...lib,
      sheets: renameSheet(lib, sheetId, 'Renommé').sheets.map((s) =>
        s.id === sheetId ? { ...s, updatedAt: MAR } : s,
      ),
    }
    const remote = {
      ...lib,
      sheets: lib.sheets.filter((s) => s.id !== sheetId),
      deleted: [{ id: sheetId, deletedAt: FEB }],
    }
    const merged = syncLibraries(local, remote)
    expect(merged.sheets.find((s) => s.id === sheetId)?.name).toBe('Renommé')
    expect(merged.deleted).toEqual([])
  })

  it('met à la corbeille, puis restaure, d’un appareil à l’autre', () => {
    const { lib, sheetId } = sample()
    const trashed = trashItems(lib, [sheetId], FEB)
    const onOther = syncLibraries(lib, trashed)
    expect(onOther.trash.map((t) => t.item.id)).toEqual([sheetId])
    expect(onOther.sheets.map((s) => s.id)).not.toContain(sheetId)
    // restaurée ensuite : plus récente que la mise à la corbeille
    const restored = restoreItems(trashed, [sheetId], MAR)
    const back = syncLibraries(onOther, restored)
    expect(back.trash).toEqual([])
    expect(back.sheets.find((s) => s.id === sheetId)?.updatedAt).toBe(MAR)
  })

  it('remet à la racine une feuille dont le dossier a été supprimé ailleurs', () => {
    const { lib, folderId, sheetId } = sample()
    const local = {
      ...lib,
      sheets: lib.sheets.map((s) =>
        s.id === sheetId ? { ...s, updatedAt: MAR } : s,
      ),
    }
    const remote = {
      ...lib,
      folders: [],
      sheets: lib.sheets.filter((s) => s.id !== sheetId),
      deleted: [{ id: folderId, deletedAt: FEB }],
    }
    const merged = syncLibraries(local, remote)
    expect(merged.folders).toEqual([])
    expect(merged.sheets.find((s) => s.id === sheetId)?.folderId).toBeNull()
  })

  it('donne le même résultat dans les deux sens, et une seconde fois', () => {
    const { lib, sheetId, otherId } = sample()
    const a = {
      ...trashItems(lib, [otherId], FEB),
      sheets: lib.sheets
        .filter((s) => s.id !== otherId)
        .map((s) =>
          s.id === sheetId ? { ...s, name: 'A', updatedAt: FEB } : s,
        ),
    }
    const b = {
      ...lib,
      sheets: lib.sheets.map((s) =>
        s.id === sheetId ? { ...s, name: 'B', updatedAt: FEB } : s,
      ),
    }
    const ab = syncLibraries(a, b)
    expect(sorted(ab)).toEqual(sorted(syncLibraries(b, a)))
    expect(sorted(syncLibraries(ab, b))).toEqual(sorted(ab))
    expect(ab.trash.map((t) => t.item.id)).toEqual([otherId])
  })
})

describe('Synchronisation : réglages', () => {
  it('laisse une pierre tombale à la suppression d’un modèle', () => {
    let id = ''
    updatePreferences((prefs) => {
      const added = addTypstModel(prefs, 'Brevet', { fontSize: 12 })
      id = added.model.id
      return added.preferences
    })
    updatePreferences((prefs) => deleteTypstModel(prefs, id))
    expect(loadPreferences().deleted.map((t) => t.id)).toEqual([id])
  })

  it('supprime un modèle à la synchronisation, le fait revenir à l’import', () => {
    const local = addTypstModel(emptyPreferences(), 'Brevet', {}, JAN)
    const remote = {
      ...emptyPreferences(),
      deleted: [{ id: local.model.id, deletedAt: FEB }],
    }
    const synced = mergePreferences(local.preferences, remote, { sync: true })
    expect(synced.preferences.typstModels).toEqual([])
    expect(synced.preferences.deleted).toEqual(remote.deleted)
    expect(synced.imported).toBe(1)
    // modifié après la suppression : il reste
    const newer = {
      ...local.preferences,
      typstModels: [{ ...local.model, updatedAt: MAR }],
    }
    expect(
      mergePreferences(newer, remote, { sync: true }).preferences.typstModels,
    ).toHaveLength(1)
    // import d'un fichier : le modèle supprimé ici revient, daté de l'import
    const imported = mergePreferences(synced.preferences, local.preferences, {
      now: MAR,
    })
    expect(imported.preferences.typstModels).toEqual([
      { ...local.model, updatedAt: MAR },
    ])
    expect(imported.preferences.deleted).toEqual([])
  })

  it('synchronise la suppression d’un diaporama de l’historique', () => {
    const kept = slideshow('u1', JAN)
    const removed = slideshow('u2', JAN)
    saveSlideshowHistory([kept, removed])
    saveSlideshowHistory([kept])
    expect(loadSlideshowDeletions().map((t) => t.id)).toEqual([
      removed.signature,
    ])
    const local = loadSettings()
    const other = {
      ...emptySettings(),
      slideshowHistory: [kept, removed],
    }
    // l'autre appareil le garde dans l'historique : il disparaît
    const synced = mergeSettings(other, local, { sync: true }).settings
    expect(synced.slideshowHistory.map((s) => s.signature)).toEqual([
      kept.signature,
    ])
    // utilisé de nouveau après la suppression : il reste
    const usedAgain = {
      ...other,
      slideshowHistory: [
        kept,
        { ...removed, lastUsedAt: '2099-01-01T00:00:00.000Z' },
      ],
    }
    expect(
      mergeSettings(usedAgain, local, { sync: true }).settings.slideshowHistory,
    ).toHaveLength(2)
    // import d'un fichier : il revient
    const imported = mergeSettings(local, other, { now: MAR }).settings
    expect(imported.slideshowHistory).toHaveLength(2)
    expect(imported.deletedSlideshows).toEqual([])
  })
})

describe('Synchronisation : titre d’un diaporama', () => {
  it('garde le titre le plus récent et la dernière utilisation la plus récente', () => {
    const entry = slideshow('u1', JAN)
    const renamed = renameSlideshow([entry], entry.id, '  Rituel  ', MAR)
    expect(renamed[0]).toMatchObject({ title: 'Rituel', updatedAt: MAR })
    // titre vide ou inchangé : rien ne change
    expect(renameSlideshow(renamed, entry.id, ' ', MAR)).toEqual(renamed)
    // l'autre appareil l'a lancé plus tard, sans le renommer
    const launched = { ...entry, id: 'autre', lastUsedAt: FEB }
    for (const [a, b] of [
      [renamed, [launched]],
      [[launched], renamed],
    ]) {
      const [merged] = mergeSlideshowHistory(a, b, { sync: true }).items
      expect(merged).toMatchObject({
        title: 'Rituel',
        updatedAt: MAR,
        lastUsedAt: FEB,
      })
    }
  })

  it('garde un diaporama renommé après sa suppression ailleurs', () => {
    const entry = slideshow('u1', JAN)
    const renamed = renameSlideshow([entry], entry.id, 'Rituel', MAR)
    const result = mergeSlideshowHistory(renamed, [], {
      sync: true,
      importedDeleted: [{ id: entry.signature, deletedAt: FEB }],
    })
    expect(result.items).toHaveLength(1)
    expect(result.deleted).toEqual([])
  })

  it('date le titre d’une entrée enregistrée avant ce champ de sa création', () => {
    const old: Partial<SlideshowHistoryEntry> = slideshow('u1', FEB)
    delete old.updatedAt
    const [read] = readSlideshowEntries([old])
    expect(read.updatedAt).toBe(JAN)
  })
})

describe('Synchronisation : document et version du serveur', () => {
  it('fait l’aller-retour du document, corbeille comprise, sans aperçus', () => {
    const { lib, sheetId } = sample()
    const library = {
      ...trashItems(lib, [sheetId], FEB),
      deleted: [{ id: 'efface', deletedAt: FEB }],
    }
    const settings = {
      ...emptySettings(),
      deletedSlideshows: [{ id: 'signature', deletedAt: FEB }],
    }
    const file = buildSyncFile({ library, settings })
    expect(JSON.stringify(file)).not.toContain('"preview"')
    const parsed = parseSyncFile(JSON.stringify(file))
    expect(parsed.library).toEqual(library)
    expect(parsed.settings.deletedSlideshows).toEqual(
      settings.deletedSlideshows,
    )
    // fusionner deux fois le même document ne change rien
    const merged = mergeSyncDocuments(parsed, { library, settings })
    expect(sorted(merged.library)).toEqual(sorted(library))
  })

  it('choisit l’étape d’après la version du serveur', () => {
    const remote = { account: 'prof', epoch: 'e1', rev: 4 }
    expect(nextSyncStep(null, remote)).toBe('premiere')
    expect(nextSyncStep({ ...remote, account: 'autre' }, remote)).toBe(
      'premiere',
    )
    expect(nextSyncStep({ ...remote, epoch: 'e0' }, remote)).toBe('effacee')
    expect(nextSyncStep(remote, remote)).toBe('a-jour')
    expect(nextSyncStep({ ...remote, rev: 3 }, remote)).toBe('recuperer')
  })
})
