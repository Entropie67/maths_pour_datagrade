import {
  coeffBaremeExercice,
  pointsMaxQuestion,
} from '../interactif/baremeExercice'
import type { IExercice, QuestionResult, QuestionScore } from '../types'

/** Conserver les points partiels de la question et appliquer le coefficient une seule fois. */
export function scoreQuestionCan(
  exercice: IExercice,
  questionIndex: number,
  result?: QuestionResult,
): QuestionScore {
  const coeff = coeffBaremeExercice(exercice)
  const score =
    typeof result === 'object'
      ? result.score
      : {
          nbBonnesReponses: result
            ? pointsMaxQuestion(exercice, questionIndex)
            : 0,
          nbReponses: pointsMaxQuestion(exercice, questionIndex),
        }
  return {
    nbBonnesReponses: score.nbBonnesReponses * coeff,
    nbReponses: score.nbReponses * coeff,
  }
}

/**
 * Indices de `autoCorrection` (les champs de réponse) portés par une question
 * affichée en CAN. Une question affichée est une entrée de `listeQuestions`,
 * qui peut contenir plusieurs champs : un exercice peut pousser un seul énoncé
 * avec trois `ajouteChampTexteMathLive()` d'indices 0, 1 et 2. Les champs sont
 * alors retrouvés grâce à leur identifiant (`champTexteEx0Q1`, `checkEx0Q1R0`…).
 */
export function autoCorrectionIndicesOfQuestion(
  exercice: IExercice,
  questionIndex: number,
): number[] {
  if (exercice.listeQuestions.length === exercice.autoCorrection?.length) {
    return [questionIndex]
  }
  const questionHtml = String(exercice.listeQuestions[questionIndex] ?? '')
  const fieldIds = questionHtml.matchAll(
    new RegExp(`Ex${exercice.numeroExercice}Q(\\d+)`, 'g'),
  )
  const indices = [...new Set([...fieldIds].map((match) => Number(match[1])))]
    .filter((index) => exercice.autoCorrection?.[index] != null)
    .sort((a, b) => a - b)
  return indices.length > 0 ? indices : [questionIndex]
}

/** Total des points obtenus et possibles, pour l'affichage comme pour le recorder. */
export function totalScoresCan(scores: QuestionScore[]): QuestionScore {
  return scores.reduce(
    (total, score) => ({
      nbBonnesReponses: total.nbBonnesReponses + score.nbBonnesReponses,
      nbReponses: total.nbReponses + score.nbReponses,
    }),
    { nbBonnesReponses: 0, nbReponses: 0 },
  )
}
