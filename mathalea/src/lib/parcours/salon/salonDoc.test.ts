import { describe, expect, it } from 'vitest'
import * as Y from 'yjs'
import {
  emptyParcours,
  type Lesson,
  type Objective,
  type Parcours,
} from '../parcoursTypes'
import {
  addSalonObjectives,
  readAll,
  readLessons,
  readSalonObjectives,
  removeLesson,
  withKeys,
  writeLesson,
  writeParcours,
  writeSalonObjectives,
} from './salonDoc'

const parcours = (): Parcours =>
  emptyParcours({
    id: 'essai',
    titre: 'Puissances',
    niveau: '4e',
    etapes: [
      { uuid: 'a', titre: 'A', nbQuestions: 2 },
      { uuid: 'b', titre: 'B', nbQuestions: 3 },
      { uuid: 'c', titre: 'C', nbQuestions: 1 },
    ],
    paliers: [
      { titre: '', nb: 2 },
      { titre: '', nb: 1, acces: 'seuil', seuil: 80 },
    ],
  })

/** Deux documents reliés comme par le serveur */
function pair() {
  const a = new Y.Doc()
  const b = new Y.Doc()
  a.on('update', (u: Uint8Array) => Y.applyUpdate(b, u))
  b.on('update', (u: Uint8Array) => Y.applyUpdate(a, u))
  return { a, b }
}

describe('salonDoc', () => {
  it('relit le parcours écrit, exercices avec leur clé', () => {
    const doc = new Y.Doc()
    const written = writeParcours(doc, parcours())
    const [read] = readAll(doc)
    expect(read).toEqual(written)
    expect(read.etapes.every((s) => s.cle)).toBe(true)
  })

  it('deux personnes modifient deux exercices différents sans s’écraser', () => {
    const a = new Y.Doc()
    const b = new Y.Doc()
    const p = writeParcours(a, parcours())
    Y.applyUpdate(b, Y.encodeStateAsUpdate(a))
    // Hors ligne l'une de l'autre, puis réunies
    const pa = structuredClone(p)
    pa.etapes[0].nbQuestions = 5
    writeParcours(a, pa)
    const pb = structuredClone(p)
    pb.etapes[2].titre = 'C modifié'
    writeParcours(b, pb)
    Y.applyUpdate(a, Y.encodeStateAsUpdate(b))
    Y.applyUpdate(b, Y.encodeStateAsUpdate(a))
    for (const doc of [a, b]) {
      const [r] = readAll(doc)
      expect(r.etapes.map((s) => s.nbQuestions)).toEqual([5, 3, 1])
      expect(r.etapes[2].titre).toBe('C modifié')
    }
  })

  it('suit déplacements, ajouts et suppressions', () => {
    const { a, b } = pair()
    const p = writeParcours(a, parcours())
    const moved = { ...p, etapes: [p.etapes[2], p.etapes[0], p.etapes[1]] }
    writeParcours(a, moved)
    expect(readAll(b)[0].etapes.map((s) => s.uuid)).toEqual(['c', 'a', 'b'])
    writeParcours(b, {
      ...moved,
      etapes: [...moved.etapes.slice(1), { uuid: 'd', titre: 'D' }],
    })
    expect(readAll(a)[0].etapes.map((s) => s.uuid)).toEqual(['a', 'b', 'd'])
  })

  it('un exercice dupliqué reçoit une nouvelle clé', () => {
    const p = withKeys(parcours())
    const twice = withKeys({ ...p, etapes: [...p.etapes, p.etapes[0]] })
    expect(new Set(twice.etapes.map((s) => s.cle)).size).toBe(4)
  })
})

const lesson = (): Lesson => ({
  titre: 'Cours',
  avant: true,
  blocs: [
    { type: 'texte', texte: 'Un' },
    { type: 'retenir', texte: 'Deux' },
  ],
})

