import { beforeEach, describe, expect, it } from 'vitest'
import {
  deleteParcours,
  emptyLibrary,
  saveParcours,
  setClassParcours,
  type TeacherLibrary,
} from '../parcours/parcoursLibrary'
import { emptyParcours, type Parcours } from '../parcours/parcoursTypes'
import { emptyBackupRecord, emptyLibrary as emptySheets } from './library'
import { buildLibraryFile, parseLibraryFile } from './libraryFile'
import {
  PARCOURS_DELETED_KEY,
  PARCOURS_KEY,
  hasParcours,
  loadParcoursSettings,
  mergeParcours,
  readParcoursLibrary,
  readParcoursSettings,
  saveParcoursLibrary,
  saveParcoursSettings,
  type ParcoursSettings,
} from './parcoursSettings'
import {
  emptySettings,
  importSettings,
  loadSettings,
  mergeSettings,
  settingsCoveredBy,
  settingsFingerprint,
} from './settings'
import { mergeSyncDocuments } from './sync'

const JAN = '2026-01-01T00:00:00.000Z'
const FEB = '2026-02-01T00:00:00.000Z'
const MAR = '2026-03-01T00:00:00.000Z'

beforeEach(() => {
  window.localStorage.clear()
})

const parcours = (id: string, titre = id): Parcours => ({
  ...emptyParcours({ titre, niveau: '5e', theme: 'Relatifs' }),
  id,
  etapes: [{ uuid: 'u1', id: '5R10', titre: 'Additionner', nbQuestions: 3 }],
})

const entry = (id: string, updatedAt?: string, classes: string[] = []) => ({
  parcours: parcours(id),
  classes,
  ...(updatedAt === undefined ? {} : { updatedAt }),
})

const settings = (
  ...entries: ReturnType<typeof entry>[]
): ParcoursSettings => ({
  library: {
    ...emptyLibrary(),
    entries,
    classes: [...new Set(entries.flatMap((e) => e.classes))],
  },
  deleted: [],
})

const ids = (p: ParcoursSettings) => p.library.entries.map((e) => e.parcours.id)

describe('Parcours : lecture', () => {
  it('écarte dans un fichier un parcours invalide, pas dans le stockage', () => {
    const draft = { ...parcours('brouillon'), niveau: 5 }
    const value = {
      classes: ['6A'],
      entries: [
        { parcours: parcours('bon'), classes: ['6A'] },
        { parcours: draft, classes: [] },
      ],
      objectives: [],
    }
    expect(readParcoursLibrary(value, true).entries).toHaveLength(1)
    expect(readParcoursLibrary(value).entries).toHaveLength(2)
  })

  it('ne garde qu’une fois un identifiant et rattache les classes des parcours', () => {
    const library = readParcoursLibrary(
      {
        classes: [],
        entries: [
          { parcours: parcours('a'), classes: ['6A', '6B'] },
          { parcours: parcours('a', 'doublon'), classes: [] },
        ],
      },
      true,
    )
    expect(library.entries).toHaveLength(1)
    expect(library.entries[0].parcours.titre).toBe('a')
    expect(library.classes).toEqual(['6A', '6B'])
  })

  it('revérifie la date, la version publiée et les objectifs', () => {
    const library = readParcoursLibrary(
      {
        classes: [],
        entries: [
          {
            parcours: parcours('a'),
            classes: [],
            published: 'trois',
            updatedAt: 'hier',
          },
        ],
        objectives: [
          { libelle: 'Additionner', niveau: '5e', theme: 'Relatifs' },
          { libelle: 3 },
        ],
      },
      true,
    )
    expect(library.entries[0].published).toBeUndefined()
    expect(library.entries[0].updatedAt).toBeUndefined()
    expect(library.objectives).toHaveLength(1)
  })

  it('lit un fichier sans parcours', () => {
    expect(hasParcours(readParcoursSettings(undefined))).toBe(false)
    expect(hasParcours(readParcoursSettings({ library: 3 }))).toBe(false)
  })
})

