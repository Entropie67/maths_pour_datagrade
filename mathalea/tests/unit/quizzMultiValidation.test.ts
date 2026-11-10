import { describe, expect, it } from 'vitest'
import {
  MULTI_MAX_QUESTIONS,
  validateQuizzForMulti,
} from '../../src/lib/quizz/validateQuizzMulti'
import type { Quizz, QuizzQuestion } from '../../src/modules/quizz/types'

const makeQuestion = (
  overrides: Partial<QuizzQuestion> = {},
): QuizzQuestion => ({
  type: 'single',
  question: '<p>2 + 2 ?</p>',
  answers: ['<p>3</p>', '<p>4</p>'],
  solutions: [1],
  correction: '<p>2 + 2 = 4</p>',
  cooldown: 5,
  time: 20,
  ...overrides,
})

const makeQuizz = (
  questions: QuizzQuestion[] = [makeQuestion()],
  subject = 'Mon quizz',
): Quizz => ({ subject, questions })

describe('validation locale du quizz avant envoi au serveur', () => {
  it('accepte un quizz conforme', () => {
    expect(validateQuizzForMulti(makeQuizz())).toBeNull()
    expect(
      validateQuizzForMulti(
        makeQuizz([
          makeQuestion(),
          makeQuestion({
            type: 'multi',
            answers: ['<p>a</p>', '<p>b</p>', '<p>c</p>', '<p>d</p>'],
            solutions: [0, 2],
            time: -1, // sans limite de temps : accepté
          }),
        ]),
      ),
    ).toBeNull()
  })

  it('refuse un titre vide ou trop long', () => {
    expect(validateQuizzForMulti(makeQuizz(undefined, '   '))).toContain(
      'titre',
    )
    expect(
      validateQuizzForMulti(makeQuizz(undefined, 'x'.repeat(121))),
    ).toContain('120')
  })

  it('refuse un quizz sans question ou avec trop de questions', () => {
    expect(validateQuizzForMulti(makeQuizz([]))).toContain('aucune question')
    const trop = Array.from({ length: MULTI_MAX_QUESTIONS + 1 }, () =>
      makeQuestion(),
    )
    expect(validateQuizzForMulti(makeQuizz(trop))).toContain('50')
  })

  it('refuse les contenus trop longs en numérotant la question', () => {
    expect(
      validateQuizzForMulti(
        makeQuizz([makeQuestion({ question: 'x'.repeat(4001) })]),
      ),
    ).toContain('question 1')
    expect(
      validateQuizzForMulti(
        makeQuizz([
          makeQuestion(),
          makeQuestion({ answers: ['ok', 'x'.repeat(2001)] }),
        ]),
      ),
    ).toContain('question 2')
    expect(
      validateQuizzForMulti(
        makeQuizz([makeQuestion({ correction: 'x'.repeat(8001) })]),
      ),
    ).toContain('correction')
  })

  it('refuse les solutions invalides ou incohérentes avec le type', () => {
    expect(
      validateQuizzForMulti(makeQuizz([makeQuestion({ solutions: [] })])),
    ).toContain('aucune bonne réponse')
    expect(
      validateQuizzForMulti(makeQuizz([makeQuestion({ solutions: [5] })])),
    ).toContain('invalides')
    expect(
      validateQuizzForMulti(makeQuizz([makeQuestion({ solutions: [0, 1] })])),
    ).toContain('réponse unique')
  })

  it('refuse les durées hors bornes', () => {
    expect(
      validateQuizzForMulti(makeQuizz([makeQuestion({ cooldown: 2 })])),
    ).toContain('lecture')
    expect(
      validateQuizzForMulti(makeQuizz([makeQuestion({ cooldown: 16 })])),
    ).toContain('lecture')
    expect(
      validateQuizzForMulti(makeQuizz([makeQuestion({ time: 4 })])),
    ).toContain('réponse')
    expect(
      validateQuizzForMulti(makeQuizz([makeQuestion({ time: 121 })])),
    ).toContain('réponse')
    expect(
      validateQuizzForMulti(makeQuizz([makeQuestion({ time: 20.5 })])),
    ).toContain('réponse')
  })
})
