import { describe, expect, it } from 'vitest'
import { noterCopie, noterQuestion } from './scoring'
import type {
  OmrBox,
  OmrBoxReading,
  OmrEvaluation,
  OmrQuestion,
} from './omrTypes'

function box(
  id: string,
  qid: string,
  correct: boolean,
  valeur?: string,
): OmrBox {
  return {
    id,
    qid,
    page: 1,
    x: 0.1,
    y: 0.1,
    w: 0.02,
    h: 0.014,
    correct,
    valeur,
  }
}

function lectures(
  etats: Record<string, OmrBoxReading['status']>,
): Map<string, OmrBoxReading> {
  return new Map(
    Object.entries(etats).map(([id, status]) => [
      id,
      { id, darkness: status === 'cochee' ? 0.9 : 0.01, status },
    ]),
  )
}

describe('noterQuestion — QCM à choix unique', () => {
  const question: OmrQuestion = {
    qid: 'q1',
    exercice: 0,
    question: 0,
    type: 'qcmMono',
    points: 2,
  }
  const boxes = [
    box('q1.0', 'q1', true),
    box('q1.1', 'q1', false),
    box('q1.2', 'q1', false),
  ]

  it('accorde les points à la bonne case', () => {
    const r = noterQuestion(
      question,
      boxes,
      lectures({ 'q1.0': 'cochee', 'q1.1': 'vide', 'q1.2': 'vide' }),
    )
    expect(r).toMatchObject({ statut: 'lu', points: 2, reponse: 'A' })
  })

  it('n’accorde rien à une mauvaise case, sans pénalité', () => {
    const r = noterQuestion(
      question,
      boxes,
      lectures({ 'q1.0': 'vide', 'q1.1': 'cochee', 'q1.2': 'vide' }),
    )
    expect(r).toMatchObject({ statut: 'lu', points: 0, reponse: 'B' })
  })

  it('distingue l’absence de réponse d’une réponse fausse', () => {
    const r = noterQuestion(
      question,
      boxes,
      lectures({ 'q1.0': 'vide', 'q1.1': 'vide', 'q1.2': 'vide' }),
    )
    expect(r.statut).toBe('sansReponse')
  })

  it('signale deux cases cochées plutôt que d’en choisir une', () => {
    const r = noterQuestion(
      question,
      boxes,
      lectures({ 'q1.0': 'cochee', 'q1.1': 'cochee', 'q1.2': 'vide' }),
    )
    expect(r).toMatchObject({ statut: 'multiple', points: 0, reponse: 'AB' })
  })

  it('ne transforme jamais une case ambiguë en note', () => {
    // même quand la bonne case est franchement cochée : une autre case
    // douteuse peut être une réponse raturée, c'est au professeur de voir
    const r = noterQuestion(
      question,
      boxes,
      lectures({ 'q1.0': 'cochee', 'q1.1': 'ambigue', 'q1.2': 'vide' }),
    )
    expect(r).toMatchObject({ statut: 'ambigu', points: 0 })
  })
})

