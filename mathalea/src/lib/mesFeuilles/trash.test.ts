import { describe, expect, it } from 'vitest'
import {
  addSelection,
  addSheet,
  changeFolders,
  createFolder,
  deleteFolder,
  deleteForever,
  emptyLibrary,
  foldersOf,
  libraryItems,
  moveItems,
  purgeTrash,
  restoreItems,
  sortSelections,
  trashDaysLeft,
  trashItems,
  type SheetLibrary,
} from './library'
import { mergeLibraries, repair } from './libraryFile'
import { selectionView, viewRank } from './selectionLink'

/** Feuilles › Contrôles (une feuille), Sélections › Révisions (une sélection) */
function sample() {
  let lib: SheetLibrary = emptyLibrary()
  const controles = createFolder(lib, 'Contrôles', null)
  lib = controles.library
  let revisions = ''
  lib = changeFolders(lib, 'selections', (set) => {
    const created = createFolder(set, 'Révisions', null)
    revisions = created.folder.id
    return created.library
  })
  const sheet = addSheet(lib, 'Contrôle 1', controles.folder.id, {
    query: '?uuid=a&v=typst',
    exercises: ['6N1E'],
  })
  lib = sheet.library
  const selection = addSelection(lib, {
    name: 'Calcul mental',
    folderId: revisions,
    query: '?uuid=a&v=can',
    exercises: ['6N1E'],
  })
  lib = selection.library
  return {
    lib,
    controles: controles.folder.id,
    revisions,
    sheet: sheet.sheet,
    selection: selection.selection,
  }
}

describe('Mes sauvegardes : corbeille', () => {
  it('met à la corbeille puis remet à sa place', () => {
    const { lib, sheet, selection, controles } = sample()
    const trashed = trashItems(lib, [sheet.id, selection.id])
    expect(libraryItems(trashed)).toHaveLength(0)
    expect(trashed.trash.map((t) => t.location)).toEqual([
      ['Contrôles'],
      ['Révisions'],
    ])
    const date = '2027-01-01T00:00:00.000Z'
    const restored = restoreItems(trashed, [sheet.id], date)
    // datée de la restauration, pour l'emporter à la synchronisation
    expect(restored.sheets[0]).toEqual({ ...sheet, updatedAt: date })
    expect(restored.sheets[0].folderId).toBe(controles)
    expect(restored.trash.map((t) => t.item.id)).toEqual([selection.id])
  })

  it('recrée le dossier supprimé entre-temps', () => {
    const { lib, revisions, selection } = sample()
    const { library } = deleteFolder(lib, revisions, 'selections')
    expect(library.selectionFolders).toHaveLength(0)
    const restored = restoreItems(library, [selection.id])
    const folder = foldersOf(restored, 'selections').folders[0]
    expect(folder.name).toBe('Révisions')
    expect(restored.selections[0].folderId).toBe(folder.id)
  })

  it('supprime définitivement et vide après 30 jours', () => {
    const { lib, sheet, selection } = sample()
    const old = trashItems(lib, [sheet.id], '2026-09-01T00:00:00.000Z')
    const both = trashItems(old, [selection.id], '2026-10-20T00:00:00.000Z')
    const date = new Date('2026-10-25T00:00:00.000Z')
    expect(trashDaysLeft(both.trash[0], date)).toBe(25)
    const purged = purgeTrash(both, date)
    expect(purged.removedSheetIds).toEqual([sheet.id])
    expect(purged.library.trash.map((t) => t.item.id)).toEqual([selection.id])
    expect(deleteForever(both, [selection.id]).removedSheetIds).toEqual([])
  })

  it('retire de la corbeille un élément rendu par un import', () => {
    const { lib, sheet } = sample()
    const trashed = trashItems(lib, [sheet.id])
    const merged = mergeLibraries(trashed, {
      ...emptyLibrary(),
      sheets: [sheet],
    })
    expect(merged.library.sheets.map((s) => s.id)).toEqual([sheet.id])
    expect(merged.library.trash).toEqual([])
  })

  it('complète une bibliothèque enregistrée avant la corbeille', () => {
    const { lib } = sample()
    expect(repair({ ...lib, trash: undefined }).trash).toEqual([])
  })
})

describe('Mes sauvegardes : actions groupées et tri par vue', () => {
  it('déplace plusieurs éléments d’un coup', () => {
    const { lib, sheet, controles } = sample()
    const other = addSheet(lib, 'Autre', null, {
      query: '?uuid=b',
      exercises: [],
    })
    const moved = moveItems(other.library, [sheet.id, other.sheet.id], null)
    expect(moved.sheets.every((s) => s.folderId === null)).toBe(true)
    expect(
      moveItems(moved, [other.sheet.id], controles).sheets[1].folderId,
    ).toBe(controles)
  })

  it('trie les sélections par vue', () => {
    let lib = emptyLibrary()
    for (const [name, v] of [
      ['Impression', 'typst'],
      ['Course', 'can'],
      ['Élève', 'eleve'],
      ['Conception', ''],
    ]) {
      lib = addSelection(lib, {
        name,
        folderId: null,
        query: v === '' ? '?uuid=a' : `?uuid=a&v=${v}`,
        exercises: [],
      }).library
    }
    expect(
      sortSelections(lib.selections, 'vue', (s) =>
        viewRank(selectionView(s)),
      ).map((s) => s.name),
    ).toEqual(['Conception', 'Élève', 'Course', 'Impression'])
  })
})
