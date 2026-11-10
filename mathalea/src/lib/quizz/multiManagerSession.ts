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
  Quizz,
  QuizzPlayer,
  QuizzScoring,
  QuizzStatusDataMap,
  QuizzUpdateQuestion,
  QuizzUsernameMode,
} from '../../modules/quizz/types'
import { QUIZZ_WS_PATH, QUIZZ_WS_URL } from './config'
import { getQuizzClientId } from './quizzClientId'
import { translateQuizzError } from './quizzMultiErrors'
import type { QuizzGameResults } from './quizzResults'
import {
  quizzAnswerCount,
  quizzCooldownTick,
  quizzProgress,
  quizzStatus,
  quizzTotalPlayers,
  resetQuizzStores,
} from '../stores/quizzStore'

/**
 * Session du manager (enseignant) en mode multi-joueurs : machine à états du
 * parcours « identification par code e-mail → création de la room → lobby →
 * pilotage de la partie → résultats ».
 *
 * Le moteur tourne côté serveur : cette classe ne fait que traduire le
 * protocole Socket.IO en stores Svelte consommés par les composants. Les
 * statuts de jeu sont versés dans les stores partagés de quizzStore (même
 * alimentation qu'en V1 via le transport).
 */

export type ManagerStep =
  /** Connexion initiale (ou reconnexion en cours). */
  | 'connecting'
  /** Saisie de l'adresse professionnelle. */
  | 'email'
  /** Saisie du code reçu par courriel. */
  | 'code'
  /** Vérification du code puis création de la room. */
  | 'creating'
  /** Room ouverte : PIN affiché, joueurs qui entrent. */
  | 'lobby'
  /** Partie en cours (le statut courant est dans quizzStatus). */
  | 'game'
  /** Room fermée ou expirée (message dans endMessage). */
  | 'ended'
  /** Erreur bloquante (connexion impossible, room introuvable…). */
  | 'error'

export interface ManagerSessionOptions {
  /** Quizz complet à envoyer à createGame (absent en cas de reconnexion). */
  quizz?: Quizz
  scoring?: QuizzScoring
  /** Mode d'attribution des pseudos (vérifié côté serveur à player:login). */
  usernameMode?: QuizzUsernameMode
  /**
   * Habillage sonore choisi par le créateur : devient un réglage de la room
   * (transmis aux joueurs à la jointure) — défaut true.
   */
  sound?: boolean
  /** gameId présent dans l'URL : reconnexion à une room existante. */
  reconnectGameId?: string
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

export class QuizzMultiManagerSession {
  readonly step = writable<ManagerStep>('connecting')
  /** Joueurs de la room (lobby et reconnexions). */
  readonly players = writable<QuizzPlayer[]>([])
  /** PIN de la room (lobby). */
  readonly inviteCode = writable('')
  /** Erreur transitoire affichée sur l'écran courant (bannière). */
  readonly lastError = writable<string | null>(null)
  /** Information transitoire (joueur exclu, départ…). */
  readonly notice = writable<string | null>(null)
  /** Message de l'écran de fin (fermeture, expiration). */
  readonly endMessage = writable<string | null>(null)
  /** Charge game:results (export CSV) — null si déjà consommée (reconnexion). */
  readonly results = writable<QuizzGameResults | null>(null)
  /** Perte de connexion transport (reconnexion automatique en cours). */
  readonly connectionLost = writable(false)
  /** Validité du code e-mail en secondes (affichage indicatif). */
  readonly emailCodeExpiresIn = writable<number | null>(null)

  private transport: SocketTransport | null = null
  private readonly unsubscribers: Array<() => void> = []
  private gameId: string | null = null
  private email = ''
  private ticket: string | null = null
  private hasConnectedOnce = false
  private disposed = false

  constructor(private readonly options: ManagerSessionOptions) {}

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
    const reconnectGameId = this.options.reconnectGameId
    if (reconnectGameId != null && reconnectGameId.length > 0) {
      this.gameId = reconnectGameId
      this.transport.send('manager:reconnect', { gameId: reconnectGameId })
    } else {
      this.step.set('email')
    }
  }

  // ----- Commandes issues de l'interface -----

