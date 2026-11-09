import { describe, expect, it } from 'vitest'
import * as Y from 'yjs'
import { emptyParcours, type Parcours } from '../parcoursTypes'
import { readAll, removeParcours, writeParcours } from './salonDoc'
import {
  deletedParcours,
  docFromBase64,
  parcoursIn,
  sameParcours,
  versionDate,
  versionSummary,
} from './salonVersions'

const parcours = (id: string, titre: string, n: number): Parcours => ({
  ...emptyParcours(),
  id,
  titre,
  etapes: Array.from({ length: n }, (_, k) => ({
    uuid: `u${k}`,
    titre: `Exercice ${k}`,
    nbQuestions: 3,
  })),
})
const copy = (doc: Y.Doc) =>
  docFromBase64(btoa(String.fromCharCode(...Y.encodeStateAsUpdate(doc))))

describe('versions d’un salon', () => {
  it('relit un parcours dans une copie et revient à cette version', () => {
    const live = new Y.Doc()
    writeParcours(live, parcours('p1', 'Fractions', 2))
    const old = copy(live)
    writeParcours(live, {
      ...readAll(live)[0],
      titre: 'Fractions (modifié)',
      etapes: [],
    })
    const before = parcoursIn(old, 'p1')
    expect(before?.titre).toBe('Fractions')
    expect(sameParcours(before, readAll(live)[0])).toBe(false)
    // Revenir : réécrire l'ancienne version dans le salon
    writeParcours(live, before!)
    expect(sameParcours(readAll(live)[0], before)).toBe(true)
    expect(versionSummary(before!)).toBe('Fractions · 2 exercices')
  })

  it('retrouve les parcours supprimés, dans leur dernière version', () => {
    const live = new Y.Doc()
    writeParcours(live, parcours('p1', 'Gardé', 1))
    writeParcours(live, parcours('p2', 'Supprimé', 1))
    const older = copy(live)
    writeParcours(live, {
      ...readAll(live).find((p) => p.id === 'p2')!,
      titre: 'Supprimé v2',
    })
    const newer = copy(live)
    removeParcours(live, 'p2')
    const found = deletedParcours(
      [
        { le: '2026-11-08T12:00:00Z', doc: newer },
        { le: '2026-11-08T11:00:00Z', doc: older },
      ],
      readAll(live),
    )
    expect(found.map((f) => [f.parcours.titre, f.le])).toEqual([
      ['Supprimé v2', '2026-11-08T12:00:00Z'],
    ])
  })

  it('ignore les clés internes ajoutées en réécrivant un parcours', () => {
    const a = parcours('p1', 'Fractions', 1)
    const b = { ...a, etapes: a.etapes.map((e) => ({ ...e, cle: 'k1' })) }
    expect(sameParcours(a, b)).toBe(true)
    expect(sameParcours(a, { ...b, titre: 'Autre' })).toBe(false)
  })

  it('écrit les dates simplement', () => {
    const now = new Date(2026, 10, 8, 20, 0)
    expect(versionDate(new Date(2026, 10, 8, 14, 5).toISOString(), now)).toBe(
      'aujourd’hui 14 h 05',
    )
    expect(versionDate(new Date(2026, 10, 7, 9, 0).toISOString(), now)).toBe(
      'hier 9 h 00',
    )
  })
})
