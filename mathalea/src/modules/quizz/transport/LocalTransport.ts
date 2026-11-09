import type { QuizzStatus, QuizzStatusDataMap } from '../types'
import type {
  QuizzEventListener,
  QuizzStatusListener,
  QuizzTransport,
} from './QuizzTransport'

/**
 * Transport local (V1) : bus en mémoire relié aux stores Svelte.
 * Les statuts gardent leur destinataire ('broadcast' ou id de joueur) afin
 * que l'interface puisse distinguer les écrans « joueur » et « manager »
 * comme le ferait le serveur en mode multi-joueurs.
 */
export class LocalTransport implements QuizzTransport {
  private readonly statusListeners = new Set<QuizzStatusListener>()
  private readonly eventListeners = new Set<QuizzEventListener>()

  broadcast<T extends QuizzStatus>(status: T, data: QuizzStatusDataMap[T]): void {
    this.dispatchStatus({ name: status, data, target: 'broadcast' })
  }

  send<T extends QuizzStatus>(
    playerId: string,
    status: T,
    data: QuizzStatusDataMap[T],
  ): void {
    this.dispatchStatus({ name: status, data, target: playerId })
  }

  emit(event: string, payload?: unknown): void {
    for (const listener of this.eventListeners) listener(event, payload)
  }

  private dispatchStatus(message: {
    name: QuizzStatus
    data: QuizzStatusDataMap[QuizzStatus]
    target: 'broadcast' | string
  }): void {
    for (const listener of this.statusListeners) listener(message)
  }

  /** S'abonne aux changements de statut. Renvoie la fonction de désabonnement. */
  onStatus(listener: QuizzStatusListener): () => void {
    this.statusListeners.add(listener)
    return () => this.statusListeners.delete(listener)
  }

  /** S'abonne aux événements annexes. Renvoie la fonction de désabonnement. */
  onEvent(listener: QuizzEventListener): () => void {
    this.eventListeners.add(listener)
    return () => this.eventListeners.delete(listener)
  }

  removeAllListeners(): void {
    this.statusListeners.clear()
    this.eventListeners.clear()
  }
}
