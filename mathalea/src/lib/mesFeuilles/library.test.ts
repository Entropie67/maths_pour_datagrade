import { describe, expect, it } from 'vitest'
import {
  addSheet,
  backupStatus,
  emptyBackupRecord,
  recordBackup,
  canMoveFolder,
  childFolders,
  countSheets,
  createFolder,
  deleteFolder,
  duplicateSheet,
  emptyLibrary,
  folderPath,
  moveFolder,
  moveSheet,
  queryFromUrl,
  renameFolder,
  renameSheet,
  queryKind,
  searchSheets,
  sheetKind,
  sheetsIn,
  sheetUrl,
  updateSheetContent,
  type SheetLibrary,
} from './library'
import {
  buildLibraryFile,
  exportFileName,
  LIBRARY_FILE_FORMAT,
  mergeLibraries,
  parseLibraryFile,
  repair,
  stripScripts,
} from './libraryFile'
import { buildPreview, buildRasterPreview } from './preview'

const content = (ids: string[] = ['6N1E']) => ({
  query: `?uuid=abc&id=${ids[0]}&alea=Xy12&v=typst`,
  exercises: ids,
})

/** Bibliothèque : Maths › 6e › Contrôles, et une feuille dans chacun */
function sample() {
  let lib: SheetLibrary = emptyLibrary()
  const maths = createFolder(lib, 'Maths', null)
  lib = maths.library
  const sixieme = createFolder(lib, '6e', maths.folder.id)
  lib = sixieme.library
  const controles = createFolder(lib, 'Contrôles', sixieme.folder.id)
  lib = controles.library
  const a = addSheet(lib, 'Fractions', sixieme.folder.id, content(['6N2A']))
  lib = a.library
  const b = addSheet(
    lib,
    'Contrôle 1',
    controles.folder.id,
    content(['6N1E', '6G2B']),
  )
  lib = b.library
  const c = addSheet(lib, 'Brouillon', null, content())
  lib = c.library
  return {
    lib,
    maths: maths.folder,
    sixieme: sixieme.folder,
    controles: controles.folder,
    a: a.sheet,
    b: b.sheet,
    c: c.sheet,
  }
}

describe('Mes feuilles : dossiers', () => {
  it('range les dossiers et compte les feuilles des sous-dossiers', () => {
    const { lib, maths, sixieme, controles } = sample()
    expect(childFolders(lib, null).map((f) => f.name)).toEqual(['Maths'])
    expect(folderPath(lib, controles.id).map((f) => f.name)).toEqual([
      'Maths',
      '6e',
      'Contrôles',
    ])
    expect(countSheets(lib, maths.id)).toBe(2)
    expect(countSheets(lib, sixieme.id)).toBe(2)
    expect(countSheets(lib, null)).toBe(3)
  })

  it('trie les noms à la française, nombres compris', () => {
    let lib = emptyLibrary()
    for (const name of ['Séquence 10', 'séquence 2', 'Algèbre']) {
      lib = createFolder(lib, name, null).library
    }
    expect(childFolders(lib, null).map((f) => f.name)).toEqual([
      'Algèbre',
      'séquence 2',
      'Séquence 10',
    ])
  })

  it('renomme sans accepter un nom vide', () => {
    const { lib, maths } = sample()
    expect(
      renameFolder(lib, maths.id, '  Mathématiques ').folders[0].name,
    ).toBe('Mathématiques')
    expect(renameFolder(lib, maths.id, '   ').folders[0].name).toBe('Maths')
  })

  it('refuse de déplacer un dossier dans lui-même ou un descendant', () => {
    const { lib, maths, controles, sixieme } = sample()
    expect(canMoveFolder(lib, maths.id, controles.id)).toBe(false)
    expect(canMoveFolder(lib, maths.id, maths.id)).toBe(false)
    expect(moveFolder(lib, maths.id, controles.id)).toBe(lib)
    const moved = moveFolder(lib, controles.id, null)
    expect(childFolders(moved, null).map((f) => f.name)).toEqual([
      'Contrôles',
      'Maths',
    ])
    expect(countSheets(moved, sixieme.id)).toBe(1)
  })

  it('supprime un dossier et met ses feuilles à la corbeille', () => {
    const { lib, sixieme, a, b, c } = sample()
    const { library, trashedIds } = deleteFolder(lib, sixieme.id)
    expect(trashedIds.sort()).toEqual([a.id, b.id].sort())
    expect(library.folders.map((f) => f.name)).toEqual(['Maths'])
    expect(library.sheets.map((s) => s.id)).toEqual([c.id])
    expect(library.trash.map((t) => t.item.id).sort()).toEqual(
      [a.id, b.id].sort(),
    )
  })
})