describe('noterQuestion — QCM à choix multiples', () => {
  const boxes = [
    box('q2.0', 'q2', true),
    box('q2.1', 'q2', true),
    box('q2.2', 'q2', false),
    box('q2.3', 'q2', false),
  ]
  const base: OmrQuestion = {
    qid: 'q2',
    exercice: 0,
    question: 1,
    type: 'qcmMult',
    points: 4,
  }

  it('applique le tout ou rien en l’absence de barème', () => {
    const juste = noterQuestion(
      base,
      boxes,
      lectures({
        'q2.0': 'cochee',
        'q2.1': 'cochee',
        'q2.2': 'vide',
        'q2.3': 'vide',
      }),
    )
    expect(juste.points).toBe(4)
    const presque = noterQuestion(
      base,
      boxes,
      lectures({
        'q2.0': 'cochee',
        'q2.1': 'vide',
        'q2.2': 'vide',
        'q2.3': 'vide',
      }),
    )
    expect(presque.points).toBe(0)
  })

  it('compte case par case quand un barème est donné', () => {
    const question = { ...base, bareme: { b: 1, m: -1 } }
    // 3 cases bien traitées, 1 mal traitée
    const r = noterQuestion(
      question,
      boxes,
      lectures({
        'q2.0': 'cochee',
        'q2.1': 'vide',
        'q2.2': 'vide',
        'q2.3': 'vide',
      }),
    )
    expect(r.points).toBe(2)
  })

  it('respecte plancher et plafond', () => {
    const question = { ...base, bareme: { b: 1, m: -5, p: 0, P: 3 } }
    const catastrophe = noterQuestion(
      question,
      boxes,
      lectures({
        'q2.0': 'vide',
        'q2.1': 'vide',
        'q2.2': 'cochee',
        'q2.3': 'cochee',
      }),
    )
    expect(catastrophe.points).toBe(0)
    const parfait = noterQuestion(
      question,
      boxes,
      lectures({
        'q2.0': 'cochee',
        'q2.1': 'cochee',
        'q2.2': 'vide',
        'q2.3': 'vide',
      }),
    )
    expect(parfait.points).toBe(3)
  })

  it('revient au tout ou rien quand le barème demande « maximum ou zéro »', () => {
    const question = { ...base, bareme: { b: 1, m: -1, mz: true } }
    const r = noterQuestion(
      question,
      boxes,
      lectures({
        'q2.0': 'cochee',
        'q2.1': 'vide',
        'q2.2': 'vide',
        'q2.3': 'vide',
      }),
    )
    expect(r.points).toBe(0)
  })
})

describe('noterQuestion — réponse numérique', () => {
  const question: OmrQuestion = {
    qid: 'q3',
    exercice: 0,
    question: 2,
    type: 'AMCNum',
    points: 3,
  }
  // deux colonnes de trois chiffres, réponse attendue « 12 »
  const boxes = [
    box('q3.0_0', 'q3', false, '0'),
    box('q3.0_1', 'q3', true, '1'),
    box('q3.0_2', 'q3', false, '2'),
    box('q3.1_0', 'q3', false, '0'),
    box('q3.1_1', 'q3', false, '1'),
    box('q3.1_2', 'q3', true, '2'),
  ]

  it('reconstitue le nombre chiffre par chiffre', () => {
    const r = noterQuestion(
      question,
      boxes,
      lectures({
        'q3.0_0': 'vide',
        'q3.0_1': 'cochee',
        'q3.0_2': 'vide',
        'q3.1_0': 'vide',
        'q3.1_1': 'vide',
        'q3.1_2': 'cochee',
      }),
    )
    expect(r).toMatchObject({ statut: 'lu', points: 3, reponse: '12' })
  })

  it('n’accorde rien à un nombre faux, mais le rapporte', () => {
    const r = noterQuestion(
      question,
      boxes,
      lectures({
        'q3.0_0': 'vide',
        'q3.0_1': 'vide',
        'q3.0_2': 'cochee',
        'q3.1_0': 'vide',
        'q3.1_1': 'cochee',
        'q3.1_2': 'vide',
      }),
    )
    expect(r).toMatchObject({ statut: 'lu', points: 0, reponse: '21' })
  })

  it('signale une colonne laissée vide sans deviner le chiffre', () => {
    const r = noterQuestion(
      question,
      boxes,
      lectures({
        'q3.0_0': 'vide',
        'q3.0_1': 'cochee',
        'q3.0_2': 'vide',
        'q3.1_0': 'vide',
        'q3.1_1': 'vide',
        'q3.1_2': 'vide',
      }),
    )
    expect(r).toMatchObject({ statut: 'sansReponse', reponse: '1_' })
  })

  it('signale une colonne à deux chiffres cochés', () => {
    const r = noterQuestion(
      question,
      boxes,
      lectures({
        'q3.0_0': 'cochee',
        'q3.0_1': 'cochee',
        'q3.0_2': 'vide',
        'q3.1_0': 'vide',
        'q3.1_1': 'vide',
        'q3.1_2': 'cochee',
      }),
    )
    expect(r).toMatchObject({ statut: 'multiple', reponse: '*2' })
  })
})

