import { describe, expect, it } from 'vitest'
import {
  addSession,
  backupStatus,
  changeFolders,
  countSessions,
  createFolder,
  deleteFolder,
  deleteForever,
  duplicateSession,
  emptyBackupRecord,
  emptyLibrary,
  isSessionState,
  libraryItems,
  moveItems,
  moveSession,
  recordBackup,
  recordDeletions,
  renameSession,
  restoreItems,
  searchSessions,
  setLibraryOrganization,
  sessionExercises,
  sessionsIn,
  trashItems,
  updateSessionState,
  type SessionState,
  type SheetLibrary,
} from './library'
import {
  buildLibraryFile,
  libraryPart,
  mergeLibraries,
  parseLibraryFile,
} from './libraryFile'
import {
  defaultSessionName,
  describeSession,
  isTbiSettingsData,
  readTbiSettings,
  sessionShareUrl,
  sessionUrl,
} from './sessionLink'
import {
  buildSyncFile,
  emptySettings,
  parseSyncFile,
  syncLibraries,
} from './sync'

const JAN = '2026-01-01T00:00:00.000Z'
const FEB = '2026-02-01T00:00:00.000Z'

/** Fichier de réglages de la vue TBI, comme l'écrit `exportTbiSettings` */
function tbiState(...refs: string[]): SessionState {
  return {
    type: 'mathalea-tbi',
    version: 1,
    shared: { mode: 'tabs', widgetVisible: true, calculetteVisible: true },
    layout: {},
    collapsed: refs.map(() => false),
    widgetMode: 'clock',
    cols: refs.map(() => 1),
    exercices: refs.map((id, i) => ({
      uuid: `uuid-${i}`,
      id,
      alea: `a${i}`,
      sup: '2',
    })),
  }
}

/** Mes séances : Lundi (une séance) et une séance à la racine */
function sample() {
  let lib: SheetLibrary = emptyLibrary()
  let lundi = ''
  lib = changeFolders(lib, 'seances', (set) => {
    const created = createFolder(set, 'Lundi', null)
    lundi = created.folder.id
    return created.library
  })
  const fractions = addSession(
    lib,
    'Fractions',
    lundi,
    tbiState('6N1E', '6N2B'),
  )
  const racine = addSession(
    fractions.library,
    'Calcul mental',
    null,
    tbiState('5P12'),
  )
  return {
    lib: racine.library,
    lundi,
    fractions: fractions.session,
    racine: racine.session,
  }
}

const GEOMETRY = { x: 0, y: 0, w: 720, h: 540 }
const JESSIE_FIGURE = {
  type: 'figure',
  format: 'jessiecode',
  name: 'figure.jc',
  source: 'A = point(1, 2);',
}

