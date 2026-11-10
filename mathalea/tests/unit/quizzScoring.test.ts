import { describe, expect, it } from 'vitest'
import {
  multiScoreRatio,
  orderToPoint,
  QUIZZ_MAX_POINTS,
  ratioToPoints,
  scoreRatio,
  singleScoreRatio,
  timeToPoint,
} from '../../src/modules/quizz/engine/scoring'
import type { QuizzQuestion } from '../../src/modules/quizz/types'

const questionSingle: QuizzQuestion = {
  type: 'single',
  question: 'Q ?',
  answers: ['a', 'b', 'c'],
  solutions: [1],
  correction: 'correction',
  cooldown: 5,
  time: 20,
}

const questionMulti: QuizzQuestion = {
  type: 'multi',
  question: 'Q ?',
  answers: ['a', 'b', 'c', 'd'],
  solutions: [0, 2],
  correction: 'correction',
  cooldown: 5,
  time: 20,
}

describe('timeToPoint', () => {
  it('donne maxPoints pour une réponse instantanée', () => {
    expect(timeToPoint(0, questionSingle)).toBe(QUIZZ_MAX_POINTS)
  })

  it('décroît linéairement avec le temps de réponse', () => {
    expect(timeToPoint(10, questionSingle)).toBe(QUIZZ_MAX_POINTS / 2)
  })

  it('atteint 0 à la fin du temps imparti et ne devient pas négatif', () => {
    expect(timeToPoint(20, questionSingle)).toBe(0)
    expect(timeToPoint(25, questionSingle)).toBe(0)
  })

  it('respecte un maxPoints personnalisé', () => {
    expect(timeToPoint(0, { ...questionSingle, maxPoints: 500 })).toBe(500)
  })
})

describe('orderToPoint', () => {
  it('donne maxPoints à un joueur seul', () => {
    expect(orderToPoint(0, 1)).toBe(QUIZZ_MAX_POINTS)
  })

  it('donne maxPoints au premier et maxPoints/2 au dernier', () => {
    expect(orderToPoint(0, 3)).toBe(QUIZZ_MAX_POINTS)
    expect(orderToPoint(2, 3)).toBe(QUIZZ_MAX_POINTS / 2)
  })
})

describe('singleScoreRatio', () => {
  it('vaut 1 pour la bonne réponse, 0 sinon', () => {
    expect(singleScoreRatio(questionSingle, [1])).toBe(1)
    expect(singleScoreRatio(questionSingle, [0])).toBe(0)
  })

  it('vaut 0 si plusieurs cases cochées sur une question single', () => {
    expect(singleScoreRatio(questionSingle, [0, 1])).toBe(0)
  })
})

describe('multiScoreRatio', () => {
  it('strict : tout ou rien', () => {
    expect(multiScoreRatio(questionMulti, [0, 2], 'strict')).toBe(1)
    expect(multiScoreRatio(questionMulti, [0], 'strict')).toBe(0)
    expect(multiScoreRatio(questionMulti, [0, 1, 2], 'strict')).toBe(0)
  })

  it('balanced : (bonnes − mauvaises) / solutions, borné à 0', () => {
    expect(multiScoreRatio(questionMulti, [0, 2], 'balanced')).toBe(1)
    expect(multiScoreRatio(questionMulti, [0], 'balanced')).toBe(0.5)
    expect(multiScoreRatio(questionMulti, [0, 1], 'balanced')).toBe(0)
    expect(multiScoreRatio(questionMulti, [1, 3], 'balanced')).toBe(0)
  })

  it('lenient : bonnes / solutions sans pénalité des mauvaises', () => {
    expect(multiScoreRatio(questionMulti, [0, 1], 'lenient')).toBe(0.5)
    expect(multiScoreRatio(questionMulti, [0, 1, 2, 3], 'lenient')).toBe(1)
  })

  it('scoreRatio dispatche selon le type de la question', () => {
    expect(scoreRatio(questionSingle, [1])).toBe(1)
    expect(scoreRatio(questionMulti, [0])).toBe(0.5)
  })
})

describe('ratioToPoints selon le mode de score', () => {
  it('full : points pondérés par le temps × ratio', () => {
    const result = ratioToPoints(0.5, 800, 'full')
    expect(result.points).toBe(400)
    expect(result.correct).toBe(true)
  })

  it('full : une mauvaise réponse ne rapporte rien', () => {
    const result = ratioToPoints(0, 800, 'full')
    expect(result.points).toBe(0)
    expect(result.correct).toBe(false)
  })

  it('simple : 1 point uniquement si entièrement correct', () => {
    expect(ratioToPoints(1, 800, 'simple').points).toBe(1)
    expect(ratioToPoints(0.5, 800, 'simple').points).toBe(0)
  })

  it('none : pas de points mais le ratio reste calculé', () => {
    const result = ratioToPoints(1, 800, 'none')
    expect(result.points).toBe(0)
    expect(result.correct).toBe(true)
    expect(result.ratio).toBe(1)
  })
})
