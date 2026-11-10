import type { QuizzStatus, QuizzStatusDataMap } from '../types'

/**
 * Interface de transport du moteur de quizz : la surface exacte que Razzia
 * injecte dans son RoundManager (broadcast / send / événements de room).
 *
 * En V1, {@link LocalTransport} la remplit avec un bus en mémoire.
 * En V2 (multi-joueurs temps réel), un SocketTransport la remplira avec
 * socket.io — le moteur et les composants d'affichage resteront inchangés.
 */
export interface QuizzTransport {
  /** Diffuse un statut à tous les participants. */
  broadcast<T extends QuizzStatus>(status: T, data: QuizzStatusDataMap[T]): void
  /** Envoie un statut à un joueur précis. */
  send<T extends QuizzStatus>(
    playerId: string,
    status: T,
    data: QuizzStatusDataMap[T],
  ): void
  /** Émet un événement annexe (ticks de cooldown, compteur de question…). */
  emit(event: string, payload?: unknown): void
}

export interface QuizzStatusMessage<T extends QuizzStatus = QuizzStatus> {
  name: T
  data: QuizzStatusDataMap[T]
  /** 'broadcast' ou l'identifiant du joueur destinataire. */
  target: 'broadcast' | string
}

export type QuizzStatusListener = (message: QuizzStatusMessage) => void
export type QuizzEventListener = (event: string, payload?: unknown) => void
