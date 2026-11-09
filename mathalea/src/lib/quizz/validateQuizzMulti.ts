import type { Quizz } from '../../modules/quizz/types'

/**
 * Validation locale d'un quizz avant envoi au serveur temps réel (mode
 * multi-joueurs) : les mêmes bornes que le schéma zod appliqué par le
 * serveur à `manager:createGame`, pour éviter un refus `invalid-payload`
 * sans explication. Renvoie le premier problème trouvé (message français),
 * ou null si le quizz est envoyable.
 *
 * Bornes serveur : `subject` 1–120 car. ; 1–50 questions ; `question`
 * ≤ 4000 car. ; `answers` 2–4 (chacune ≤ 2000 car.) ; `solutions` indices
 * valides non vides (exactement 1 si `single`) ; `cooldown` entier 3–15 ;
 * `time` entier 5–120 ou -1 ; `correction` ≤ 8000 car.
 */

export const MULTI_MAX_QUESTIONS = 50
export const MULTI_MAX_SUBJECT_LENGTH = 120
export const MULTI_MAX_QUESTION_LENGTH = 4000
export const MULTI_MAX_ANSWER_LENGTH = 2000
export const MULTI_MAX_CORRECTION_LENGTH = 8000
export const MULTI_MIN_ANSWERS = 2
export const MULTI_MAX_ANSWERS = 4
export const MULTI_MIN_COOLDOWN = 3
export const MULTI_MAX_COOLDOWN = 15
export const MULTI_MIN_TIME = 5
export const MULTI_MAX_TIME = 120
export const MULTI_NO_TIME_LIMIT = -1

const isInteger = (value: number): boolean => Number.isInteger(value)

export function validateQuizzForMulti(quizz: Quizz): string | null {
  const subject = quizz.subject.trim()
  if (subject.length === 0) return 'Le titre du quizz est vide.'
  if (subject.length > MULTI_MAX_SUBJECT_LENGTH) {
    return `Le titre du quizz dépasse ${MULTI_MAX_SUBJECT_LENGTH} caractères.`
  }
  if (quizz.questions.length === 0)
    return 'Le quizz ne contient aucune question.'
  if (quizz.questions.length > MULTI_MAX_QUESTIONS) {
    return `Le quizz dépasse la limite de ${MULTI_MAX_QUESTIONS} questions : allégez la sélection d'exercices.`
  }
  for (const [index, question] of quizz.questions.entries()) {
    const numero = index + 1
    if (question.question.length === 0) {
      return `La question ${numero} est vide.`
    }
    if (question.question.length > MULTI_MAX_QUESTION_LENGTH) {
      return `L'énoncé de la question ${numero} dépasse ${MULTI_MAX_QUESTION_LENGTH} caractères.`
    }
    if (
      question.answers.length < MULTI_MIN_ANSWERS ||
      question.answers.length > MULTI_MAX_ANSWERS
    ) {
      return `La question ${numero} doit proposer entre ${MULTI_MIN_ANSWERS} et ${MULTI_MAX_ANSWERS} réponses.`
    }
    if (
      question.answers.some((answer) => answer.length > MULTI_MAX_ANSWER_LENGTH)
    ) {
      return `Une réponse de la question ${numero} dépasse ${MULTI_MAX_ANSWER_LENGTH} caractères.`
    }
    if (question.solutions.length === 0) {
      return `La question ${numero} n'a aucune bonne réponse.`
    }
    if (
      question.solutions.some(
        (solution) =>
          !isInteger(solution) ||
          solution < 0 ||
          solution >= question.answers.length,
      )
    ) {
      return `Les solutions de la question ${numero} sont invalides.`
    }
    if (question.type === 'single' && question.solutions.length !== 1) {
      return `La question ${numero} est à réponse unique mais a plusieurs solutions.`
    }
    if (
      !isInteger(question.cooldown) ||
      question.cooldown < MULTI_MIN_COOLDOWN ||
      question.cooldown > MULTI_MAX_COOLDOWN
    ) {
      return `Le temps de lecture de la question ${numero} doit être entre ${MULTI_MIN_COOLDOWN} et ${MULTI_MAX_COOLDOWN} s.`
    }
    const unlimited = question.time === MULTI_NO_TIME_LIMIT
    if (
      !isInteger(question.time) ||
      (!unlimited &&
        (question.time < MULTI_MIN_TIME || question.time > MULTI_MAX_TIME))
    ) {
      return `Le temps de réponse de la question ${numero} doit être entre ${MULTI_MIN_TIME} et ${MULTI_MAX_TIME} s.`
    }
    if (question.correction.length > MULTI_MAX_CORRECTION_LENGTH) {
      return `La correction de la question ${numero} dépasse ${MULTI_MAX_CORRECTION_LENGTH} caractères.`
    }
  }
  return null
}
