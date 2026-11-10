import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { analyseExerciceQuizz, freezeSeeds } from '../../src/lib/quizz/buildQuizz'
import type { IExercice, InterfaceParams } from '../../src/lib/types'
import { QuizzEngine } from '../../src/modules/quizz/engine/QuizzEngine'
import { QuizzPlayerManager } from '../../src/modules/quizz/engine/QuizzPlayerManager'
import { LocalTransport } from '../../src/modules/quizz/transport/LocalTransport'
import type { QuizzStatusMessage } from '../../src/modules/quizz/transport/QuizzTransport'
import {
  QUIZZ_EVENTS,
  QUIZZ_STATUS,
  type Quizz,
  type QuizzStatusDataMap,
} from '../../src/modules/quizz/types'

vi.mock('../../src/lib/renderScratch', () => ({
  renderScratch: vi.fn(() => 'mocked value'),
}))

vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(() => 'mocked value'),
}))

function makeQuizz(): Quizz {
  return {
    subject: 'Quizz de test',
    questions: [
      {
        type: 'single',
        question: 'Question 1 ?',
        answers: ['a', 'b', 'c'],
        solutions: [1],
        correction: 'Correction 1',
        cooldown: 5,
        time: 20,
      },
      {
        type: 'single',
        question: 'Question 2 ?',
        answers: ['a', 'b'],
        solutions: [0],
        correction: 'Correction 2',
        cooldown: 5,
        time: 20,
      },
    ],
  }
}

function setup(mode: 'solo' | 'projection', scoring: 'full' | 'simple' | 'none' = 'full') {
  const transport = new LocalTransport()
  const messages: QuizzStatusMessage[] = []
  transport.onStatus((m) => messages.push(m))
  const events: { event: string, payload?: unknown }[] = []
  transport.onEvent((event, payload) => events.push({ event, payload }))
  const players = new QuizzPlayerManager()
  players.add({ id: 'p1', username: 'Moi', points: 0, streak: 0 })
  const engine = new QuizzEngine({
    quizz: makeQuizz(),
    players,
    transport,
    mode,
    scoring,
  })
  return { engine, messages, events, players }
}

const names = (messages: QuizzStatusMessage[]) => messages.map((m) => m.name)

async function avancerJusquaSelect() {
  // 3 s de lancement + 3 s de compte à rebours + 2 s de préparation + 5 s de lecture
  await vi.advanceTimersByTimeAsync(3000)
  await vi.advanceTimersByTimeAsync(3000)
  await vi.advanceTimersByTimeAsync(2000)
  await vi.advanceTimersByTimeAsync(5000)
}

