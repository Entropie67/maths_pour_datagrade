import type { IExercice } from '../lib/types'

/**
 * Sauvegarde les réponses d'un exercice de type tableau dont on connait le nombre de lignes et de colonnes
 */
export function saveAnswersFromTable(
  exercice: IExercice,
  indiceQuestion: number,
  numberOfLines: number,
  numberOfColumns: number,
) {
  for (let i = 1; i < numberOfLines + 1; i++) {
    for (let j = 1; j < numberOfColumns + 1; j++) {
      const input = document.querySelector(
        `#champTexteEx${exercice.numeroExercice}Q${indiceQuestion}L${i}C${j}`,
      ) as HTMLInputElement
      if (input != null) {
        const key = `Ex${exercice.numeroExercice}Q${indiceQuestion}L${i}C${j}`
        if (input.value.length > 0 && typeof exercice.answers === 'object') {
          exercice.answers[key] = input.value
        }
      }
    }
  }
}
