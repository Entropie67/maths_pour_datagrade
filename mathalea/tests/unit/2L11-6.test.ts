import { afterEach, describe, expect, it, vi } from 'vitest'
import FactoriserAvecFacteurCommun from '../../src/exercices/2e/2L11-6'
import { fonctionComparaison } from '../../src/lib/interactif/comparisonFunctions'
import * as outils from '../../src/modules/outils'

afterEach(() => vi.restoreAllMocks())

describe('2L11-6 — facteur implicite', () => {
  it.each<[string, number, number, number, string, string]>([
    ['10', 2, -3, -5, '(2x-3)(x-5)+2x-3', '(2x-3)(x-4)'],
    ['11', 2, -3, -5, '(2x-3)(x-5)-2x+3', '(2x-3)(x-6)'],
    ['10', -1, 3, -5, '(-x+3)(x-5)-x+3', '(-x+3)(x-4)'],
    ['11', -1, 3, -5, '(-x+3)(x-5)+x-3', '(-x+3)(x-6)'],
    ['10', 2, -3, -1, '(2x-3)(x-1)+2x-3', '(2x-3)x'],
    ['11', 2, -3, 1, '(2x-3)(x+1)-2x+3', '(2x-3)x'],
  ])('type %s avec a=%s, b=%s, d=%s', (type, a, b, d, expression, answer) => {
    const tirage = vi.spyOn(outils, 'randint')
    for (const valeur of [a, b, 1, d, 3, 4]) {
      tirage.mockReturnValueOnce(valeur)
    }
    const exercice = new FactoriserAvecFacteurCommun()
    exercice.numeroExercice = 0
    exercice.nbQuestions = 1
    exercice.sup = type
    exercice.interactif = true
    exercice.nouvelleVersion()

    expect(exercice.listeQuestions).toHaveLength(1)
    expect(exercice.listeQuestions[0]).toContain(`A=${expression}=`)
    expect(exercice.listeCorrections[0]).toContain('\\times 1')
    expect(exercice.listeCorrections[0]).toContain('\\begin{aligned}')
    const reponse = exercice.autoCorrection[0].valeur!.reponse
    expect(
      fonctionComparaison(answer, reponse.value, reponse.options).isOk,
    ).toBe(true)
    expect(
      fonctionComparaison(expression, reponse.value, reponse.options).isOk,
    ).toBe(false)
  })
})
