import { writable } from 'svelte/store'
import type { QuizzStatusMessage } from '../../modules/quizz/transport/QuizzTransport'
import type { QuizzUpdateQuestion } from '../../modules/quizz/types'

/**
 * Stores de la vue quizz, alimentés par le transport (local en V1).
 * `quizzStatus` est l'équivalent Svelte de l'événement `game:status` de
 * Razzia : les layouts ne consomment que ce store et ignorent le moteur.
 */
export const quizzStatus = writable<QuizzStatusMessage | null>(null)

/** Progression dans le quizz (question courante / total). */
export const quizzProgress = writable<QuizzUpdateQuestion>({
  current: 0,
  total: 0,
})

/** Compte à rebours courant (ticks émis pendant les phases chronométrées). */
export const quizzCooldownTick = writable<number>(0)

/** Nombre de joueurs ayant répondu à la question en cours. */
export const quizzAnswerCount = writable<number>(0)

/** Nombre de joueurs connectés à la room (mode multi-joueurs). */
export const quizzTotalPlayers = writable<number>(0)

/** Remet les stores à leur état initial (nouveau quizz, démontage). */
export function resetQuizzStores(): void {
  quizzStatus.set(null)
  quizzProgress.set({ current: 0, total: 0 })
  quizzCooldownTick.set(0)
  quizzAnswerCount.set(0)
  quizzTotalPlayers.set(0)
}
