import { describe, expect, it } from 'vitest'
import { encrypt } from '../components/urls'
import {
  addSelection,
  addSheet,
  backupStatus,
  changeFolders,
  countSelections,
  createFolder,
  deleteFolder,
  duplicateSelection,
  emptyBackupRecord,
  emptyLibrary,
  libraryItems,
  moveSelection,
  recordBackup,
  searchSelections,
  selectionsIn,
  sortSelections,
  updateSelection,
  type SheetLibrary,
} from './library'
import {
  buildLibraryFile,
  LIBRARY_FILE_FORMAT,
  mergeLibraries,
  parseLibraryFile,
  repair,
} from './libraryFile'
import {
  applySettings,
  defaultSelectionName,
  describeSettings,
  editExercisesUrl,
  readMathaleaLink,
  readSettings,
  replaceExercises,
  selectionUrl,
} from './selectionLink'

const BASE = 'https://coopmaths.fr/alea/'
const TWO_EXERCISES =
  '?uuid=aaa&id=6N1E&n=4&s=2&alea=Ab12&uuid=bbb&id=5P12&alea=Cd34&i=1'

/** Mes sélections : Révisions › Fractions, une sélection dans chacun et une à la racine */
function sample() {
  let lib: SheetLibrary = emptyLibrary()
  const create = (name: string, parentId: string | null) => {
    let id = ''
    lib = changeFolders(lib, 'selections', (set) => {
      const created = createFolder(set, name, parentId)
      id = created.folder.id
      return created.library
    })
    return id
  }
  const revisions = create('Révisions', null)
  const fractions = create('Fractions', revisions)
  const add = (name: string, folderId: string | null, comment = '') => {
    const added = addSelection(lib, {
      name,
      folderId,
      query: TWO_EXERCISES,
      exercises: ['6N1E', '5P12'],
      comment,
    })
    lib = added.library
    return added.selection
  }
  const a = add('Calcul mental', revisions, 'Marche bien en début d’heure')
  const b = add('Fractions égales', fractions)
  const c = add('À trier', null)
  return { lib: () => lib, revisions, fractions, a, b, c }
}

