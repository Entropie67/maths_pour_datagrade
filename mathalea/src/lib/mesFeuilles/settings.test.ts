import { beforeEach, describe, expect, it } from 'vitest'
import { defaultTypstDocumentOptions } from '../../components/setup/typst/buildTypstDocument'
import type { SlideshowHistoryOptions } from '../../components/setup/diaporama/types'
import {
  backupStatus,
  emptyBackupRecord,
  emptyLibrary,
  recordBackup,
} from './library'
import { buildLibraryFile, parseLibraryFile } from './libraryFile'
import { emptyStudentClasses } from './studentClasses'
import {
  addTypstModel,
  applyTypstModel,
  defaultTypstModel,
  deleteTypstModel,
  describeTypstModel,
  duplicateTypstModel,
  emptyPreferences,
  loadPreferences,
  matchesTypstModel,
  mergePreferences,
  patchTypstModel,
  readPreferences,
  renameTypstModel,
  sameStudentLink,
  setDefaultTypstModel,
  studentLinkPreferences,
  typstModelOptions,
  updatePreferences,
  updateTypstModel,
} from './preferences'
import {
  emptySettings,
  hasSettings,
  importSettings,
  loadSettings,
  mergeSettings,
  settingsCoveredBy,
  settingsFingerprint,
  type LibrarySettings,
} from './settings'
import { emptyParcoursSettings } from './parcoursSettings'
import { emptyEdurlToken } from '../edurl/token'
import { slideshowUrl } from './slideshowLink'
import {
  buildSlideshowSignature,
  loadSlideshowHistory,
  mergeSlideshowHistory,
  readSlideshowEntries,
  saveSlideshowHistory,
  type SlideshowHistoryEntry,
} from './slideshowHistory'

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