/** Deux documents hors ligne l'un de l'autre, puis réunis */
function offline(write: (d: Y.Doc) => void) {
  const a = new Y.Doc()
  write(a)
  const b = new Y.Doc()
  Y.applyUpdate(b, Y.encodeStateAsUpdate(a))
  return {
    a,
    b,
    join() {
      Y.applyUpdate(a, Y.encodeStateAsUpdate(b))
      Y.applyUpdate(b, Y.encodeStateAsUpdate(a))
    },
  }
}

describe('salonDoc : fiches et objectifs', () => {
  it('fiche d’un palier : deux blocs et le titre du palier modifiés en même temps', () => {
    let p = withKeys(parcours())
    const { a, b, join } = offline((d) => {
      p = writeParcours(d, {
        ...p,
        paliers: p.paliers!.map((l, i) => (i ? l : { ...l, fiche: lesson() })),
      })
    })
    p = readAll(a)[0]
    const pa = structuredClone(p)
    ;(pa.paliers![0].fiche!.blocs[0] as { texte: string }).texte = 'Un modifié'
    pa.paliers![1].titre = 'Second'
    writeParcours(a, pa)
    const pb = structuredClone(p)
    ;(pb.paliers![0].fiche!.blocs[1] as { texte: string }).texte = 'Deux modifié'
    writeParcours(b, pb)
    join()
    for (const doc of [a, b]) {
      const [r] = readAll(doc)
      expect(r.paliers![1].titre).toBe('Second')
      expect(
        r.paliers![0].fiche!.blocs.map((x) => (x as { texte: string }).texte),
      ).toEqual(['Un modifié', 'Deux modifié'])
      expect(r.paliers![1].fiche).toBeUndefined()
    }
  })

  it('fiche seule : relue avec ses clés, blocs modifiés à deux', () => {
    const { a, b, join } = offline((d) => writeLesson(d, 'f1', lesson()))
    const [{ fiche }] = readLessons(a)
    expect(fiche.blocs.every((x) => x.cle)).toBe(true)
    const fa = structuredClone(fiche)
    fa.blocs.push({ type: 'texte', texte: 'Trois' })
    writeLesson(a, 'f1', fa)
    const fb = structuredClone(fiche)
    fb.titre = 'Cours modifié'
    writeLesson(b, 'f1', fb)
    join()
    for (const doc of [a, b]) {
      const [r] = readLessons(doc)
      expect(r.fiche.titre).toBe('Cours modifié')
      expect(r.fiche.blocs.length).toBe(3)
    }
    removeLesson(a, 'f1')
    expect(readLessons(a)).toEqual([])
  })

  it('salon d’avant les fiches à part : la fiche de l’en-tête est relue puis déplacée', () => {
    const doc = new Y.Doc()
    const p = writeParcours(doc, parcours())
    const y = doc.getMap<Y.Map<unknown>>('parcours').get(p.id)!
    ;(y.get('entete') as Y.Map<unknown>).set('fiche', lesson())
    const [r] = readAll(doc)
    expect(r.fiche?.titre).toBe('Cours')
    writeParcours(doc, r)
    expect((y.get('entete') as Y.Map<unknown>).has('fiche')).toBe(false)
    expect(readAll(doc)[0].fiche?.blocs.length).toBe(2)
  })

  it('objectifs ajoutés en même temps par deux personnes : tous gardés, sans doublon', () => {
    const o = (libelle: string): Objective => ({
      libelle,
      niveau: '4e',
      theme: 'Puissances',
    })
    const { a, b, join } = offline((d) => writeSalonObjectives(d, [o('A')]))
    writeSalonObjectives(a, [o('A'), o('B')])
    expect(addSalonObjectives(b, [o('A'), o('C'), o('C')])).toBe(1)
    join()
    for (const doc of [a, b])
      expect(readSalonObjectives(doc).map((x) => x.libelle)).toEqual([
        'A',
        'B',
        'C',
      ])
    writeSalonObjectives(a, [o('C')])
    join()
    expect(readSalonObjectives(b).map((x) => x.libelle)).toEqual(['C'])
  })
})
