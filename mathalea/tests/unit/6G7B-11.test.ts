import type Point from 'apigeom/src/elements/points/Point'
import seedrandom from 'seedrandom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SymetrieAxialeFigures from '../../src/exercices/6e/6G7B-11'
import { context } from '../../src/modules/context'

vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))
const originalContext = { ...context }
const originalRandom = Math.random
const exercises: SymetrieAxialeFigures[] = []

beforeEach(() => {
  context.isHtml = true
  context.isTypst = false
  document.body.innerHTML = ''
  window.notify = vi.fn()
  window.notifyLocal = vi.fn()
})
afterEach(() => {
  for (const exercise of exercises.splice(0)) {
    for (const figure of exercise.figuresApiGeom) figure.destroy()
  }
  Object.assign(context, originalContext)
  Math.random = originalRandom
})

function generate(
  type: number,
  axis: number,
  aid = 1,
  seed = 'symetrie-axiale',
) {
  seedrandom(seed, { global: true })
  const exercise = new SymetrieAxialeFigures()
  exercises.push(exercise)
  exercise.numeroExercice = 0
  exercise.nbQuestions = 1
  exercise.sup = aid
  exercise.sup2 = String(type)
  exercise.sup4 = axis
  exercise.nouvelleVersion()
  return exercise
}

// Coordonnées calculées indépendamment de la fonction de réflexion d'apiGeom.
function reflected(x: number, y: number, axis: number) {
  switch (axis) {
    case 1:
      return { x, y: -y }
    case 2:
      return { x: -x, y }
    case 3:
      return { x: y, y: x }
    default:
      return { x: -y, y: -x }
  }
}

describe('6G7B-11 : construction de figures par symétrie axiale', () => {
  it.each(
    [1, 2, 3, 4].flatMap((axis) => [1, 2, 3, 4, 5].map((type) => [axis, type])),
  )(
    'corrige les constructions et conserve deux points (axe %s, figure %s)',
    (axis, type) => {
      for (const seed of [
        'symetrie-axiale',
        'autre-tirage',
        'droite-invariante',
      ]) {
        const exercise = generate(type, axis, 1, seed)
        const figure = exercise.figuresApiGeom[0]
        const originals = exercise.antecedents[0]
        for (let k = 0; k < originals.length; k++) {
          for (let j = k + 1; j < originals.length; j++) {
            expect(
              Math.hypot(
                originals[k].x - originals[j].x,
                originals[k].y - originals[j].y,
              ),
            ).toBeGreaterThanOrEqual(3)
          }
        }
        expect(exercise.correctionInteractive(0)).toEqual(['KO', 'KO'])
        const images = exercise.antecedents[0].map(({ x, y }) =>
          figure.create('Point', reflected(x, y, axis)),
        )
        expect(exercise.correctionInteractive(0)).toEqual(['KO', 'OK'])
        switch (type) {
          case 1:
            figure.create('Segment', { point1: images[0], point2: images[1] })
            break
          case 2:
            figure.create('Line', { point1: images[0], point2: images[1] })
            break
          case 3:
            figure.create('Ray', { point1: images[0], point2: images[1] })
            break
          case 4:
            figure.create('CircleCenterPoint', {
              center: images[0],
              point: images[1],
            })
            break
          case 5:
            images.forEach((point, k) =>
              figure.create('Segment', {
                point1: point,
                point2: images[(k + 1) % images.length],
              }),
            )
            expect(exercise.correctionInteractive(0)).toEqual(['OK', 'OK'])
            figure.create('Polygon', { points: images })
            break
        }
        expect(exercise.correctionInteractive(0)).toEqual(['OK', 'OK'])
        expect(exercise.answers[figure.id]).toBeTruthy()
        expect(exercise.antecedents[0].every((point) => !point.isFree)).toBe(
          true,
        )
        if (type === 4) {
          const [a, b] = exercise.antecedents[0]
          const radius = Math.hypot(a.x - b.x, a.y - b.y)
          expect(radius).toBeGreaterThanOrEqual(3)
          expect(Math.abs(a.x) + radius).toBeLessThanOrEqual(8.5)
          expect(Math.abs(a.y) + radius).toBeLessThanOrEqual(8.5)
        }
      }
    },
  )

  it.each([1, 2, 3, 4])(
    'protège les points et écarte le label de l’axe %s après rechargement',
    (axis) => {
      const exercise = generate(1, axis)
      const figure = exercise.figuresApiGeom[0]
      const ids = exercise.antecedents[0].map((point) => point.id)
      const studentPoint = figure.create('Point', { x: -8, y: -8 })
      figure.buttons.get('DRAG')!.click()
      expect(figure.filter(studentPoint)).toBe(true)
      for (const point of exercise.antecedents[0])
        expect(figure.filter(point)).toBe(false)
      figure.loadJson(JSON.parse(figure.json))
      for (const id of ids) {
        const point = figure.elements.get(id) as Point
        expect(point.isFree).toBe(false)
        expect(figure.filter(point)).toBe(false)
      }
      figure.buttons.get('SEGMENT')!.click()
      for (const id of ids)
        expect(figure.filter(figure.elements.get(id) as Point)).toBe(true)
      const axisPoint = figure.elements.get(exercise.axes[0].point2.id) as Point
      const label = axisPoint.elementTextLabel!
      const distance =
        axis <= 2
          ? Math.abs(axis === 1 ? label.dyInPixels : label.dxInPixels)
          : Math.abs(
              axis === 3
                ? label.dxInPixels - label.dyInPixels
                : label.dxInPixels + label.dyInPixels,
            ) / Math.SQRT2
      expect(distance).toBeGreaterThanOrEqual(12)
    },
  )

  it.each([1, 2, 3, 4])(
    'produit HTML, Typst et LaTeX avec l’aide %s',
    (aid) => {
      for (const format of ['html', 'typst', 'latex']) {
        context.isHtml = format !== 'latex'
        context.isTypst = format === 'typst'
        const exercise = generate(4, 3, aid)
        const [question, correction] = [
          exercise.listeQuestions[0],
          exercise.listeCorrections[0],
        ]
        const marker = format === 'latex' ? '\\begin{tikzpicture}' : '<svg'
        expect(question).toContain(marker)
        expect(correction).toContain(marker)
        expect(question + correction).not.toMatch(/NaN|undefined/)
        if (format === 'typst') {
          expect(question).toContain('<text')
          const figure = exercise.figuresApiGeom[0]
          const [a, b] = exercise.antecedents[0]
          const radius = Math.hypot(a.x - b.x, a.y - b.y)
          expect(
            (Math.abs(figure.xToSx(radius) - figure.xToSx(0)) * 2.54) / 96,
          ).toBeGreaterThanOrEqual(2)
        }
      }
    },
  )
})