describe('Mes séances au vidéoprojecteur', () => {
  it('conserve les séances dans les dossiers communs, leur export et le retour aux espaces séparés', () => {
    const { lib, lundi, fractions } = sample()
    const merged = setLibraryOrganization(lib, true, '2099-01-01T00:00:00.000Z')
    expect(merged.folders).toEqual(merged.sessionFolders)
    expect(sessionsIn(merged, lundi)).toHaveLength(1)
    const part = libraryPart(merged, { space: 'feuilles', folderId: lundi })
    expect(part.sessions.map((s) => s.id)).toEqual([fractions.id])
    const parsed = parseLibraryFile(
      JSON.stringify(buildLibraryFile(merged, new Map())),
    ).library
    expect(parsed.sessions.find((s) => s.id === fractions.id)?.folderId).toBe(
      lundi,
    )
    const separate = setLibraryOrganization(
      parsed,
      false,
      '2099-01-02T00:00:00.000Z',
    )
    const session = separate.sessions.find((s) => s.id === fractions.id)!
    expect(
      separate.sessionFolders.find((f) => f.id === session.folderId)?.name,
    ).toBe('Lundi')
    const synced = syncLibraries(separate, merged)
    expect(synced.sessions.find((s) => s.id === fractions.id)?.folderId).toBe(
      session.folderId,
    )
    const deleted = deleteFolder(merged, lundi, 'feuilles').library
    expect(deleted.sessions.some((s) => s.id === fractions.id)).toBe(false)
    expect(
      restoreItems(deleted, [fractions.id]).sessions.find(
        (s) => s.id === fractions.id,
      )?.folderId,
    ).not.toBeNull()
  })

  it('range les séances dans leurs propres dossiers', () => {
    const { lib, lundi, fractions, racine } = sample()
    expect(lib.sessionFolders.map((f) => f.name)).toEqual(['Lundi'])
    expect(lib.folders).toHaveLength(0)
    expect(lib.selectionFolders).toHaveLength(0)
    expect(sessionsIn(lib, lundi)).toEqual([fractions])
    expect(sessionsIn(lib, null)).toEqual([racine])
    expect(countSessions(lib, null)).toBe(2)
    expect(countSessions(lib, lundi)).toBe(1)
  })

  it('garde les références des exercices et les met à jour', () => {
    const { lib, fractions } = sample()
    expect(fractions.exercises).toEqual(['6N1E', '6N2B'])
    const updated = updateSessionState(lib, fractions.id, tbiState('3A10'))
    const session = updated.sessions.find((s) => s.id === fractions.id)
    expect(session?.exercises).toEqual(['3A10'])
    expect(session?.name).toBe('Fractions')
  })

  it('reprend l’uuid quand un exercice n’a pas de référence', () => {
    const state = tbiState('6N1E')
    state.exercices = [{ uuid: 'xyz' }, { uuid: 'abc', id: '' }]
    expect(sessionExercises(state)).toEqual(['xyz', 'abc'])
  })

  it('renomme, déplace et duplique', () => {
    const { lib, lundi, racine } = sample()
    const renamed = renameSession(lib, racine.id, '  Calcul   rapide ')
    expect(renamed.sessions.find((s) => s.id === racine.id)?.name).toBe(
      'Calcul rapide',
    )
    const moved = moveSession(renamed, racine.id, lundi)
    expect(sessionsIn(moved, lundi)).toHaveLength(2)
    // un dossier d'une autre arborescence est refusé
    const sheetFolder = createFolder(moved, 'Feuilles', null)
    expect(
      moveSession(sheetFolder.library, racine.id, sheetFolder.folder.id),
    ).toBe(sheetFolder.library)
    const copy = duplicateSession(moved, racine.id)
    expect(copy.session?.name).toBe('Calcul rapide (copie)')
    expect(copy.session?.id).not.toBe(racine.id)
    expect(copy.session?.state).toEqual(racine.state)
    expect(copy.session?.state).not.toBe(racine.state)
  })

  it('cherche dans les noms, les exercices et les dossiers', () => {
    const { lib, fractions } = sample()
    expect(searchSessions(lib, 'fract').map((s) => s.id)).toEqual([
      fractions.id,
    ])
    expect(searchSessions(lib, '6n2b').map((s) => s.id)).toEqual([fractions.id])
    expect(searchSessions(lib, 'lundi').map((s) => s.id)).toEqual([
      fractions.id,
    ])
    expect(searchSessions(lib, '')).toEqual([])
  })

  it('compte les séances dans l’état de la sauvegarde', () => {
    const { lib, fractions } = sample()
    expect(libraryItems(lib)).toHaveLength(2)
    const record = recordBackup(emptyBackupRecord(), [fractions], JAN)
    const status = backupStatus(lib, record)
    expect(status.total).toBe(2)
    expect(status.onlyInBrowser).toBe(1)
  })

  it('supprime un dossier : ses séances vont à la corbeille et reviennent', () => {
    const { lib, lundi, fractions } = sample()
    const result = deleteFolder(lib, lundi, 'seances')
    expect(result.trashedIds).toEqual([fractions.id])
    expect(result.library.sessionFolders).toHaveLength(0)
    expect(result.library.trash[0]).toMatchObject({
      kind: 'session',
      location: ['Lundi'],
    })
    const restored = restoreItems(result.library, [fractions.id])
    expect(restored.sessionFolders.map((f) => f.name)).toEqual(['Lundi'])
    const session = restored.sessions.find((s) => s.id === fractions.id)
    expect(session?.folderId).toBe(restored.sessionFolders[0].id)
    expect(session?.state).toEqual(fractions.state)
  })

  it('supprime définitivement et laisse une pierre tombale', () => {
    const { lib, racine } = sample()
    const trashed = trashItems(lib, [racine.id])
    expect(trashed.sessions).toHaveLength(1)
    const forever = deleteForever(trashed, [racine.id]).library
    const after = recordDeletions(lib, forever)
    expect(after.deleted.map((t) => t.id)).toEqual([racine.id])
  })

  it('déplace des séances avec les autres éléments cochés', () => {
    const { lib, lundi, racine } = sample()
    const moved = moveItems(lib, [racine.id], lundi)
    expect(sessionsIn(moved, lundi)).toHaveLength(2)
  })
})