describe('Parcours : stockage', () => {
  it('date un parcours modifié et laisse les autres', () => {
    let library: TeacherLibrary = emptyLibrary()
    library = saveParcours(library, parcours('a')).library
    library = saveParcours(library, parcours('b')).library
    const ids = library.entries.map((e) => e.parcours.id)
    saveParcoursLibrary(library, JAN)
    expect(
      loadParcoursSettings().library.entries.map((e) => e.updatedAt),
    ).toEqual([JAN, JAN])

    const changed = {
      ...library,
      entries: library.entries.map((e, i) =>
        i === 0 ? { ...e, classes: ['6A'] } : e,
      ),
    }
    saveParcoursLibrary(changed, FEB)
    const saved = loadParcoursSettings().library.entries
    expect(saved.map((e) => e.parcours.id)).toEqual(ids)
    expect(saved.map((e) => e.updatedAt)).toEqual([FEB, JAN])
  })

  it('ne réécrit rien, ni ne prévient, quand rien ne change', () => {
    const library = saveParcours(emptyLibrary(), parcours('a')).library
    saveParcoursLibrary(library, JAN)
    const raw = window.localStorage.getItem(PARCOURS_KEY)
    saveParcoursLibrary(loadParcoursSettings().library, FEB)
    expect(window.localStorage.getItem(PARCOURS_KEY)).toBe(raw)
  })

  it('publier un parcours ne le date pas', () => {
    const library = saveParcours(emptyLibrary(), parcours('a')).library
    saveParcoursLibrary(library, JAN)
    const published = {
      ...library,
      entries: library.entries.map((e) => ({ ...e, published: 1 })),
    }
    saveParcoursLibrary(published, FEB)
    const saved = loadParcoursSettings().library.entries[0]
    expect(saved.published).toBe(1)
    expect(saved.updatedAt).toBe(JAN)
  })

  it('laisse une pierre tombale pour un parcours supprimé, retirée s’il revient', () => {
    let library = saveParcours(emptyLibrary(), parcours('a')).library
    library = saveParcours(library, parcours('b')).library
    saveParcoursLibrary(library, JAN)
    saveParcoursLibrary(deleteParcours(library, 'a'), FEB)
    expect(loadParcoursSettings().deleted.map((t) => t.id)).toEqual(['a'])
    expect(ids(loadParcoursSettings())).toEqual(['b'])

    saveParcoursLibrary(library, MAR)
    expect(loadParcoursSettings().deleted).toEqual([])
  })

  it('lit un ancien stockage, sans date ni pierre tombale', () => {
    window.localStorage.setItem(
      PARCOURS_KEY,
      JSON.stringify({
        classes: ['6A'],
        entries: [{ parcours: parcours('a'), classes: ['6A'], published: 2 }],
        objectives: [],
      }),
    )
    expect(window.localStorage.getItem(PARCOURS_DELETED_KEY)).toBeNull()
    const saved = loadParcoursSettings()
    expect(ids(saved)).toEqual(['a'])
    expect(saved.library.entries[0].updatedAt).toBeUndefined()
    expect(saved.deleted).toEqual([])
  })

  it('donne les classes à un parcours en gardant sa date si rien d’autre ne change', () => {
    const library = saveParcours(emptyLibrary(), parcours('a')).library
    saveParcoursLibrary(library, JAN)
    const assigned = setClassParcours(library, '6A', ['a'])
    saveParcoursLibrary(assigned, FEB)
    expect(loadParcoursSettings().library.entries[0]).toMatchObject({
      classes: ['6A'],
      updatedAt: FEB,
    })
  })
})

describe('Parcours : import d’un fichier', () => {
  it('ajoute un parcours inconnu et une classe, sans rien effacer', () => {
    const local = settings(entry('a', JAN, ['6A']))
    const imported = settings(entry('b', JAN, ['5B']))
    const { parcours: merged, imported: count } = mergeParcours(local, imported)
    expect(ids(merged)).toEqual(['a', 'b'])
    expect(merged.library.classes).toEqual(['6A', '5B'])
    expect(count).toBe(1)
  })

  it('ne remplace un parcours que par une version plus récente', () => {
    const local = settings(entry('a', FEB))
    const older = settings({ ...entry('a', JAN), classes: ['6A'] })
    expect(mergeParcours(local, older).imported).toBe(0)
    expect(
      mergeParcours(local, older).parcours.library.entries[0].classes,
    ).toEqual([])

    const newer = settings({ ...entry('a', MAR), classes: ['6A'] })
    const result = mergeParcours(local, newer)
    expect(result.imported).toBe(1)
    expect(result.parcours.library.entries[0].classes).toEqual(['6A'])
  })

  it('ne compte rien pour un fichier identique', () => {
    const local = settings(entry('a', JAN, ['6A']))
    expect(mergeParcours(local, local).imported).toBe(0)
  })

  it('rend un parcours supprimé ici, daté de l’import', () => {
    const local: ParcoursSettings = {
      ...settings(),
      deleted: [{ id: 'a', deletedAt: FEB }],
    }
    const { parcours: merged } = mergeParcours(
      local,
      settings(entry('a', JAN)),
      {
        now: MAR,
      },
    )
    expect(merged.library.entries[0].updatedAt).toBe(MAR)
    expect(merged.deleted).toEqual([])
  })

  it('ignore les suppressions du fichier', () => {
    const imported: ParcoursSettings = {
      ...settings(),
      deleted: [{ id: 'a', deletedAt: MAR }],
    }
    expect(
      ids(mergeParcours(settings(entry('a', JAN)), imported).parcours),
    ).toEqual(['a'])
  })

  it('réunit les objectifs sans doublon', () => {
    const objective = (libelle: string) => ({
      libelle,
      niveau: '5e',
      theme: 'Relatifs',
    })
    const a = settings()
    a.library.objectives = [objective('Additionner')]
    const b = settings()
    b.library.objectives = [objective('Additionner'), objective('Soustraire')]
    const result = mergeParcours(a, b)
    expect(result.parcours.library.objectives.map((o) => o.libelle)).toEqual([
      'Additionner',
      'Soustraire',
    ])
    expect(result.imported).toBe(1)
  })
})

