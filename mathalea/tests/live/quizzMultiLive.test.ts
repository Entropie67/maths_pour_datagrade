// @vitest-environment node
import { readFileSync } from 'node:fs'
import { get, type Readable } from 'svelte/store'
import { describe, expect, it } from 'vitest'
import { QuizzMultiManagerSession } from '../../src/lib/quizz/multiManagerSession'
import { QuizzMultiPlayerSession } from '../../src/lib/quizz/multiPlayerSession'
import type { QuizzStatusMessage } from '../../src/modules/quizz/transport/QuizzTransport'
import type { Quizz } from '../../src/modules/quizz/types'

/**
 * Test LIVE de bout en bout du mode multi-joueurs contre le serveur local
 * (dépôt quizz-ws, `node dist/src/index.js`, port 3000, debugMode: true).
 *
 * Désactivé par défaut : il exige le serveur démarré. Lancement explicite :
 *   QUIZZ_LIVE=1 pnpm exec vitest tests/live/quizzMultiLive.test.ts --run
 *
 * Environnement node (et non jsdom) : socket.io-client utilise alors son
 * transport Node, qui n'émet pas d'en-tête Origin — le filtre CORS du
 * serveur (coopmaths.fr / localhost:5173) ne s'applique qu'aux navigateurs.
 *
 * Partie réelle à 1 manager + 2 joueurs, avec rechargements simulés :
 * nouvelle session avec le MÊME clientId (équivalent du F5 navigateur).
 */

const LIVE = process.env.QUIZZ_LIVE === '1'
const WS_LOG =
  process.env.QUIZZ_WS_LOG ??
  '/home/sylcha/projets/bradype/ws/logs/quizz-ws.log'
const EMAIL = 'prof@ac-toulouse.fr'

const QUIZZ: Quizz = {
  subject: 'Quiz live de validation',
  questions: [
    {
      type: 'single',
      question: '<p>Q1 : 2 + 2 ?</p>',
      answers: ['<p>3</p>', '<p>4</p>', '<p>5</p>'],
      solutions: [1],
      correction: '<p>2 + 2 = 4.</p>',
      cooldown: 3,
      time: 30,
    },
    {
      type: 'single',
      question: '<p>Q2 : 3 × 3 ?</p>',
      answers: ['<p>6</p>', '<p>9</p>', '<p>12</p>'],
      solutions: [1],
      correction: '<p>3 × 3 = 9.</p>',
      cooldown: 3,
      time: 30,
    },
  ],
}

/** Collecte des statuts d'une session via son passe-plat d'abonnement. */
const collectStatuses = (session: {
  onGameStatus: (listener: (message: QuizzStatusMessage) => void) => () => void
}): QuizzStatusMessage[] => {
  const statuses: QuizzStatusMessage[] = []
  session.onGameStatus((message) => statuses.push(message))
  return statuses
}

/** Attend qu'un store satisfasse un prédicat. */
function waitStore<T>(
  store: Readable<T>,
  predicate: (value: T) => boolean,
  timeout = 30_000,
  label = 'store',
): Promise<T> {
  return new Promise((resolve, reject) => {
    const current = get(store)
    if (predicate(current)) return resolve(current)
    const timer = setTimeout(() => {
      unsubscribe()
      reject(new Error(`timeout en attendant ${label}`))
    }, timeout)
    const unsubscribe = store.subscribe((value) => {
      if (predicate(value)) {
        clearTimeout(timer)
        unsubscribe()
        resolve(value)
      }
    })
  })
}

/** Attend un statut dans la collecte d'une session. */
async function waitStatus(
  statuses: QuizzStatusMessage[],
  name: string,
  timeout = 30_000,
): Promise<QuizzStatusMessage> {
  return waitStatusWhere(statuses, name, () => true, timeout)
}

