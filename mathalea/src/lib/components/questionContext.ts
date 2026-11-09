import type { IExercice } from '../types'

/** Composer le contexte commun, puis éventuellement l'énoncé autonome. */
export function composeQuestionContext(
  exercise: Pick<IExercice, 'consigne' | 'introduction'>,
  question = '',
): string {
  return [exercise.consigne, exercise.introduction, question]
    .filter((part) => typeof part === 'string' && part.trim() !== '')
    .join('<br>\n')
}
