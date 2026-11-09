import { get, writable } from 'svelte/store'
import type {
  QuizzEventListener,
  QuizzStatusMessage,
} from '../../modules/quizz/transport/QuizzTransport'
import {
  SocketTransport,
  type QuizzSocketLike,
} from '../../modules/quizz/transport/SocketTransport'
import type {
  QuizzPlayer,
  QuizzUpdateQuestion,
  QuizzUsernameMode,
} from '../../modules/quizz/types'
import { QUIZZ_WS_PATH, QUIZZ_WS_URL } from './config'
import { getQuizzClientId } from './quizzClientId'
import { translateQuizzError } from './quizzMultiErrors'
import {
  quizzAnswerCount,
  quizzCooldownTick,
  quizzProgress,
  quizzStatus,
  quizzTotalPlayers,
  resetQuizzStores,
} from '../stores/quizzStore'

/**
 * Session d'un joueur (élève) en mode multi-joueurs : machine à états du
 * parcours « PIN → pseudo → attente → jeu », avec reconnexion après
 * rechargement de page ou coupure réseau.
 *
 * Séquence de reconnexion (le siège est retrouvé via le clientId du
 * handshake) : `player:join` (PIN) puis `player:reconnect { gameId }` — le
 * serveur restitue alors le dernier statut pertinent et les points.
 *
 * Le moteur tourne côté serveur : les statuts de jeu sont versés dans les
 * stores partagés de quizzStore, que les layouts consomment comme en V1.
 */

export type PlayerStep =
  /** Connexion initiale. */
  | 'connecting'
  /** Saisie du PIN. */
  | 'pin'
  /** Jointure de la room en cours. */
  | 'joining'
  /** Saisie du pseudo. */
  | 'pseudo'
  /** En jeu (attente ou partie : le statut courant est dans quizzStatus). */
  | 'game'
  /** Exclusion, fermeture ou expiration (message dans endMessage). */
  | 'ended'
  /** Erreur bloquante (connexion impossible). */
  | 'error'

export interface PlayerSessionOptions {
  /** PIN présent dans l'URL (lien de jointure) : jointure automatique. */
  pin?: string
  /** gameId présent dans l'URL : reconnexion à un siège existant. */
  reconnectGameId?: string
  /** Persiste le PIN dans l'URL (null pour l'effacer). */
  onPin?: (pin: string | null) => void
  /** Persiste le gameId dans l'URL (null pour l'effacer). */
  onGameId?: (gameId: string | null) => void
  /** Fabrique de socket (tests). */
  socketFactory?: (
    url: string,
    clientId: string,
    path: string,
  ) => QuizzSocketLike
  /** Identifiant navigateur (tests ; localStorage sinon). */
  clientId?: string
}

export class QuizzMultiPlayerSession {
  readonly step = writable<PlayerStep>('connecting')
  /** Erreur transitoire affichée sur l'écran courant. */
  readonly lastError = writable<string | null>(null)
  /** Message de l'écran de fin (exclusion, fermeture, expiration). */
  readonly endMessage = writable<string | null>(null)
  /** Identité et points du joueur (restitués à la reconnexion). */
  readonly myPlayer = writable<QuizzPlayer | null>(null)
  /**
   * Mode d'attribution des pseudos de la room (transmis par
   * game:successRoom) : 'safe' → l'écran de saisie demande un prénom de
   * la liste autorisée, vérifié par le serveur à player:login.
   */
  readonly usernameMode = writable<QuizzUsernameMode>('free')
  /**
   * Habillage sonore choisi par le créateur de la room (transmis par
   * game:successRoom) : état initial du bouton son de l'appareil, qui
   * reste ensuite libre d'être changé localement.
   */
  readonly sound = writable<boolean>(true)
  /** Perte de connexion transport (reconnexion automatique en cours). */
  readonly connectionLost = writable(false)

  private transport: SocketTransport | null = null
  private readonly unsubscribers: Array<() => void> = []
  private pin: string | null = null
  private gameId: string | null = null
  private hasUsername = false
  private hasConnectedOnce = false
  private disposed = false

  constructor(private readonly options: PlayerSessionOptions) {}

