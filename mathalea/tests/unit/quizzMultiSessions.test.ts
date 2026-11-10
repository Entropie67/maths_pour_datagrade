import { get } from 'svelte/store'
import { beforeEach, describe, expect, it } from 'vitest'
import { QuizzMultiManagerSession } from '../../src/lib/quizz/multiManagerSession'
import { QuizzMultiPlayerSession } from '../../src/lib/quizz/multiPlayerSession'
import {
  quizzProgress,
  quizzStatus,
  resetQuizzStores,
} from '../../src/lib/stores/quizzStore'
import type { Quizz, QuizzPlayer } from '../../src/modules/quizz/types'
import { FakeSocket } from './helpers/quizzFakeSocket'

/**
 * Tests des machines à états des sessions multi-joueurs (manager et joueur)
 * contre une fausse socket : vérification des événements émis et des
 * transitions d'étapes à la réception des messages du protocole.
 */

const QUIZZ: Quizz = {
  subject: 'Quiz de test',
  questions: [
    {
      type: 'single',
      question: '<p>2 + 2 ?</p>',
      answers: ['<p>3</p>', '<p>4</p>'],
      solutions: [1],
      correction: '<p>4</p>',
      cooldown: 3,
      time: 20,
    },
  ],
}

const PLAYER: QuizzPlayer = {
  id: 'player-1',
  username: 'Ada',
  points: 0,
  streak: 0,
}

const connect = async (
  session: { init: () => Promise<void> },
  socket: FakeSocket,
): Promise<void> => {
  const promise = session.init()
  socket.connect()
  await promise
}