describe('noterQuestion — question ouverte notée à la main', () => {
  const question: OmrQuestion = {
    qid: 'q4',
    exercice: 0,
    question: 3,
    type: 'AMCOpen',
    points: 3,
  }
  const boxes = [0, 1, 2, 3].map((p) => box(`q4.${p}`, 'q4', false, String(p)))

  it('reprend la note noircie par le correcteur', () => {
    const r = noterQuestion(
      question,
      boxes,
      lectures({
        'q4.0': 'vide',
        'q4.1': 'vide',
        'q4.2': 'cochee',
        'q4.3': 'vide',
      }),
    )
    expect(r).toMatchObject({ statut: 'lu', points: 2 })
  })

  it('signale une question que le correcteur a oublié de noter', () => {
    const r = noterQuestion(
      question,
      boxes,
      lectures({
        'q4.0': 'vide',
        'q4.1': 'vide',
        'q4.2': 'vide',
        'q4.3': 'vide',
      }),
    )
    expect(r.statut).toBe('sansReponse')
  })
})

describe('noterCopie', () => {
  const boxes: OmrBox[] = [
    box('q1.0', 'q1', true),
    box('q1.1', 'q1', false),
    { ...box('q5.0', 'q5', true), page: 2 },
    { ...box('q5.1', 'q5', false), page: 2 },
  ]
  const evaluation: OmrEvaluation = {
    version: 1,
    sujet: { titre: 'T', checkSum: 'x', exercicesParams: [] },
    page: { widthPt: 595.28, heightPt: 841.89 },
    reperes: [
      { x: 0.06, y: 0.04 },
      { x: 0.94, y: 0.04 },
      { x: 0.94, y: 0.96 },
      { x: 0.06, y: 0.96 },
    ],
    layouts: { L1: boxes },
    copies: [
      {
        copieId: 'c01',
        eleve: { id: 'e1', nom: 'Alice' },
        layoutId: 'L1',
        pages: [1, 2],
      },
    ],
    questions: [
      { qid: 'q1', exercice: 0, question: 0, type: 'qcmMono', points: 2 },
      { qid: 'q5', exercice: 0, question: 1, type: 'qcmMono', points: 3 },
    ],
  }

  it('additionne les points et le maximum', () => {
    const r = noterCopie(
      evaluation,
      'c01',
      [
        { id: 'q1.0', darkness: 0.9, status: 'cochee' },
        { id: 'q1.1', darkness: 0.01, status: 'vide' },
        { id: 'q5.0', darkness: 0.9, status: 'cochee' },
        { id: 'q5.1', darkness: 0.01, status: 'vide' },
      ],
      [1, 2],
    )
    expect(r.points).toBe(5)
    expect(r.pointsMax).toBe(5)
    expect(r.pagesManquantes).toEqual([])
    expect(r.aArbitrer).toBe(0)
  })

  it('signale une page absente du scan sans la noter zéro en silence', () => {
    const r = noterCopie(
      evaluation,
      'c01',
      [
        { id: 'q1.0', darkness: 0.9, status: 'cochee' },
        { id: 'q1.1', darkness: 0.01, status: 'vide' },
      ],
      [1],
    )
    expect(r.pagesManquantes).toEqual([2])
    expect(r.questions.find((q) => q.qid === 'q5')?.statut).toBe(
      'pageManquante',
    )
    expect(r.aArbitrer).toBe(1)
  })

  it('refuse une copie inconnue du fichier d’accompagnement', () => {
    expect(() => noterCopie(evaluation, 'c99', [], [1])).toThrow(/c99/)
  })
})
