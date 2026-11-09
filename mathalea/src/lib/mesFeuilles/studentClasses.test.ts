import { beforeEach, describe, expect, it } from 'vitest'
import { emptyLibrary } from './library'
import { buildLibraryFile, parseLibraryFile } from './libraryFile'
import { emptySettings, settingsFingerprint } from './settings'
import {
  addStudentClass,
  addStudentDraw,
  deleteStudentClass,
  drawProbabilities,
  emptyStudentClasses,
  loadStudentClasses,
  mergeStudentClasses,
  parseStudentNames,
  pickStudentIndex,
  resetStudentDraws,
  setStudentNames,
  updateStudentClasses,
  type ClassStudent,
} from './studentClasses'

const OLD = '2026-01-01T00:00:00.000Z'
const NEW = '2026-02-01T00:00:00.000Z'

function students(...draws: number[]): ClassStudent[] {
  return draws.map((count, i) => ({ name: `Élève ${i}`, draws: count }))
}

describe('Classes du tirage au sort', () => {
  beforeEach(() => window.localStorage.clear())

  it('lit une liste d’élèves par ligne, virgule ou point-virgule', () => {
    expect(
      parseStudentNames('Alice\nBob, Chloé ;  Driss  \n\nAlice;Emma  Durand'),
    ).toEqual(['Alice', 'Bob', 'Chloé', 'Driss', 'Emma Durand'])
  })

  it('favorise les élèves les moins tirés', () => {
    const p = drawProbabilities(students(0, 1, 2))
    expect(p[0]).toBeGreaterThan(p[1])
    expect(p[1]).toBeGreaterThan(p[2])
    expect(p.reduce((a, b) => a + b, 0)).toBeCloseTo(1)
    expect(drawProbabilities(students(3, 3))).toEqual([0.5, 0.5])
  })

  it('tire un élève selon les poids', () => {
    const list = students(0, 1)
    expect(pickStudentIndex(list, 0)).toBe(0)
    expect(pickStudentIndex(list, 0.79)).toBe(0)
    expect(pickStudentIndex(list, 0.81)).toBe(1)
    expect(pickStudentIndex(list, 0.999999)).toBe(1)
    expect(pickStudentIndex([], 0.5)).toBe(-1)
  })

  it('garde les tirages des élèves qui restent dans la liste', () => {
    let { classes, studentClass } = addStudentClass(
      emptyStudentClasses(),
      '5e B',
      ['Alice', 'Bob'],
    )
    classes = addStudentDraw(classes, studentClass.id, 'Bob')
    classes = addStudentDraw(classes, studentClass.id, 'Bob')
    classes = setStudentNames(classes, studentClass.id, ['Bob', 'Chloé'])
    expect(classes.classes[0].students).toEqual([
      { name: 'Bob', draws: 2 },
      { name: 'Chloé', draws: 0 },
    ])
    classes = addStudentDraw(classes, studentClass.id, 'Chloé', -1)
    expect(classes.classes[0].students[1].draws).toBe(0)
    classes = resetStudentDraws(classes, studentClass.id)
    expect(classes.classes[0].students[0].draws).toBe(0)
  })

  it('enregistre les classes et leur suppression', () => {
    let id = ''
    updateStudentClasses((value) => {
      const added = addStudentClass(value, '4e A', ['Alice'])
      id = added.studentClass.id
      return added.classes
    })
    expect(loadStudentClasses().classes.map((c) => c.name)).toEqual(['4e A'])
    updateStudentClasses((value) => deleteStudentClass(value, id))
    expect(loadStudentClasses().classes).toEqual([])
  })

  it('fusionne : la version la plus récente l’emporte', () => {
    const base = addStudentClass(emptyStudentClasses(), '5e B', ['Alice'], OLD)
    const id = base.studentClass.id
    const newer = addStudentDraw(base.classes, id, 'Alice', 1, NEW)
    const imported = mergeStudentClasses(base.classes, newer)
    expect(imported.imported).toBe(1)
    expect(imported.classes.classes[0].students[0].draws).toBe(1)
    expect(mergeStudentClasses(newer, base.classes).imported).toBe(0)
  })

  it('fait l’aller-retour dans le fichier .mathalea', () => {
    const settings = {
      ...emptySettings(),
      classes: addStudentClass(emptyStudentClasses(), '5e B', ['Alice']).classes,
    }
    const file = buildLibraryFile(emptyLibrary(), new Map(), null, settings)
    const parsed = parseLibraryFile(JSON.stringify(file))
    expect(parsed.settings?.classes.classes[0].students).toEqual([
      { name: 'Alice', draws: 0 },
    ])
    expect(settingsFingerprint(parsed.settings!)).toBe(
      settingsFingerprint(settings),
    )
  })
})