describe('session manager multi-joueurs', () => {
  let socket: FakeSocket
  let session: QuizzMultiManagerSession
  const persistedGameIds: Array<string | null> = []

  beforeEach(() => {
    resetQuizzStores()
    persistedGameIds.length = 0
    socket = new FakeSocket()
    session = new QuizzMultiManagerSession({
      quizz: QUIZZ,
      scoring: 'full',
      clientId: 'client-manager',
      socketFactory: () => socket,
      onGameId: (gameId) => persistedGameIds.push(gameId),
    })
  })

  it('démarre sur la saisie de l’e-mail', async () => {
    await connect(session, socket)
    expect(get(session.step)).toBe('email')
  })

  it('enchaîne e-mail → code → création → lobby', async () => {
    await connect(session, socket)

    session.requestEmailCode('prof@ac-toulouse.fr')
    expect(socket.lastSent('manager:requestEmailCode')?.payload).toEqual({
      email: 'prof@ac-toulouse.fr',
    })
    socket.fire('manager:emailCodeSent', { expiresIn: 600 })
    expect(get(session.step)).toBe('code')

    session.verifyEmailCode('123456')
    expect(get(session.step)).toBe('creating')
    expect(socket.lastSent('manager:verifyEmailCode')?.payload).toEqual({
      email: 'prof@ac-toulouse.fr',
      code: '123456',
    })

    socket.fire('manager:emailVerified', { ticket: 'ticket-1', expires: 0 })
    const createGame = socket.lastSent('manager:createGame')
    expect(createGame?.payload).toMatchObject({
      ticket: 'ticket-1',
      scoring: 'full',
      quizz: QUIZZ,
      usernameMode: 'free',
      sound: true,
    })

    socket.fire('manager:gameCreated', {
      gameId: 'game-1',
      inviteCode: '654321',
    })
    expect(persistedGameIds).toEqual(['game-1'])
    expect(get(session.inviteCode)).toBe('654321')

    socket.fire('game:status', {
      name: 'SHOW_ROOM',
      data: {
        text: 'En attente des joueurs…',
        inviteCode: '654321',
        players: [],
      },
    })
    expect(get(session.step)).toBe('lobby')
    expect(get(session.players)).toEqual([])
  })

  it('transmet le mode pseudo contrôlé à createGame', async () => {
    await connect(session, socket)
    session.setQuizz(QUIZZ, 'full', 'safe')
    socket.fire('manager:emailCodeSent', { expiresIn: 600 })
    session.verifyEmailCode('123456')
    socket.fire('manager:emailVerified', { ticket: 'ticket-2', expires: 0 })
    expect(socket.lastSent('manager:createGame')?.payload).toMatchObject({
      usernameMode: 'safe',
    })
  })

  it('transmet le réglage sonore choisi à createGame', async () => {
    const localSocket = new FakeSocket()
    const localSession = new QuizzMultiManagerSession({
      quizz: QUIZZ,
      scoring: 'full',
      sound: false,
      clientId: 'client-manager',
      socketFactory: () => localSocket,
    })
    await connect(localSession, localSocket)
    localSocket.fire('manager:emailCodeSent', { expiresIn: 600 })
    localSession.verifyEmailCode('123456')
    localSocket.fire('manager:emailVerified', { ticket: 'ticket-3', expires: 0 })
    expect(localSocket.lastSent('manager:createGame')?.payload).toMatchObject({
      sound: false,
    })
  })

  it('met à jour la liste des joueurs du lobby et pilote la partie', async () => {
    await connect(session, socket)
    socket.fire('manager:gameCreated', {
      gameId: 'game-1',
      inviteCode: '654321',
    })
    socket.fire('game:status', {
      name: 'SHOW_ROOM',
      data: { text: '…', inviteCode: '654321', players: [] },
    })

    socket.fire('manager:newPlayer', PLAYER)
    expect(get(session.players)).toEqual([PLAYER])

    session.startGame()
    expect(socket.lastSent('manager:startGame')?.payload).toEqual({
      gameId: 'game-1',
    })

    // Le refus « 0 joueur » du moteur arrive en phrase française : affichée telle quelle.
    socket.fire(
      'game:errorMessage',
      'Aucun joueur connecté pour démarrer la partie',
    )
    expect(get(session.lastError)).toBe(
      'Aucun joueur connecté pour démarrer la partie',
    )

    socket.fire('manager:playerKicked', {
      playerId: PLAYER.id,
      username: 'Ada',
    })
    expect(get(session.players)).toEqual([])
  })

  it('verse les statuts de jeu au store et conserve game:results pour le CSV', async () => {
    await connect(session, socket)
    socket.fire('manager:gameCreated', {
      gameId: 'game-1',
      inviteCode: '654321',
    })
    socket.fire('game:status', {
      name: 'SHOW_RESPONSES',
      data: {
        question: '<p>2 + 2 ?</p>',
        responses: { 0: 1, 1: 2 },
        solutions: [1],
        answers: ['<p>3</p>', '<p>4</p>'],
        correction: '<p>4</p>',
        selected: null,
        scoring: 'full',
      },
    })
    expect(get(session.step)).toBe('game')
    expect(get(quizzStatus)?.name).toBe('SHOW_RESPONSES')

    const results = {
      subject: 'Quiz de test',
      scoring: 'full',
      questions: [],
      players: [],
    }
    socket.fire('game:results', results)
    expect(get(session.results)).toEqual(results)
  })

  it('termine la session sur game:reset', async () => {
    await connect(session, socket)
    socket.fire('manager:gameCreated', {
      gameId: 'game-1',
      inviteCode: '654321',
    })
    socket.fire('game:reset', 'closed')
    expect(get(session.step)).toBe('ended')
    expect(get(session.endMessage)).toContain('fermée')
    expect(persistedGameIds).toEqual(['game-1', null])
  })

  it('rejoue manager:reconnect au chargement quand un gameId est dans l’URL', async () => {
    const reconnecting = new QuizzMultiManagerSession({
      reconnectGameId: 'game-9',
      clientId: 'client-manager',
      socketFactory: () => socket,
    })
    await connect(reconnecting, socket)
    expect(socket.lastSent('manager:reconnect')?.payload).toEqual({
      gameId: 'game-9',
    })
    socket.fire('manager:successReconnect', {
      status: {
        name: 'SHOW_ROOM',
        data: { text: '…', inviteCode: '111222', players: [PLAYER] },
      },
      players: [PLAYER],
      currentQuestion: { current: 1, total: 3 },
    })
    expect(get(reconnecting.step)).toBe('lobby')
    expect(get(reconnecting.players)).toEqual([PLAYER])
    expect(get(quizzProgress)).toEqual({ current: 1, total: 3 })
  })

  it('passe en erreur si la room est introuvable à la reconnexion', async () => {
    const reconnecting = new QuizzMultiManagerSession({
      reconnectGameId: 'game-9',
      clientId: 'client-manager',
      socketFactory: () => socket,
    })
    await connect(reconnecting, socket)
    socket.fire('game:errorMessage', 'game-not-found')
    expect(get(reconnecting.step)).toBe('error')
    expect(get(reconnecting.lastError)).toContain('introuvable')
  })
})

