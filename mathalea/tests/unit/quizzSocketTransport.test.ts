import { describe, expect, it } from 'vitest'
import { SocketTransport } from '../../src/modules/quizz/transport/SocketTransport'
import type { QuizzStatusMessage } from '../../src/modules/quizz/transport/QuizzTransport'
import { FakeSocket } from './helpers/quizzFakeSocket'

const makeTransport = (socket: FakeSocket): SocketTransport =>
  new SocketTransport({
    url: 'http://localhost:3000',
    path: '/ws',
    clientId: 'client-test',
    socketFactory: () => socket,
  })

describe('SocketTransport (navigateur)', () => {
  it('relit game:status vers les abonnés onStatus avec target broadcast', () => {
    const socket = new FakeSocket()
    const transport = makeTransport(socket)
    const received: QuizzStatusMessage[] = []
    transport.onStatus((message) => received.push(message))
    socket.fire('game:status', {
      name: 'SELECT_ANSWER',
      data: {
        question: '<p>2+2 ?</p>',
        answers: ['<p>3</p>', '<p>4</p>'],
        time: 20,
        totalPlayer: 3,
        questionType: 'single',
      },
    })
    expect(received).toHaveLength(1)
    expect(received[0].name).toBe('SELECT_ANSWER')
    expect(received[0].target).toBe('broadcast')
    expect(received[0].data).toMatchObject({ totalPlayer: 3 })
  })

  it('relit les événements annexes vers onEvent (mêmes noms qu’en V1)', () => {
    const socket = new FakeSocket()
    const transport = makeTransport(socket)
    const received: Array<{ event: string; payload?: unknown }> = []
    transport.onEvent((event, payload) => received.push({ event, payload }))
    socket.fire('game:cooldown', 7)
    socket.fire('game:totalPlayers', 12)
    socket.fire('game:updateQuestion', { current: 2, total: 5 })
    socket.fire('game:playerAnswer', 4)
    socket.fire('game:startCooldown')
    socket.fire('game:errorMessage', 'pin-unknown')
    expect(received).toEqual([
      { event: 'game:cooldown', payload: 7 },
      { event: 'game:totalPlayers', payload: 12 },
      { event: 'game:updateQuestion', payload: { current: 2, total: 5 } },
      { event: 'game:playerAnswer', payload: 4 },
      { event: 'game:startCooldown', payload: undefined },
      { event: 'game:errorMessage', payload: 'pin-unknown' },
    ])
  })

  it('émet les événements du protocole vers le serveur via send', () => {
    const socket = new FakeSocket()
    const transport = makeTransport(socket)
    transport.send('manager:startGame', { gameId: 'abc' })
    expect(socket.lastSent('manager:startGame')?.payload).toEqual({
      gameId: 'abc',
    })
  })

  it('onServerEvent abonne et désabonne aux événements du protocole', () => {
    const socket = new FakeSocket()
    const transport = makeTransport(socket)
    const received: unknown[] = []
    const unsubscribe = transport.onServerEvent('game:reset', (payload) =>
      received.push(payload),
    )
    socket.fire('game:reset', 'kicked')
    unsubscribe()
    socket.fire('game:reset', 'closed')
    expect(received).toEqual(['kicked'])
  })

  it('connect() résout à la première connexion effective', async () => {
    const socket = new FakeSocket()
    const transport = makeTransport(socket)
    let resolved = false
    const promise = transport.connect().then(() => (resolved = true))
    await Promise.resolve()
    expect(resolved).toBe(false)
    socket.connect()
    await promise
    expect(resolved).toBe(true)
  })

  it('close() ferme la socket et purge les abonnés', () => {
    const socket = new FakeSocket()
    const transport = makeTransport(socket)
    let calls = 0
    transport.onStatus(() => calls++)
    transport.close()
    socket.fire('game:status', { name: 'WAIT', data: { text: '…' } })
    expect(socket.closed).toBe(true)
    expect(calls).toBe(0)
  })
})
