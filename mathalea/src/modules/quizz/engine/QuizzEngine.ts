import {
  QUIZZ_EVENTS,
  QUIZZ_STATUS,
  type Quizz,
  type QuizzAnswer,
  type QuizzMode,
  type QuizzMultiScoringMode,
  type QuizzPlayer,
  type QuizzQuestion,
  type QuizzScoring,
} from '../types'
import type { QuizzTransport } from '../transport/QuizzTransport'
import { CooldownTimer } from './CooldownTimer'
import type { QuizzPlayerManager } from './QuizzPlayerManager'
import {
  orderToPoint,
  ratioToPoints,
  scoreRatio,
  timeToPoint,
} from './scoring'

export const QUIZZ_START_COUNTDOWN = 3
export const QUIZZ_PREPARED_DELAY = 2
export const QUIZZ_NO_TIME_LIMIT = -1

type QuizzPhase =
  | 'idle'
  | 'start'
  | 'prepared'
  | 'question'
  | 'select'
  | 'results'
  | 'leaderboard'
  | 'finished'

export interface QuizzEngineOptions {
  quizz: Quizz
  players: QuizzPlayerManager
  transport: QuizzTransport
  mode: QuizzMode
  scoring: QuizzScoring
  multiScoringMode?: QuizzMultiScoringMode
  /**
   * Identifiant du manager (mode multi-joueurs V2) : lorsqu'il est fourni,
   * SHOW_LEADERBOARD n'est envoyé qu'au manager (comportement Razzia),
   * sinon il est diffusé (comportement V1 solo/projection).
   */
  managerId?: string
}

const sleep = (seconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000))

/**
 * Moteur de déroulement du quizz, porté du RoundManager de Razzia
 * (https://github.com/Ralex91/Razzia) — licence MIT, Copyright (c) 2024 Ralex.
 *
 * TypeScript pur, sans DOM ni Svelte : la même classe pourra s'exécuter
 * côté serveur en mode multi-joueurs (V2) avec un transport Socket.IO.
 *
 * Séquence (identique à Razzia) :
 * SHOW_START → par question : SHOW_PREPARED → SHOW_QUESTION → SELECT_ANSWER
 * → SHOW_RESULT (par joueur) + SHOW_RESPONSES → [SHOW_LEADERBOARD] → …
 * → FINISHED.
 *
 * Extensions MathALÉA :
 * - suivi de phase explicite (les réponses ne sont acceptées qu'en SELECT_ANSWER) ;
 * - avancement manuel après le résultat dans tous les modes (l'élève lit la
 *   correction à son rythme en solo, l'enseignant pilote en projection) ;
 * - mode de score 'full' | 'simple' | 'none'.
 */
export class QuizzEngine {
  private readonly opts: QuizzEngineOptions
  private readonly cooldown: CooldownTimer
  private started = false
  private destroyed = false
  private phase: QuizzPhase = 'idle'
  private currentQuestion = 0
  private playersAnswers: QuizzAnswer[] = []
  private startTime = 0
  private leaderboard: QuizzPlayer[] = []
  private tempOldLeaderboard: QuizzPlayer[] | null = null

  constructor(opts: QuizzEngineOptions) {
    this.opts = opts
    this.cooldown = new CooldownTimer((remaining) => {
      this.opts.transport.emit(QUIZZ_EVENTS.COOLDOWN, remaining)
    })
  }

  isStarted(): boolean {
    return this.started
  }

  getPhase(): QuizzPhase {
    return this.phase
  }

  getProgress(): { current: number, total: number } {
    return {
      current: Math.min(this.currentQuestion + 1, this.opts.quizz.questions.length),
      total: this.opts.quizz.questions.length,
    }
  }

  /** Démarre le quizz : compte à rebours puis première question. */
  async start(): Promise<void> {
    if (this.started || this.destroyed) return
    if (this.opts.quizz.questions.length === 0) return
    if (this.opts.players.count() === 0) {
      // Comme chez Razzia : pas de partie sans joueur connecté
      this.opts.transport.emit(
        QUIZZ_EVENTS.ERROR_MESSAGE,
        'Aucun joueur connecté pour démarrer la partie',
      )
      return
    }
    this.started = true
    this.phase = 'start'
    this.opts.transport.broadcast(QUIZZ_STATUS.SHOW_START, {
      time: QUIZZ_START_COUNTDOWN,
      subject: this.opts.quizz.subject,
    })
    await sleep(QUIZZ_START_COUNTDOWN)
    if (!this.started) return
    this.opts.transport.emit(QUIZZ_EVENTS.START_COOLDOWN)
    await this.cooldown.start(QUIZZ_START_COUNTDOWN)
    if (!this.started) return
    void this.newQuestion()
  }

