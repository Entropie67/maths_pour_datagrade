import { describe, expect, it } from 'vitest'
import {
  pattern3DDifficulty,
  patternsFor6N4B_2,
  patternsFor6N4B_2ByDifficulty,
} from '../../src/exercices/6e/6N4B-2'
import {
  PATTERN_2D_EASY_MAX_SHAPES,
  PATTERN_2D_HARD_MIN_SHAPES,
  pattern2DDifficulty,
  patternsFor6N4B,
  patternsFor6N4BByDifficulty,
  shape2DGridStateFromPattern,
} from '../../src/exercices/6e/6N4B'
import { VisualPattern } from '../../src/lib/2d/patterns/VisualPattern'
import { VisualPattern3D } from '../../src/lib/2d/patterns/VisualPattern3D'

describe('patternsFor6N4B', () => {
  it("inverse l'axe vertical pour reproduire visuellement la correction", () => {
    const pattern = new VisualPattern([])
    pattern.iterate = () =>
      new Set([
        VisualPattern.coordToKey([0, 0, 'carré']),
        VisualPattern.coordToKey([0, 1, 'carré']),
      ])
    const cells = shape2DGridStateFromPattern(pattern, 1).cells
    expect(cells.find((cell) => cell.x === 2)?.y).toBe(3)
    expect(cells.find((cell) => cell.x === 2 && cell.y !== 3)?.y).toBe(2)
  })

  it('ne contient que des coordonnées 2D au demi-pas', () => {
    expect(patternsFor6N4B.length).toBeGreaterThan(0)
    for (const pattern of patternsFor6N4B) {
      const visualPattern = new VisualPattern([], pattern.shapes)
      visualPattern.iterate = pattern.iterate.bind(visualPattern)
      for (let step = 1; step <= 5; step++) {
        for (const key of visualPattern.iterate(step)) {
          const [x, y, , options] = VisualPattern.keyToCoord(key)
          expect(
            Number.isInteger((x + (options?.translate?.[0] ?? 0)) * 2),
          ).toBe(true)
          expect(
            Number.isInteger((y + (options?.translate?.[1] ?? 0)) * 2),
          ).toBe(true)
        }
      }
    }
  })

  it('classe chaque motif compatible dans un unique niveau non vide', () => {
    const classified = Object.values(patternsFor6N4BByDifficulty).flat()
    expect(classified).toHaveLength(patternsFor6N4B.length)
    expect(new Set(classified).size).toBe(patternsFor6N4B.length)
    expect(
      Object.values(patternsFor6N4BByDifficulty).every(
        (patterns) => patterns.length > 0,
      ),
    ).toBe(true)
  })

  it('classe selon les demi-pas et le nombre de shapes du motif 4', () => {
    for (const pattern of patternsFor6N4B) {
      const visualPattern = new VisualPattern([], pattern.shapes)
      visualPattern.iterate = pattern.iterate.bind(visualPattern)
      const cells = Array.from(visualPattern.iterate(4))
      const hasHalfStep = cells.some((key) => {
        const [x, y, , options] = VisualPattern.keyToCoord(key)
        return [
          x + (options?.translate?.[0] ?? 0),
          y + (options?.translate?.[1] ?? 0),
        ].some((value) => !Number.isInteger(value))
      })
      const expected =
        hasHalfStep || cells.length >= PATTERN_2D_HARD_MIN_SHAPES
          ? 3
          : cells.length <= PATTERN_2D_EASY_MAX_SHAPES
            ? 1
            : 2
      expect(pattern2DDifficulty(pattern)).toBe(expected)
    }
  })
})

describe('patternsFor6N4B_2ByDifficulty', () => {
  it('classe chaque motif 3D compatible dans un unique niveau', () => {
    const classified = Object.values(patternsFor6N4B_2ByDifficulty).flat()
    expect(classified).toHaveLength(patternsFor6N4B_2.length)
    expect(new Set(classified).size).toBe(patternsFor6N4B_2.length)
    expect(
      Object.values(patternsFor6N4B_2ByDifficulty).every(
        (patterns) => patterns.length > 0,
      ),
    ).toBe(true)
  })

  it('applique les seuils de difficulté au motif 4', () => {
    for (const pattern of patternsFor6N4B_2) {
      const visualPattern = new VisualPattern3D({
        initialCells: [],
        prefixId: '',
        shapes: pattern.shapes,
        type: 'full3D',
      })
      visualPattern.iterate3d = pattern.iterate3d.bind(visualPattern)
      const coordinates = Array.from(visualPattern.iterate3d(4), (key) =>
        VisualPattern3D.keyToCoord(key),
      )
      const hasHalfStep = coordinates.some(([x, y, z]) =>
        [x, y, z].some((value) => !Number.isInteger(value)),
      )
      const minLevels = Math.min(
        ...[0, 1, 2].map(
          (axis) => new Set(coordinates.map((point) => point[axis])).size,
        ),
      )
      const expected = hasHalfStep
        ? 3
        : minLevels === 1
          ? 1
          : minLevels <= 3
            ? 2
            : 3
      expect(pattern3DDifficulty(pattern)).toBe(expected)
    }
  })
})