describe('Mes feuilles : feuilles', () => {
  it('déplace, renomme, duplique', () => {
    const { lib, a, maths } = sample()
    const moved = moveSheet(lib, a.id, maths.id)
    expect(sheetsIn(moved, maths.id).map((s) => s.name)).toEqual(['Fractions'])
    expect(moveSheet(lib, a.id, 'inconnu')).toBe(lib)
    const renamed = renameSheet(moved, a.id, 'Fractions (révision)')
    expect(renamed.sheets.find((s) => s.id === a.id)?.name).toBe(
      'Fractions (révision)',
    )
    const { library, sheet } = duplicateSheet(renamed, a.id)
    expect(sheet?.name).toBe('Fractions (révision) (copie)')
    expect(sheet?.id).not.toBe(a.id)
    expect(sheet?.query).toBe(a.query)
    expect(sheetsIn(library, maths.id)).toHaveLength(2)
  })

  it('cherche dans les noms, les exercices et les dossiers, sans accents', () => {
    const { lib } = sample()
    expect(searchSheets(lib, 'controle').map((s) => s.name)).toEqual([
      'Contrôle 1',
    ])
    expect(searchSheets(lib, '6g2b').map((s) => s.name)).toEqual(['Contrôle 1'])
    expect(searchSheets(lib, 'maths 6e').map((s) => s.name)).toEqual([
      'Contrôle 1',
      'Fractions',
    ])
    expect(searchSheets(lib, '  ')).toEqual([])
  })
})

describe('Mes feuilles : URL', () => {
  it('enregistre la requête sans origine ni paramètre feuille', () => {
    expect(
      queryFromUrl(
        'https://coopmaths.fr/alea/?uuid=abc&v=typst&feuille=123#typstParam=xyz',
      ),
    ).toBe('?uuid=abc&v=typst#typstParam=xyz')
  })

  it('rouvre la feuille sur le site courant, reliée à la feuille', () => {
    const { a } = sample()
    const sheet = { ...a, query: '?uuid=abc&v=typst#typstParam=xyz' }
    const url = new URL(sheetUrl(sheet, 'http://localhost:5173/alea/'))
    expect(url.origin + url.pathname).toBe('http://localhost:5173/alea/')
    expect(url.searchParams.get('uuid')).toBe('abc')
    expect(url.searchParams.get('v')).toBe('typst')
    expect(url.searchParams.get('feuille')).toBe(a.id)
    expect(url.hash).toBe('#typstParam=xyz')
  })
})