  /** Envoie un code de vérification à l'adresse professionnelle saisie. */
  requestEmailCode(email: string): void {
    this.email = email.trim()
    this.lastError.set(null)
    this.transport?.send('manager:requestEmailCode', { email: this.email })
  }

  /** Vérifie le code saisi puis, au ticket obtenu, crée la room. */
  verifyEmailCode(code: string): void {
    this.lastError.set(null)
    this.step.set('creating')
    this.transport?.send('manager:verifyEmailCode', {
      email: this.email,
      code: code.trim(),
    })
  }

  /** Fournit le quizz à créer (construit de façon asynchrone par le composant). */
  setQuizz(
    quizz: Quizz,
    scoring: QuizzScoring,
    usernameMode: QuizzUsernameMode = 'free',
  ): void {
    this.options.quizz = quizz
    this.options.scoring = scoring
    this.options.usernameMode = usernameMode
  }

  /** Abonne un écouteur aux événements annexes bruts (habillage sonore). */
  onGameEvent(listener: QuizzEventListener): () => void {
    return this.transport?.onEvent(listener) ?? (() => {})
  }

  /** Abonne un écouteur aux statuts bruts (habillage sonore). */
  onGameStatus(listener: (message: QuizzStatusMessage) => void): () => void {
    return this.transport?.onStatus(listener) ?? (() => {})
  }

  startGame(): void {
    if (this.gameId != null)
      this.transport?.send('manager:startGame', { gameId: this.gameId })
  }

  nextQuestion(): void {
    if (this.gameId != null)
      this.transport?.send('manager:nextQuestion', { gameId: this.gameId })
  }

  showLeaderboard(): void {
    if (this.gameId != null)
      this.transport?.send('manager:showLeaderboard', { gameId: this.gameId })
  }

  abortQuestion(): void {
    if (this.gameId != null)
      this.transport?.send('manager:abortQuiz', { gameId: this.gameId })
  }

  kickPlayer(playerId: string): void {
    if (this.gameId != null) {
      this.transport?.send('manager:kickPlayer', {
        gameId: this.gameId,
        playerId,
      })
    }
  }

  /** Ferme définitivement la room (game:reset 'closed' pour tous). */
  closeGame(): void {
    if (this.gameId != null)
      this.transport?.send('manager:closeGame', { gameId: this.gameId })
  }

  /** Abandonne l'identification en cours et revient à la saisie de l'e-mail. */
  backToEmail(): void {
    this.ticket = null
    this.lastError.set(null)
    this.step.set('email')
  }

  // ----- Câblage du protocole -----