  /** Crée le transport, câble le protocole et ouvre la connexion. */
  async init(): Promise<void> {
    resetQuizzStores()
    this.transport = new SocketTransport({
      url: QUIZZ_WS_URL,
      path: QUIZZ_WS_PATH,
      clientId: this.options.clientId ?? getQuizzClientId(),
      socketFactory: this.options.socketFactory,
    })
    this.wire()
    try {
      await this.transport.connect()
    } catch {
      this.step.set('error')
      this.lastError.set(
        'Impossible de joindre le serveur de jeu en ligne. Vérifiez votre connexion et réessayez.',
      )
      return
    }
    this.hasConnectedOnce = true
    const pin = this.options.pin
    if (pin != null && pin.length > 0) {
      // Lien de jointure (ou rechargement de page) : tentative automatique.
      this.step.set('joining')
      this.join(pin, this.options.reconnectGameId != null)
    } else {
      this.step.set('pin')
    }
  }

  // ----- Commandes issues de l'interface -----

  /** Joint la room correspondant au PIN saisi. */
  submitPin(pin: string): void {
    const cleaned = pin.trim()
    this.lastError.set(null)
    if (!/^\d{6}$/.test(cleaned)) {
      this.lastError.set('Le PIN contient exactement 6 chiffres.')
      return
    }
    this.step.set('joining')
    this.join(cleaned, false)
  }

  /** Entre en jeu sous le pseudo saisi. */
  submitUsername(username: string): void {
    const cleaned = username.trim()
    this.lastError.set(null)
    if (cleaned.length === 0 || cleaned.length > 20) {
      this.lastError.set('Le pseudo doit contenir entre 1 et 20 caractères.')
      return
    }
    if (this.gameId == null) return
    this.transport?.send('player:login', {
      gameId: this.gameId,
      data: { username: cleaned },
    })
  }

  /** Envoie la réponse à la question en cours (première réponse seule compte). */
  answer(answerIds: number[]): void {
    if (this.gameId == null) return
    this.transport?.send('player:selectedAnswer', {
      gameId: this.gameId,
      data: { answerKeys: answerIds },
    })
  }

  /** Quitte la partie (siège libéré au lobby, marqué déconnecté en cours). */
  leave(): void {
    if (this.gameId != null) {
      this.transport?.send('player:leave', { gameId: this.gameId })
    }
  }

  /** Abonne un écouteur aux événements annexes bruts (habillage sonore). */
  onGameEvent(listener: QuizzEventListener): () => void {
    return this.transport?.onEvent(listener) ?? (() => {})
  }

  /** Abonne un écouteur aux statuts bruts (habillage sonore). */
  onGameStatus(listener: (message: QuizzStatusMessage) => void): () => void {
    return this.transport?.onStatus(listener) ?? (() => {})
  }

  /** Repart à l'écran de saisie du PIN (après une fin de partie). */
  backToPin(): void {
    this.pin = null
    this.gameId = null
    this.hasUsername = false
    this.options.onPin?.(null)
    this.options.onGameId?.(null)
    this.lastError.set(null)
    resetQuizzStores()
    this.step.set('pin')
  }

  // ----- Câblage du protocole -----

  /** Joint la room ; si reconnect, rejoue ensuite player:reconnect. */
  private join(pin: string, reconnect: boolean): void {
    this.pin = pin
    this.reconnectAfterJoin = reconnect
    this.transport?.send('player:join', pin)
    // La suite arrive dans game:successRoom (voir wire).
  }

  private reconnectAfterJoin = false

  private wire(): void {
    const transport = this.transport
    if (transport == null) return
    this.unsubscribers.push(
      transport.onStatus((message) => this.handleStatus(message)),
      transport.onEvent((event, payload) => this.handleEvent(event, payload)),
      transport.onServerEvent<{
        gameId: string
        usernameMode?: QuizzUsernameMode
        sound?: boolean
      }>('game:successRoom', ({ gameId, usernameMode, sound }) => {
        this.gameId = gameId
        if (usernameMode != null) this.usernameMode.set(usernameMode)
        if (typeof sound === 'boolean') this.sound.set(sound)
        this.options.onPin?.(this.pin)
        this.options.onGameId?.(gameId)
        if (this.reconnectAfterJoin) {
          // Rechargement de page : le siège est retrouvé via le clientId.
          this.transport?.send('player:reconnect', { gameId })
        } else {
          this.step.set('pseudo')
        }
      }),
      transport.onServerEvent('game:successJoin', () => {
        this.hasUsername = true
        this.step.set('game')
      }),
      transport.onServerEvent<{
        gameId: string
        status: { name: string; data: unknown } | null
        player: QuizzPlayer | null
        currentQuestion: QuizzUpdateQuestion
      }>('player:successReconnect', (payload) => {
        this.connectionLost.set(false)
        this.hasUsername = true
        this.myPlayer.set(payload.player)
        quizzProgress.set(payload.currentQuestion)
        if (payload.status != null) {
          quizzStatus.set({
            name: payload.status.name as QuizzStatusMessage['name'],
            data: payload.status.data as QuizzStatusMessage['data'],
            target: 'broadcast',
          })
        }
        this.step.set('game')
      }),
      transport.onServerEvent<string>('game:reset', (reason) => {
        this.handleReset(reason)
      }),
      transport.onConnectionEvent('disconnect', () => {
        if (this.disposed) return
        this.connectionLost.set(true)
      }),
      transport.onConnectionEvent('connect', () => {
        // Reprise après une coupure transport : nouvelle socket côté serveur,
        // il faut rejoindre la room et restituer le siège explicitement.
        if (this.disposed || !this.hasConnectedOnce) return
        this.hasConnectedOnce = true
        if (
          this.pin != null &&
          this.gameId != null &&
          get(this.step) === 'game'
        ) {
          this.join(this.pin, true)
        } else {
          this.connectionLost.set(false)
        }
      }),
    )
  }

