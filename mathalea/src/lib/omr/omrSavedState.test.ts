import { describe, expect, it } from 'vitest'
import { defaultOmrDocumentOptions } from './buildOmrDocument'
import {
  readOmrSavedState,
  restoreScan,
  saveScan,
  type OmrSavedState,
} from './omrSavedState'
import {
  addSheet,
  duplicateSheet,
  emptyLibrary,
  sheetUrl,
  updateSheetContent,
} from '../mesFeuilles/library'
import { buildLibraryFile, parseLibraryFile } from '../mesFeuilles/libraryFile'

const state = (): OmrSavedState => ({
  version: 1,
  titre: 'Fractions',
  listeCollee: 'Alice\nBob',
  consigne: 'Justifier.',
  grainePartagee: false,
  graineDeBase: 'seed-classe',
  documentOptions: { ...defaultOmrDocumentOptions },
  gabarit: '// Retouche du professeur\n#let colonnes = 2',
  indexApercu: 1,
  onglet: 'bilan',
  displayMode: 'split',
  showOverlay: false,
  isSettingsOpen: false,
  evaluation: {
    version: 1,
    sujet: { titre: 'Fractions', checkSum: 'abc', exercicesParams: [] },
    page: { widthPt: 595, heightPt: 842 },
    reperes: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ],
    layouts: {},
    copies: [],
    questions: [],
  },
  resultat: {
    pages: [{ rang: 1, statut: 'ecartee', retournee: true, mesures: [] }],
    copies: [],
    copiesAbsentes: [],
    lectures: {},
    seuils: {},
    revision: {
      cases: { c1: { q1: 'cochee' } },
      questions: { c1: { q1: { points: 1, commentaire: 'Accordé.' } } },
      validees: ['c1'],
    },
  },
  scan: { name: 'copies.pdf', data: 'JVBERi0=' },
  review: { selection: 'c1', rang: 1, seulementAVerifier: true, zoom: 150 },
})

const content = (omr = state()) => ({
  query: '?uuid=test&alea=seed&v=omr&beta=1',
  exercises: ['6N1E'],
  omr,
})

describe('sauvegarde des évaluations avec scan', () => {
  it('conserve tout l’état dans le fichier .mathalea et rouvre la bonne vue', () => {
    const added = addSheet(emptyLibrary(), 'Fractions', null, content())
    const file = buildLibraryFile(added.library, new Map())
    const restored = parseLibraryFile(JSON.stringify(file)).library.sheets[0]
    expect(restored.omr).toEqual(state())
    const url = new URL(sheetUrl(restored, 'https://coopmaths.fr/alea/'))
    expect(url.searchParams.get('v')).toBe('omr')
    expect(url.searchParams.get('beta')).toBe('1')
    expect(url.searchParams.get('feuille')).toBe(added.sheet.id)
  })

  it('met à jour la même évaluation et duplique aussi le scan et les révisions', () => {
    const added = addSheet(emptyLibrary(), 'Fractions', null, content())
    const changed = state()
    changed.review.zoom = 200
    changed.resultat!.revision!.validees = []
    const library = updateSheetContent(
      added.library,
      added.sheet.id,
      content(changed),
    )
    expect(library.sheets).toHaveLength(1)
    expect(library.sheets[0].omr).toEqual(changed)
    const copy = duplicateSheet(library, added.sheet.id)
    expect(copy.sheet?.id).not.toBe(added.sheet.id)
    expect(copy.sheet?.omr).toEqual(changed)
    expect(added.sheet.omr).toEqual(state())
  })

  it('refuse un état incomplet plutôt que de perdre les corrections à l’import', () => {
    expect(() => readOmrSavedState({ ...state(), scan: null })).toThrow()
    expect(() => readOmrSavedState({ ...state(), review: null })).toThrow()
    expect(() => readOmrSavedState({ ...state(), version: 2 })).toThrow()
    expect(
      readOmrSavedState({
        ...state(),
        scan: null,
        resultat: null,
        evaluation: null,
        onglet: 'generer',
      }),
    ).toBeTruthy()
  })

  it('conserve exactement les octets du scan, y compris au-delà d’un bloc', async () => {
    const bytes = Uint8Array.from({ length: 70000 }, (_, i) => i % 256)
    const saved = await saveScan({
      name: 'copies.pdf',
      arrayBuffer: async () => bytes.buffer,
    } as File)
    const restored = restoreScan(saved)
    expect(restored?.name).toBe('copies.pdf')
    const result = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as ArrayBuffer)
      reader.onerror = reject
      reader.readAsArrayBuffer(restored!)
    })
    expect(new Uint8Array(result)).toEqual(bytes)
    expect(await saveScan(null)).toBeNull()
  })
})