describe('Mes feuilles : fichier .mathalea', () => {
  const preview = {
    svg: '<svg></svg>',
    pageWidth: 595,
    pageHeight: 842,
    pageCount: 2,
  }

  it('fait l’aller-retour avec les aperçus', () => {
    const { lib, a } = sample()
    const file = buildLibraryFile(lib, new Map([[a.id, preview]]))
    expect(file.format).toBe(LIBRARY_FILE_FORMAT)
    const parsed = parseLibraryFile(JSON.stringify(file))
    expect(parsed.library).toEqual(lib)
    expect(parsed.previews.get(a.id)).toEqual(preview)
  })

  it('exporte un dossier comme une nouvelle racine', () => {
    const { lib, sixieme, a, b } = sample()
    const file = buildLibraryFile(lib, new Map(), {
      space: 'feuilles',
      folderId: sixieme.id,
    })
    expect(file.folders.map((f) => f.name).sort()).toEqual(['6e', 'Contrôles'])
    expect(file.folders.find((f) => f.id === sixieme.id)?.parentId).toBeNull()
    expect(file.sheets.map((s) => s.id).sort()).toEqual([a.id, b.id].sort())
  })

  it('nomme le fichier avec la date et l’heure, sans accents', () => {
    const date = new Date(2026, 9, 5, 9, 7, 3)
    expect(exportFileName('mes-feuilles', date)).toBe(
      'mes-feuilles-2026-10-05-09h07m03.mathalea',
    )
    expect(exportFileName('Contrôles 6e', date)).toBe(
      'Controles-6e-2026-10-05-09h07m03.mathalea',
    )
  })

  it('refuse un fichier qui n’est pas une sauvegarde', () => {
    expect(() => parseLibraryFile('pas du json')).toThrow(/lisible/)
    expect(() => parseLibraryFile('{"format":"classes-mathalea/1"}')).toThrow(
      /Mes sauvegardes/,
    )
  })

  it('écarte une feuille dont l’adresse n’est pas une requête MathALÉA', () => {
    const parsed = parseLibraryFile(
      JSON.stringify({
        format: LIBRARY_FILE_FORMAT,
        folders: [],
        sheets: [
          { id: 'x', name: 'Piège', query: 'javascript:alert(1)' },
          { id: 'y', name: 'Bonne', query: '?uuid=abc' },
        ],
      }),
    )
    expect(parsed.library.sheets.map((s) => s.id)).toEqual(['y'])
  })

  it('retire les scripts des aperçus importés', () => {
    expect(stripScripts('<svg><script>alert(1)</script><g/></svg>')).toBe(
      '<svg><g/></svg>',
    )
  })

  it('rattache à la racine les éléments orphelins et casse les boucles', () => {
    const date = new Date().toISOString()
    const folder = (id: string, parentId: string | null) => ({
      id,
      name: id,
      parentId,
      createdAt: date,
      updatedAt: date,
    })
    const repaired = repair({
      folders: [folder('a', 'b'), folder('b', 'a'), folder('c', 'absent')],
      sheets: [
        {
          id: 's',
          name: 's',
          folderId: 'absent',
          query: '?',
          exercises: [],
          createdAt: date,
          updatedAt: date,
        },
      ],
    })
    expect(repaired.folders.find((f) => f.id === 'c')?.parentId).toBeNull()
    expect(
      repaired.folders.some(
        (f) => f.parentId === null && (f.id === 'a' || f.id === 'b'),
      ),
    ).toBe(true)
    expect(repaired.sheets[0].folderId).toBeNull()
  })

  it('fusionne sans rien effacer et garde la version la plus récente', () => {
    const { lib, a, c } = sample()
    const later = new Date(Date.now() + 60_000).toISOString()
    const earlier = new Date(0).toISOString()
    const imported: SheetLibrary = {
      ...emptyLibrary(),
      sheets: [
        { ...a, name: 'Fractions v2', updatedAt: later },
        { ...c, name: 'Ancien brouillon', updatedAt: earlier },
        { ...c, id: 'nouvelle', name: 'Nouvelle', folderId: 'dossier-absent' },
      ],
    }
    const result = mergeLibraries(lib, imported)
    expect(result.added).toBe(1)
    expect(result.updated).toBe(1)
    expect(result.unchanged).toBe(1)
    expect(result.importedSheetIds.sort()).toEqual([a.id, 'nouvelle'].sort())
    expect(result.library.sheets).toHaveLength(4)
    expect(result.library.sheets.find((s) => s.id === a.id)?.name).toBe(
      'Fractions v2',
    )
    expect(result.library.sheets.find((s) => s.id === c.id)?.name).toBe(
      'Brouillon',
    )
    expect(
      result.library.sheets.find((s) => s.id === 'nouvelle')?.folderId,
    ).toBeNull()
  })
})