  /** Enchaîne sur la question courante. */
  private async newQuestion(): Promise<void> {
    if (!this.started) return
    const question = this.opts.quizz.questions[this.currentQuestion]
    this.opts.transport.emit(QUIZZ_EVENTS.UPDATE_QUESTION, {
      current: this.currentQuestion + 1,
      total: this.opts.quizz.questions.length,
    })
    this.phase = 'prepared'
    this.opts.transport.broadcast(QUIZZ_STATUS.SHOW_PREPARED, {
      totalAnswers: question.answers.length,
      questionNumber: this.currentQuestion + 1,
    })
    await sleep(QUIZZ_PREPARED_DELAY)
    if (!this.started) return
    this.phase = 'question'
    this.opts.transport.broadcast(QUIZZ_STATUS.SHOW_QUESTION, {
      question: question.question,
      cooldown: question.cooldown,
    })
    await sleep(question.cooldown)
    if (!this.started) return
    this.startTime = Date.now()
    this.playersAnswers = []
    this.phase = 'select'
    this.opts.transport.broadcast(QUIZZ_STATUS.SELECT_ANSWER, {
      question: question.question,
      answers: question.answers,
      time: question.time,
      totalPlayer: this.opts.players.count(),
      questionType: question.type,
    })
    if (question.time === QUIZZ_NO_TIME_LIMIT) {
      // Sans limite de temps : la phase se termine quand tous les joueurs
      // ont répondu (abort dans selectAnswer) ou sur interruption manuelle.
      await this.cooldown.waitUntilAborted()
    } else {
      await this.cooldown.start(question.time)
    }
    if (!this.started) return
    this.showResults(question)
  }

  /** Calcule les scores et diffuse les résultats de la question. */
  private showResults(question: QuizzQuestion): void {
    this.phase = 'results'
    const currentPlayers = this.opts.players.getAll()
    const oldLeaderboard =
      this.leaderboard.length === 0
        ? currentPlayers.map((p) => ({ ...p }))
        : this.leaderboard.map((p) => ({ ...p }))

    const answerCounts = this.playersAnswers
      .flatMap(({ answerIds }) => answerIds)
      .reduce<Record<number, number>>((acc, id) => {
        acc[id] = (acc[id] ?? 0) + 1
        return acc
      }, {})

    const multiMode = this.opts.multiScoringMode ?? 'balanced'
    const scoring = this.opts.scoring
    // Hors multi-joueurs, l'écran de révélation rappelle le choix du joueur
    // local (la classe en projection). En multi, il n'y a pas de joueur
    // local : diffuser la réponse d'un élève précis n'aurait pas de sens.
    const localAnswer =
      this.opts.mode === 'multi' ? null : (this.playersAnswers[0] ?? null)

    const sortedPlayers = currentPlayers
      .map((player) => {
        const playerAnswer = this.playersAnswers.find(
          (a) => a.playerId === player.id,
        )
        const ratio =
          playerAnswer == null
            ? 0
            : scoreRatio(question, playerAnswer.answerIds, multiMode)
        const { points, correct } = ratioToPoints(
          ratio,
          playerAnswer?.points ?? 0,
          scoring,
        )
        const penalty = !correct && playerAnswer != null ? (question.penalty ?? 0) : 0
        player.points = Math.max(0, player.points + points - penalty)
        player.streak = correct ? player.streak + 1 : 0
        return {
          ...player,
          lastCorrect: correct,
          lastPoints: correct ? points : -penalty,
          lastRatio: ratio,
        }
      })
      .sort((a, b) => b.points - a.points)

    this.opts.players.replace(sortedPlayers)

    sortedPlayers.forEach((player, index) => {
      const playerAnswer = this.playersAnswers.find(
        (a) => a.playerId === player.id,
      )
      this.opts.transport.send(player.id, QUIZZ_STATUS.SHOW_RESULT, {
        correct: player.lastCorrect,
        message:
          player.lastRatio === 1
            ? 'Bonne réponse !'
            : player.lastCorrect
              ? 'Partiellement correct'
              : 'Mauvaise réponse',
        points: player.lastPoints,
        myPoints: player.points,
        rank: index + 1,
        aheadOfMe: sortedPlayers[index - 1]?.username ?? null,
        correction: question.correction,
        solutions: question.solutions,
        answers: question.answers,
        selected: playerAnswer?.answerIds ?? null,
        scoring,
      })
    })

    this.opts.transport.broadcast(QUIZZ_STATUS.SHOW_RESPONSES, {
      question: question.question,
      responses: answerCounts,
      solutions: question.solutions,
      answers: question.answers,
      correction: question.correction,
      selected: localAnswer?.answerIds ?? null,
      scoring,
    })

    this.leaderboard = sortedPlayers
    this.tempOldLeaderboard = oldLeaderboard
    this.playersAnswers = []
  }

