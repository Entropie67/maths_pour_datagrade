import { describe, expect, it } from 'vitest'
import {
  defaultCoverPoints,
  groupedExercisePoints,
  setGroupedExercisePoints,
} from './coverBareme'

describe('barème proposé de la page de garde', () => {
  it('compte les items effectivement générés', () => {
    expect(
      defaultCoverPoints({
        listeQuestions: ['a', 'b', 'c'],
        nbQuestions: 10,
      }),
    ).toBe(3)
  })

  it('utilise le nombre configuré pendant la duplication', () => {
    expect(defaultCoverPoints({ listeQuestions: [], nbQuestions: 6 })).toBe(6)
  })

  it('retombe sur un point si aucun nombre exploitable n’est disponible', () => {
    expect(defaultCoverPoints(null)).toBe(1)
    expect(defaultCoverPoints({ listeQuestions: [], nbQuestions: 0 })).toBe(1)
  })
})

describe('points des groupes fusionnés', () => {
  it('propose le total du groupe dans la palette, y compris pour une chaîne de fusions', () => {
    expect(groupedExercisePoints([2, 3, 5, 4], [2, 3])).toEqual({
      1: 10,
      2: 8,
      3: 5,
      4: 4,
    })
  })

  it('modifie le total du groupe sans toucher aux autres exercices', () => {
    const points = [2, 3, 5, 4]
    const changed = setGroupedExercisePoints(points, [2, 3], 1, 5)
    expect(changed).toEqual([1, 1.5, 2.5, 4])
    expect(groupedExercisePoints(changed, [2, 3])[1]).toBe(5)
    expect(points).toEqual([2, 3, 5, 4])
    expect(setGroupedExercisePoints(points, [2, 3], 4, 7)).toEqual([2, 3, 5, 7])
  })

  it('accepte un total nul et un groupe initialement sans points', () => {
    expect(setGroupedExercisePoints([2, 3], [2], 1, 0)).toEqual([0, 0])
    expect(setGroupedExercisePoints([0, 0], [2], 1, 3)).toEqual([1.5, 1.5])
    const changed = setGroupedExercisePoints([1, 1, 1], [2, 3], 1, 2.5)
    expect(groupedExercisePoints(changed, [2, 3])[1]).toBe(2.5)
    expect(changed.every((p) => p >= 0)).toBe(true)
  })
})
