export type CanState =
  'start' | 'countdown' | 'race' | 'end' | 'solutions' | 'canHomeScreen'
export type CanSolutionsMode = 'gathered' | 'split'
/** Le temps est compté pour toute la course ou pour chaque question. */
export type CanTimerMode = 'global' | 'question'
/** Le feedback est donné à la fin de la course ou après chaque question. */
export type CanFeedbackMode = 'end' | 'each'
export type CanOptions = {
  durationInMinutes: number
  /**
   * Chronomètre global (`durationInMinutes`) ou chronomètre par question
   * (`durationPerQuestionInSeconds`). Sans effet si `isTimerDisabled`.
   */
  timerMode: CanTimerMode
  durationPerQuestionInSeconds: number
  /**
   * `each` : l'élève valide chaque question et voit aussitôt si sa réponse est
   * juste (la navigation devient linéaire). Le bilan global est de toute façon
   * affiché à la fin. Nécessite `isInteractive`.
   */
  feedbackMode: CanFeedbackMode
  title: string
  subTitle: string
  isChoosen: boolean
  solutionsAccess: boolean
  solutionsMode: CanSolutionsMode
  isInteractive: boolean
  /** Course sans limite de temps : le chronomètre n'est ni affiché ni décompté. */
  isTimerDisabled: boolean
  remainingTimeInSeconds: number
  questionGetAnswer: boolean[]
  state: CanState
}
export interface ButtonWithMathaleaListener extends HTMLButtonElement {
  hasMathaleaListener: boolean
}
