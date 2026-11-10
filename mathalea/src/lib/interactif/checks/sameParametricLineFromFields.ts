import type { MathfieldElement } from 'mathlive'
import type { AnswerType, IExercice } from '../../types'
import type { Comparator } from './types'
import {
  expectedCoordinates,
  parametricSystemFromValues,
  type LineDimension,
} from './parametricSystem'

type SameParametricLineCallbackOptions = {
  compare: Comparator
  dimension?: LineDimension
}

function scoreFromResult(result: { isOk: boolean; score?: number }): number {
  return typeof result.score === 'number' ? result.score : result.isOk ? 1 : 0
}

export function sameParametricLineFromFieldsCallback({
  compare,
  dimension = 3,
}: SameParametricLineCallbackOptions) {
  return (
    exercice: IExercice,
    question: number,
    variables: [string, AnswerType][],
    _bareme: (listePoints: number[]) => [number, number],
  ) => {
    const coordinates = expectedCoordinates(dimension)
    const expected = variables[0]?.[1]?.value
    const mathfield = globalThis.document?.querySelector(
      `#champTexteEx${exercice.numeroExercice}Q${question}`,
    ) as MathfieldElement | null

    if (mathfield == null || typeof expected !== 'string') {
      return {
        isOk: false,
        feedback: 'Erreur dans la configuration de la réponse attendue.',
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }

    const values = Object.fromEntries(
      coordinates.map((_, index) => {
        const key = `champ${index + 1}`
        return [key, mathfield.getPromptValue(key) ?? '']
      }),
    )
    const emptyCount = Object.values(values).filter((value) => value === '').length

    if (emptyCount > 0) {
      for (const key of Object.keys(values)) {
        mathfield.setPromptState(key, 'incorrect', true)
      }
      mathfield.classList.add('corrected')
      return {
        isOk: false,
        feedback:
          emptyCount === 1
            ? 'Il manque une réponse dans une zone de saisie.<br>'
            : `Il manque ${emptyCount} réponses dans les zones de saisie.<br>`,
        score: { nbBonnesReponses: 0, nbReponses: 1 },
      }
    }

    const result = compare(parametricSystemFromValues(values, dimension), expected)
    const score = scoreFromResult(result)
    for (const key of Object.keys(values)) {
      mathfield.setPromptState(key, result.isOk ? 'correct' : 'incorrect', true)
    }
    mathfield.classList.add('corrected')

    return {
      isOk: result.isOk,
      feedback: result.feedback ?? '',
      score: {
        nbBonnesReponses: result.isOk ? 1 : score,
        nbReponses: 1,
      },
    }
  }
}