describe('QuizzEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('déroule la séquence complète en solo jusqu’à FINISHED', async () => {
    const { engine, messages } = setup('solo')
    void engine.start()
    expect(names(messages)).toEqual([QUIZZ_STATUS.SHOW_START])
    await avancerJusquaSelect()
    expect(names(messages)).toContain(QUIZZ_STATUS.SHOW_PREPARED)
    expect(names(messages)).toContain(QUIZZ_STATUS.SHOW_QUESTION)
    expect(names(messages)).toContain(QUIZZ_STATUS.SELECT_ANSWER)

    engine.selectAnswer('p1', [1])
    await vi.advanceTimersByTimeAsync(1000)
    expect(names(messages)).toContain(QUIZZ_STATUS.SHOW_RESULT)
    expect(names(messages)).toContain(QUIZZ_STATUS.SHOW_RESPONSES)

    const result = messages.find((m) => m.name === QUIZZ_STATUS.SHOW_RESULT)
    const resultData = result?.data as QuizzStatusDataMap['SHOW_RESULT']
    expect(resultData.correct).toBe(true)
    expect(resultData.myPoints).toBe(1000)
    expect(resultData.correction).toBe('Correction 1')

    // Pas d'avance automatique en solo : le joueur lit la correction
    // à son rythme et passe manuellement à la question suivante
    const count = messages.length
    await vi.advanceTimersByTimeAsync(30000)
    expect(messages.length).toBe(count)

    engine.nextQuestion()
    await vi.advanceTimersByTimeAsync(2000)
    await vi.advanceTimersByTimeAsync(5000)
    expect(
      names(messages).filter((n) => n === QUIZZ_STATUS.SELECT_ANSWER),
    ).toHaveLength(2)

    // Mauvaise réponse puis fin du quizz
    engine.selectAnswer('p1', [1])
    await vi.advanceTimersByTimeAsync(1000)
    engine.showLeaderboard()
    expect(names(messages)).toContain(QUIZZ_STATUS.FINISHED)
    const finished = messages
      .filter((m) => m.name === QUIZZ_STATUS.FINISHED)
      .at(-1)
    const finishedData = finished?.data as QuizzStatusDataMap['FINISHED']
    expect(finishedData.myPoints).toBe(1000)
    expect(finishedData.top[0].points).toBe(1000)
  })

  it('attend les commandes de l’enseignant en projection', async () => {
    const { engine, messages } = setup('projection')
    void engine.start()
    await avancerJusquaSelect()
    engine.selectAnswer('p1', [1])
    await vi.advanceTimersByTimeAsync(1000)
    expect(names(messages)).toContain(QUIZZ_STATUS.SHOW_RESPONSES)

    // Aucune avance automatique : rien ne change sans commande
    const count = messages.length
    await vi.advanceTimersByTimeAsync(30000)
    expect(messages.length).toBe(count)

    engine.nextQuestion()
    expect(
      names(messages).filter((n) => n === QUIZZ_STATUS.SHOW_PREPARED),
    ).toHaveLength(2)

    await vi.advanceTimersByTimeAsync(2000)
    await vi.advanceTimersByTimeAsync(5000)
    engine.selectAnswer('p1', [0])
    await vi.advanceTimersByTimeAsync(1000)
    // Dernière question jouée : showLeaderboard termine le quizz
    engine.showLeaderboard()
    expect(names(messages)).toContain(QUIZZ_STATUS.FINISHED)
  })

  it('abortQuestion révèle les résultats sans attendre la fin du chrono', async () => {
    const { engine, messages } = setup('projection')
    void engine.start()
    await avancerJusquaSelect()
    expect(names(messages)).not.toContain(QUIZZ_STATUS.SHOW_RESPONSES)
    engine.abortQuestion()
    await vi.advanceTimersByTimeAsync(1000)
    expect(names(messages)).toContain(QUIZZ_STATUS.SHOW_RESPONSES)
  })

  it('ignore les réponses hors phase SELECT_ANSWER et les doublons', async () => {
    const { engine, events } = setup('solo')
    // Phase idle : ignoré
    engine.selectAnswer('p1', [1])
    expect(
      events.filter((e) => e.event === QUIZZ_EVENTS.PLAYER_ANSWER),
    ).toHaveLength(0)

    void engine.start()
    await avancerJusquaSelect()
    engine.selectAnswer('p1', [1])
    engine.selectAnswer('p1', [0]) // doublon : ignoré
    expect(
      events.filter((e) => e.event === QUIZZ_EVENTS.PLAYER_ANSWER),
    ).toHaveLength(1)
  })

  it('score simple : 1 point par question entièrement réussie', async () => {
    const { engine, messages } = setup('solo', 'simple')
    void engine.start()
    await avancerJusquaSelect()
    engine.selectAnswer('p1', [1])
    await vi.advanceTimersByTimeAsync(1000)
    const result = messages.find((m) => m.name === QUIZZ_STATUS.SHOW_RESULT)
    const resultData = result?.data as QuizzStatusDataMap['SHOW_RESULT']
    expect(resultData.points).toBe(1)
    expect(resultData.myPoints).toBe(1)
  })

  it('refuse de démarrer sans joueur connecté', async () => {
    const transport = new LocalTransport()
    const messages: QuizzStatusMessage[] = []
    transport.onStatus((m) => messages.push(m))
    const events: { event: string, payload?: unknown }[] = []
    transport.onEvent((event, payload) => events.push({ event, payload }))
    const engine = new QuizzEngine({
      quizz: makeQuizz(),
      players: new QuizzPlayerManager(),
      transport,
      mode: 'multi',
      scoring: 'full',
      managerId: 'mgr',
    })
    void engine.start()
    await vi.advanceTimersByTimeAsync(100)
    expect(names(messages)).not.toContain(QUIZZ_STATUS.SHOW_START)
    expect(
      events.some((e) => e.event === QUIZZ_EVENTS.ERROR_MESSAGE),
    ).toBe(true)
    expect(engine.isStarted()).toBe(false)
  })

  it('envoie SHOW_LEADERBOARD au manager seul quand managerId est fourni', async () => {
    const transport = new LocalTransport()
    const messages: QuizzStatusMessage[] = []
    transport.onStatus((m) => messages.push(m))
    transport.onEvent(() => {})
    const players = new QuizzPlayerManager()
    players.add({ id: 'p1', username: 'Moi', points: 0, streak: 0 })
    const engine = new QuizzEngine({
      quizz: makeQuizz(),
      players,
      transport,
      mode: 'multi',
      scoring: 'full',
      managerId: 'mgr',
    })
    void engine.start()
    await avancerJusquaSelect()
    engine.selectAnswer('p1', [1])
    await vi.advanceTimersByTimeAsync(1000)
    engine.showLeaderboard()
    const leaderboard = messages.find(
      (m) => m.name === QUIZZ_STATUS.SHOW_LEADERBOARD,
    )
    expect(leaderboard).toBeDefined()
    expect(leaderboard?.target).toBe('mgr')
  })

  it('SHOW_RESPONSES ne diffuse aucune réponse sélectionnée en multi-joueurs', async () => {
    const transport = new LocalTransport()
    const messages: QuizzStatusMessage[] = []
    transport.onStatus((m) => messages.push(m))
    transport.onEvent(() => {})
    const players = new QuizzPlayerManager()
    players.add({ id: 'p1', username: 'Alicia', points: 0, streak: 0 })
    players.add({ id: 'p2', username: 'Bilal', points: 0, streak: 0 })
    const engine = new QuizzEngine({
      quizz: makeQuizz(),
      players,
      transport,
      mode: 'multi',
      scoring: 'full',
      managerId: 'mgr',
    })
    void engine.start()
    await avancerJusquaSelect()
    engine.selectAnswer('p1', [1])
    engine.selectAnswer('p2', [0])
    await vi.advanceTimersByTimeAsync(1000)

    const responses = messages.find(
      (m) => m.name === QUIZZ_STATUS.SHOW_RESPONSES,
    )
    const responsesData = responses?.data as QuizzStatusDataMap['SHOW_RESPONSES']
    // La réponse du premier joueur ayant répondu ne doit pas ressortir :
    // seule la bonne réponse est mise en évidence sur l'écran de révélation.
    expect(responsesData.selected).toBeNull()
    expect(responsesData.responses).toEqual({ 0: 1, 1: 1 })

    // Le verdict personnel conserve, lui, la réponse de chaque joueur
    // (verdicts envoyés dans l'ordre du classement : p1 correcte d'abord).
    const verdicts = messages.filter((m) => m.name === QUIZZ_STATUS.SHOW_RESULT)
    expect(verdicts).toHaveLength(2)
    const verdictP1 = verdicts[0].data as QuizzStatusDataMap['SHOW_RESULT']
    const verdictP2 = verdicts[1].data as QuizzStatusDataMap['SHOW_RESULT']
    expect(verdictP1.selected).toEqual([1])
    expect(verdictP2.selected).toEqual([0])
  })

  it('SHOW_RESPONSES rappelle le choix de la classe en projection', async () => {
    const { engine, messages } = setup('projection')
    void engine.start()
    await avancerJusquaSelect()
    engine.selectAnswer('p1', [1])
    await vi.advanceTimersByTimeAsync(1000)
    const responses = messages.find(
      (m) => m.name === QUIZZ_STATUS.SHOW_RESPONSES,
    )
    const responsesData = responses?.data as QuizzStatusDataMap['SHOW_RESPONSES']
    expect(responsesData.selected).toEqual([1])
  })
})