/** Attend un statut satisfaisant un prédicat (ex. FINISHED personnel, avec rang). */
async function waitStatusWhere(
  statuses: QuizzStatusMessage[],
  name: string,
  predicate: (message: QuizzStatusMessage) => boolean,
  timeout = 30_000,
): Promise<QuizzStatusMessage> {
  const start = Date.now()
  for (;;) {
    const found = statuses.find(
      (message) => message.name === name && predicate(message),
    )
    if (found != null) return found
    if (Date.now() - start > timeout) {
      throw new Error(
        `timeout en attendant le statut ${name} (reçus : ${statuses.map((m) => m.name).join(', ')})`,
      )
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
}

/** Relit le dernier code e-mail « délivré » par le mailer console (debugMode). */
function readEmailCode(email: string): string {
  const lines = readFileSync(WS_LOG, 'utf8').trim().split('\n').reverse()
  for (const line of lines) {
    try {
      const entry = JSON.parse(line)
      if (
        entry.message === 'console-mailer : code simulé' &&
        entry.to === email
      ) {
        return entry.code as string
      }
    } catch {
      // lignes anciennes non JSON : ignorer
    }
  }
  throw new Error(`aucun code trouvé dans ${WS_LOG} pour ${email}`)
}

describe.skipIf(!LIVE)(
  'live — partie multi-joueurs contre le serveur local',
  () => {
    it(
      'partie complète à 1 manager + 2 joueurs, avec rechargements',
      { timeout: 180_000 },
      async () => {
        // ---------- Manager : identification + création ----------
        const manager = new QuizzMultiManagerSession({
          quizz: QUIZZ,
          scoring: 'full',
          clientId: 'live-manager',
        })
        await manager.init()
        // Abonnement aux statuts APRÈS init (le transport n'existe pas avant).
        const managerStatuses = collectStatuses(manager)
        expect(get(manager.step)).toBe('email')

        manager.requestEmailCode(EMAIL)
        await waitStore(
          manager.step,
          (step) => step === 'code',
          10_000,
          'étape code',
        )
        const code = readEmailCode(EMAIL)
        manager.verifyEmailCode(code)

        const inviteCode = await waitStore(
          manager.inviteCode,
          (pin) => pin.length === 6,
          15_000,
          'PIN de la room',
        )
        await waitStore(
          manager.step,
          (step) => step === 'lobby',
          10_000,
          'lobby',
        )
        expect(get(manager.players)).toEqual([])
        const gameId = (manager as unknown as { gameId: string }).gameId
        expect(typeof gameId).toBe('string')

        // ---------- 2 joueurs rejoignent ----------
        const player1 = new QuizzMultiPlayerSession({
          pin: inviteCode,
          clientId: 'live-player-1',
        })
        await player1.init()
        const player1Statuses = collectStatuses(player1)
        await waitStore(
          player1.step,
          (step) => step === 'pseudo',
          10_000,
          'pseudo p1',
        )
        player1.submitUsername('Ada')
        await waitStore(
          player1.step,
          (step) => step === 'game',
          10_000,
          'jeu p1',
        )
        await waitStatus(player1Statuses, 'WAIT', 10_000)

        const player2 = new QuizzMultiPlayerSession({
          pin: inviteCode,
          clientId: 'live-player-2',
        })
        await player2.init()
        const player2Statuses = collectStatuses(player2)
        await waitStore(
          player2.step,
          (step) => step === 'pseudo',
          10_000,
          'pseudo p2',
        )
        player2.submitUsername('Bob')
        await waitStore(
          player2.step,
          (step) => step === 'game',
          10_000,
          'jeu p2',
        )

        // Le lobby du manager voit les deux joueurs.
        await waitStore(
          manager.players,
          (players) => players.length === 2,
          10_000,
          '2 joueurs au lobby',
        )
        expect(get(manager.players).map((p) => p.username)).toEqual([
          'Ada',
          'Bob',
        ])

        // ---------- Démarrage ----------
        manager.startGame()
        await waitStatus(player1Statuses, 'SHOW_START', 15_000)
        await waitStatus(player2Statuses, 'SHOW_START', 15_000)

        // Q1 : Ada répond juste [1], Bob faux [0].
        await waitStatus(player1Statuses, 'SELECT_ANSWER', 30_000)
        player1.answer([1])
        player2.answer([0])
        const result1 = await waitStatus(player1Statuses, 'SHOW_RESULT', 20_000)
        expect((result1.data as { correct: boolean }).correct).toBe(true)
        await waitStatus(player2Statuses, 'SHOW_RESULT', 20_000)
        await waitStatus(managerStatuses, 'SHOW_RESPONSES', 20_000)

        // Classement réservé au manager.
        manager.showLeaderboard()
        await waitStatus(managerStatuses, 'SHOW_LEADERBOARD', 10_000)
        expect(
          player1Statuses.some(
            (message) => message.name === 'SHOW_LEADERBOARD',
          ),
        ).toBe(false)
        expect(
          player2Statuses.some(
            (message) => message.name === 'SHOW_LEADERBOARD',
          ),
        ).toBe(false)

        // ---------- Rechargement d'Ada (même clientId, pin + gameId) ----------
        const player1Reload = new QuizzMultiPlayerSession({
          pin: inviteCode,
          reconnectGameId: gameId,
          clientId: 'live-player-1',
        })
        await player1Reload.init()
        await waitStore(
          player1Reload.myPlayer,
          (player) => player != null && player.points > 0,
          15_000,
          'points restitués',
        )
        expect(get(player1Reload.myPlayer)?.username).toBe('Ada')
        expect(get(player1Reload.step)).toBe('game')
        player1.dispose()

        // ---------- Q2 ----------
        manager.nextQuestion()
        const player1ReloadStatuses = collectStatuses(player1Reload)
        await waitStatus(player1ReloadStatuses, 'SELECT_ANSWER', 30_000)

        // ---------- Rechargement du manager en pleine question ----------
        const managerReload = new QuizzMultiManagerSession({
          reconnectGameId: gameId,
          clientId: 'live-manager',
        })
        await managerReload.init()
        const managerReloadStatuses = collectStatuses(managerReload)
        await waitStore(
          managerReload.step,
          (step) => step === 'game',
          15_000,
          'reconnexion manager',
        )
        expect(get(managerReload.players).map((p) => p.username)).toEqual([
          'Ada',
          'Bob',
        ])
        manager.dispose()

        // Ada et Bob répondent à Q2 depuis les sessions « rechargées ».
        player1Reload.answer([1])
        player2.answer([0])
        await waitStatus(managerReloadStatuses, 'SHOW_RESPONSES', 20_000)

        // Fin de partie pilotée par le manager rechargé : FINISHED + game:results.
        managerReload.showLeaderboard()
        // Chaque joueur reçoit d'abord le FINISHED diffusé (podium), puis le
        // personnel (rang) : on filtre sur la présence du rang.
        const finished1 = await waitStatusWhere(
          player1ReloadStatuses,
          'FINISHED',
          (message) => (message.data as { rank?: number }).rank !== undefined,
          15_000,
        )
        expect((finished1.data as { rank?: number }).rank).toBe(1)
        const finished2 = await waitStatusWhere(
          player2Statuses,
          'FINISHED',
          (message) => (message.data as { rank?: number }).rank !== undefined,
          15_000,
        )
        expect((finished2.data as { rank?: number }).rank).toBe(2)

        const results = await waitStore(
          managerReload.results,
          (payload) => payload != null,
          15_000,
          'game:results',
        )
        expect(results?.subject).toBe('Quiz live de validation')
        expect(results?.questions).toHaveLength(2)
        expect(results?.players).toHaveLength(2)
        expect(results?.players[0].player.username).toBe('Ada')
        expect(results?.players[0].answers[0]?.correct).toBe(true)
        expect(results?.players[1].answers[1]?.answerIds).toEqual([0])

        // ---------- Fermeture propre ----------
        managerReload.closeGame()
        await waitStore(
          player1Reload.step,
          (step) => step === 'ended',
          10_000,
          'reset joueur 1',
        )
        await waitStore(
          player2.step,
          (step) => step === 'ended',
          10_000,
          'reset joueur 2',
        )
        await waitStore(
          managerReload.step,
          (step) => step === 'ended',
          10_000,
          'reset manager',
        )

        managerReload.dispose()
        player1Reload.dispose()
        player2.dispose()
      },
    )
  },
)
