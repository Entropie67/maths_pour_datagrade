import { afterEach, expect, it, vi } from 'vitest'
import RestesSommeDifference from '../../src/exercices/TEx/TEA1-26'
import * as outils from '../../src/modules/outils'

afterEach(() => vi.restoreAllMocks())

it.each([
  [7, 4, 6, 3, 5],
  [7, 1, 6, 0, 2],
  [7, 6, 1, 0, 5],
  [7, 4, 4, 1, 0],
  [3, 2, 2, 1, 0],
])(
  'détermine les restes pour le tirage (%i, %i, %i)',
  (d, a, b, sum, difference) => {
    const draw = vi
      .spyOn(outils, 'randint')
      .mockReturnValueOnce(d)
      .mockReturnValueOnce(a)
      .mockReturnValueOnce(b)
    const exercise = new RestesSommeDifference()
    exercise.interactif = true
    exercise.nouvelleVersion()
    expect(draw).toHaveBeenNthCalledWith(2, 1, d - 1)
    expect(draw).toHaveBeenNthCalledWith(3, d - a, d - 1)
    expect(a + b).toBeGreaterThanOrEqual(d)
    const answers = exercise.autoCorrection[0].valeur!
    expect(Number(answers.champ1.value)).toBe(sum)
    expect(Number(answers.champ2.value)).toBe(difference)
    expect(exercise.listeQuestions[0]).toContain('$a+b$')
    expect(exercise.listeQuestions[0]).toContain('$a-b$')
    for (const [operation, remainder] of [
      [a + b, sum],
      [a - b, difference],
    ]) {
      expect(remainder).toBeGreaterThanOrEqual(0)
      expect(remainder).toBeLessThan(d)
      expect(Number.isInteger((operation - remainder) / d)).toBe(true)
    }
    expect(exercise.listeCorrections[0]).toContain(`0\\leqslant ${sum}<${d}`)
    expect(exercise.listeCorrections[0]).toContain(
      `0\\leqslant ${difference}<${d}`,
    )
  },
)