describe('analyseExerciceQuizz', () => {
  function fakeExercice(
    propositionsPerQuestion: (string[] | null)[],
  ): IExercice {
    return {
      autoCorrection: propositionsPerQuestion.map((p) =>
        p == null ? {} : { propositions: p.map((texte) => ({ texte })) },
      ),
      listeQuestions: propositionsPerQuestion.map(() => 'question'),
      listeCorrections: propositionsPerQuestion.map(() => 'correction'),
      consigne: '',
      introduction: '',
      id: 'TEST-00',
      uuid: 'uuid-test',
      titre: 'Exercice de test',
    } as unknown as IExercice
  }

  it('ok si toutes les questions ont entre 2 et 4 propositions', () => {
    const analyse = analyseExerciceQuizz(
      fakeExercice([
        ['a', 'b'],
        ['a', 'b', 'c', 'd'],
      ]),
      0,
    )
    expect(analyse.status).toBe('ok')
    expect(analyse.keptQuestions).toEqual([0, 1])
    expect(analyse.droppedCount).toBe(0)
  })

  it('partial si certaines questions dépassent 4 propositions', () => {
    const analyse = analyseExerciceQuizz(
      fakeExercice([
        ['a', 'b'],
        ['a', 'b', 'c', 'd', 'e'],
      ]),
      0,
    )
    expect(analyse.status).toBe('partial')
    expect(analyse.keptQuestions).toEqual([0])
    expect(analyse.droppedCount).toBe(1)
  })

  it('incompatible si aucune question n’est un QCM exploitable', () => {
    const analyse = analyseExerciceQuizz(fakeExercice([null, ['a']]), 0)
    expect(analyse.status).toBe('incompatible')
    expect(analyse.keptQuestions).toEqual([])
  })

  it('incompatible pour un exercice statique (sans autoCorrection)', () => {
    const statique = { uuid: 'dnb_test', typeExercice: 'statique' }
    const analyse = analyseExerciceQuizz(statique as never, 0)
    expect(analyse.status).toBe('incompatible')
    expect(analyse.convertible).toBe(false)
  })
})

describe('freezeSeeds', () => {
  it('attribue une graine aux exercices qui n’en ont pas', () => {
    const params: InterfaceParams[] = [
      { uuid: 'a' },
      { uuid: 'b', alea: 'XYZ1' },
    ]
    const modified = freezeSeeds(params)
    expect(modified).toBe(true)
    expect(params[0].alea).toBeTruthy()
    expect(params[1].alea).toBe('XYZ1')
  })

  it('ne touche à rien si toutes les graines sont présentes', () => {
    const params: InterfaceParams[] = [{ uuid: 'a', alea: 'XYZ1' }]
    expect(freezeSeeds(params)).toBe(false)
  })
})