describe('session joueur multi-joueurs', () => {
  let socket: FakeSocket

  const makeSession = (
    options: Partial<
      ConstructorParameters<typeof QuizzMultiPlayerSession>[0]
    > = {},
  ): QuizzMultiPlayerSession =>
    new QuizzMultiPlayerSession({
      clientId: 'client-joueur',
      socketFactory: () => socket,
      ...options,
    })

  beforeEach(() => {
    resetQuizzStores()
    socket = new FakeSocket()
  })

  it('démarre sur la saisie du PIN sans PIN dans l’URL', async () => {
    const session = makeSession()
    await connect(session, socket)
    expect(get(session.step)).toBe('pin')
  })

  it('valide le format du PIN avant envoi', async () => {
    const session = makeSession()
    await connect(session, socket)
    session.submitPin('12')
    expect(get(session.lastError)).toContain('6 chiffres')
    expect(get(session.step)).toBe('pin')
    expect(socket.lastSent('player:join')).toBeUndefined()
  })

  it('capture le mode pseudo contrôlé annoncé par la room', async () => {
    const session = makeSession()
    await connect(session, socket)
    session.submitPin('123456')
    socket.fire('game:successRoom', { gameId: 'game-1', usernameMode: 'safe' })
    expect(get(session.usernameMode)).toBe('safe')
    expect(get(session.step)).toBe('pseudo')
  })

  it('capture le réglage sonore annoncé par la room', async () => {
    const session = makeSession()
    await connect(session, socket)
    expect(get(session.sound)).toBe(true)
    session.submitPin('123456')
    socket.fire('game:successRoom', { gameId: 'game-1', sound: false })
    expect(get(session.sound)).toBe(false)
    expect(get(session.step)).toBe('pseudo')
  })

  it('enchaîne jointure → pseudo → entrée en jeu', async () => {
    const session = makeSession()
    await connect(session, socket)
    session.submitPin('123456')
    expect(get(session.step)).toBe('joining')
    expect(socket.lastSent('player:join')?.payload).toBe('123456')

    socket.fire('game:successRoom', { gameId: 'game-1' })
    expect(get(session.step)).toBe('pseudo')
    expect(get(session.usernameMode)).toBe('free')

    session.submitUsername('Ada')
    expect(socket.lastSent('player:login')?.payload).toEqual({
      gameId: 'game-1',
      data: { username: 'Ada' },
    })
    socket.fire('game:successJoin')
    expect(get(session.step)).toBe('game')

    socket.fire('game:status', { name: 'WAIT', data: { text: 'En attente…' } })
    expect(get(quizzStatus)?.name).toBe('WAIT')
  })

  it('revient au PIN avec un message si la jointure est refusée', async () => {
    const session = makeSession()
    await connect(session, socket)
    session.submitPin('000000')
    socket.fire('game:errorMessage', 'pin-unknown')
    expect(get(session.step)).toBe('pin')
    expect(get(session.lastError)).toContain('PIN inconnu')
  })

  it('joint automatiquement avec le PIN de l’URL puis rejoue player:reconnect', async () => {
    const session = makeSession({ pin: '123456', reconnectGameId: 'game-1' })
    await connect(session, socket)
    expect(socket.lastSent('player:join')?.payload).toBe('123456')

    socket.fire('game:successRoom', { gameId: 'game-1' })
    expect(socket.lastSent('player:reconnect')?.payload).toEqual({
      gameId: 'game-1',
    })

    socket.fire('player:successReconnect', {
      gameId: 'game-1',
      status: {
        name: 'SELECT_ANSWER',
        data: {
          question: '<p>2 + 2 ?</p>',
          answers: ['<p>3</p>', '<p>4</p>'],
          time: 20,
          totalPlayer: 2,
          questionType: 'single',
        },
      },
      player: { ...PLAYER, points: 800 },
      currentQuestion: { current: 1, total: 1 },
    })
    expect(get(session.step)).toBe('game')
    expect(get(session.myPlayer)?.points).toBe(800)
    expect(get(quizzStatus)?.name).toBe('SELECT_ANSWER')
    expect(get(quizzProgress)).toEqual({ current: 1, total: 1 })
  })

  it('poursuit à la saisie du pseudo si le siège retrouvé n’a pas de nom', async () => {
    const session = makeSession({ pin: '123456', reconnectGameId: 'game-1' })
    await connect(session, socket)
    socket.fire('game:successRoom', { gameId: 'game-1' })
    socket.fire('game:reset', 'unknown-session')
    expect(get(session.step)).toBe('pseudo')
  })

  it('envoie les réponses au serveur', async () => {
    const session = makeSession({ pin: '123456' })
    await connect(session, socket)
    socket.fire('game:successRoom', { gameId: 'game-1' })
    socket.fire('game:successJoin')
    session.answer([0, 2])
    expect(socket.lastSent('player:selectedAnswer')?.payload).toEqual({
      gameId: 'game-1',
      data: { answerKeys: [0, 2] },
    })
  })

  it('termine la session sur game:reset kicked en cours de jeu', async () => {
    const session = makeSession({ pin: '123456' })
    await connect(session, socket)
    socket.fire('game:successRoom', { gameId: 'game-1' })
    socket.fire('game:successJoin')
    socket.fire('game:reset', 'kicked')
    expect(get(session.step)).toBe('ended')
    expect(get(session.endMessage)).toContain('exclu')
  })
})