  private wire(): void {
    const transport = this.transport
    if (transport == null) return
    this.unsubscribers.push(
      transport.onStatus((message) => this.handleStatus(message)),
      transport.onEvent((event, payload) => this.handleEvent(event, payload)),
      transport.onServerEvent<{ expiresIn: number }>(
        'manager:emailCodeSent',
        ({ expiresIn }) => {
          this.emailCodeExpiresIn.set(expiresIn)
          this.step.set('code')
        },
      ),
      transport.onServerEvent<{ ticket: string }>(
        'manager:emailVerified',
        ({ ticket }) => {
          this.ticket = ticket
          const quizz = this.options.quizz
          if (quizz == null) {
            // Sans quizz local, impossible de créer : retour à l'e-mail.
            this.step.set('email')
            return
          }
          this.transport?.send('manager:createGame', {
            ticket,
            quizz,
            scoring: this.options.scoring ?? 'full',
            // Le serveur fait autorité sur la vérification des pseudos :
            // 'safe' exige un prénom de la liste autorisée (player:login).
            usernameMode: this.options.usernameMode ?? 'free',
            // Réglage sonore de la room : initialisé sur l'appareil de chaque
            // joueur à la jointure (game:successRoom), réglable ensuite localement.
            sound: this.options.sound ?? true,
          })
        },
      ),
      transport.onServerEvent<{ gameId: string; inviteCode: string }>(
        'manager:gameCreated',
        ({ gameId, inviteCode }) => {
          this.gameId = gameId
          this.inviteCode.set(inviteCode)
          this.options.onGameId?.(gameId)
          // Le statut SHOW_ROOM qui suit immédiatement bascule au lobby.
        },
      ),
      transport.onServerEvent<QuizzPlayer>('manager:newPlayer', (player) => {
        this.players.update((list) => [...list, player])
        this.notice.set(`${player.username} a rejoint la partie`)
      }),
      transport.onServerEvent<{ playerId: string }>(
        'manager:playerLeft',
        ({ playerId }) => {
          this.removePlayer(playerId)
        },
      ),
      transport.onServerEvent<{ playerId: string; username: string }>(
        'manager:playerKicked',
        ({ playerId, username }) => {
          this.removePlayer(playerId)
          this.notice.set(`${username} a été exclu de la partie`)
        },
      ),
      transport.onServerEvent<{
        status: { name: string; data: unknown } | null
        players: QuizzPlayer[]
        currentQuestion: QuizzUpdateQuestion
      }>('manager:successReconnect', (payload) => {
        this.connectionLost.set(false)
        this.players.set(payload.players)
        quizzProgress.set(payload.currentQuestion)
        if (payload.status != null) {
          this.handleStatus({
            name: payload.status.name as QuizzStatusMessage['name'],
            data: payload.status.data as QuizzStatusMessage['data'],
            target: 'broadcast',
          })
        } else {
          this.step.set('game')
        }
      }),
      transport.onServerEvent<QuizzGameResults>('game:results', (results) => {
        this.results.set(results)
      }),
      transport.onServerEvent<string>('game:reset', (reason) => {
        this.handleReset(reason)
      }),
      transport.onConnectionEvent('disconnect', () => {
        if (this.disposed) return
        this.connectionLost.set(true)
      }),
      transport.onConnectionEvent('connect', () => {
        // Reprise après une coupure transport : la nouvelle socket a un
        // nouvel identifiant, il faut rejoindre la room explicitement.
        if (this.disposed || !this.hasConnectedOnce) return
        this.hasConnectedOnce = true
        this.connectionLost.set(false)
        const step = get(this.step)
        if (this.gameId != null && (step === 'game' || step === 'lobby')) {
          this.transport?.send('manager:reconnect', { gameId: this.gameId })
        }
      }),
    )
  }

  private removePlayer(playerId: string): void {
    this.players.update((list) => list.filter((p) => p.id !== playerId))
  }

  private handleStatus(message: QuizzStatusMessage): void {
    if (this.disposed) return
    if (message.name === 'SHOW_ROOM') {
      const data = message.data as QuizzStatusDataMap['SHOW_ROOM']
      if (data.inviteCode != null) this.inviteCode.set(data.inviteCode)
      this.players.set(data.players)
      this.step.set('lobby')
      return
    }
    // Le serveur n'adresse jamais SHOW_RESULT (verdict personnel) au manager.
    if (message.name === 'SHOW_RESULT') return
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
    // Erreurs fatales de session : la room n'existe plus ou n'est pas à nous.
    if (key === 'game-not-found' || key === 'not-manager') {
      if (step === 'connecting') {
        this.options.onGameId?.(null)
        this.step.set('error')
      } else if (step === 'lobby' || step === 'game') {
        this.endSession(translateQuizzError(raw))
        return
      }
      this.lastError.set(translateQuizzError(raw))
      return
    }
    if (step === 'creating') {
      // Identification à refaire (ticket brûlé, code faux, quota…).
      this.ticket = null
      this.step.set(
        key.startsWith('code-') ||
          key === 'too-many-attempts' ||
          key === 'no-pending-code'
          ? 'code'
          : 'email',
      )
      this.lastError.set(translateQuizzError(raw))
      return
    }
    this.lastError.set(translateQuizzError(raw))
  }

  private handleReset(reason: string): void {
    const messages: Record<string, string> = {
      closed: 'La partie a été fermée.',
      expired: 'La partie a expiré.',
      kicked: 'Vous avez été exclu de la partie.',
      'unknown-session': 'Session introuvable.',
    }
    this.endSession(messages[reason] ?? 'La partie est terminée.')
  }

  private endSession(message: string): void {
    this.options.onGameId?.(null)
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
