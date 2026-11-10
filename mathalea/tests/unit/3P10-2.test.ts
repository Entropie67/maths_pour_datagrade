import seedrandom from 'seedrandom'
import { expect, it, vi } from 'vitest'
import VariationsCumulees from '../../src/exercices/3e/3P10-2'
import { handleAnswers } from '../../src/lib/interactif/gestionInteractif'
import { miseEnEvidence } from '../../src/lib/outils/embellissements'

vi.mock('../../src/lib/interactif/gestionInteractif', () => ({
  handleAnswers: vi.fn(),
}))
vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

it.each([1, 2, 3])(
  'accorde les réponses aux corrections de population (progressivité %s)',
  (sup2) => {
    seedrandom('gl1w', { global: true })
    vi.mocked(handleAnswers).mockClear()
    const exercice = new VariationsCumulees()
    exercice.sup = '3-4'
    exercice.sup2 = sup2
    exercice.interactif = true
    exercice.nouvelleVersion()
    expect(exercice.listeQuestions).toHaveLength(4)
    for (const [, i, answers] of vi.mocked(handleAnswers).mock.calls) {
      expect(exercice.listeQuestions[i]).not.toContain(' euros')
      expect(exercice.listeQuestions[i]).toContain(' individus')
      for (const [name, answer] of Object.entries(answers)) {
        if (name === 'bareme') continue
        const value = (answer as { value: string }).value
        expect(exercice.listeCorrections[i]).toContain(miseEnEvidence(value))
      }
      const bareme = answers.bareme
      if (typeof bareme === 'function') {
        expect(bareme([1, 1, 1])).toEqual([3, 3])
        expect(bareme([0, 0, 0])).toEqual([0, 3])
      }
    }
  },
)