describe('Parcours : synchronisation', () => {
  const sync = { sync: true }

  it('garde la version modifiée le plus récemment, dans les deux sens', () => {
    const a = settings({ ...entry('p', FEB), classes: ['6A'] })
    const b = settings({ ...entry('p', MAR), classes: ['6B'] })
    const ab = mergeParcours(a, b, sync).parcours
    const ba = mergeParcours(b, a, sync).parcours
    expect(ab.library.entries[0].classes).toEqual(['6B'])
    expect(ba.library.entries[0]).toEqual(ab.library.entries[0])
  })

  it('départage deux copies de même date de la même façon sur les deux appareils', () => {
    const a = settings({ ...entry('p', FEB), classes: ['6A'] })
    const b = settings({ ...entry('p', FEB), classes: ['6B'] })
    expect(mergeParcours(a, b, sync).parcours.library.entries[0]).toEqual(
      mergeParcours(b, a, sync).parcours.library.entries[0],
    )
  })

  it('applique la suppression plus récente que la modification', () => {
    const local = settings(entry('a', JAN), entry('b', JAN))
    const remote: ParcoursSettings = {
      ...settings(entry('b', JAN)),
      deleted: [{ id: 'a', deletedAt: FEB }],
    }
    const { parcours: merged, imported } = mergeParcours(local, remote, sync)
    expect(ids(merged)).toEqual(['b'])
    expect(merged.deleted.map((t) => t.id)).toEqual(['a'])
    expect(imported).toBe(1)
  })

  it('garde un parcours modifié après sa suppression ailleurs', () => {
    const local = settings(entry('a', MAR))
    const remote: ParcoursSettings = {
      ...settings(),
      deleted: [{ id: 'a', deletedAt: FEB }],
    }
    const { parcours: merged } = mergeParcours(local, remote, sync)
    expect(ids(merged)).toEqual(['a'])
    expect(merged.deleted).toEqual([])
  })

  it('une suppression ne fait pas revenir l’autre copie d’un parcours supprimé', () => {
    const local: ParcoursSettings = {
      ...settings(),
      deleted: [{ id: 'a', deletedAt: FEB }],
    }
    const remote = settings(entry('a', JAN))
    const { parcours: merged, imported } = mergeParcours(local, remote, sync)
    expect(ids(merged)).toEqual([])
    expect(imported).toBe(0)
  })

  it('fusionne deux fois sans rien changer', () => {
    const local = settings(entry('a', FEB, ['6A']), entry('b', JAN))
    const remote = settings(entry('a', MAR, ['6B']), entry('c', JAN))
    const once = mergeParcours(local, remote, sync).parcours
    expect(mergeParcours(once, remote, sync).parcours).toEqual(once)
    expect(mergeParcours(once, remote, sync).imported).toBe(0)
  })

  it('passe par le document de synchronisation', () => {
    const merged = mergeSyncDocuments(
      {
        library: emptySheets(),
        settings: { ...emptySettings(), parcours: settings(entry('a', JAN)) },
      },
      {
        library: emptySheets(),
        settings: { ...emptySettings(), parcours: settings(entry('b', JAN)) },
      },
    )
    expect(ids(merged.settings.parcours).sort()).toEqual(['a', 'b'])
  })
})

