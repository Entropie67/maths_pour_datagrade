import { writable } from 'svelte/store'
import type { CanOptions } from '../types/can'
export const canOptions = writable<CanOptions>({
  durationInMinutes: 4,
  timerMode: 'global',
  durationPerQuestionInSeconds: 30,
  feedbackMode: 'end',
  title: 'Course aux Nombres',
  subTitle: new Date().getFullYear().toString(),
  isChoosen: false,
  solutionsAccess: true,
  solutionsMode: 'gathered',
  // La Course aux nombres est interactive par défaut : les liens antérieurs au
  // paramètre d'URL `canI` doivent rester interactifs.
  isInteractive: true,
  isTimerDisabled: false,
  remainingTimeInSeconds: 0,
  questionGetAnswer: [],
  state: 'start',
})
