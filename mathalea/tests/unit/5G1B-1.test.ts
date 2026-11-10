import seedrandom from 'seedrandom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SymAxeEtCoordonnees from '../../src/exercices/5e/5G1B-1'
import { MultiMathfieldElement } from '../../src/lib/customElements/MultiMathfield'
import { fonctionComparaison } from '../../src/lib/interactif/comparisonFunctions'
import { setOutputHtml } from '../../src/modules/context'

afterEach(() => vi.restoreAllMocks())

describe('5G1B-1 : réponses de plusieurs figures', () => {
  it('conserve les trois réponses de chacune des 21 questions du lien signalé', () => {
    setOutputHtml()
    vi.spyOn(Math, 'random').mockImplementation(seedrandom('LIXv'))
    const exercice = new SymAxeEtCoordonnees()
    exercice.numeroExercice = 0
    exercice.interactif = true
    exercice.nbQuestions = 21
    exercice.nouvelleVersion()

    expect(exercice.listeQuestions).toHaveLength(21)
    expect(exercice.autoCorrection).toHaveLength(21)
    const ids: string[] = []
    exercice.listeQuestions.forEach((question, i) => {
      const template = document.createElement('template')
      template.innerHTML = question
      const field = template.content.querySelector('multi-mathfield')
      expect(field).not.toBeNull()
      ids.push(field!.id)
      const answers = exercice.autoCorrection[i].valeur!
      expect(MultiMathfieldElement.pointsMaxQuestion(exercice, i)).toBe(3)
      for (const name of ['field0', 'field1', 'field2'] as const) {
        const answer = answers[name]!
        const value = String(answer.value)
        expect(exercice.listeCorrections[i]).toContain(value)
        expect(fonctionComparaison(value, value, answer.options).isOk).toBe(
          true,
        )
        expect(fonctionComparaison('99;99', value, answer.options).isOk).toBe(
          false,
        )
      }
    })
    expect(new Set(ids).size).toBe(21)
  })
})
