import { afterEach, describe, expect, it, vi } from 'vitest'
import DecomposerFraction from '../../../src/exercices/can/4e/can4C21-05'
import { fonctionComparaison } from '../../../src/lib/interactif/comparisonFunctions'
import { mathaleaHandleExerciceSimple } from '../../../src/lib/mathalea'

vi.mock('../../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

const originalRandom = Math.random
afterEach(() => {
  Math.random = originalRandom
})

describe('can4C21-05 / 2N30-flash2 : réponses de chaque question', () => {
  it.each([1, 10])(
    'conserve les réponses du tirage YHfg avec %i questions',
    (nbQuestions) => {
      const exercice = new DecomposerFraction()
      exercice.seed = 'YHfg'
      exercice.nbQuestions = nbQuestions
      mathaleaHandleExerciceSimple(exercice, true, 0)

      expect(exercice.listeQuestions).toHaveLength(nbQuestions)
      exercice.listeCorrections.forEach((correction, i) => {
        const fraction = correction.match(/\\dfrac\{(\d+)\}\{(\d+)\}/)
        expect(fraction).not.toBeNull()
        const n = Number(fraction![1])
        const d = Number(fraction![2])
        const entier = Math.trunc(n / d)
        const reponses = exercice.autoCorrection[i].valeur!
        expect(reponses.champ1!.value).toBe(String(entier))
        expect(reponses.champ2!.value).toBe(`\\dfrac{${n - entier * d}}{${d}}`)
        for (const [champ, saisie] of [
          [reponses.champ1!, String(entier)],
          [reponses.champ2!, `\\frac{${2 * (n - entier * d)}}{${2 * d}}`],
        ] as const) {
          expect(
            fonctionComparaison(saisie, String(champ.value), champ.options)
              .isOk,
          ).toBe(true)
          expect(
            fonctionComparaison('0', String(champ.value), champ.options).isOk,
          ).toBe(false)
        }
        expect(reponses.bareme!([1, 1])).toEqual([1, 1])
        expect(reponses.bareme!([1, 0])).toEqual([0, 1])
      })
    },
  )
})
