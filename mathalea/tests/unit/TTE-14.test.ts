import seedrandom from 'seedrandom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SensVariationKFoisAPuissanceX from '../../src/exercices/TT/TTE-14'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

function creeExercice(sup: number, sup2: number, detaillee: boolean) {
  seedrandom('TTE-14', { global: true })
  const exercice = new SensVariationKFoisAPuissanceX()
  exercice.interactif = true
  exercice.numeroExercice = 0
  exercice.nbQuestions = 8
  exercice.sup = sup
  exercice.sup2 = sup2
  exercice.sup3 = detaillee
  exercice.nouvelleVersion()
  return exercice
}

describe('TTE-14 : sens de variation de k × a^x', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('produit 8 questions avec une réponse attendue', () => {
    const exercice = creeExercice(3, 3, false)
    expect(exercice.listeQuestions).toHaveLength(8)
    for (const reponse of exercice.autoCorrection) {
      expect(['strictement croissante', 'strictement décroissante']).toContain(
        reponse.valeur?.reponse?.value,
      )
    }
  })

  it('a > 1 et k > 0 : croissante', () => {
    const exercice = creeExercice(1, 1, false)
    for (const correction of exercice.listeCorrections) {
      expect(correction).toContain('strictement croissante')
    }
  })

  it('a < 1 et k > 0 : décroissante', () => {
    const exercice = creeExercice(2, 1, true)
    for (const correction of exercice.listeCorrections) {
      expect(correction).toContain('strictement décroissante')
      expect(correction).toContain('x\\lt y')
    }
  })

  it('a < 1 et k < 0 : croissante', () => {
    const exercice = creeExercice(2, 2, false)
    for (const correction of exercice.listeCorrections) {
      expect(correction).toContain('strictement croissante')
    }
  })
})
