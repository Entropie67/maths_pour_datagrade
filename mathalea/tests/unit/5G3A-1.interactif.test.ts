import seedrandom from 'seedrandom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SymetrieCentralePoint from '../../src/exercices/5e/5G3A-1'
import { context } from '../../src/modules/context'

vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

const originalRandom = Math.random
const exercises: SymetrieCentralePoint[] = []

function generate(
  interactive = true,
  notebook = 1,
  offCenter = false,
  seed = 'symetrie',
  nbPoints?: number,
) {
  seedrandom(seed, { global: true })
  const exercise = new SymetrieCentralePoint()
  exercises.push(exercise)
  exercise.numeroExercice = 0
  exercise.interactif = interactive
  exercise.nbQuestions = 3
  exercise.sup2 = notebook
  exercise.sup4 = offCenter
  if (nbPoints !== undefined) exercise.sup5 = nbPoints
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
  context.isHtml = true
  context.isTypst = false
  context.isAmc = false
})

describe('5G3A-1 : construction interactive des symétriques', () => {
  it.each([1, 2, 3])(
    'conserve les tirages et trois points par question pour le cahier %s',
    (notebook) => {
      for (const offCenter of [false, true]) {
        for (const seed of ['symetrie', 'autre-serie']) {
          const printable = generate(false, notebook, offCenter, seed)
          const nextRandom = Math.random()
          const interactive = generate(true, notebook, offCenter, seed)
          expect(Math.random()).toBe(nextRandom)
          const withoutIds = (texts: string[]) =>
            texts.map((text) =>
              text
                .replace(/\bid="[^"]*"|\bstroke-opacity="[^"]*"/g, '')
                .replace(/\s+/g, ' '),
            )
          expect(withoutIds(interactive.listeCorrections)).toEqual(
            withoutIds(printable.listeCorrections),
          )
          expect(interactive.goodAnswers).toHaveLength(3)
          for (let i = 0; i < 3; i++) {
            expect(interactive.goodAnswers[i]).toHaveLength(3)
            expect(interactive.listeQuestions[i]).not.toContain('Reproduire')
            const figure = interactive.figuresApiGeom![i]
            for (const answer of interactive.goodAnswers[i]) {
              figure.create('Point', answer)
              expect(answer.x).toBeGreaterThan(figure.xMin)
              expect(answer.x).toBeLessThan(figure.xMax)
              expect(answer.y).toBeGreaterThan(figure.yMin)
              expect(answer.y).toBeLessThan(figure.yMax)
            }
            expect(interactive.correctionInteractive(i)).toEqual([
              'OK',
              'OK',
              'OK',
            ])
            expect(figure.isDynamic).toBe(false)
            expect(
              JSON.parse(interactive.answers![figure.id] as string).options,
            ).not.toHaveProperty('tools')
          }
        }
      }
    },
  )

  it('refuse un point mal nommé, mal placé ou dupliqué, avec un score partiel', () => {
    const exercise = generate()
    const figure = exercise.figuresApiGeom![1]
    const [first, second, third] = exercise.goodAnswers[1]
    figure.create('Point', first)
    figure.create('Point', { ...second, x: second.x + 1 })
    figure.create('Point', { ...third, label: 'Z' })
    const feedback = document.createElement('div')
    feedback.id = 'feedbackEx0Q1'
    document.body.appendChild(feedback)
    expect(exercise.correctionInteractive(1)).toEqual(['OK', 'KO', 'KO'])
    expect(feedback.textContent).toContain('Revoir la position')
    expect(feedback.textContent).toContain('Construire et nommer')
    expect(feedback.textContent).not.toContain('coordonnées')
    figure.create('Point', first)
    expect(exercise.correctionInteractive(1)).toEqual(['KO', 'KO', 'KO'])
    expect(feedback.textContent).toContain('Nommer un seul point')
  })

  it("fixe les points donnés et active le magnétisme dès qu'une grille est affichée", () => {
    for (const notebook of [1, 2, 3]) {
      const exercise = generate(true, notebook)
      const figure = exercise.figuresApiGeom![0]
      const points = [...figure.elements.values()].filter(
        (element) => element.type === 'Point',
      )
      expect(points).toHaveLength(4)
      for (const point of points) {
        expect(point).toMatchObject({ isFree: false, isDeletable: false })
      }
      figure.saveState()
      figure.create('Point', exercise.goodAnswers[0][0])
      figure.saveState()
      figure.undo()
      for (const point of points) {
        expect(figure.elements.get(point.id)).toMatchObject({
          isFree: false,
          isDeletable: false,
        })
      }
      expect(figure.snapGrid).toBe(notebook < 3)
      expect(
        [...figure.elements.values()].filter(
          (element) => element.type === 'Grid',
        ),
      ).toHaveLength(notebook === 3 ? 0 : notebook)
    }
  })

  it.each([1, 2, 3, 4, 5])(
    'permet de choisir le nombre de points (%s)',
    (nbPoints) => {
      for (const notebook of [1, 2, 3]) {
        const exercise = generate(true, notebook, false, 'symetrie', nbPoints)
        for (let i = 0; i < 3; i++) {
          expect(exercise.goodAnswers[i]).toHaveLength(nbPoints)
          const labels = exercise.goodAnswers[i].map((a) => a.label)
          expect(new Set(labels).size).toBe(nbPoints)
          const figure = exercise.figuresApiGeom![i]
          for (const answer of exercise.goodAnswers[i]) {
            figure.create('Point', answer)
            expect(answer.x).toBeGreaterThan(figure.xMin)
            expect(answer.x).toBeLessThan(figure.xMax)
            expect(answer.y).toBeGreaterThan(figure.yMin)
            expect(answer.y).toBeLessThan(figure.yMax)
          }
          expect(exercise.correctionInteractive(i)).toEqual(
            Array(nbPoints).fill('OK'),
          )
        }
      }
    },
  )

  it.each([1, 4, 5])("adapte l'énoncé imprimable à %s point(s)", (nbPoints) => {
    context.isHtml = false
    const exercise = generate(false, 1, false, 'symetrie', nbPoints)
    const enonce = exercise.listeQuestions[0]
    expect(enonce.match(/Construire le point/g)).toHaveLength(nbPoints)
    expect(enonce).toContain('Coder la figure')
  })

  it("n'affiche pas la lettre a) quand il n'y a qu'un point à construire", () => {
    const seul = generate(true, 1, false, 'symetrie', 1)
    expect(seul.listeQuestions[0]).toContain('Construire le point')
    expect(seul.listeQuestions[0]).not.toContain('a)')
    const plusieurs = generate(true, 1, false, 'symetrie', 2)
    expect(plusieurs.listeQuestions[0]).toContain('a)')
    expect(plusieurs.listeQuestions[0]).toContain('b)')
  })

  it('ne demande pas de reproduire la figure en sortie Typst', () => {
    context.isTypst = true
    const exercise = generate(false)
    expect(exercise.listeQuestions[0]).not.toContain('Reproduire')
    expect(exercise.listeQuestions[0]).toContain('Coder la figure')
  })

  it.each(['latex', 'typst', 'amc'])(
    'conserve la figure imprimable en sortie %s',
    (output) => {
      context.isHtml = output === 'typst'
      context.isTypst = output === 'typst'
      context.isAmc = output === 'amc'
      const exercise = generate()
      expect(exercise.figuresApiGeom).toHaveLength(0)
      expect(exercise.listeQuestions[0]).not.toContain('apigeom')
      expect(exercise.listeQuestions[0]).toContain('Coder la figure')
      if (output === 'amc') expect(exercise.questionsAMC).toHaveLength(3)
    },
  )
})