function slideshow(
  id: string,
  uuid: string,
  lastUsedAt: string,
  title = `Diaporama ${id}`,
): SlideshowHistoryEntry {
  const exercicesParams = [{ uuid, alea: 'Ab12' }]
  return {
    id,
    title,
    createdAt: '2026-01-01T00:00:00.000Z',
    lastUsedAt,
    updatedAt: lastUsedAt,
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

describe('Réglages : lien pour les élèves', () => {
  it('ne garde que les réglages connus, avec une valeur valide', () => {
    const prefs = studentLinkPreferences(
      {
        presMode: 'une_question_par_page',
        setInteractive: '1',
        isSolutionAccessible: true,
        title: 'Fiche du jour',
        oneShot: 'oui',
      },
      {
        timerMode: 'question',
        durationPerQuestionInSeconds: 20,
        durationInMinutes: 6,
        isChoosen: true,
        feedbackMode: 'jamais',
      },
      true,
      'crypt',
      '2026-10-25T10:00:00.000Z',
    )
    expect(prefs.globalOptions).toEqual({
      presMode: 'une_question_par_page',
      isSolutionAccessible: true,
    })
    expect(prefs.canOptions).toEqual({
      timerMode: 'question',
      durationPerQuestionInSeconds: 20,
    })
    expect(prefs.isDataRandom).toBe(true)
    expect(prefs.linkFormat).toBe('crypt')
  })

  it('compare deux réglages sans tenir compte de la date', () => {
    const a = studentLinkPreferences(
      { twoColumns: true },
      {},
      false,
      'clear',
      '2026-01-01T00:00:00.000Z',
    )
    const b = { ...a, updatedAt: '2026-02-01T00:00:00.000Z' }
    expect(sameStudentLink(a, b)).toBe(true)
    expect(sameStudentLink(a, { ...b, linkFormat: 'short' })).toBe(false)
    expect(sameStudentLink(null, null)).toBe(true)
    expect(sameStudentLink(a, null)).toBe(false)
  })
})

describe('Réglages : modèles de document', () => {
  it('ne met pas dans un modèle les réglages propres à la fiche', () => {
    const options = typstModelOptions({
      ...defaultTypstDocumentOptions,
      title: 'Évaluation',
      versionSeeds: [['a']],
      coverPage: {
        ...defaultTypstDocumentOptions.coverPage,
        etablissement: 'Collège',
        bareme: [2, 3],
      },
    })
    expect(options).not.toHaveProperty('title')
    expect(options).not.toHaveProperty('subtitle')
    expect(options).not.toHaveProperty('versionSeeds')
    expect(options).not.toHaveProperty('canMode')
    expect(options.coverPage?.etablissement).toBe('Collège')
    expect(options.coverPage).not.toHaveProperty('bareme')
  })

  it('applique un modèle en gardant le titre et le barème de la fiche', () => {
    const sheet = {
      ...defaultTypstDocumentOptions,
      title: 'Ma fiche',
      fontSize: 11,
      coverPage: { ...defaultTypstDocumentOptions.coverPage, bareme: [4] },
    }
    const applied = applyTypstModel(sheet, {
      fontSize: 13,
      title: 'Autre',
      coverPage: { ...defaultTypstDocumentOptions.coverPage, matiere: 'Maths' },
    })
    expect(applied.title).toBe('Ma fiche')
    expect(applied.fontSize).toBe(13)
    expect(applied.coverPage.matiere).toBe('Maths')
    expect(applied.coverPage.bareme).toEqual([4])
  })

  it('ajoute, modifie, renomme, choisit par défaut et supprime un modèle', () => {
    const now = '2026-10-25T10:00:00.000Z'
    const later = '2026-10-25T11:00:00.000Z'
    const { preferences, model } = addTypstModel(
      emptyPreferences(),
      '  Évaluation   5e ',
      { ...defaultTypstDocumentOptions, title: 'Contrôle' },
      now,
    )
    expect(model.name).toBe('Évaluation 5e')
    expect(
      matchesTypstModel(
        { ...defaultTypstDocumentOptions, title: 'Autre' },
        model,
      ),
    ).toBe(true)
    let prefs = updateTypstModel(
      preferences,
      model.id,
      { ...defaultTypstDocumentOptions, fontSize: 12 },
      later,
    )
    expect(prefs.typstModels[0].options.fontSize).toBe(12)
    expect(prefs.typstModels[0].updatedAt).toBe(later)
    expect(
      matchesTypstModel(defaultTypstDocumentOptions, prefs.typstModels[0]),
    ).toBe(false)
    prefs = renameTypstModel(prefs, model.id, '', later)
    expect(prefs.typstModels[0].name).toBe('Évaluation 5e')
    prefs = setDefaultTypstModel(prefs, model.id, later)
    expect(defaultTypstModel(prefs)?.id).toBe(model.id)
    prefs = deleteTypstModel(prefs, model.id, later)
    expect(prefs.typstModels).toEqual([])
    expect(defaultTypstModel(prefs)).toBeNull()
  })

  it('relit des réglages abîmés sans erreur', () => {
    const prefs = readPreferences({
      studentLink: { linkFormat: 'inconnu', globalOptions: { twoColumns: 1 } },
      typstModels: [
        { id: '' },
        { id: 'm1', options: { fontSize: 12 }, name: '' },
        'x',
      ],
      defaultTypstModel: { id: 'disparu', updatedAt: 'pas une date' },
    })
    expect(prefs.studentLink?.linkFormat).toBe('clear')
    expect(prefs.studentLink?.globalOptions).toEqual({})
    expect(prefs.typstModels.map((m) => m.id)).toEqual(['m1'])
    expect(prefs.typstModels[0].name).toBe('Modèle')
    expect(prefs.defaultTypstModel.id).toBeNull()
    expect(readPreferences('rien')).toEqual(emptyPreferences())
  })

  it('enregistre les réglages dans localStorage', () => {
    expect(loadPreferences()).toEqual(emptyPreferences())
    const saved = updatePreferences(
      (prefs) =>
        addTypstModel(prefs, 'Brevet', defaultTypstDocumentOptions).preferences,
    )
    expect(loadPreferences()).toEqual(saved)
  })
})

describe('Réglages : fusion', () => {
  it('garde la version la plus récente de chaque réglage', () => {
    const local = addTypstModel(
      emptyPreferences(),
      'A',
      { fontSize: 11 },
      '2026-01-01T00:00:00.000Z',
    )
    const imported = {
      ...local.preferences,
      typstModels: [
        {
          ...local.model,
          options: { fontSize: 14 },
          updatedAt: '2026-02-01T00:00:00.000Z',
        },
        { ...local.model, id: 'autre', name: 'B' },
      ],
      studentLink: studentLinkPreferences(
        { twoColumns: true },
        {},
        false,
        'clear',
        '2026-02-01T00:00:00.000Z',
      ),
      defaultTypstModel: { id: 'autre', updatedAt: '2026-02-01T00:00:00.000Z' },
    }
    const result = mergePreferences(local.preferences, imported)
    expect(result.imported).toBe(4)
    expect(result.preferences.typstModels).toHaveLength(2)
    expect(result.preferences.typstModels[0].options.fontSize).toBe(14)
    expect(result.preferences.defaultTypstModel.id).toBe('autre')
    // une seconde fusion n'apporte plus rien
    expect(mergePreferences(result.preferences, imported).imported).toBe(0)
    // une version plus ancienne ne remplace rien
    const older = mergePreferences(result.preferences, local.preferences)
    expect(older.imported).toBe(0)
    expect(older.preferences.typstModels[0].options.fontSize).toBe(14)
  })

  it('reconnaît un diaporama à sa signature', () => {
    const local = [slideshow('1', 'u1', '2026-01-02T00:00:00.000Z')]
    const imported = [
      slideshow('autre-id', 'u1', '2026-01-03T00:00:00.000Z', 'Renommé'),
      slideshow('2', 'u2', '2026-01-01T00:00:00.000Z'),
    ]
    const result = mergeSlideshowHistory(local, imported)
    expect(result.added).toBe(1)
    expect(result.updated).toBe(1)
    expect(result.items.map((item) => item.id)).toEqual(['1', '2'])
    expect(result.items[0].title).toBe('Renommé')
  })

  it('complète les entrées d’un historique et écarte celles sans exercices', () => {
    const entries = readSlideshowEntries([
      { options: slideshowOptions, exercicesParams: [{ uuid: 'u1' }] },
      { options: slideshowOptions },
      null,
    ])
    expect(entries).toHaveLength(1)
    expect(entries[0].id).not.toBe('')
    expect(entries[0].title).toMatch(/^Diaporama /)
    expect(entries[0].signature).toBe(
      buildSlideshowSignature(slideshowOptions, [{ uuid: 'u1' }]),
    )
  })
})

describe('Réglages : fichier .mathalea et état de la sauvegarde', () => {
  function sampleSettings(): LibrarySettings {
    return {
      preferences: addTypstModel(emptyPreferences(), 'Brevet', { fontSize: 12 })
        .preferences,
      slideshowHistory: [slideshow('1', 'u1', '2026-01-02T00:00:00.000Z')],
      deletedSlideshows: [],
      parcours: emptyParcoursSettings(),
      edurlToken: emptyEdurlToken(),
      classes: emptyStudentClasses(),
    }
  }

  it('fait l’aller-retour des réglages dans le fichier', () => {
    const settings = sampleSettings()
    const file = buildLibraryFile(emptyLibrary(), new Map(), null, settings)
    const parsed = parseLibraryFile(JSON.stringify(file))
    expect(parsed.settings).not.toBeNull()
    expect(settingsFingerprint(parsed.settings!)).toBe(
      settingsFingerprint(settings),
    )
  })

  it('n’exporte pas les réglages avec un dossier, ni des réglages vides', () => {
    const settings = sampleSettings()
    const library = emptyLibrary()
    library.folders.push({
      id: 'f',
      name: 'Dossier',
      parentId: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    const folder = buildLibraryFile(
      library,
      new Map(),
      { space: 'feuilles', folderId: 'f' },
      settings,
    )
    expect(folder.settings).toBeUndefined()
    const empty = buildLibraryFile(library, new Map(), null, emptySettings())
    expect(empty.settings).toBeUndefined()
    // un fichier sans réglages reste lisible
    expect(parseLibraryFile(JSON.stringify(empty)).settings).toBeNull()
  })

  it('signale des réglages modifiés depuis le dernier export', () => {
    const settings = sampleSettings()
    const library = emptyLibrary()
    expect(
      backupStatus(library, emptyBackupRecord(), '').settingsOnlyInBrowser,
    ).toBe(false)
    const print = settingsFingerprint(settings)
    expect(
      backupStatus(library, emptyBackupRecord(), print).settingsOnlyInBrowser,
    ).toBe(true)
    const record = recordBackup(emptyBackupRecord(), [], 'maintenant', print)
    expect(backupStatus(library, record, print).settingsOnlyInBrowser).toBe(
      false,
    )
    // relancer un diaporama ne change pas l'empreinte, le renommer si
    const relaunched = {
      ...settings,
      slideshowHistory: [
        {
          ...settings.slideshowHistory[0],
          lastUsedAt: '2026-03-01T00:00:00.000Z',
        },
      ],
    }
    expect(settingsFingerprint(relaunched)).toBe(print)
    const renamed = {
      ...settings,
      slideshowHistory: [{ ...settings.slideshowHistory[0], title: 'Autre' }],
    }
    expect(settingsFingerprint(renamed)).not.toBe(print)
    // un export de dossier garde l'empreinte précédente
    expect(recordBackup(record, [], 'plus tard').savedSettings).toBe(print)
  })

  it('importe les réglages dans ce navigateur', () => {
    expect(hasSettings(loadSettings())).toBe(false)
    const settings = sampleSettings()
    expect(importSettings(settings)).toBe(2)
    expect(loadSlideshowHistory()).toHaveLength(1)
    expect(loadPreferences().typstModels).toHaveLength(1)
    expect(importSettings(settings)).toBe(0)
    expect(mergeSettings(loadSettings(), settings).imported).toBe(0)
  })

  it('considère les réglages importés comme sauvegardés dans le fichier', () => {
    // le fichier contient des suppressions et des identifiants que l'import
    // ne reprend pas : les empreintes diffèrent, mais rien n'est que dans le navigateur
    const file = sampleSettings()
    file.deletedSlideshows = [
      { id: 'ancien', deletedAt: '2026-01-01T00:00:00.000Z' },
    ]
    file.preferences.deleted = [
      { id: 'vieux-modele', deletedAt: '2026-01-01T00:00:00.000Z' },
    ]
    saveSlideshowHistory([slideshow('local', 'u1', '2026-01-01T00:00:00.000Z')])
    importSettings(file)
    const local = loadSettings()
    expect(settingsFingerprint(local)).not.toBe(settingsFingerprint(file))
    expect(settingsCoveredBy(file, local)).toBe(true)
    // un réglage créé ensuite n'est que dans le navigateur
    const added = {
      ...local,
      preferences: addTypstModel(local.preferences, 'Nouveau', {}).preferences,
    }
    expect(settingsCoveredBy(file, added)).toBe(false)
  })

  it('enregistre l’historique trié, du plus récent au plus ancien', () => {
    saveSlideshowHistory([
      slideshow('1', 'u1', '2026-01-01T00:00:00.000Z'),
      slideshow('2', 'u2', '2026-01-05T00:00:00.000Z'),
    ])
    expect(loadSlideshowHistory().map((item) => item.id)).toEqual(['2', '1'])
  })
})

describe('Réglages : modifier et dupliquer un modèle', () => {
  const earlier = '2026-10-25T10:00:00.000Z'
  const later = '2026-10-26T10:00:00.000Z'

  function withModel() {
    const added = addTypstModel(
      emptyPreferences(),
      'Contrôle',
      { ...defaultTypstDocumentOptions, title: 'Mon titre' },
      earlier,
    )
    return { prefs: added.preferences, model: added.model }
  }

  it('ne change que les réglages donnés', () => {
    const { prefs, model } = withModel()
    const next = patchTypstModel(
      prefs,
      model.id,
      { font: 'Luciole', fontSize: 14, showFooter: false },
      later,
    )
    const patched = next.typstModels[0]
    expect(patched.options.font).toBe('Luciole')
    expect(patched.options.fontSize).toBe(14)
    expect(patched.options.showFooter).toBe(false)
    // les autres réglages et la date de création restent
    expect(patched.options.mathFont).toBe(model.options.mathFont)
    expect(patched.createdAt).toBe(earlier)
    expect(patched.updatedAt).toBe(later)
    // les réglages propres à la fiche ne passent pas dans un modèle
    expect(patched.options).not.toHaveProperty('title')
  })

  it('retire un réglage mis à undefined', () => {
    const { prefs, model } = withModel()
    const next = patchTypstModel(prefs, model.id, { font: undefined }, later)
    expect(next.typstModels[0].options).not.toHaveProperty('font')
  })

  it('duplique un modèle sans en faire le modèle par défaut', () => {
    const { prefs, model } = withModel()
    const asDefault = setDefaultTypstModel(prefs, model.id, earlier)
    const copy = duplicateTypstModel(asDefault, model.id, later)
    expect(copy.model).not.toBeNull()
    expect(copy.model!.id).not.toBe(model.id)
    expect(copy.model!.name).toBe('Contrôle (copie)')
    expect(copy.model!.options).toEqual(model.options)
    expect(copy.preferences.typstModels).toHaveLength(2)
    expect(copy.preferences.defaultTypstModel.id).toBe(model.id)
    expect(duplicateTypstModel(prefs, 'inconnu').model).toBeNull()
  })

  it('résume les réglages les plus visibles', () => {
    const { model } = withModel()
    expect(describeTypstModel(model)).toBe(
      'Libertinus Serif 11 pt · 1 colonne · A4 · en-tête épuré',
    )
    expect(
      describeTypstModel({
        ...model,
        options: {
          fontSize: 12,
          columns: 2,
          pageFormat: 'a5',
          orientation: 'landscape',
          showCorrections: false,
        },
      }),
    ).toBe('12 pt · 2 colonnes · A5 paysage · sans correction')
    expect(describeTypstModel({ ...model, options: {} })).toBe('')
  })
})

describe('Réglages : rouvrir un diaporama de l’historique', () => {
  it('écrit les exercices, les graines et les réglages dans le lien', () => {
    const entry = slideshow('1', 'uuid-a', '2026-10-25T10:00:00.000Z')
    entry.options = {
      ...slideshowOptions,
      nbVues: 2,
      flow: 1,
      shuffle: true,
      durationGlobal: 30,
      select: [0],
      order: [1, 0],
    }
    entry.exercicesParams = [
      { uuid: 'uuid-a', alea: 'Ab12', nbQuestions: 5 },
      { uuid: 'uuid-b', alea: 'Cd34' },
    ]
    const url = slideshowUrl(entry)
    expect(url.searchParams.getAll('uuid')).toEqual(['uuid-a', 'uuid-b'])
    expect(url.searchParams.getAll('alea')).toEqual(['Ab12', 'Cd34'])
    expect(url.searchParams.get('v')).toBe('diaporama')
    expect(url.searchParams.get('ds')).toBe('21001000')
    expect(url.searchParams.get('dGlobal')).toBe('30')
    expect(url.searchParams.get('select')).toBe('0')
    expect(url.searchParams.get('order')).toBe('1-0')
  })

  it('n’écrit ni sélection complète, ni ordre sans mélange', () => {
    const entry = slideshow('1', 'uuid-a', '2026-10-25T10:00:00.000Z')
    entry.options = { ...slideshowOptions, select: [0], order: [0] }
    const url = slideshowUrl(entry)
    expect(url.searchParams.has('select')).toBe(false)
    expect(url.searchParams.has('order')).toBe(false)
    expect(url.searchParams.has('dGlobal')).toBe(false)
  })
})
