import { afterEach, expect, it, vi } from 'vitest'
import LimitesEnUnReel from '../../src/exercices/TSpe/TSA2-32'
import * as outils from '../../src/modules/outils'

afterEach(() => vi.restoreAllMocks())

it.each([
  { type: 1, a: -3, b: 2, c: 1, left: '-\\infty', right: '+\\infty' },
  { type: 2, a: 0, b: 3, c: 2, left: '+\\infty', right: '+\\infty' },
  { type: 3, a: 2, b: 3, c: -5, left: '-\\infty', right: '+\\infty' },
  { type: 3, a: 2, b: -3, c: 5, left: '+\\infty', right: '-\\infty' },
  { type: 3, a: -2, b: 2, c: 3, left: '+\\infty', right: '-\\infty' },
  { type: 3, a: 0, b: -1, c: 7, left: '-\\infty', right: '+\\infty' },
  // Dénominateur sx+d avec s ≠ 1, de signe quelconque
  { type: 1, a: -3, b: 2, c: 1, s: -2, left: '+\\infty', right: '-\\infty' },
  { type: 1, a: 4, b: 2, c: 1, s: 3, left: '-\\infty', right: '+\\infty' },
  { type: 2, a: 2, b: 3, c: 2, s: -4, left: '+\\infty', right: '+\\infty' },
  { type: 3, a: 2, b: 3, c: -5, s: -2, left: '+\\infty', right: '-\\infty' },
  { type: 3, a: -2, b: 2, c: 3, s: 5, left: '+\\infty', right: '-\\infty' },
  { type: 3, a: 0, b: -1, c: 7, s: -3, left: '+\\infty', right: '-\\infty' },
])(
  'respecte les signes pour le type $type, a=$a, b=$b, c=$c, s=$s',
  ({ type, a, b, c, s = 1, left, right }) => {
    const point = type === 2 && a === 0 ? 1 : a
    vi.spyOn(outils, 'randint')
      .mockReturnValueOnce(a)
      .mockReturnValueOnce(b)
      .mockReturnValueOnce(c)
      .mockReturnValueOnce(s)
    const exercise = new LimitesEnUnReel()
    exercise.interactif = true
    exercise.nbQuestions = 1
    exercise.sup = type
    exercise.nouvelleVersion()
    const answers = exercise.autoCorrection[0].valeur!
    expect(answers.field0.value).toBe(left)
    expect(answers.field1.value).toBe(right)
    expect(exercise.listeQuestions[0]).toContain(`x\\to ${point}^{-}`)
    expect(exercise.listeQuestions[0]).toContain(`x\\to ${point}^{+}`)
    expect(answers.bareme!([1, 1])).toEqual([1, 1])
    expect(answers.bareme!([1, 0])).toEqual([0, 1])
    for (const [side, expected] of [
      [-1, left],
      [1, right],
    ] as const) {
      const x = point + side * 1e-6
      const value =
        type === 1
          ? 1 / (s * (x - a))
          : type === 2
            ? 1 / (s * (x - point)) ** 2
            : (b * x + c) / (s * (x - a))
      expect(Math.sign(value)).toBe(expected.startsWith('+') ? 1 : -1)
      expect(Math.abs(value)).toBeGreaterThan(100_000)
    }
  },
)

it('demande les limites à gauche et à droite sans champs ni pointillés hors interactivité', () => {
  vi.spyOn(outils, 'randint')
    .mockReturnValueOnce(6)
    .mockReturnValueOnce(2)
    .mockReturnValueOnce(1)
  const exercise = new LimitesEnUnReel()
  exercise.interactif = false
  exercise.nbQuestions = 1
  exercise.sup = 1
  exercise.nouvelleVersion()
  expect(exercise.listeQuestions[0]).toContain(
    'Calculer les limites à gauche et à droite de $f$ en $6$.',
  )
  expect(exercise.listeQuestions[0]).not.toMatch(
    /\\ldots|\\dot|\^\{-\}|\^\{\+\}|multi-mathfield/,
  )
})