describe('Parcours : fichier .mathalea et état de la sauvegarde', () => {
  const withParcours = () => ({
    ...emptySettings(),
    parcours: settings(entry('a', JAN, ['6A'])),
  })

  it('fait l’aller-retour des parcours dans le fichier', () => {
    const file = buildLibraryFile(
      emptySheets(),
      new Map(),
      null,
      withParcours(),
    )
    expect(file.settings?.parcours.library.entries).toHaveLength(1)
    const parsed = parseLibraryFile(JSON.stringify(file))
    expect(parsed.settings?.parcours).toEqual(withParcours().parcours)
  })

  it('n’ajoute rien au fichier sans parcours', () => {
    const file = buildLibraryFile(
      emptySheets(),
      new Map(),
      null,
      emptySettings(),
    )
    expect(file.settings).toBeUndefined()
  })

  it('exporte des parcours supprimés pour la synchronisation seulement via les pierres tombales', () => {
    const only = {
      ...emptySettings(),
      parcours: { ...settings(), deleted: [{ id: 'a', deletedAt: FEB }] },
    }
    const file = buildLibraryFile(emptySheets(), new Map(), null, only)
    expect(
      parseLibraryFile(JSON.stringify(file)).settings?.parcours.deleted,
    ).toEqual(only.parcours.deleted)
  })

  it('un fichier abîmé ou ancien ne casse pas la lecture', () => {
    const file = buildLibraryFile(
      emptySheets(),
      new Map(),
      null,
      withParcours(),
    )
    const raw = JSON.parse(JSON.stringify(file))
    raw.settings.parcours = 'abîmé'
    expect(
      hasParcours(parseLibraryFile(JSON.stringify(raw)).settings!.parcours),
    ).toBe(false)
    delete raw.settings.parcours
    expect(
      hasParcours(parseLibraryFile(JSON.stringify(raw)).settings!.parcours),
    ).toBe(false)
  })

  it('importe les parcours du fichier dans ce navigateur', () => {
    expect(importSettings(withParcours())).toBe(1)
    expect(ids(loadSettings().parcours)).toEqual(['a'])
    expect(importSettings(withParcours())).toBe(0)
  })

  it('l’empreinte change avec les parcours, pas avec leur publication ni leur date', () => {
    const a = withParcours()
    const edited = withParcours()
    edited.parcours.library.entries[0].classes = ['6B']
    expect(settingsFingerprint(a)).not.toBe(settingsFingerprint(edited))

    const published = withParcours()
    published.parcours.library.entries[0].published = 1
    published.parcours.library.entries[0].updatedAt = MAR
    expect(settingsFingerprint(a)).toBe(settingsFingerprint(published))
  })

  it('garde l’empreinte d’avant les parcours quand il n’y en a pas', () => {
    const before = settingsFingerprint({
      ...emptySettings(),
      slideshowHistory: [],
    })
    expect(before).toBe('')
    const deleted = {
      ...emptySettings(),
      parcours: { ...settings(), deleted: [{ id: 'a', deletedAt: FEB }] },
    }
    expect(settingsFingerprint(deleted)).not.toBe('')
  })

  it('compte comme sauvegardés les parcours du fichier qu’on vient d’importer', () => {
    const inFile = withParcours()
    importSettings(inFile)
    expect(settingsCoveredBy(inFile, loadSettings())).toBe(true)
    // un parcours créé ensuite n'est pas dans le fichier
    saveParcoursSettings({
      library: {
        ...loadParcoursSettings().library,
        entries: [
          ...loadParcoursSettings().library.entries,
          entry('nouveau', MAR),
        ],
      },
      deleted: [],
    })
    expect(settingsCoveredBy(inFile, loadSettings())).toBe(false)
  })

  it('fusionne parcours et réglages ensemble', () => {
    const result = mergeSettings(
      { ...emptySettings(), parcours: settings(entry('a', JAN)) },
      { ...emptySettings(), parcours: settings(entry('b', JAN)) },
    )
    expect(result.imported).toBe(1)
    expect(ids(result.settings.parcours)).toEqual(['a', 'b'])
  })

  it('l’état de la sauvegarde signale des parcours seulement dans le navigateur', async () => {
    const { backupStatus, recordBackup } = await import('./library')
    const library = emptySheets()
    const record = recordBackup(
      emptyBackupRecord(),
      [],
      '2026-01-01T00:00:00.000Z',
      settingsFingerprint(withParcours()),
    )
    expect(
      backupStatus(library, record, settingsFingerprint(withParcours()))
        .settingsOnlyInBrowser,
    ).toBe(false)
    const edited = withParcours()
    edited.parcours.library.entries[0].classes = ['6B']
    expect(
      backupStatus(library, record, settingsFingerprint(edited))
        .settingsOnlyInBrowser,
    ).toBe(true)
  })
})
