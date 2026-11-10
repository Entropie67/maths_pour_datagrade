import seedrandom from 'seedrandom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SymetrieCentraleFigures from '../../src/exercices/5e/5G3A-4'
import { context } from '../../src/modules/context'

vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

const originalRandom = Math.random
const exercises: SymetrieCentraleFigures[] = []

function generate(
  figureType: string,
  position = 4,
  seed = 'Q1Im',
  aid = 1,
  interactive = false,
) {
  seedrandom(seed, { global: true })
  const exercise = new SymetrieCentraleFigures()
  exercises.push(exercise)
  exercise.numeroExercice = 0
  exercise.interactif = interactive
  exercise.nbQuestions = 3
  exercise.sup = aid
  exercise.sup2 = figureType
  exercise.sup4 = position
  exercise.nouvelleVersion()
  return exercise
}

beforeEach(() => {
  context.isHtml = true
  context.isTypst = false
  context.isAmc = false
  document.body.innerHTML = ''
  window.notify = vi.fn()
  window.notifyLocal = vi.fn()
})

afterEach(() => {
  for (const exercise of exercises.splice(0)) {
    for (const figure of exercise.figuresApiGeom ?? []) figure.destroy()
  }
  Math.random = originalRandom
})

type Coordinates = { x: number; y: number }

function area(a: Coordinates, b: Coordinates, c: Coordinates) {
  return Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) / 2
}

describe('5G3A-4 : position du centre de symétrie', () => {
  // Coordonnées et état du générateur relevés sur la version publiée (graine Q1Im).
  it.each(['4', '5', '6'])(
    'conserve les tirages historiques par défaut pour le type %s',
    (figureType) => {
      const exercise = generate(figureType)
      const mixed = figureType === '6'
      expect(
        exercise.antecedentsApiGeom.map((points) =>
          points.map(({ x, y, label }) => [x, y, label]),
        ),
      ).toEqual(
        mixed
          ? [
              [
                [1, -4, 'V'],
                [5, -3, 'X'],
                [6, 4, 'S'],
              ],
              [
                [4, 3, 'B'],
                [6, 7, 'V'],
                [-7, -4, 'C'],
              ],
              [
                [-2, 4, 'J'],
                [4, 5, 'P'],
                [-5, -4, 'F'],
              ],
            ]
          : [
              [
                [-4, 3, 'O'],
                [-8, 5, 'Y'],
                [-2, 6, 'R'],
              ],
              [
                [-2, 4, 'B'],
                [2, 8, 'H'],
                [7, -7, 'M'],
              ],
              [
                [3, -4, 'Y'],
                [7, -5, 'J'],
                [2, 5, 'I'],
              ],
            ],
      )
      expect(exercise.centresApiGeom.map(({ label }) => label)).toEqual(
        mixed ? ['J', 'D', 'E'] : ['G', 'D', 'N'],
      )
      expect(Math.random()).toBe(
        mixed ? 0.24845805809534172 : 0.1268047650776967,
      )
    },
  )

  it.each([1, 2, 3])(
    'respecte la position %s pour les cercles et les triangles',
    (position) => {
      for (const figureType of ['4', '5', '4-5']) {
        for (let seed = 0; seed < 4; seed++) {
          const exercise = generate(
            figureType,
            position,
            `position-${seed}`,
            1 + (seed % 4),
          )
          expect(exercise.listeQuestions).toHaveLength(3)
          for (let i = 0; i < 3; i++) {
            const [a, b, c] = exercise.antecedentsApiGeom[i]
            const center = exercise.centresApiGeom[i]
            if (exercise.typesDeQuestions[i] === 'cercle') {
              const distance = Math.hypot(center.x - a.x, center.y - a.y)
              const radius = Math.hypot(b.x - a.x, b.y - a.y)
              if (position === 1) expect(distance).toBeGreaterThan(radius)
              if (position === 2) expect(distance).toBeCloseTo(radius)
              if (position === 3) expect(distance).toBeLessThan(radius)
            } else {
              const triangleArea = area(a, b, c)
              const subAreas = [
                area(center, a, b),
                area(center, b, c),
                area(center, c, a),
              ]
              const total = subAreas.reduce((sum, value) => sum + value, 0)
              expect(triangleArea).toBeGreaterThanOrEqual(8)
              if (position === 1) expect(total).toBeGreaterThan(triangleArea)
              else {
                expect(total).toBe(triangleArea)
                if (position === 2) expect(Math.min(...subAreas)).toBe(0)
                else expect(Math.min(...subAreas)).toBeGreaterThan(0)
              }
            }
          }
        }
      }
    },
  )

  it.each(['1', '2', '3'])(
    'ne modifie pas les tirages des figures de type %s',
    (figureType) => {
      const baseline = generate(figureType)
      const nextRandom = Math.random()
      const coordinates = (exercise: SymetrieCentraleFigures) =>
        exercise.antecedentsApiGeom.map((points) =>
          points.map(({ x, y, label }) => ({ x, y, label })),
        )
      for (const position of [1, 2, 3]) {
        const exercise = generate(figureType, position)
        expect(coordinates(exercise)).toEqual(coordinates(baseline))
        expect(Math.random()).toBe(nextRandom)
      }
    },
  )

  it.each([1, 2, 3])(
    'accepte les constructions et conserve deux points pour la position %s',
    (position) => {
      const exercise = generate('4-5', position, 'interactive', 1, true)
      for (let i = 0; i < 3; i++) {
        const figure = exercise.figuresApiGeom![i]
        const points = exercise.antecedentsApiGeom[i]
          .slice(0, exercise.nbPoints[i])
          .map((point) =>
            figure.create('Point', {
              x: -point.x,
              y: -point.y,
              label: `${point.label}'`,
            }),
          )
        if (exercise.typesDeQuestions[i] === 'cercle') {
          figure.create('CircleCenterPoint', {
            center: points[0],
            point: points[1],
          })
        } else {
          figure.create('Polygon', { points })
        }
        expect(exercise.correctionInteractive(i)).toEqual(['OK', 'OK'])
      }
    },
  )
})