  /**
   * Enregistre la réponse d'un joueur (première réponse seule compte,
   * uniquement pendant la phase SELECT_ANSWER — comme chez Razzia).
   */
  selectAnswer(playerId: string, answerIds: number[]): void {
    if (!this.started || this.phase !== 'select') return
    const player = this.opts.players.findById(playerId)
    const question = this.opts.quizz.questions[this.currentQuestion]
    if (player == null || question == null) return
    if (this.playersAnswers.find((a) => a.playerId === playerId)) return

    const points =
      question.time === QUIZZ_NO_TIME_LIMIT
        ? orderToPoint(
            this.playersAnswers.length,
            this.opts.players.count(),
            question.maxPoints,
          )
        : timeToPoint((Date.now() - this.startTime) / 1000, question)

    this.playersAnswers.push({ playerId: player.id, answerIds, points })
    this.opts.transport.send(player.id, QUIZZ_STATUS.WAIT, {
      text: 'Réponse enregistrée, en attente de la fin du temps…',
    })
    this.opts.transport.emit(
      QUIZZ_EVENTS.PLAYER_ANSWER,
      this.playersAnswers.length,
    )
    if (this.playersAnswers.length === this.opts.players.count()) {
      this.cooldown.abort()
    }
  }

  /** Passe à la question suivante (commande enseignant / avance solo). */
  nextQuestion(): void {
    if (!this.started) return
    if (!this.opts.quizz.questions[this.currentQuestion + 1]) return
    this.currentQuestion += 1
    void this.newQuestion()
  }

  /** Interrompt le temps de réponse et révèle les résultats. */
  abortQuestion(): void {
    if (!this.started) return
    this.cooldown.abort()
  }

  /**
   * Affiche le classement intermédiaire, ou termine le quizz si la
   * dernière question vient d'être jouée (sémantique Razzia).
   */
  showLeaderboard(): void {
    if (!this.started) return
    const isLastRound =
      this.currentQuestion + 1 === this.opts.quizz.questions.length
    if (isLastRound) {
      this.finish()
      return
    }
    this.phase = 'leaderboard'
    const oldLeaderboard = this.tempOldLeaderboard ?? this.leaderboard
    const payload = {
      oldLeaderboard: oldLeaderboard.slice(0, 5),
      leaderboard: this.leaderboard.slice(0, 5),
    }
    if (this.opts.managerId != null) {
      // Mode multi-joueurs : classement réservé au manager (comme Razzia)
      this.opts.transport.send(
        this.opts.managerId,
        QUIZZ_STATUS.SHOW_LEADERBOARD,
        payload,
      )
    } else {
      this.opts.transport.broadcast(QUIZZ_STATUS.SHOW_LEADERBOARD, payload)
    }
    this.tempOldLeaderboard = null
  }

  /** Termine le quizz : diffuse le podium et le rang de chaque joueur. */
  finish(): void {
    if (!this.started) return
    this.started = false
    this.phase = 'finished'
    const top = this.leaderboard.slice(0, 3)
    this.opts.transport.broadcast(QUIZZ_STATUS.FINISHED, {
      subject: this.opts.quizz.subject,
      top,
      scoring: this.opts.scoring,
    })
    this.leaderboard.forEach((player, index) => {
      this.opts.transport.send(player.id, QUIZZ_STATUS.FINISHED, {
        subject: this.opts.quizz.subject,
        top,
        rank: index + 1,
        myPoints: player.points,
        scoring: this.opts.scoring,
      })
    })
  }

  /** Arrête le moteur et nettoie les minuteurs (démontage du composant). */
  destroy(): void {
    this.destroyed = true
    this.started = false
    this.cooldown.abort()
  }
}