describe('Mes feuilles : aperçu', () => {
  it('garde la taille de la première page et déclare l’espace de noms', () => {
    const built = buildPreview(
      '<svg viewBox="0 0 10 20"><script>x</script><use xlink:href="#a"/></svg>',
      [
        { width: 10, height: 9 },
        { width: 10, height: 9 },
      ],
    )
    expect(built?.pageWidth).toBe(10)
    expect(built?.pageCount).toBe(2)
    expect(built?.svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    const doc = new DOMParser().parseFromString(built!.svg, 'image/svg+xml')
    expect(doc.querySelector('parsererror')).toBeNull()
    expect(built?.svg).not.toContain('<script')
  })

  it('produit du XML valide sans la couche de sélection du texte', () => {
    const built = buildPreview(
      '<svg viewBox="0 0 10 9"><g><foreignObject><h5:div>Exercice&nbsp;1</h5:div></foreignObject><path d="M0 0"/></g></svg>',
      [{ width: 10, height: 9 }],
    )
    expect(built?.svg).not.toContain('foreignObject')
    expect(built?.svg).not.toContain('&nbsp;')
    const doc = new DOMParser().parseFromString(built!.svg, 'image/svg+xml')
    expect(doc.querySelector('parsererror')).toBeNull()
    expect(doc.querySelector('path')).not.toBeNull()
  })

  it('ne produit rien sans aperçu compilé', () => {
    expect(buildPreview('', [])).toBeUndefined()
  })
})

describe('Mes feuilles : état de la sauvegarde', () => {
  it('compte les feuilles absentes de tout fichier ou modifiées depuis', () => {
    const { lib, a, b } = sample()
    expect(backupStatus(lib, emptyBackupRecord())).toMatchObject({
      total: 3,
      onlyInBrowser: 3,
      percent: 100,
      lastExportAt: null,
    })
    const date = '2026-10-25T10:00:00.000Z'
    const record = recordBackup(emptyBackupRecord(), lib.sheets, date)
    expect(backupStatus(lib, record)).toMatchObject({
      onlyInBrowser: 0,
      percent: 0,
      lastExportAt: date,
    })
    // une feuille renommée depuis l'export n'est plus à jour dans le fichier
    const renamed = renameSheet(lib, a.id, 'Fractions v2')
    renamed.sheets.find((s) => s.id === a.id)!.updatedAt = 'plus tard'
    expect(backupStatus(renamed, record)).toMatchObject({
      onlyInBrowser: 1,
      percent: 33,
    })
    // un import garde la date du dernier export
    const afterImport = recordBackup(record, [b], null)
    expect(afterImport.lastExportAt).toBe(date)
  })

  it('ne compte rien pour une bibliothèque vide', () => {
    expect(backupStatus(emptyLibrary(), emptyBackupRecord()).percent).toBe(0)
  })
})

describe('Mes feuilles : feuilles LaTeX', () => {
  const texContent = (code?: string) => ({
    query: '?uuid=abc&id=6N1E&alea=Xy12&v=tex&texParam=eyJ0Ijoi',
    exercises: ['6N1E'],
    code,
  })

  it('reconnaît la vue d’une feuille à sa requête', () => {
    expect(queryKind('?uuid=abc&v=tex&texParam=xyz')).toBe('tex')
    expect(queryKind('?uuid=abc&v=typst#typstParam=v=tex')).toBe('typst')
    expect(queryKind('?uuid=abc')).toBe('typst')
    const { sheet } = addSheet(emptyLibrary(), 'LaTeX', null, texContent())
    expect(sheetKind(sheet)).toBe('tex')
  })

  it('rouvre une feuille LaTeX dans la vue LaTeX, reliée à la feuille', () => {
    const { sheet } = addSheet(emptyLibrary(), 'LaTeX', null, texContent())
    const url = new URL(sheetUrl(sheet, 'http://localhost:5173/alea/'))
    expect(url.searchParams.get('v')).toBe('tex')
    expect(url.searchParams.get('texParam')).toBe('eyJ0Ijoi')
    expect(url.searchParams.get('feuille')).toBe(sheet.id)
  })

  it('se retrouve en cherchant « latex »', () => {
    let lib = emptyLibrary()
    lib = addSheet(lib, 'Fiche A', null, texContent()).library
    lib = addSheet(lib, 'Fiche B', null, content()).library
    expect(searchSheets(lib, 'latex').map((s) => s.name)).toEqual(['Fiche A'])
  })

  it('garde le code retouché, et le retire quand il ne l’est plus', () => {
    const added = addSheet(emptyLibrary(), 'LaTeX', null, texContent('\\foo'))
    expect(added.sheet.code).toBe('\\foo')
    expect(duplicateSheet(added.library, added.sheet.id).sheet?.code).toBe(
      '\\foo',
    )
    const same = updateSheetContent(added.library, added.sheet.id, {
      ...texContent('\\bar'),
    })
    expect(same.sheets[0].code).toBe('\\bar')
    const cleared = updateSheetContent(
      added.library,
      added.sheet.id,
      texContent(undefined),
    )
    expect(cleared.sheets[0]).not.toHaveProperty('code')
    // un code vide ou démesuré n'est pas gardé
    expect(
      addSheet(emptyLibrary(), 'x', null, texContent('  ')).sheet,
    ).not.toHaveProperty('code')
    expect(
      addSheet(emptyLibrary(), 'x', null, texContent('a'.repeat(600_000)))
        .sheet,
    ).not.toHaveProperty('code')
  })

  it('fait l’aller-retour du fichier avec le code retouché', () => {
    const added = addSheet(emptyLibrary(), 'LaTeX', null, texContent('\\foo'))
    const parsed = parseLibraryFile(
      JSON.stringify(buildLibraryFile(added.library, new Map())),
    )
    expect(parsed.library.sheets[0].code).toBe('\\foo')
    expect(parsed.library).toEqual(added.library)
  })

  it('empile les pages rasterisées dans un SVG lisible comme image', () => {
    const page = (n: number) => ({
      dataUrl: `data:image/jpeg;base64,AAA${n}`,
      width: 560,
      height: 792,
    })
    const preview = buildRasterPreview([page(1), page(2)])
    expect(preview).toMatchObject({
      pageWidth: 560,
      pageHeight: 792,
      pageCount: 2,
    })
    const doc = new DOMParser().parseFromString(preview!.svg, 'image/svg+xml')
    expect(doc.querySelector('parsererror')).toBeNull()
    expect(doc.querySelectorAll('image')).toHaveLength(2)
    expect(buildRasterPreview([])).toBeUndefined()
  })
})