  private handleStatus(message: QuizzStatusMessage): void {
    if (this.disposed) return
    // Jamais adressés aux joueurs : écrans réservés au manager.
    if (message.name === 'SHOW_RESPONSES') return
    if (message.name === 'SHOW_LEADERBOARD') return
    if (message.name === 'SHOW_ROOM') return
    // Suivi du total de points pour le badge du joueur.
    if (message.name === 'SHOW_RESULT') {
      const data = message.data as { myPoints?: number }
      if (typeof data.myPoints === 'number') {
        this.myPlayer.update((player) =>
          player == null ? player : { ...player, points: data.myPoints ?? 0 },
        )
      }
    }
    quizzStatus.set(message)
    this.step.set('game')
  }

  private handleEvent(event: string, payload?: unknown): void {
    if (this.disposed) return
    if (event === 'game:updateQuestion') {
      quizzProgress.set(payload as QuizzUpdateQuestion)
    } else if (event === 'game:cooldown') {
      quizzCooldownTick.set(payload as number)
    } else if (event === 'game:playerAnswer') {
      quizzAnswerCount.set(payload as number)
    } else if (event === 'game:totalPlayers') {
      quizzTotalPlayers.set(payload as number)
    } else if (event === 'game:errorMessage') {
      this.handleErrorMessage(payload)
    }
  }

  private handleErrorMessage(raw: unknown): void {
    const key = typeof raw === 'string' ? raw : ''
    const step = get(this.step)
    // Jointure impossible : retour à la saisie du PIN avec le motif.
    if (
      key === 'pin-unknown' ||
      key === 'game-started' ||
      key === 'room-full' ||
      key === 'quota-exceeded'
    ) {
      if (step === 'joining') {
        this.options.onGameId?.(null)
        this.step.set('pin')
        this.lastError.set(translateQuizzError(raw))
      } else if (step === 'game') {
        // La jointure de récupération (après coupure réseau) a échoué :
        // la room n'existe plus côté serveur.
        this.endSession(translateQuizzError(raw))
      } else {
        this.lastError.set(translateQuizzError(raw))
      }
      return
    }
    // Siège perdu (room expirée entre la jointure et le login) : on repart au PIN.
    if (key === 'seat-not-found' || key === 'game-not-found') {
      if (step === 'game') {
        this.endSession(translateQuizzError(raw))
        return
      }
      this.options.onGameId?.(null)
      this.lastError.set(translateQuizzError(raw))
      if (step === 'pseudo' || step === 'joining') this.step.set('pin')
      return
    }
    this.lastError.set(translateQuizzError(raw))
  }

  private handleReset(reason: string): void {
    const step = get(this.step)
    if (
      reason === 'unknown-session' &&
      (step === 'joining' || step === 'pseudo')
    ) {
      // Siège fraîchement créé mais sans pseudo : on poursuit à la saisie.
      this.step.set('pseudo')
      return
    }
    const messages: Record<string, string> = {
      kicked: 'Vous avez été exclu de la partie par l’enseignant.',
      closed: 'La partie a été fermée par l’enseignant.',
      expired: 'La partie a expiré.',
      'unknown-session': 'Session introuvable : la partie a peut-être expiré.',
    }
    this.endSession(messages[reason] ?? 'La partie est terminée.')
  }

  private endSession(message: string): void {
    this.options.onGameId?.(null)
    this.hasUsername = false
    this.endMessage.set(message)
    this.step.set('ended')
  }

  /** Désabonne tout et ferme la connexion (démontage du composant). */
  dispose(): void {
    this.disposed = true
    for (const unsubscribe of this.unsubscribers) unsubscribe()
    this.unsubscribers.length = 0
    this.transport?.close()
    this.transport = null
    resetQuizzStores()
  }
}
