import type {
  QuizzMultiScoringMode,
  QuizzQuestion,
  QuizzScoring,
} from '../types'

/**
 * Calcul des points du quizz.
 *
 * Les formules sont portées de Razzia (https://github.com/Ralex91/Razzia)
 * — licence MIT, Copyright (c) 2024 Ralex :
 * - `timeToPoint` : décroissance linéaire des points avec le temps de réponse ;
 * - `orderToPoint` : sans limite de temps, décroissance selon l'ordre de réponse ;
 * - ratios par type de question (single 0/1 ; multi strict/balanced/lenient).
 *
 * Extension MathALÉA : trois modes de score choisis à la création du quizz
 * ('full' = Razzia, 'simple' = 1 point par question réussie, 'none' = pas de score).
 */

export const QUIZZ_MAX_POINTS = 1000

/**
 * Points acquis à la réception d'une réponse : maxPoints au départ,
 * décroissance linéaire jusqu'à 0 à la fin du temps imparti.
 */
export function timeToPoint(
  elapsedSeconds: number,
  question: QuizzQuestion,
): number {
  const maxPoints = question.maxPoints ?? QUIZZ_MAX_POINTS
  const points = maxPoints - (maxPoints / question.time) * elapsedSeconds
  return Math.max(0, points)
}

/**
 * Points selon l'ordre d'arrivée des réponses (mode sans limite de temps) :
 * le plus rapide obtient maxPoints, le plus lent maxPoints / 2.
 */
export function orderToPoint(
  answerIndex: number,
  totalPlayers: number,
  maxPoints = QUIZZ_MAX_POINTS,
): number {
  if (totalPlayers <= 1) return maxPoints
  return Math.round(
    maxPoints - (answerIndex / (totalPlayers - 1)) * (maxPoints / 2),
  )
}

/** Ratio de réussite d'une question à une seule bonne réponse : 0 ou 1. */
export function singleScoreRatio(
  question: QuizzQuestion,
  answerIds: number[],
): number {
  return answerIds.length === 1 && question.solutions.includes(answerIds[0])
    ? 1
    : 0
}

/**
 * Ratio de réussite d'une question multi-réponses :
 * - strict : 1 si et seulement si la sélection est exactement la solution ;
 * - balanced : (bonnes − mauvaises) / nombre de solutions, borné à [0, 1] ;
 * - lenient : bonnes / nombre de solutions.
 */
export function multiScoreRatio(
  question: QuizzQuestion,
  answerIds: number[],
  mode: QuizzMultiScoringMode = 'balanced',
): number {
  const { solutions } = question
  if (solutions.length === 0) return 0
  const good = answerIds.filter((id) => solutions.includes(id)).length
  const bad = answerIds.length - good
  switch (mode) {
    case 'strict': {
      const allCorrect = solutions.every((s) => answerIds.includes(s))
      return allCorrect && bad === 0 ? 1 : 0
    }
    case 'lenient':
      return good / solutions.length
    case 'balanced':
    default:
      return Math.max((good - bad) / solutions.length, 0)
  }
}

/** Ratio de réussite dans [0, 1] selon le type de la question. */
export function scoreRatio(
  question: QuizzQuestion,
  answerIds: number[],
  multiMode: QuizzMultiScoringMode = 'balanced',
): number {
  return question.type === 'single'
    ? singleScoreRatio(question, answerIds)
    : multiScoreRatio(question, answerIds, multiMode)
}

export interface QuizzScoreResult {
  /** Ratio de réussite dans [0, 1] (indépendant du mode de score). */
  ratio: number
  /** Points effectivement gagnés selon le mode de score choisi. */
  points: number
  /** Vrai si la réponse est au moins partiellement correcte (sémantique Razzia). */
  correct: boolean
}

/**
 * Convertit un ratio de réussite en points selon le mode de score :
 * - 'full' : points pondérés par la rapidité × ratio (formule Razzia) ;
 * - 'simple' : 1 point si la réponse est entièrement correcte, 0 sinon ;
 * - 'none' : pas de points (le ratio reste calculé pour l'affichage).
 */
export function ratioToPoints(
  ratio: number,
  answerPoints: number,
  scoring: QuizzScoring,
): QuizzScoreResult {
  const correct = ratio > 0
  switch (scoring) {
    case 'simple':
      return { ratio, points: ratio === 1 ? 1 : 0, correct }
    case 'none':
      return { ratio, points: 0, correct }
    case 'full':
    default:
      return { ratio, points: Math.round(answerPoints * ratio), correct }
  }
}
