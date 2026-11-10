import { get } from 'svelte/store'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ExternalApp from '../../src/exercices/apps/_ExternalApp'
import {
  exercicesParams,
  resultsByExercice,
} from '../../src/lib/stores/generalStore'
import { globalOptions } from '../../src/lib/stores/globalOptions'

vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

function sendScoreFromApp(
  app: ExternalApp,
  score: number,
  numberOfQuestions: number,
) {
  window.dispatchEvent(
    new MessageEvent('message', {
      data: {
        type: 'mathaleaSendScore',
        score,
        numberOfQuestions,
        numeroExercice: app.numeroExercice,
        finalState: '<p>Résumé de la partie</p>',
      },
    }),
  )
}

describe('ExternalApp : remontée du score à Moodle', () => {
  let postMessage: ReturnType<typeof vi.fn>
  // ExternalApp s'abonne à window sans jamais se désabonner : on retire ses écouteurs entre deux tests
  const messageListeners: EventListenerOrEventListenerObject[] = []

  beforeEach(() => {
    const addEventListener = window.addEventListener.bind(window)
    vi.spyOn(window, 'addEventListener').mockImplementation(
      (type, listener, options) => {
        if (type === 'message') messageListeners.push(listener as EventListener)
        addEventListener(type, listener, options)
      },
    )
    postMessage = vi.fn()
    vi.spyOn(window, 'parent', 'get').mockReturnValue({
      postMessage,
    } as unknown as Window)
    resultsByExercice.set([])
    exercicesParams.set([{ uuid: 'challengeTables', type: 'app' } as never])
  })

  afterEach(() => {
    vi.restoreAllMocks()
    for (const listener of messageListeners.splice(0)) {
      window.removeEventListener('message', listener)
    }
    globalOptions.update((options) => ({ ...options, recorder: undefined }))
  })

  function createApp() {
    const app = new ExternalApp(
      'https://coopmaths.fr/challenge/?mathalea&type=tables',
    )
    app.numeroExercice = 0
    app.seed = 'owKy'
    app.handleScore()
    return app
  }

  it('envoie mathalea:score au parent avec recorder=moodle', () => {
    globalOptions.update((options) => ({ ...options, recorder: 'moodle' }))
    const app = createApp()
    sendScoreFromApp(app, 17, 20)
    expect(postMessage).toHaveBeenCalledTimes(1)
    const [message, targetOrigin] = postMessage.mock.calls[0]
    expect(targetOrigin).toBe('*')
    expect(message.action).toBe('mathalea:score')
    expect(message.resultsByExercice).toHaveLength(1)
    expect(message.resultsByExercice[0]).toMatchObject({
      numberOfPoints: 17,
      numberOfQuestions: 20,
      alea: 'owKy',
    })
    expect(message.resultsByExercice[0].answers).toBeUndefined()
    // Le store garde le finalState pour la vue professeur
    expect(get(resultsByExercice)[0].answers).toEqual([
      '<p>Résumé de la partie</p>',
    ])
  })

  it("n'envoie rien au parent sans recorder moodle", () => {
    const app = createApp()
    sendScoreFromApp(app, 17, 20)
    expect(postMessage).not.toHaveBeenCalled()
  })

  it("n'envoie rien quand la tentative est moins bonne que la meilleure", () => {
    globalOptions.update((options) => ({ ...options, recorder: 'moodle' }))
    const app = createApp()
    sendScoreFromApp(app, 17, 20)
    sendScoreFromApp(app, 5, 20)
    expect(postMessage).toHaveBeenCalledTimes(1)
  })
})
