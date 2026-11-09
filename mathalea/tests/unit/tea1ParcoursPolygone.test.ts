import { afterEach, expect, it, vi } from 'vitest'
import ParcoursPolygoneRegulier from '../../src/exercices/TEx/TEA1-27'
import * as outils from '../../src/modules/outils'

afterEach(() => vi.restoreAllMocks())

it.each(Array.from({ length: 6 }, (_, i) => i + 3))(
  'retrouve les sommets dans les deux sens pour %i côtés, y compris un tour entier',
  (sides) => {
    for (const direction of [0, 1]) {
      for (const remainder of [0, 1, sides - 1]) {
        const steps = sides * 10 + remainder
        const draw = vi.spyOn(outils, 'randint')
        draw
          .mockReturnValueOnce(sides - 1)
          .mockReturnValueOnce(steps)
          .mockReturnValueOnce(direction)
        const exercise = new ParcoursPolygoneRegulier()
        exercise.sup = String(sides - 2)
        exercise.nouvelleVersion()
        expect(draw).toHaveBeenCalledWith(20, 999)
        const answers = exercise.autoCorrection[0].valeur!
        const sign = direction === 0 ? 1 : -1
        const letters = 'ABCDEFGH'
        expect(answers.field0!.value).toBe(
          letters[(sides - 1 + sign * remainder + sides) % sides],
        )
        expect(answers.field1!.value).toBe(
          letters[(sides - 1 - sign * remainder + sides) % sides],
        )
        expect(answers.bareme!([1, 1])).toEqual([2, 2])
        expect(answers.bareme!([1, 0])).toEqual([1, 2])
        expect(exercise.listeQuestions[0]).toContain(
          `$${sides}$ arcs identiques`,
        )
        expect(exercise.listeCorrections[0]).not.toContain('undefined')
        draw.mockRestore()
      }
    }
  },
)