describe('Fichier .mathalea', () => {
  it('exporte et relit séances et dossiers', () => {
    const { lib } = sample()
    const file = buildLibraryFile(lib, new Map())
    expect(file.sessions).toHaveLength(2)
    expect(file.sessionFolders).toHaveLength(1)
    const parsed = parseLibraryFile(JSON.stringify(file)).library
    expect(parsed.sessions).toEqual(lib.sessions)
    expect(parsed.sessionFolders).toEqual(lib.sessionFolders)
  })

  it('exporte un dossier de séances comme une racine', () => {
    const { lib, lundi } = sample()
    const file = buildLibraryFile(lib, new Map(), {
      space: 'seances',
      folderId: lundi,
    })
    expect(file.sessions.map((s) => s.name)).toEqual(['Fractions'])
    expect(file.sessionFolders.map((f) => f.parentId)).toEqual([null])
    expect(file.sheets).toHaveLength(0)
    expect(file.selections).toHaveLength(0)
  })

  it('lit un fichier qui n’a pas de séances', () => {
    const text = JSON.stringify({
      format: 'mon-mathalea/1',
      exportedAt: JAN,
      folders: [],
      sheets: [],
    })
    const library = parseLibraryFile(text).library
    expect(library.sessions).toEqual([])
    expect(library.sessionFolders).toEqual([])
  })

  it('écarte une séance dont l’état n’est pas celui de la vue TBI', () => {
    const { lib, racine } = sample()
    const file = buildLibraryFile(lib, new Map())
    const broken = {
      ...file,
      sessions: [
        { ...racine, id: 'sans-type', state: { exercices: [{ uuid: 'a' }] } },
        {
          ...racine,
          id: 'sans-liste',
          state: { type: 'mathalea-tbi', version: 1 },
        },
        {
          ...racine,
          id: 'exercice-invalide',
          state: { ...tbiState('x'), exercices: [null] },
        },
        racine,
      ],
    }
    const parsed = parseLibraryFile(JSON.stringify(broken)).library
    expect(parsed.sessions.map((s) => s.id)).toEqual([racine.id])
  })

  it('rattache à la racine une séance dont le dossier manque', () => {
    const { lib, fractions } = sample()
    const file = buildLibraryFile(lib, new Map())
    const orphan = { ...file, sessionFolders: [] }
    const parsed = parseLibraryFile(JSON.stringify(orphan)).library
    expect(parsed.sessions.find((s) => s.id === fractions.id)?.folderId).toBe(
      null,
    )
  })

  it('fusionne à l’import : la version la plus récente l’emporte', () => {
    const { lib, racine } = sample()
    const imported = {
      ...lib,
      sessions: lib.sessions.map((s) =>
        s.id === racine.id
          ? { ...s, name: 'Nouveau nom', updatedAt: '2999-01-01T00:00:00.000Z' }
          : s,
      ),
    }
    const result = mergeLibraries(lib, imported)
    expect(result.updated).toBe(1)
    expect(result.unchanged).toBe(1)
    expect(result.library.sessions.find((s) => s.id === racine.id)?.name).toBe(
      'Nouveau nom',
    )
    const onEmpty = mergeLibraries(emptyLibrary(), lib)
    expect(onEmpty.added).toBe(2)
    expect(onEmpty.library.sessions).toHaveLength(2)
  })

  it('rend à la bibliothèque une séance importée qui était à la corbeille', () => {
    const { lib, racine } = sample()
    const trashed = trashItems(lib, [racine.id])
    const result = mergeLibraries(trashed, lib)
    expect(result.library.sessions.map((s) => s.id)).toContain(racine.id)
    expect(result.library.trash).toHaveLength(0)
  })

  it('range une séance de la corbeille dans le fichier de synchronisation', () => {
    const { lib, racine } = sample()
    const trashed = trashItems(lib, [racine.id])
    const text = JSON.stringify(
      buildSyncFile({ library: trashed, settings: emptySettings() }),
    )
    const back = parseSyncFile(text).library
    expect(back.trash).toHaveLength(1)
    expect(back.trash[0].kind).toBe('session')
  })
})

