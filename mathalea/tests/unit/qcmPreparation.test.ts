import { describe, expect, it, vi } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import { prepareQcmPropositions } from '../../src/lib/interactif/qcm'

function createExerciseWithQcm(
  propositions: Array<{ texte: string; statut?: boolean }>,
  options: Record<string, unknown> = {},
) {
  const exercice = new Exercice()
  exercice.autoCorrection[0] = {
    propositions,
    options,
  }
  return exercice
}

describe('prepareQcmPropositions', () => {
  it('elimine les mauvaises propositions en doublon', () => {
    const exercice = createExerciseWithQcm(
      [
        { texte: '$4$', statut: true },
        { texte: '$5$', statut: false },
        { texte: '$5$', statut: false },
      ],
      { ordered: true },
    )

    prepareQcmPropositions(exercice, 0)

    expect(exercice.autoCorrection[0].propositions).toEqual([
      { texte: '$4$', statut: true },
      { texte: '$5$', statut: false },
    ])
  })

  it('conserve une proposition vraie quand elle doublonne une fausse', () => {
    const exercice = createExerciseWithQcm(
      [
        { texte: '$4$', statut: false },
        { texte: '$4$', statut: true },
        { texte: '$5$', statut: false },
      ],
      { ordered: true },
    )

    prepareQcmPropositions(exercice, 0)

    expect(exercice.autoCorrection[0].propositions).toEqual([
      { texte: '$4$', statut: true },
      { texte: '$5$', statut: false },
    ])
  })

  it('place Vrai puis Faux en tete sans melanger', () => {
    const randomSpy = vi.spyOn(Math, 'random')
    const exercice = createExerciseWithQcm(
      [
        { texte: 'Autre', statut: false },
        { texte: 'Faux', statut: false },
        { texte: 'Vrai', statut: true },
      ],
      { ordered: false },
    )

    const preparation = prepareQcmPropositions(exercice, 0)

    expect(
      exercice.autoCorrection[0].propositions?.map((p) => p.texte),
    ).toEqual(['Vrai', 'Faux', 'Autre'])
    expect(preparation.indexes).toEqual([])
    expect(randomSpy).not.toHaveBeenCalled()
    randomSpy.mockRestore()
  })

  it('respecte ordered=true', () => {
    const randomSpy = vi.spyOn(Math, 'random')
    const exercice = createExerciseWithQcm(
      [
        { texte: 'A', statut: true },
        { texte: 'B', statut: false },
        { texte: 'C', statut: false },
      ],
      { ordered: true },
    )

    const preparation = prepareQcmPropositions(exercice, 0)

    expect(
      exercice.autoCorrection[0].propositions?.map((p) => p.texte),
    ).toEqual(['A', 'B', 'C'])
    expect(preparation.indexes).toEqual([])
    expect(randomSpy).not.toHaveBeenCalled()
    randomSpy.mockRestore()
  })

  it('melange seulement les choix autorises par lastChoice', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
    const exercice = createExerciseWithQcm(
      [
        { texte: 'A', statut: true },
        { texte: 'B', statut: false },
        { texte: 'C', statut: false },
        { texte: 'Je ne sais pas', statut: false },
      ],
      { ordered: false, lastChoice: 2 },
    )

    const preparation = prepareQcmPropositions(exercice, 0)

    expect(
      exercice.autoCorrection[0].propositions?.map((p) => p.texte),
    ).toEqual(['B', 'C', 'A', 'Je ne sais pas'])
    expect(preparation.indexes).toEqual([1, 2, 0, 3])
    randomSpy.mockRestore()
  })
})
