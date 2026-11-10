import seedrandom from 'seedrandom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ConstructionsSymetrieCentraleFigures from '../../src/exercices/5e/5G3A-4'
import { svgToTypstImage } from '../../src/components/setup/typst/latexToTypst'
import { context } from '../../src/modules/context'

vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

const originalRandom = Math.random
const originalContext = { ...context }
const exercises: ConstructionsSymetrieCentraleFigures[] = []

function generate(typst: boolean, aid: number, type = '4', seed = '63KE') {
  seedrandom(seed, { global: true })
  context.isHtml = true
  context.isTypst = typst
  const exercise = new ConstructionsSymetrieCentraleFigures()
  exercises.push(exercise)
  exercise.numeroExercice = 0
  exercise.nbQuestions = 1
  exercise.interactif = false
  exercise.sup = aid
  exercise.sup2 = type
  exercise.nouvelleVersion()
  return exercise
}

afterEach(() => {
  for (const exercise of exercises.splice(0)) {
    for (const figure of exercise.figuresApiGeom ?? []) figure.destroy()
  }
  Math.random = originalRandom
  Object.assign(context, originalContext)
})

describe('5G3A-4 : dimensions des cercles en Typst', () => {
  it.each([1, 2, 3, 4])(
    'agrandit le cercle et sa correction avec le type d’aide %s sans changer le tirage',
    (aid) => {
      for (const seed of ['63KE', 'cercle-minimum', 'symetrie']) {
        const html = generate(false, aid, '4', seed)
        const nextRandom = Math.random()
        const typst = generate(true, aid, '4', seed)
        expect(Math.random()).toBe(nextRandom)
        const coordinates = (exercise: ConstructionsSymetrieCentraleFigures) =>
          exercise.antecedentsApiGeom[0].map(({ x, y, label }) => ({
            x,
            y,
            label,
          }))
        expect(coordinates(typst)).toEqual(coordinates(html))
        expect(typst.centresApiGeom[0].label).toBe(html.centresApiGeom[0].label)

        const [center, point] = typst.antecedentsApiGeom[0]
        const radius = Math.hypot(point.x - center.x, point.y - center.y)
        const figure = typst.figuresApiGeom![0]
        const radiusPx = Math.abs(figure.xToSx(radius) - figure.xToSx(0))
        expect((radiusPx * 2.54) / 96).toBeGreaterThanOrEqual(2)
        for (const text of [
          typst.listeQuestions[0],
          typst.listeCorrections[0],
        ]) {
          const svg = text.match(/<svg[\s\S]*?<\/svg>/)![0]
          const widthPx = Number(svg.match(/\bwidth="([\d.]+)"/)![1])
          const widthPt = Number(
            svgToTypstImage(svg).match(/width: ([\d.]+)pt/)![1],
          )
          // L'export ne doit pas réduire la taille intrinsèque de la figure.
          expect(widthPt).toBeCloseTo(widthPx * 0.75, 1)
          expect(widthPx).toBeGreaterThan(figure.width)
        }
        expect(html.figuresApiGeom![0].width).toBe(300)
        expect(figure.width).toBe(420)
      }
    },
  )

  it.each(['1', '2', '3', '5'])(
    'conserve la taille des autres figures (%s)',
    (type) => {
      const html = generate(false, 4, type)
      const typst = generate(true, 4, type)
      expect(typst.figuresApiGeom![0].width).toBe(html.figuresApiGeom![0].width)
    },
  )
})