describe('Synchronisation', () => {
  it('garde la modification la plus récente d’une séance', () => {
    const { lib, racine } = sample()
    const at = (library: SheetLibrary, updatedAt: string, name: string) => ({
      ...library,
      sessions: library.sessions.map((s) =>
        s.id === racine.id ? { ...s, name, updatedAt } : s,
      ),
    })
    const merged = syncLibraries(at(lib, JAN, 'Ancien'), at(lib, FEB, 'Récent'))
    expect(merged.sessions.find((s) => s.id === racine.id)?.name).toBe('Récent')
    const reversed = syncLibraries(
      at(lib, FEB, 'Récent'),
      at(lib, JAN, 'Ancien'),
    )
    expect(reversed.sessions.find((s) => s.id === racine.id)?.name).toBe(
      'Récent',
    )
  })

  it('applique la suppression d’une séance faite sur l’autre appareil', () => {
    const { lib, racine } = sample()
    const trashed = trashItems(lib, [racine.id], '2999-01-01T00:00:00.000Z')
    const merged = syncLibraries(lib, trashed)
    expect(merged.sessions.map((s) => s.id)).not.toContain(racine.id)
    expect(merged.trash.map((t) => t.item.id)).toContain(racine.id)
  })

  it('synchronise aussi les dossiers de séances', () => {
    const { lib } = sample()
    const merged = syncLibraries(emptyLibrary(), lib)
    expect(merged.sessionFolders).toHaveLength(1)
    expect(merged.sessions).toHaveLength(2)
  })
})