describe('Mes sélections : bibliothèque', () => {
  it('range les sélections dans leurs propres dossiers', () => {
    const { lib, revisions, a, c } = sample()
    const library = lib()
    expect(library.folders).toHaveLength(0)
    expect(library.selectionFolders.map((f) => f.name).sort()).toEqual([
      'Fractions',
      'Révisions',
    ])
    expect(selectionsIn(library, revisions).map((s) => s.id)).toEqual([a.id])
    expect(selectionsIn(library, null).map((s) => s.id)).toEqual([c.id])
    expect(countSelections(library, revisions)).toBe(2)
    expect(countSelections(library, null)).toBe(3)
  })

  it('n’accepte une sélection que dans un dossier de « Mes sélections »', () => {
    let library = emptyLibrary()
    const folder = createFolder(library, 'Feuilles', null)
    library = folder.library
    const added = addSelection(library, {
      name: 'x',
      folderId: folder.folder.id,
      query: '?uuid=a',
      exercises: [],
    })
    expect(added.selection.folderId).toBeNull()
    expect(
      moveSelection(added.library, added.selection.id, folder.folder.id)
        .selections[0].folderId,
    ).toBeNull()
  })

  it('note, commente et renomme sans changer la date si rien ne change', () => {
    const { lib, a } = sample()
    const library = lib()
    expect(updateSelection(library, a.id, { name: a.name })).toEqual(library)
    const changed = updateSelection(library, a.id, {
      stars: 3,
      comment: '  Question 3 trop dure  \r\n',
      name: '  Calcul   mental 6e ',
    })
    const selection = changed.selections.find((s) => s.id === a.id)!
    expect(selection.stars).toBe(3)
    expect(selection.comment).toBe('Question 3 trop dure')
    expect(selection.name).toBe('Calcul mental 6e')
    expect(
      updateSelection(library, a.id, { stars: 7 as never }).selections.find(
        (s) => s.id === a.id,
      )?.stars,
    ).toBe(0)
  })

  it('trie par étoiles, par date ou par nom', () => {
    const { lib, a, b, c } = sample()
    let library = updateSelection(lib(), b.id, { stars: 2 })
    library = updateSelection(library, c.id, { stars: 3 })
    expect(
      sortSelections(library.selections, 'etoiles').map((s) => s.id),
    ).toEqual([c.id, b.id, a.id])
    expect(
      sortSelections(library.selections, 'nom').map((s) => s.name),
    ).toEqual(['À trier', 'Calcul mental', 'Fractions égales'])
    const dated = library.selections.map((s, i) => ({
      ...s,
      updatedAt: `2026-10-0${i + 1}T00:00:00.000Z`,
    }))
    expect(sortSelections(dated, 'date').map((s) => s.id)).toEqual([
      c.id,
      b.id,
      a.id,
    ])
  })

  it('cherche dans les noms, commentaires, exercices et dossiers', () => {
    const { lib, a, b } = sample()
    expect(searchSelections(lib(), 'debut heure').map((s) => s.id)).toEqual([
      a.id,
    ])
    expect(
      searchSelections(lib(), 'revisions fractions').map((s) => s.id),
    ).toEqual([b.id])
    expect(searchSelections(lib(), '5p12')).toHaveLength(3)
  })

  it('duplique et supprime un dossier avec ses sélections', () => {
    const { lib, revisions, a, c } = sample()
    const copy = duplicateSelection(lib(), a.id)
    expect(copy.selection?.name).toBe('Calcul mental (copie)')
    const removed = deleteFolder(copy.library, revisions, 'selections')
    expect(removed.trashedIds).toHaveLength(3)
    expect(removed.library.selections.map((s) => s.id)).toEqual([c.id])
    expect(removed.library.selectionFolders).toHaveLength(0)
  })

  it('compte les sélections dans l’état de la sauvegarde', () => {
    const { lib } = sample()
    const library = addSheet(lib(), 'Fiche', null, {
      query: '?uuid=a&v=typst',
      exercises: [],
    }).library
    expect(backupStatus(library, emptyBackupRecord()).total).toBe(4)
    const record = recordBackup(
      { ...emptyBackupRecord(), lastAutoSaveAt: 'hier' },
      libraryItems(library),
      'maintenant',
    )
    expect(backupStatus(library, record).onlyInBrowser).toBe(0)
    // un export garde la date de la dernière sauvegarde automatique
    expect(record.lastAutoSaveAt).toBe('hier')
  })
})

