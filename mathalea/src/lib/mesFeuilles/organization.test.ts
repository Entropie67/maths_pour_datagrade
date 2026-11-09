import { describe, expect, it } from 'vitest'
import {
  addSelection,
  backupStatus,
  emptyBackupRecord,
  recordBackup,
  addSheet,
  changeFolders,
  createFolder,
  deleteFolder,
  emptyLibrary,
  moveItems,
  renameFolder,
  restoreItems,
  setLibraryOrganization,
} from './library'
import {
  buildLibraryFile,
  libraryPart,
  parseLibraryFile,
  repair,
} from './libraryFile'
import { syncLibraries } from './sync'

function fixture() {
  let library = emptyLibrary()
  const sheetFolder = createFolder(library, 'Chapitre', null)
  library = sheetFolder.library
  const selectionFolder = createFolder({ folders: [] }, 'Activités', null)
  library.selectionFolders = selectionFolder.library.folders
  const sheet = addSheet(library, 'Feuille', sheetFolder.folder.id, {
    query: '?v=typst',
    exercises: [],
  })
  const selection = addSelection(sheet.library, {
    name: 'Sélection',
    folderId: selectionFolder.folder.id,
    query: '?v=eleve',
    exercises: [],
  })
  return {
    library: selection.library,
    sheet: sheet.sheet,
    selection: selection.selection,
    sheetFolder: sheetFolder.folder,
    selectionFolder: selectionFolder.folder,
  }
}

