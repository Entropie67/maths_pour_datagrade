import { describe, expect, it } from 'vitest'
import { decodeBase64 } from '../../components/setup/latex/LatexConfig'
import {
  buildRelectureUrls,
  collectExercicesARelire,
  filterExercices,
  frenchDateToNumber,
  loadEtatsDeRelecture,
  RELECTURE_STORAGE_KEY,
  saveEtatsDeRelecture,
  sortByDate,
  toggleEtatDeRelecture,
  VUES_DE_RELECTURE,
} from './relecture'

const referentiel = {
  '6e': {
    '6N1': {
      '6N1A': {
        uuid: 'aaaaa',
        id: '6N1A',
        titre: 'Écrire un nombre',
        tags: [],
        datePublication: '05/03/2024',
      },
      '6N1B': {
        uuid: 'bbbbb',
        id: '6N1B',
        titre: 'Comparer des nombres',
        datePublication: '12/01/2025',
        dateModification: '02/02/2025',
      },
      '6N1C': { uuid: 'ccccc', id: '6N1C', titre: 'Sans date' },
    },
  },
  '5e': {
    // même exercice rangé à un autre endroit
    '6N1B-bis': {
      uuid: 'bbbbb',
      id: '6N1B-bis',
      titre: 'Comparer des nombres',
      datePublication: '12/01/2025',
    },
    '5G1': {
      uuid: 'ddddd',
      id: '5G1',
      titre: 'Tracer un triangle',
      dateModification: '20/12/2024',
    },
  },
}

describe('vue relecture', () => {
  it('convertit les dates françaises en nombres comparables', () => {
    expect(frenchDateToNumber('05/03/2024')).toBe(20240305)
    expect(frenchDateToNumber(undefined)).toBe(0)
    expect(frenchDateToNumber('2024-03-05')).toBe(0)
  })

  it('récupère les exercices datés sans doublon', () => {
    const exercices = collectExercicesARelire(referentiel)
    expect(exercices.map((e) => e.uuid)).toEqual(['aaaaa', 'bbbbb', 'ddddd'])
  })

  it('trie du plus récent au plus ancien', () => {
    const exercices = collectExercicesARelire(referentiel)
    expect(sortByDate(exercices, 'datePublication').map((e) => e.id)).toEqual([
      '6N1B',
      '6N1A',
    ])
    expect(sortByDate(exercices, 'dateModification').map((e) => e.id)).toEqual([
      '6N1B',
      '5G1',
    ])
  })

  it('filtre sur la référence et le titre sans tenir compte des accents', () => {
    const exercices = collectExercicesARelire(referentiel)
    expect(filterExercices(exercices, 'ecrire').map((e) => e.id)).toEqual([
      '6N1A',
    ])
    expect(filterExercices(exercices, '6n1 comparer').map((e) => e.id)).toEqual(
      ['6N1B'],
    )
    expect(filterExercices(exercices, '  ')).toHaveLength(3)
  })

  it('construit une URL par vue de relecture', () => {
    const liens = buildRelectureUrls(
      { uuid: 'aaaaa', id: '6N1A' },
      'https://coopmaths.fr/alea/?v=eleve',
    )
    expect(liens[1].label).toBe('Vue élève interactive')
    const urls = liens.map((lien) => lien.url)
    expect(urls).toHaveLength(VUES_DE_RELECTURE.length)
    expect(urls[0]).toBe('https://coopmaths.fr/alea/?uuid=aaaaa&id=6N1A&i=0')
    const views = urls.map((url) => new URL(url).searchParams.get('v'))
    expect(views).toEqual([
      null,
      'eleve',
      'diaporama',
      'can',
      'tbi',
      'typst',
      'typst',
      'tex',
    ])
    const typstParam = new URL(urls[6]).searchParams.get('typstParam') ?? ''
    expect(decodeBase64(typstParam).options.minimalCorrections).toBe(true)
  })

  it('pose, change et efface un verdict de relecture', () => {
    let etats = toggleEtatDeRelecture({}, 'aaaaa', 'valide')
    expect(etats).toEqual({ aaaaa: 'valide' })
    etats = toggleEtatDeRelecture(etats, 'aaaaa', 'refuse')
    expect(etats).toEqual({ aaaaa: 'refuse' })
    etats = toggleEtatDeRelecture(etats, 'aaaaa', 'refuse')
    expect(etats).toEqual({})
  })

  it('enregistre et relit le suivi de relecture', () => {
    const data = new Map<string, string>()
    const storage = {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => void data.set(key, value),
    }
    expect(loadEtatsDeRelecture(storage)).toEqual({})
    saveEtatsDeRelecture(storage, { aaaaa: 'valide', bbbbb: 'refuse' })
    expect(loadEtatsDeRelecture(storage)).toEqual({
      aaaaa: 'valide',
      bbbbb: 'refuse',
    })
    data.set(RELECTURE_STORAGE_KEY, '{"aaaaa":"valide","ccccc":"autre"}')
    expect(loadEtatsDeRelecture(storage)).toEqual({ aaaaa: 'valide' })
    data.set(RELECTURE_STORAGE_KEY, 'pas du json')
    expect(loadEtatsDeRelecture(storage)).toEqual({})
    expect(loadEtatsDeRelecture(undefined)).toEqual({})
  })
})
