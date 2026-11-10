import { describe, expect, it } from 'vitest'
import type { ResultatAnalyse } from './analyseScan'
import { grilleBilan, grilleReponses, nomDeFichier, versCsv } from './omrExport'
import type { OmrEvaluation } from './omrTypes'

const evaluation = {
  version: 1,
  sujet: {
    titre: 'Contrôle nº 3 : fractions',
    checkSum: 'x',
    exercicesParams: [],
  },
  page: { widthPt: 595.28, heightPt: 841.89 },
  reperes: [
    { x: 0.06, y: 0.04 },
    { x: 0.94, y: 0.04 },
    { x: 0.94, y: 0.96 },
    { x: 0.06, y: 0.96 },
  ],
  layouts: { L1: [] },
  copies: [
    {
      copieId: 'c01',
      eleve: { id: 'e1', nom: 'Alice Martin' },
      layoutId: 'L1',
      pages: [1],
    },
    {
      copieId: 'c02',
      eleve: { id: 'e2', nom: 'Bo Nguyen' },
      layoutId: 'L1',
      pages: [2],
    },
    {
      copieId: 'c03',
      eleve: { id: 'e3', nom: 'Chen Wei' },
      layoutId: 'L1',
      pages: [3],
    },
  ],
  questions: [
    {
      qid: 'q1',
      exercice: 0,
      question: 0,
      type: 'qcmMono' as const,
      points: 2,
    },
    { qid: 'q2', exercice: 0, question: 1, type: 'AMCNum' as const, points: 3 },
  ],
} satisfies OmrEvaluation

const resultat: ResultatAnalyse = {
  pages: [],
  seuils: {},
  copiesAbsentes: ['c03'],
  copies: [
    {
      copieId: 'c01',
      eleve: { id: 'e1', nom: 'Alice Martin' },
      questions: [
        { qid: 'q1', statut: 'lu', points: 2, pointsMax: 2, reponse: 'A' },
        { qid: 'q2', statut: 'lu', points: 3, pointsMax: 3, reponse: '125' },
      ],
      points: 5,
      pointsMax: 5,
      pagesManquantes: [],
      aArbitrer: 0,
    },
    {
      copieId: 'c02',
      eleve: { id: 'e2', nom: 'Bo Nguyen' },
      questions: [
        { qid: 'q1', statut: 'ambigu', points: 0, pointsMax: 2, reponse: 'A' },
        { qid: 'q2', statut: 'sansReponse', points: 0, pointsMax: 3 },
      ],
      points: 0,
      pointsMax: 5,
      pagesManquantes: [2],
      aArbitrer: 1,
    },
  ],
}

describe('grilleBilan', () => {
  const grille = grilleBilan(evaluation, resultat)

  it('annonce le barème de chaque question dans l’en-tête', () => {
    expect(grille[0]).toEqual([
      'Élève',
      'Ex. 1 · Q1 (/2)',
      'Ex. 1 · Q2 (/3)',
      'Total',
      'Sur',
      'Anomalies',
    ])
  })

  it('identifie les questions par exercice plutôt que par leur rang global', () => {
    const plusieursExercices = structuredClone(evaluation)
    plusieursExercices.questions[1].exercice = 1
    plusieursExercices.questions[1].question = 0
    expect(grilleBilan(plusieursExercices, resultat)[0][2]).toBe(
      'Ex. 2 · Q1 (/3)',
    )
    expect(grilleReponses(plusieursExercices, resultat)[0][2]).toBe(
      'Ex. 2 · Q1',
    )
  })

  it('donne les points quand la lecture est sûre', () => {
    expect(grille[1]).toEqual(['Alice Martin', 2, 3, 5, 5, ''])
  })

  it('écrit pourquoi les points manquent plutôt qu’un zéro muet', () => {
    // un zéro et une lecture douteuse ne se corrigent pas de la même façon
    expect(grille[2]).toEqual([
      'Bo Nguyen',
      'à vérifier',
      'sans réponse',
      0,
      5,
      'pages absentes : 2 ; 1 question(s) à vérifier',
    ])
  })

  it('fait figurer une copie jamais retrouvée dans le lot', () => {
    expect(grille[3]).toEqual([
      'Chen Wei',
      '',
      '',
      '',
      '',
      'copie non retrouvée dans le lot',
    ])
  })
})

describe('grilleReponses', () => {
  it('rapporte ce qui a été lu, pas la note', () => {
    const grille = grilleReponses(evaluation, resultat)
    expect(grille[1]).toEqual(['Alice Martin', 'A', '125'])
    expect(grille[2]).toEqual(['Bo Nguyen', 'à vérifier', 'sans réponse'])
  })
})

describe('versCsv', () => {
  it('sépare par des points-virgules, convention des tableurs français', () => {
    expect(
      versCsv([
        ['a', 'b'],
        [1, 2],
      ]),
    ).toBe('a;b\n1;2')
  })

  it('protège les valeurs contenant un séparateur, un guillemet ou un saut de ligne', () => {
    expect(versCsv([['Martin; Alice', 'dit "Ali"', 'a\nb']])).toBe(
      '"Martin; Alice";"dit ""Ali""";"a\nb"',
    )
  })
})

describe('nomDeFichier', () => {
  it('dérive un nom sûr du titre de l’évaluation', () => {
    expect(nomDeFichier('Contrôle nº 3 : fractions')).toBe(
      'controle-n-3-fractions',
    )
  })

  it('retombe sur un nom par défaut si le titre ne laisse rien', () => {
    expect(nomDeFichier('!!!')).toBe('evaluation')
    expect(nomDeFichier('')).toBe('evaluation')
  })
})
