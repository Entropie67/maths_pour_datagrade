import { describe, expect, it } from 'vitest'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { OmrEvaluation } from './omrTypes'
import type { ResultatAnalyse } from './analyseScan'
import { construireFeedback } from './omrFeedback'

const evaluation: OmrEvaluation = {
  version: 1,
  sujet: { titre: 'Évaluation', checkSum: '', exercicesParams: [] },
  page: { widthPt: 595, heightPt: 842 },
  reperes: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
  ],
  copies: [
    {
      copieId: 'c01',
      eleve: { id: 'e', nom: 'Élève <A>' },
      layoutId: 'l',
      pages: [1],
    },
  ],
  questions: [
    { qid: 'q1', exercice: 0, question: 0, type: 'qcmMono', points: 2 },
    { qid: 'q2', exercice: 0, question: 1, type: 'AMCOpen', points: 2 },
    { qid: 'q3', exercice: 1, question: 0, type: 'AMCOpen', points: 2 },
  ],
  layouts: {
    l: [
      {
        id: 'q1.0',
        qid: 'q1',
        page: 1,
        x: 0.2,
        y: 0.2,
        w: 0.02,
        h: 0.02,
        correct: true,
      },
    ],
  },
}
const resultat: ResultatAnalyse = {
  pages: [{ rang: 1, copieId: 'c01', page: 1, statut: 'ok', mesures: [] }],
  copies: [
    {
      copieId: 'c01',
      eleve: { id: 'e', nom: 'Élève <A>' },
      points: 4,
      pointsMax: 6,
      aArbitrer: 0,
      pagesManquantes: [],
      questions: [
        { qid: 'q1', points: 2, pointsMax: 2, statut: 'lu', reponse: 'A' },
        {
          qid: 'q2',
          points: 1,
          pointsMax: 2,
          statut: 'lu',
          reponse: 'note codée',
        },
        {
          qid: 'q3',
          points: 1,
          pointsMax: 2,
          statut: 'lu',
          reponse: 'note codée',
        },
      ],
    },
  ],
  seuils: {},
  copiesAbsentes: [],
  revision: {
    cases: {},
    questions: {
      c01: {
        q1: { commentaire: 'Bien.' },
        q2: { commentaire: '  ' },
        q3: { commentaire: '#include "fichier"' },
      },
    },
    validees: ['c01'],
  },
}

describe('fiche compacte de correction', () => {
  it('regroupe les questions en colonnes par exercice avec les trois lignes demandées', () => {
    const source = construireFeedback(evaluation, resultat)
    expect(source).toContain('Exercice 1 — 3 / 4')
    expect(source).toContain('Exercice 2 — 1 / 2')
    expect(source).toContain('text(weight: "bold", "Q1")')
    expect(source).toContain('text(weight: "bold", "Q2")')
    for (const label of ['Note', 'Saisie', 'Attendue'])
      expect(source).toContain(`text(weight: "bold", "${label}")`)
    expect(source).not.toContain('Copie c01')
    expect(source).not.toContain('Relecture validée')
  })
  it('ne conserve que la note pour les questions ouvertes et omet les commentaires vides', () => {
    const source = construireFeedback(evaluation, resultat)
    expect(source).not.toContain('Évaluation du correcteur')
    expect(source).not.toContain('note codée')
    const exerciceOuvert = source.slice(source.indexOf('Exercice 2 —'))
    expect(exerciceOuvert).not.toContain('Saisie')
    expect(exerciceOuvert).not.toContain('Attendue')
    expect(source).toContain(JSON.stringify('Q1 : Bien.'))
    expect(source).toContain(JSON.stringify('Q1 : #include "fichier"'))
    expect(source).not.toContain('Q2 :')
  })
})

it.skipIf(spawnSync('typst', ['--version']).status !== 0)(
  'compile réellement le tableau mixte QCM/question ouverte et un deuxième exercice ouvert',
  () => {
    const dossier = mkdtempSync(join(tmpdir(), 'omr-fiche-'))
    try {
      writeFileSync(
        join(dossier, 'fiche.typ'),
        construireFeedback(evaluation, resultat),
      )
      const compile = spawnSync(
        'typst',
        [
          'compile',
          '--font-path',
          'public/fonts/typst',
          join(dossier, 'fiche.typ'),
          join(dossier, 'fiche.pdf'),
        ],
        { encoding: 'utf8' },
      )
      expect(compile.status, compile.stderr).toBe(0)
      expect(
        readFileSync(join(dossier, 'fiche.pdf')).subarray(0, 4).toString(),
      ).toBe('%PDF')
      const extrait = spawnSync(
        'pdftotext',
        ['-layout', join(dossier, 'fiche.pdf'), '-'],
        { encoding: 'utf8' },
      )
      if (!extrait.error) {
        expect(extrait.stdout).toContain('Bien.')
        expect(extrait.stdout).toContain('Saisie')
        expect(extrait.stdout).not.toContain('Copie c01')
        expect(extrait.stdout).not.toContain('Évaluation du correcteur')
      }
    } finally {
      rmSync(dossier, { recursive: true, force: true })
    }
  },
)
