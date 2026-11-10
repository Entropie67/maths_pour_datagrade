import { describe, expect, it } from 'vitest'
import {
  buildQuizzResultsCsv,
  stripHtmlForCsv,
  type QuizzGameResults,
} from '../../src/lib/quizz/quizzResults'

const RESULTS: QuizzGameResults = {
  subject: 'Révisions de fractions',
  scoring: 'full',
  questions: [
    {
      question: '<p>1/2 + 1/4 = ?</p>',
      answers: ['<p>1/6</p>', '<p>2/6</p>', '<p>3/4</p>'],
      solutions: [2],
      correction: '<p>1/2 = 2/4.</p>',
      responses: { 0: 1, 1: 0, 2: 1 },
    },
    {
      question: '<p>Multiples de 3 ?</p>',
      answers: ['<p>6</p>', '<p>7</p>', '<p>9</p>', '<p>10</p>'],
      solutions: [0, 2],
      correction: '<p>6 = 2×3, 9 = 3×3.</p>',
      responses: { 0: 2, 1: 1, 2: 1, 3: 0 },
    },
  ],
  players: [
    {
      player: { id: 'p1', username: 'Ada', points: 1850, streak: 2 },
      rank: 1,
      answers: [
        { answerIds: [2], correct: true, points: 940 },
        { answerIds: [0, 2], correct: true, points: 910 },
      ],
    },
    {
      player: { id: 'p2', username: 'Bob', points: 400, streak: 0 },
      rank: 2,
      answers: [
        { answerIds: [0], correct: false, points: 0 },
        { answerIds: null, correct: false, points: 0 },
      ],
    },
  ],
}

describe('stripHtmlForCsv', () => {
  it('convertit le HTML en texte plat', () => {
    expect(stripHtmlForCsv('<p>2 + 2 = <strong>4</strong></p>')).toBe(
      '2 + 2 = 4',
    )
  })

  it('déduplique le rendu KaTeX (MathML masqué + rendu HTML)', () => {
    const katex =
      '<span class="katex">' +
      '<span class="katex-mathml"><math><semantics><mi>x</mi></semantics></math></span>' +
      '<span class="katex-html" aria-hidden="true"><span>x</span></span>' +
      '</span>'
    expect(stripHtmlForCsv(`<p>${katex} + 1</p>`)).toBe('x + 1')
  })
})

describe('buildQuizzResultsCsv', () => {
  it('produit les informations de la partie en tête', () => {
    const csv = buildQuizzResultsCsv(RESULTS)
    const lines = csv.split('\r\n')
    expect(lines[0]).toBe('Quizz;Révisions de fractions')
    expect(lines[1]).toMatch(/^Date;/)
    expect(lines[2]).toBe('Mode de score;full')
    expect(lines[3]).toBe('Joueurs;2')
  })

  it('produit le tableau des points par question', () => {
    const csv = buildQuizzResultsCsv(RESULTS)
    expect(csv).toContain('Rang;Pseudo;Total;Q1;Q2')
    expect(csv).toContain('1;Ada;1850;940;910')
    expect(csv).toContain('2;Bob;400;0;0')
  })

  it('produit le détail des réponses en lettres', () => {
    const csv = buildQuizzResultsCsv(RESULTS)
    expect(csv).toContain('1;Ada;C;A,C')
    expect(csv).toContain('2;Bob;A;—')
  })

  it('produit le rappel des questions avec les bonnes réponses et les choix', () => {
    const csv = buildQuizzResultsCsv(RESULTS)
    expect(csv).toContain('1;1/2 + 1/4 = ?;C;1;0;1;')
    expect(csv).toContain('2;Multiples de 3 ?;A,C;2;1;1;0')
  })

  it('échappe les cellules contenant séparateur, guillemets ou retours', () => {
    const results: QuizzGameResults = {
      ...RESULTS,
      subject: 'Quizz "piégé"; du lundi',
      players: [
        {
          player: { id: 'p1', username: 'A;B', points: 0, streak: 0 },
          rank: 1,
          answers: [],
        },
      ],
      questions: [],
    }
    const csv = buildQuizzResultsCsv(results)
    expect(csv).toContain('Quizz;"Quizz ""piégé""; du lundi"')
    expect(csv).toContain('"A;B"')
  })
})