describe('Lien et ancien fichier de réglages', () => {
  it('reconnaît l’état de la vue TBI, avec ou sans exercice', () => {
    expect(isSessionState(tbiState('6N1E'))).toBe(true)
    // séance de widgets, de documents ou de vidéos seulement
    expect(isSessionState(tbiState())).toBe(true)
    const withoutList = { ...tbiState('6N1E') }
    delete withoutList.exercices
    expect(isSessionState(withoutList)).toBe(false)
    expect(isSessionState({ ...tbiState('6N1E'), type: 'autre' })).toBe(false)
    expect(isSessionState(null)).toBe(false)
  })

  it('importe un fichier de réglages valide', () => {
    const result = readTbiSettings(JSON.parse(JSON.stringify(tbiState('6N1E'))))
    expect('state' in result && result.state.exercices).toHaveLength(1)
  })

  it('refuse un fichier d’une ancienne version, sans liste d’exercices', () => {
    const old = { ...tbiState('6N1E') }
    delete old.exercices
    expect(isTbiSettingsData(old)).toBe(true)
    const result = readTbiSettings(old)
    expect('error' in result && result.error).toContain('liste des exercices')
  })

  it('refuse un autre fichier JSON', () => {
    expect(isTbiSettingsData({ format: 'mon-mathalea/1' })).toBe(false)
    expect(readTbiSettings([])).toHaveProperty('error')
  })

  it('propose un nom d’après les exercices', () => {
    expect(defaultSessionName(tbiState('6N1E', '6N2B'))).toBe(
      'Séance 6N1E, 6N2B',
    )
    expect(defaultSessionName(tbiState('a', 'b', 'c', 'd'))).toBe(
      'Séance a, b, c…',
    )
    // sans exercice : d'après les documents et vidéos
    expect(
      defaultSessionName({
        ...tbiState(),
        documents: [
          { url: 'https://youtu.be/dQw4w9WgXcQ' },
          { url: 'https://a.fr/sujet.pdf' },
        ],
      }),
    ).toBe('Séance Vidéo YouTube, sujet.pdf')
    expect(defaultSessionName(tbiState())).toBe('Séance sans titre')
  })

  it('résume l’affichage', () => {
    expect(describeSession(tbiState('6N1E'))).toEqual([
      'Affichage en onglets',
      'horloge, calculette',
    ])
    expect(describeSession({ type: 'mathalea-tbi', exercices: [] })).toEqual([])
    expect(
      describeSession({
        type: 'mathalea-tbi',
        exercices: [],
        documents: [
          { url: 'https://youtu.be/dQw4w9WgXcQ' },
          { url: 'https://a.fr/a.pdf' },
          { url: 'https://a.fr/b.png' },
        ],
      }),
    ).toEqual(['1 vidéo, 2 documents'])
  })

  it('résume et nomme une séance de notes et de figures', () => {
    const state = {
      ...tbiState(),
      documents: [
        {
          ...GEOMETRY,
          content: { type: 'markdown', text: '# A', fontSize: 1 },
        },
        { ...GEOMETRY, content: JESSIE_FIGURE },
        { ...GEOMETRY, url: 'https://www.geogebra.org/m/KXhXFvxZ' },
        { ...GEOMETRY, url: 'https://exemple.fr/page' },
      ],
    }
    expect(describeSession({ ...state, shared: {} })).toEqual([
      '1 document, 1 note, 2 figures',
    ])
    expect(defaultSessionName(state)).toBe(
      'Séance Note, figure.jc, Figure GeoGebra…',
    )
  })

  it('garde les notes et les figures dans le fichier .mathalea', () => {
    const { lib } = sample()
    const documents = [
      {
        ...GEOMETRY,
        content: { type: 'markdown', text: '[a]{rouge}', fontSize: 1.5 },
      },
      { ...GEOMETRY, content: JESSIE_FIGURE },
      {
        ...GEOMETRY,
        content: {
          type: 'figure',
          format: 'apigeom',
          name: 'figure.json',
          source: '{"apiGeomVersion":"1","A":{"type":"Point","x":1,"y":2}}',
        },
      },
    ]
    const saved = addSession(lib, 'Notes', null, { ...tbiState(), documents })
    const file = buildLibraryFile(saved.library, new Map())
    const parsed = parseLibraryFile(JSON.stringify(file)).library
    const session = parsed.sessions.find((s) => s.id === saved.session.id)
    expect(session?.state.documents).toEqual(documents)
  })

  it('garde une séance sans exercice dans le fichier .mathalea', () => {
    const { lib } = sample()
    const empty = addSession(lib, 'Vidéo du jour', null, {
      ...tbiState(),
      documents: [
        { url: 'https://youtu.be/dQw4w9WgXcQ', x: 0, y: 0, w: 720, h: 441 },
      ],
    })
    const file = buildLibraryFile(empty.library, new Map())
    const parsed = parseLibraryFile(JSON.stringify(file)).library
    const session = parsed.sessions.find((s) => s.id === empty.session.id)
    expect(session?.exercises).toEqual([])
    expect(session?.state.documents).toEqual([
      { url: 'https://youtu.be/dQw4w9WgXcQ', x: 0, y: 0, w: 720, h: 441 },
    ])
    expect(sessionUrl(empty.session).searchParams.get('seance')).toBe(
      empty.session.id,
    )
  })

  it('construit le lien qui rouvre la séance dans la vue TBI', () => {
    const { fractions } = sample()
    const url = sessionUrl(fractions)
    expect(url.searchParams.get('v')).toBe('tbi')
    expect(url.searchParams.get('seance')).toBe(fractions.id)
    expect(url.searchParams.getAll('uuid')).toEqual(['uuid-0', 'uuid-1'])
    expect(url.searchParams.getAll('alea')).toEqual(['a0', 'a1'])
    expect(url.searchParams.getAll('s')).toEqual(['2', '2'])
  })

  it('construit le lien à partager, sans lien avec la bibliothèque', () => {
    const { fractions } = sample()
    const url = sessionShareUrl(fractions)
    expect(url.searchParams.get('v')).toBe('tbi')
    expect(url.searchParams.has('seance')).toBe(false)
    expect(url.searchParams.getAll('alea')).toEqual(['a0', 'a1'])
    // mode onglets, horloge et calculette viennent de l'état enregistré
    expect(url.searchParams.get('tbiParam')).toBe('m-tabs_w-1_ct-1')
  })

  it('décrit les outils et les tableaux d’une séance récente', () => {
    expect(
      describeSession({
        type: 'mathalea-tbi',
        exercices: [],
        shared: {
          mode: 'tabs',
          tools: [
            { kind: 'clock', scope: 0, x: 0, y: 0 },
            { kind: 'clock', scope: 1, x: 0, y: 0 },
            { kind: 'college', scope: 'all', x: 0, y: 0 },
          ],
          boards: [null, 'seyes', 'blank'],
        },
      }),
    ).toEqual([
      'Affichage en onglets',
      'horloge, calculatrice collège',
      '2 tableaux',
    ])
  })

  it('complète un état ancien pour le lien à partager', () => {
    const { fractions } = sample()
    const old = { ...fractions, state: { ...fractions.state, shared: {} } }
    expect(sessionShareUrl(old).searchParams.has('tbiParam')).toBe(false)
  })
})