describe('Mes sélections : lien raccourci', () => {
  const link = {
    url: 'https://edurl.fr/maths6',
    longUrl: 'https://coopmaths.fr/alea/?uuid=aaa',
  }

  it('garde le lien raccourci avec la sélection, et le retire', () => {
    const { lib, a } = sample()
    const withLink = updateSelection(lib(), a.id, { shortLink: link })
    const updated = withLink.selections.find((s) => s.id === a.id)!
    expect(updated.shortLink).toEqual(link)
    expect(updated.updatedAt >= a.updatedAt).toBe(true)
    const without = updateSelection(withLink, a.id, { shortLink: null })
    expect(
      without.selections.find((s) => s.id === a.id)!.shortLink,
    ).toBeUndefined()
  })

  it('ne change pas la date quand le lien raccourci est le même', () => {
    const { lib, a } = sample()
    const once = updateSelection(lib(), a.id, { shortLink: link })
    const twice = updateSelection(once, a.id, { shortLink: { ...link } })
    expect(twice).toEqual(once)
  })

  it('ne copie pas le lien raccourci dans une sélection dupliquée', () => {
    const { lib, a } = sample()
    const withLink = updateSelection(lib(), a.id, { shortLink: link })
    const { selection } = duplicateSelection(withLink, a.id)
    expect(selection!.shortLink).toBeUndefined()
    expect('shortLink' in selection!).toBe(false)
  })

  it('fait l’aller-retour du lien raccourci dans le fichier', () => {
    const { lib, a } = sample()
    const withLink = updateSelection(lib(), a.id, { shortLink: link })
    const parsed = parseLibraryFile(
      JSON.stringify(buildLibraryFile(withLink, new Map())),
    )
    expect(
      parsed.library.selections.find((s) => s.id === a.id)!.shortLink,
    ).toEqual(link)
    expect(parsed.library).toEqual(withLink)
  })

  it('écarte un lien raccourci qui n’est pas une adresse web', () => {
    for (const shortLink of [
      { url: 'javascript:alert(1)', longUrl: 'https://coopmaths.fr/' },
      { url: 'https://edurl.fr/a' },
      'https://edurl.fr/a',
    ]) {
      const parsed = parseLibraryFile(
        JSON.stringify({
          format: LIBRARY_FILE_FORMAT,
          selections: [{ id: 'y', query: '?uuid=a', shortLink }],
        }),
      )
      expect(parsed.library.selections[0].shortLink).toBeUndefined()
    }
  })
})

describe('Mes sélections : fichier .mathalea', () => {
  it('fait l’aller-retour des sélections et de leurs dossiers', () => {
    const { lib } = sample()
    const parsed = parseLibraryFile(
      JSON.stringify(buildLibraryFile(lib(), new Map())),
    )
    expect(parsed.library).toEqual(lib())
  })

  it('exporte un dossier de sélections seul', () => {
    const { lib, fractions, b } = sample()
    const file = buildLibraryFile(lib(), new Map(), {
      space: 'selections',
      folderId: fractions,
    })
    expect(file.sheets).toEqual([])
    expect(file.selectionFolders.map((f) => f.parentId)).toEqual([null])
    expect(file.selections.map((s) => s.id)).toEqual([b.id])
  })

  it('lit un fichier sans sélections et écarte les adresses suspectes', () => {
    const old = parseLibraryFile(
      JSON.stringify({ format: LIBRARY_FILE_FORMAT, folders: [], sheets: [] }),
    )
    expect(old.library.selections).toEqual([])
    const parsed = parseLibraryFile(
      JSON.stringify({
        format: LIBRARY_FILE_FORMAT,
        selections: [
          { id: 'x', query: 'https://ailleurs.example/?uuid=a' },
          { id: 'y', query: '?uuid=a', stars: 9, comment: 42 },
        ],
      }),
    )
    expect(parsed.library.selections.map((s) => s.id)).toEqual(['y'])
    expect(parsed.library.selections[0]).toMatchObject({
      stars: 0,
      comment: '',
      newDataEachTime: false,
    })
  })

  it('complète une bibliothèque enregistrée avant les sélections', () => {
    expect(repair({ folders: [], sheets: [] })).toEqual(emptyLibrary())
  })

  it('fusionne les sélections comme les feuilles', () => {
    const { lib, a } = sample()
    const later = new Date(Date.now() + 60_000).toISOString()
    const result = mergeLibraries(lib(), {
      ...emptyLibrary(),
      selections: [
        { ...a, stars: 3, updatedAt: later },
        { ...a, id: 'nouvelle', folderId: 'absent' },
      ],
    })
    expect(result).toMatchObject({ added: 1, updated: 1, unchanged: 0 })
    expect(result.importedSheetIds).toEqual([])
    expect(result.library.selections.find((s) => s.id === a.id)?.stars).toBe(3)
    expect(
      result.library.selections.find((s) => s.id === 'nouvelle')?.folderId,
    ).toBeNull()
  })
})

