import { io } from 'socket.io-client'
import type { QuizzStatus, QuizzStatusDataMap } from '../types'
import type { QuizzEventListener, QuizzStatusListener } from './QuizzTransport'

/**
 * Transport navigateur du mode multi-joueurs (V2) : encapsule la connexion
 * Socket.IO vers le service temps réel et expose la **même surface
 * d'abonnement** que {@link LocalTransport} (`onStatus` / `onEvent`), afin
 * que les écrans du quizz fonctionnent à l'identique.
 *
 * Différences avec la V1 :
 * - le moteur ne tourne PAS dans le navigateur : il est côté serveur, qui
 *   fait autorité (chronomètres, scores) — ici on ne fait que relire le fil ;
 * - le champ `target` des messages V1 n'existe pas sur le fil (le serveur
 *   n'adresse à cette socket que ce qui la concerne) : les statuts relus sont
 *   estampillés 'broadcast' ;
 * - le rôle (manager/joueur) est connu localement, pas besoin de filtrage par
 *   destinataire.
 *
 * Contraintes d'hébergement (o2switch) : long-polling obligatoire, jamais de
 * WebSocket — `transports: ['polling']` est forcé à la connexion.
 */

/** Événements annexes relus vers les abonnés onEvent (noms identiques à la V1,
 * plus `game:totalPlayers`, spécifique au multi-joueurs). */
const FORWARDED_EVENTS = [
  'game:cooldown',
  'game:startCooldown',
  'game:updateQuestion',
  'game:playerAnswer',
  'game:totalPlayers',
  'game:errorMessage',
] as const

/** Surface minimale d'une socket Socket.IO utilisée ici (injectable en test). */
export interface QuizzSocketLike {
  readonly connected: boolean
  on(event: string, listener: (...args: never[]) => void): void
  once(event: string, listener: (...args: never[]) => void): void
  off(event: string, listener?: (...args: never[]) => void): void
  emit(event: string, payload?: unknown): void
  close(): void
}

export interface SocketTransportOptions {
  /** URL du service temps réel (ex. http://localhost:3000). */
  url: string
  /** Chemin sur lequel Socket.IO est servi ('/ws'). */
  path: string
  /** Identifiant persistant du navigateur (uuid v4, localStorage). */
  clientId: string
  /** Fabrique de socket (injectée en test ; `io` de socket.io-client sinon). */
  socketFactory?: (
    url: string,
    clientId: string,
    path: string,
  ) => QuizzSocketLike
}

const defaultSocketFactory = (
  url: string,
  clientId: string,
  path: string,
): QuizzSocketLike =>
  io(url, {
    path,
    transports: ['polling'], // jamais de WebSocket (bloqué par l'hébergement)
    auth: { clientId },
  }) as unknown as QuizzSocketLike

export class SocketTransport {
  private readonly socket: QuizzSocketLike
  private readonly statusListeners = new Set<QuizzStatusListener>()
  private readonly eventListeners = new Set<QuizzEventListener>()

  constructor(options: SocketTransportOptions) {
    const factory = options.socketFactory ?? defaultSocketFactory
    this.socket = factory(options.url, options.clientId, options.path)
    this.socket.on(
      'game:status',
      (payload: {
        name: QuizzStatus
        data: QuizzStatusDataMap[QuizzStatus]
      }) => {
        const message = {
          name: payload.name,
          data: payload.data,
          target: 'broadcast' as const,
        }
        for (const listener of this.statusListeners) listener(message)
      },
    )
    for (const event of FORWARDED_EVENTS) {
      this.socket.on(event, (payload?: unknown) => {
        for (const listener of this.eventListeners) listener(event, payload)
      })
    }
  }

  /** Résout à la première connexion effective de la socket. */
  connect(): Promise<void> {
    if (this.socket.connected) return Promise.resolve()
    return new Promise((resolve, reject) => {
      this.socket.once('connect', () => resolve())
      this.socket.once('connect_error', (error: unknown) => reject(error))
    })
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

  /** Émet un événement du protocole vers le serveur (manager:*, player:*). */
  send(event: string, payload?: unknown): void {
    this.socket.emit(event, payload)
  }

  /**
   * Écoute un événement précis du protocole en provenance du serveur
   * (manager:gameCreated, game:reset, game:results…).
   * Renvoie la fonction de désabonnement.
   */
  onServerEvent<TPayload = unknown>(
    event: string,
    listener: (payload: TPayload) => void,
  ): () => void {
    const wrapped = listener as (...args: never[]) => void
    this.socket.on(event, wrapped)
    return () => this.socket.off(event, wrapped)
  }

  /**
   * Écoute les événements de connexion bas niveau ('connect', 'disconnect',
   * 'connect_error') — utilisé pour rejouer la reconnexion protocole après
   * une coupure transport (la socket reconstruite a un nouvel identifiant,
   * la room côté serveur doit être rejointe explicitement).
   */
  onConnectionEvent(
    event: 'connect' | 'disconnect' | 'connect_error',
    listener: (...args: never[]) => void,
  ): () => void {
    this.socket.on(event, listener)
    return () => this.socket.off(event, listener)
  }

  removeAllListeners(): void {
    this.statusListeners.clear()
    this.eventListeners.clear()
  }

  /** Ferme la connexion (sans tentative de reconnexion automatique). */
  close(): void {
    this.removeAllListeners()
    this.socket.close()
  }
}
