import type { IExercice } from '../../../lib/types'

export function countMathField(exercise: IExercice): number {
  if (exercise == null) return 0
  let numbOfAnswerFields: number = 0
  if (exercise.interactif) {
    if (!exercise.autoCorrection || !Array.isArray(exercise.autoCorrection)) {
      return 0
    }
    for (const autoCorr of exercise.autoCorrection) {
      if (autoCorr?.formatInteractif != null) {
        if (
          autoCorr.formatInteractif === 'mathlive' ||
          autoCorr.formatInteractif === 'qcm'
        ) {
          numbOfAnswerFields++
        }
      }
    }
    if ('goodAnswers' in exercise && Array.isArray(exercise.goodAnswers)) {
      for (const goodAnswer of exercise.goodAnswers) {
        if (Array.isArray(goodAnswer)) {
          numbOfAnswerFields += goodAnswer.length
        } else {
          numbOfAnswerFields++
        }
      }
    }
    return numbOfAnswerFields
  }
  return 0
}
