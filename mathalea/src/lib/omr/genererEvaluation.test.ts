import { describe, expect, it } from 'vitest'
import {
  decrireDocument,
  identifiantCopie,
  identifiantSujet,
  lireFichierEvaluation,
  lireListeDeClasse,
} from './genererEvaluation'
import type { OmrExerciceSource } from './buildOmrDocument'

const EXERCICE: OmrExerciceSource = {
  titre: 'Exercice de test',
  questions: [
    {
      qid: 'e0q0',
      type: 'qcmMono',
      enonce: 'A ?',
      points: 1,
      propositions: [
        { texte: 'a', correct: true },
        { texte: 'b', correct: false },
      ],
    },
  ],
}

describe('lireListeDeClasse', () => {
  it('lit un nom par ligne', () => {
    expect(lireListeDeClasse('Alice Martin\nBo Nguyen')).toEqual([
      { id: 'e01', nom: 'Alice Martin' },
      { id: 'e02', nom: 'Bo Nguyen' },
    ])
  })

  it('ne garde que la première colonne d’un collage de tableur', () => {
    const colle = 'Alice Martin\t3e B\t12,5\nBo Nguyen\t3e B\t9'
    expect(lireListeDeClasse(colle).map((e) => e.nom)).toEqual([
      'Alice Martin',
      'Bo Nguyen',
    ])
  })

  it('accepte aussi le point-virgule comme séparateur de colonnes', () => {
    expect(lireListeDeClasse('Alice;3eB').map((e) => e.nom)).toEqual(['Alice'])
  })

  it('ignore les lignes vides et les espaces superflus', () => {
    expect(lireListeDeClasse('  Alice  \n\n\n Bo \n')).toHaveLength(2)
  })

  it('renvoie une liste vide sur une saisie vide', () => {
    expect(lireListeDeClasse('   \n  ')).toEqual([])
  })
})

describe('identifiants', () => {
  it('numérote les copies sur deux chiffres, pour un tri lisible', () => {
    expect(identifiantCopie(0)).toBe('c01')
    expect(identifiantCopie(9)).toBe('c10')
  })

  it('dérive du sujet un identifiant court et purement alphanumérique', () => {
    // il voyage dans un QR-code : tout séparateur y serait ambigu
    expect(identifiantSujet('a1b2c3d4e5')).toBe('A1B2C3')
    expect(identifiantSujet('ab')).toBe('AB0000')
    expect(identifiantSujet('a-b_c/d+e:f')).toBe('ABCDEF')
  })
})

describe('decrireDocument', () => {
  it('crée une copie nominative par élève, avec les mêmes exercices', () => {
    const source = decrireDocument(
      'Contrôle',
      'abcdef12',
      [
        { id: 'e01', nom: 'Alice' },
        { id: 'e02', nom: 'Bo' },
      ],
      [EXERCICE],
    )
    expect(source.copies.map((c) => c.copieId)).toEqual(['c01', 'c02'])
    expect(source.copies.map((c) => c.eleve.nom)).toEqual(['Alice', 'Bo'])
    expect(source.sujetId).toBe('ABCDEF')
    expect(source.copies[0].exercices).toEqual(source.copies[1].exercices)
  })

  it('donne à chaque élève ses propres exercices quand ils sont fournis', () => {
    const exercicesBo: OmrExerciceSource[] = [
      { ...EXERCICE, titre: 'Version de Bo' },
    ]
    const source = decrireDocument(
      'Contrôle',
      'abcdef12',
      [
        { id: 'e01', nom: 'Alice' },
        { id: 'e02', nom: 'Bo' },
      ],
      [EXERCICE],
      undefined,
      [[EXERCICE], exercicesBo],
    )
    expect(source.copies[1].exercices).toEqual(exercicesBo)
    expect(source.copies[0].exercices).not.toEqual(source.copies[1].exercices)
  })

  it('retombe sur les exercices communs pour un élève sans version propre', () => {
    const source = decrireDocument(
      'Contrôle',
      'abcdef12',
      [
        { id: 'e01', nom: 'Alice' },
        { id: 'e02', nom: 'Bo' },
      ],
      [EXERCICE],
      undefined,
      [[{ ...EXERCICE, titre: 'Version d’Alice' }]],
    )
    expect(source.copies[1].exercices).toEqual([EXERCICE])
  })
})

describe('lireFichierEvaluation', () => {
  it('relit un fichier d’accompagnement valide', () => {
    const evaluation = {
      version: 1,
      sujet: { titre: 'T', checkSum: 'x', exercicesParams: [] },
      page: { widthPt: 595, heightPt: 842 },
      reperes: [],
      layouts: { L1: [] },
      copies: [],
      questions: [],
    }
    expect(lireFichierEvaluation(JSON.stringify(evaluation))).toMatchObject({
      version: 1,
    })
  })

  it('refuse un JSON qui n’est pas un accompagnement MathALÉA', () => {
    // déposer le mauvais fichier est l'erreur la plus probable de ce parcours
    expect(() => lireFichierEvaluation('{"foo":1}')).toThrow(/MathALÉA/)
    expect(() => lireFichierEvaluation('{"version":2}')).toThrow(/MathALÉA/)
  })

  it('laisse remonter une erreur de syntaxe JSON', () => {
    expect(() => lireFichierEvaluation('pas du json')).toThrow()
  })
})