describe('Organisation des sauvegardes', () => {
  it('garde les deux arbres et permet de déplacer ensemble feuilles et sélections', () => {
    const f = fixture()
    const merged = setLibraryOrganization(f.library, true)
    expect(merged.folders).toEqual(merged.selectionFolders)
    expect(merged.folders).toHaveLength(2)
    const moved = moveItems(
      merged,
      [f.sheet.id, f.selection.id],
      f.sheetFolder.id,
    )
    expect(moved.sheets[0].folderId).toBe(f.sheetFolder.id)
    expect(moved.selections[0].folderId).toBe(f.sheetFolder.id)
    const renamed = changeFolders(moved, 'selections', (set) =>
      renameFolder(set, f.sheetFolder.id, 'Commun'),
    )
    expect(renamed.folders).toEqual(renamed.selectionFolders)
    expect(renamed.folders[0].name).toBe('Commun')
  })

  it('fusionne récursivement les dossiers homonymes sans perdre leurs contenus', () => {
    const f = fixture()
    let library = changeFolders(f.library, 'selections', (set) =>
      renameFolder(set, f.selectionFolder.id, 'Chapitre'),
    )
    const sheetChild = createFolder(library, 'Fractions', f.sheetFolder.id)
    library = sheetChild.library
    const selectionChild = createFolder(
      { folders: library.selectionFolders },
      'Fractions',
      f.selectionFolder.id,
    )
    library.selectionFolders = selectionChild.library.folders
    library = moveItems(library, [f.sheet.id], sheetChild.folder.id)
    library = moveItems(library, [f.selection.id], selectionChild.folder.id)
    // Même nom, mais dans une autre branche : ne pas fusionner.
    const other = createFolder(library, 'Fractions', null)
    library = other.library
    const date = '2099-10-29T12:00:00.000Z'
    const merged = setLibraryOrganization(library, true, date)
    expect(merged.folders).toHaveLength(3)
    expect(
      merged.folders.filter((folder) => folder.parentId === null),
    ).toHaveLength(2)
    expect(merged.sheets[0].folderId).toBe(merged.selections[0].folderId)
    expect(merged.sheets[0].id).toBe(f.sheet.id)
    expect(merged.selections[0].id).toBe(f.selection.id)
    expect(merged.folders).toEqual(merged.selectionFolders)
    expect(merged.deleted).toHaveLength(2)
    expect(repair(merged)).toEqual(merged)
    const synced = syncLibraries(merged, library)
    expect(synced.folders).toHaveLength(3)
    expect(synced.sheets[0].folderId).toBe(synced.selections[0].folderId)
    expect(synced.sheets[0].folderId).not.toBeNull()
  })

  it('fusionne aussi les anciens dossiers communs homonymes à la lecture', () => {
    const f = fixture()
    const library = changeFolders(f.library, 'selections', (set) =>
      renameFolder(set, f.selectionFolder.id, 'Chapitre'),
    )
    library.organization = {
      merged: true,
      updatedAt: '2099-10-29T12:00:00.000Z',
    }
    const repaired = repair(library)
    expect(repaired.folders).toHaveLength(1)
    expect(repaired.sheets[0].folderId).toBe(repaired.selections[0].folderId)
    expect(repair(repaired)).toEqual(repaired)
    const parsed = parseLibraryFile(
      JSON.stringify(buildLibraryFile(repaired, new Map())),
    ).library
    expect(parsed).toEqual(repaired)
  })

  it('supprime tout le contenu mixte et recrée un dossier commun à la restauration', () => {
    const f = fixture()
    const merged = moveItems(
      setLibraryOrganization(f.library, true),
      [f.selection.id],
      f.sheetFolder.id,
    )
    const deleted = deleteFolder(merged, f.sheetFolder.id).library
    expect(deleted.sheets).toHaveLength(0)
    expect(deleted.selections).toHaveLength(0)
    expect(deleted.trash).toHaveLength(2)
    expect(
      repair(deleted).folders.some((folder) => folder.id === f.sheetFolder.id),
    ).toBe(false)
    const restored = restoreItems(
      deleted,
      deleted.trash.map((t) => t.item.id),
    )
    expect(restored.sheets[0].folderId).toBe(restored.selections[0].folderId)
    expect(restored.folders).toEqual(restored.selectionFolders)
  })

  it('conserve les contenus et leur classement au retour aux espaces séparés', () => {
    const f = fixture()
    const merged = moveItems(
      setLibraryOrganization(f.library, true),
      [f.selection.id],
      f.sheetFolder.id,
    )
    const separate = setLibraryOrganization(merged, false)
    expect(separate.sheets).toEqual(merged.sheets)
    expect(separate.selections[0].id).toBe(f.selection.id)
    expect(
      separate.selectionFolders.find(
        (folder) => folder.id === separate.selections[0].folderId,
      )?.name,
    ).toBe('Chapitre')
    expect(
      separate.selectionFolders.every(
        (folder) => !separate.folders.some((other) => other.id === folder.id),
      ),
    ).toBe(true)
  })

  it('synchronise le retour au mode séparé sans perdre les dossiers des feuilles', () => {
    const f = fixture()
    const merged = setLibraryOrganization(
      f.library,
      true,
      '2099-10-29T10:00:00.000Z',
    )
    const separate = setLibraryOrganization(
      merged,
      false,
      '2099-10-29T11:00:00.000Z',
    )
    const synced = syncLibraries(separate, merged)
    expect(synced.organization?.merged).toBe(false)
    expect(synced.sheets[0].folderId).toBe(f.sheetFolder.id)
    expect(synced.selections[0].folderId).toBe(separate.selections[0].folderId)
    expect(syncLibraries(merged, separate)).toEqual(synced)
  })

  it('signale le choix d’organisation à sauvegarder même sans contenu', () => {
    const library = setLibraryOrganization(emptyLibrary(), true)
    expect(
      backupStatus(library, emptyBackupRecord()).settingsOnlyInBrowser,
    ).toBe(true)
    const record = recordBackup(
      emptyBackupRecord(),
      [],
      null,
      undefined,
      library.organization?.updatedAt,
    )
    expect(backupStatus(library, record).settingsOnlyInBrowser).toBe(false)
  })

  it('exporte les deux types du dossier et préserve le choix après import et synchronisation', () => {
    const f = fixture()
    const merged = moveItems(
      setLibraryOrganization(f.library, true),
      [f.selection.id],
      f.sheetFolder.id,
    )
    const part = libraryPart(merged, {
      space: 'feuilles',
      folderId: f.sheetFolder.id,
    })
    expect(part.sheets).toHaveLength(1)
    expect(part.selections).toHaveLength(1)
    const parsed = parseLibraryFile(
      JSON.stringify(buildLibraryFile(merged, new Map())),
    ).library
    expect(parsed).toEqual(merged)
    const synced = syncLibraries(emptyLibrary(), parsed)
    expect(synced.organization?.merged).toBe(true)
    expect(synced.folders).toEqual(synced.selectionFolders)
    expect(synced.selections[0].folderId).toBe(f.sheetFolder.id)
  })
})