describe('Mes sélections : liens', () => {
  it('lit un lien complet, sans origine ni paramètres de copie', () => {
    const link = readMathaleaLink(
      `https://coopmaths.fr/alea/${TWO_EXERCISES}&v=eleve&recorder=capytale&answers=%7B%7D&done=1`,
    )
    expect(link.query).toBe(`${TWO_EXERCISES}&v=eleve`)
    expect(link.exercises).toEqual(['6N1E', '5P12'])
  })

  it('accepte un lien sans protocole, crypté ou réduit à sa requête', () => {
    expect(readMathaleaLink(`coopmaths.fr/alea/${TWO_EXERCISES}`).query).toBe(
      TWO_EXERCISES,
    )
    expect(readMathaleaLink(encrypt(`${BASE}${TWO_EXERCISES}`)).query).toBe(
      TWO_EXERCISES,
    )
    expect(readMathaleaLink('?uuid=aaa').exercises).toEqual(['aaa'])
  })

  it('refuse un lien sans exercice', () => {
    expect(() => readMathaleaLink('https://coopmaths.fr/alea/')).toThrow(
      /aucun exercice/,
    )
    expect(() => readMathaleaLink('javascript:alert(1)')).toThrow(
      /aucun exercice/,
    )
  })

  it('lit les réglages de la vue élève', () => {
    const settings = readSettings(
      `${TWO_EXERCISES}&v=eleve&es=3101001100&title=Devoir%2520maison`,
    )
    expect(settings).toMatchObject({
      view: 'eleve',
      interactivity: 'tous',
      presMode: 'une_question_par_page',
      isSolutionAccessible: false,
      isInteractiveFree: true,
      oneShot: false,
      title: 'Devoir maison',
    })
    expect(describeSettings(settings)).toEqual([
      'Élève',
      'Une page par question',
      'tout interactif',
    ])
  })

  it('reconnaît une interactivité propre à chaque exercice', () => {
    expect(readSettings(TWO_EXERCISES).interactivity).toBe('mixte')
    expect(readSettings('?uuid=a&uuid=b').interactivity).toBe('aucun')
    expect(readSettings('?uuid=a&numerique=1').interactivity).toBe('tous')
  })

  it('rend tous les exercices interactifs, puis aucun', () => {
    const all = applySettings(TWO_EXERCISES, {
      ...readSettings(TWO_EXERCISES),
      interactivity: 'tous',
    })
    expect(new URLSearchParams(all).getAll('i')).toEqual(['1', '1'])
    // chaque `i` reste après son exercice
    expect(all).toContain('alea=Ab12&i=1&uuid=bbb')
    const none = applySettings(all, {
      ...readSettings(all),
      interactivity: 'aucun',
    })
    expect(new URLSearchParams(none).getAll('i')).toEqual([])
  })

  it('passe dans la vue élève avec la présentation choisie', () => {
    const query = applySettings(TWO_EXERCISES, {
      ...readSettings(TWO_EXERCISES),
      view: 'eleve',
      presMode: 'un_exo_par_page',
      oneShot: true,
      title: 'Révisions & co',
    })
    const params = new URLSearchParams(query)
    expect(params.get('v')).toBe('eleve')
    expect(params.get('es')).toBe('121110110')
    expect(decodeURIComponent(params.get('title')!)).toBe('Révisions & co')
    expect(readSettings(query)).toMatchObject({
      presMode: 'un_exo_par_page',
      interactivity: 'mixte',
      oneShot: true,
      title: 'Révisions & co',
    })
  })

  it('ne réécrit pas un `es` court dont la présentation ne change pas', () => {
    const query = `${TWO_EXERCISES}&v=eleve&es=011100`
    expect(applySettings(query, readSettings(query))).toBe(query)
  })

  it('règle l’interactivité de la course aux nombres', () => {
    const query = applySettings(TWO_EXERCISES, {
      ...readSettings(TWO_EXERCISES),
      view: 'can',
      interactivity: 'tous',
    })
    expect(new URLSearchParams(query).get('canI')).toBe('1')
  })

  it('ouvre la sélection avec les seuls réglages de sa vue', () => {
    const { a } = sample()
    const query = `${TWO_EXERCISES}&v=diaporama&ds=1010000&es=0211001&title=x&canD=3`
    const url = new URL(selectionUrl({ ...a, query }, BASE))
    expect(url.origin + url.pathname).toBe(BASE)
    expect(url.searchParams.get('ds')).toBe('1010000')
    expect(url.searchParams.has('es')).toBe(false)
    expect(url.searchParams.has('title')).toBe(false)
    expect(url.searchParams.has('canD')).toBe(false)
    expect(url.searchParams.getAll('alea')).toEqual(['Ab12', 'Cd34'])
  })

  it('ouvre la sélection dans une autre vue (diaporama, impression…)', () => {
    const { a } = sample()
    const query = `${TWO_EXERCISES}&v=eleve&es=0211001&ds=1010000`
    const url = new URL(selectionUrl({ ...a, query }, BASE, 'diaporama'))
    expect(url.searchParams.get('v')).toBe('diaporama')
    expect(url.searchParams.get('ds')).toBe('1010000')
    expect(url.searchParams.has('es')).toBe(false)
    expect(
      new URL(selectionUrl({ ...a, query }, BASE, 'typst')).searchParams.has(
        'ds',
      ),
    ).toBe(false)
  })

  it('retire les graines pour de nouveaux énoncés à chaque ouverture', () => {
    const { a } = sample()
    const url = new URL(selectionUrl({ ...a, newDataEachTime: true }, BASE))
    expect(url.searchParams.has('alea')).toBe(false)
    expect(url.searchParams.getAll('uuid')).toEqual(['aaa', 'bbb'])
  })

  it('ouvre les exercices dans la conception de document', () => {
    const { a } = sample()
    const query = `${TWO_EXERCISES}&v=eleve&es=0211001`
    const url = new URL(editExercisesUrl({ ...a, query }, BASE))
    expect(url.searchParams.has('v')).toBe(false)
    expect(url.searchParams.has('es')).toBe(false)
    expect(url.searchParams.getAll('alea')).toEqual(['Ab12', 'Cd34'])
  })

  it('remplace les exercices en gardant les réglages de la sélection', () => {
    const query = `${TWO_EXERCISES}&v=eleve&es=3111001&title=Devoir`
    const replaced = replaceExercises(
      query,
      readMathaleaLink('?uuid=ccc&id=4C10&alea=Zz'),
    )
    expect(replaced.exercises).toEqual(['4C10'])
    expect(replaced.query).toBe(
      '?uuid=ccc&id=4C10&alea=Zz&v=eleve&es=3111001&title=Devoir',
    )
    // un lien de la vue élève sans `es` n'en reçoit pas
    expect(
      replaceExercises(
        '?uuid=aaa&uuid=bbb&v=eleve&title=DM',
        readMathaleaLink('?uuid=bbb&uuid=aaa'),
      ).query,
    ).toBe('?uuid=bbb&uuid=aaa&v=eleve&title=DM')
    // en conception, « tout interactif » vaut aussi pour les nouveaux exercices
    const allInteractive = '?uuid=aaa&i=1&uuid=bbb&i=1'
    expect(
      replaceExercises(allInteractive, readMathaleaLink('?uuid=ccc')).query,
    ).toBe('?uuid=ccc&i=1')
  })

  it('propose comme nom le titre, sinon les références', () => {
    expect(
      defaultSelectionName(readMathaleaLink(`${TWO_EXERCISES}&title=DM%25201`)),
    ).toBe('DM 1')
    expect(defaultSelectionName(readMathaleaLink(TWO_EXERCISES))).toBe(
      '6N1E, 5P12',
    )
  })
})
