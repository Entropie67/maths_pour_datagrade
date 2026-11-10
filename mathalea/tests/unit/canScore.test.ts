import { describe, expect, it } from 'vitest'
import {
  scoreQuestionCan,
  totalScoresCan,
} from '../../src/lib/components/canScore'
import type { IExercice } from '../../src/lib/types'

const exercice = {
  coeffBareme: 3,
  autoCorrection: [{ formatInteractif: 'custom' }],
} as unknown as IExercice

describe('barème en Course aux nombres', () => {
  it('pondère une réponse juste ou fausse et conserve un maximum fixe', () => {
    expect(scoreQuestionCan(exercice, 0, true)).toEqual({
      nbBonnesReponses: 3,
      nbReponses: 3,
    })
    expect(scoreQuestionCan(exercice, 0, false)).toEqual({
      nbBonnesReponses: 0,
      nbReponses: 3,
    })
  })

  it('conserve les points partiels même si la question est globalement fausse', () => {
    const partial = scoreQuestionCan(exercice, 0, {
      isOk: false,
      feedback: '',
      score: { nbBonnesReponses: 2, nbReponses: 5 },
    })
    expect(partial).toEqual({ nbBonnesReponses: 6, nbReponses: 15 })
    expect(
      totalScoresCan([partial, scoreQuestionCan(exercice, 0, true)]),
    ).toEqual({ nbBonnesReponses: 9, nbReponses: 18 })
  })

  it('garde le score historique pour un exercice à un point sans coefficient', () => {
    expect(
      scoreQuestionCan({ ...exercice, coeffBareme: undefined }, 0, true),
    ).toEqual({ nbBonnesReponses: 1, nbReponses: 1 })
  })
})
