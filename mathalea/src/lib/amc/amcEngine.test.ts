import { describe, expect, it } from 'vitest'

import {
  createIdGenerator,
  normalizeAMCNum,
  normalizeAMCOpen,
  renderAMCHybride,
  renderAMCNum,
  renderElement,
  renderQcm,
} from './amcEngine'
import type { AMCUneProposition, AutoCorrectionAMC } from './amcTypes'

const exerciceMock = {
  listeQuestions: ['Question 0', 'Question 1', 'Question 2'],
  listeCorrections: ['Correction 0', 'Correction 1', 'Correction 2'],
}

describe('amcEngine', () => {
  it('genere des ids incrementaux avec createIdGenerator', () => {
    const nextId = createIdGenerator('5A10', 0)

    expect(nextId()).toBe('5A10/A-10')
    expect(nextId()).toBe('5A10/A-11')
    expect(nextId()).toBe('5A10/A-12')
  })

  it('normalise une question AMC open', () => {
    const item: AutoCorrectionAMC = {
      enonce: 'Enonce open',
      propositions: [{ texte: 'Ma correction', statut: 2, pointilles: false }],
    }

    const normalized = normalizeAMCOpen(item, {
      ref: 'REF',
      id: 'Q1',
      index: 1,
      exercice: exerciceMock,
    })

    expect(normalized).toEqual({
      multicols: false,
      type: 'amcopen',
      id: 'Q1',
      ref: 'REF',
      enonce: 'Enonce open',
      correction: 'Ma correction',
      notation: 2,
      sanscadre: false,
      pointilles: false,
    })
  })

  it('normalise AMCNum en mode puissance', () => {
    const item: AutoCorrectionAMC = {
      enonce: 'Ecrire en puissance',
      reponse: {
        valeur: 125,
        param: {
          basePuissance: 5,
          exposantPuissance: 3,
          baseNbChiffres: 1,
          exposantNbChiffres: 1,
        },
      },
    }

    const normalized = normalizeAMCNum(item, {
      ref: 'REF',
      id: 'Q',
      index: 0,
      exercice: exerciceMock,
    })

    expect(normalized.id).toBe('Q')
    expect(normalized.blocks).toHaveLength(2)
    expect(normalized.blocks[0]).toMatchObject({
      label: 'Base',
      value: 5,
      digits: 1,
      decimals: 0,
      sign: false,
    })
    expect(normalized.blocks[1]).toMatchObject({
      label: 'Exposant',
      value: 3,
      digits: 1,
      decimals: 0,
      sign: true,
    })
  })

  it('normalise AMCNum en mode fraction avec Tpoint specifique', () => {
    const item: AutoCorrectionAMC = {
      reponse: {
        valeur: { num: 3, den: 4 },
        param: {
          digitsNum: 1,
          digitsDen: 1,
        },
      },
    }

    const normalized = normalizeAMCNum(item, {
      ref: 'REF',
      id: 'Q',
      index: 1,
      exercice: exerciceMock,
    })

    expect(normalized.blocks).toHaveLength(1)
    expect(normalized.blocks[0].decimals).toBe(1)
    expect(normalized.blocks[0].options?.Tpoint).toContain('\\vrule')
  })

  it('normalise AMCNum en mode decimal', () => {
    const item: AutoCorrectionAMC = {
      reponse: {
        valeur: 12.5,
        param: {
          digits: 3,
          decimals: 1,
          approx: 0,
          tpoint: ',',
        },
      },
    }

    const normalized = normalizeAMCNum(item, {
      ref: 'REF',
      id: 'Q',
      index: 2,
      exercice: exerciceMock,
    })

    expect(normalized.blocks).toHaveLength(1)
    expect(normalized.blocks[0]).toMatchObject({
      value: 12.5,
      digits: 3,
      decimals: 1,
      sign: false,
    })
    expect(normalized.blocks[0].options?.Tpoint).toBe(',')
  })

  it('conserve les décimales de la mantisse en notation scientifique', () => {
    const item: AutoCorrectionAMC = {
      reponse: {
        valeur: 0.0314,
        param: {
          digits: 3,
          decimals: 2,
          signe: false,
          exposantNbChiffres: 1,
          exposantSigne: true,
        },
      },
    }

    const normalized = normalizeAMCNum(item, {
      ref: 'REF',
      id: 'Q',
      index: 2,
      exercice: exerciceMock,
    })

    expect(normalized.blocks[0]).toMatchObject({
      value: 0.0314,
      digits: 3,
      decimals: 2,
      options: {
        exponent: 1,
        exposign: true,
      },
    })
  })

  it('rend les paramètres AMCnumericChoices de la notation scientifique', () => {
    const latex = renderAMCNum(
      {
        reponse: {
          valeur: 0.0314,
          param: {
            digits: 3,
            decimals: 2,
            exposantNbChiffres: 1,
            exposantSigne: true,
          },
        },
      },
      {
        ref: 'REF',
        id: 'Q',
        index: 0,
        exercice: exerciceMock,
      },
    )

    expect(latex).toContain('\\AMCnumericChoices{0.0314}')
    expect(latex).toContain('digits=3')
    expect(latex).toContain('decimals=2')
    expect(latex).toContain('exponent=1')
    expect(latex).toContain('exposign=true')
  })

  it('normalise AMCNum entier avec un nombre de digits coherent par defaut', () => {
    const item: AutoCorrectionAMC = {
      reponse: {
        valeur: 53,
        param: {
          decimals: 0,
          tpoint: ',',
          digits: 2,
        },
      },
    }

    const normalized = normalizeAMCNum(item, {
      ref: 'REF',
      id: 'Q',
      index: 0,
      exercice: exerciceMock,
    })

    expect(normalized.blocks).toHaveLength(1)
    expect(normalized.blocks[0]).toMatchObject({
      value: 53,
      digits: 2,
      decimals: 0,
    })
  })

  it('rend un QCM mono avec renderQcm', () => {
    const item: AMCUneProposition = {
      enonce: 'Choisir la bonne reponse',
      propositions: [
        { texte: 'A', statut: false },
        { texte: 'B', statut: true },
      ],
      options: {
        vertical: true,
        ordered: false,
      },
    }

    const latex = renderQcm(item, {
      type: 'qcm',
      ref: 'REF',
      id: 'QCM1',
      index: 0,
      exercice: exerciceMock,
    })

    expect(latex).toContain('\\element{REF}{')
    expect(latex).toContain('\\begin{question}{QCM1}')
    expect(latex).toContain('\\bonne{B}')
    expect(latex).toContain('\\mauvaise{A}')
  })

  it('dispatch correctement via renderElement', () => {
    const item: AMCUneProposition = {
      enonce: 'Question dispatch QCM',
      propositions: [
        { texte: 'Vrai', statut: true },
        { texte: 'Faux', statut: false },
      ],
    }

    const latex = renderElement(
      { type: 'qcm', data: item },
      {
        type: 'qcm',
        ref: 'REF',
        id: 'Q',
        index: 0,
        exercice: exerciceMock,
      },
    )

    expect(latex).toContain('Question dispatch QCM')
    expect(latex).toContain('\\bonne{Vrai}')
  })

  it('rend AMCNum sans erreur de template', () => {
    const item: AutoCorrectionAMC = {
      enonce: 'Calculer',
      reponse: {
        valeur: 9,
        param: { digits: 1, decimals: 0, tpoint: ',' },
      },
    }

    const latex = renderAMCNum(item, {
      ref: 'REF',
      id: 'Q',
      index: 0,
      exercice: exerciceMock,
    })

    expect(latex).toContain('\\element{REF}')
    expect(latex).toContain('\\begin{questionmultx}{Q}')
    expect(latex).toContain('\\AMCnumericChoices{9}')
  })

  it('rend un AMCHybride avec bloc QCM', () => {
    const hybride = renderAMCHybride({
      type: 'AMCHybride',
      autoCorrectionItem: {
        enonce: 'Enonce hybride',
        enonceAvant: true,
        propositions: [
          {
            type: 'qcmMono',
            enonce: 'Sous-question QCM',
            propositions: [
              { texte: 'A', statut: false },
              { texte: 'B', statut: true },
            ],
            options: { ordered: true, lastChoice: 1 },
          },
        ],
      },
      exercice: exerciceMock,
      ref: 'REF',
      idExo: 0,
      questionIndex: 0,
      currentId: 0,
      melange: true,
    })

    expect(hybride.texQr).toContain('Enonce hybride')
    expect(hybride.texQr).toContain('Sous-question QCM')
    expect(hybride.texQr).toContain('\\bonne{B}')
    expect(hybride.texQr).toContain('\\mauvaise{A}')
    expect(hybride.nextId).toBe(1)
    expect(hybride.melange).toBe(true)
  })

  it('rend un AMCHybride avec bloc AMCOpen', () => {
    const hybride = renderAMCHybride({
      type: 'AMCHybride',
      autoCorrectionItem: {
        enonce: 'Enonce open hybride',
        propositions: [
          {
            type: 'AMCOpen',
            propositions: [
              {
                texte: 'Correction open hybride',
                statut: 2,
                numQuestionVisible: false,
                sanscadre: 0,
                pointilles: 1,
              },
            ],
          },
        ],
      },
      exercice: exerciceMock,
      ref: 'REF',
      idExo: 0,
      questionIndex: 0,
      currentId: 0,
      melange: true,
    })

    expect(hybride.texQr).toContain('\\QuestionIndicative')
    expect(hybride.texQr).toContain('Correction open hybride')
    expect(hybride.texQr).toContain('\\notation{2}[0][1]')
    expect(hybride.nextId).toBe(1)
  })

  it('rend un AMCHybride avec bloc AMCNum puissance et met a jour nextId/melange', () => {
    const hybride = renderAMCHybride({
      type: 'AMCHybride',
      autoCorrectionItem: {
        enonce: 'Enonce num hybride',
        melange: false,
        propositions: [
          {
            type: 'AMCNum',
            propositions: [
              {
                texte: 'Corr num',
                reponse: {
                  texte: 'Ecrire sous forme de puissance',
                  valeur: 0,
                  param: {
                    basePuissance: 5,
                    exposantPuissance: 3,
                    baseNbChiffres: 1,
                    exposantNbChiffres: 1,
                  },
                },
              },
            ],
          },
        ],
      },
      exercice: exerciceMock,
      ref: 'REF',
      idExo: 0,
      questionIndex: 0,
      currentId: 0,
      melange: true,
    })

    expect(hybride.texQr).toContain('Base')
    expect(hybride.texQr).toContain('Exposant')
    expect(hybride.texQr).toContain('\\AMCnumericChoices{5}')
    expect(hybride.texQr).toContain('\\AMCnumericChoices{3}')
    expect(hybride.texQr).toContain('\\begin{questionmultx}{REF/A-10}')
    expect(hybride.nextId).toBe(1)
    expect(hybride.melange).toBe(false)
  })

  it('preserve enonce principal, explain et enonce de sous-question pour AMCNum hybride', () => {
    const hybride = renderAMCHybride({
      type: 'AMCHybride',
      autoCorrectionItem: {
        enonce: 'Contexte principal',
        propositions: [
          {
            type: 'AMCNum',
            texte: 'Explication principale',
            propositions: [
              {
                reponse: {
                  texte: 'Sous-question numerique',
                  valeur: 35,
                  param: { digits: 2, decimals: 0, tpoint: ',' },
                },
              },
            ],
          },
        ],
      },
      exercice: exerciceMock,
      ref: 'REF',
      idExo: 0,
      questionIndex: 0,
      currentId: 0,
      melange: true,
    })

    expect(hybride.texQr).toContain('Contexte principal')
    expect(hybride.texQr).toContain('\\explain{Explication principale}')
    expect(hybride.texQr).toContain('Sous-question numerique')
    expect(hybride.texQr).toContain('\\AMCnumericChoices{35}')
  })

  it('n affiche l enonce principal qu une seule fois pour plusieurs blocs AMCNum hybrides', () => {
    const hybride = renderAMCHybride({
      type: 'AMCHybride',
      autoCorrectionItem: {
        enonce: 'Contexte principal',
        propositions: [
          {
            type: 'AMCNum',
            texte: 'Explication 1',
            propositions: [
              {
                reponse: {
                  texte: 'Numerateur',
                  valeur: 1,
                  param: { digits: 1, decimals: 0, tpoint: ',' },
                },
              },
            ],
          },
          {
            type: 'AMCNum',
            propositions: [
              {
                reponse: {
                  texte: 'Denominateur',
                  valeur: 3,
                  param: { digits: 1, decimals: 0, tpoint: ',' },
                },
              },
            ],
          },
        ],
      },
      exercice: exerciceMock,
      ref: 'REF',
      idExo: 0,
      questionIndex: 0,
      currentId: 0,
      melange: true,
    })

    expect(hybride.texQr.match(/Contexte principal/g)).toHaveLength(1)
    expect(hybride.texQr).toContain('Numerateur')
    expect(hybride.texQr).toContain('Denominateur')
    expect(hybride.texQr).toContain('\\AMCnumericChoices{1}')
    expect(hybride.texQr).toContain('\\AMCnumericChoices{3}')
  })

  it('ne remplace pas $1 dans explain AMCNum hybride', () => {
    const hybride = renderAMCHybride({
      type: 'AMCHybride',
      autoCorrectionItem: {
        enonce: 'Contexte principal',
        propositions: [
          {
            type: 'AMCNum',
            texte: 'Les diviseurs sont : $1, 5, 7$.',
            propositions: [
              {
                reponse: {
                  texte: 'Sous-question numerique',
                  valeur: 35,
                  param: { digits: 2, decimals: 0, tpoint: ',' },
                },
              },
            ],
          },
        ],
      },
      exercice: exerciceMock,
      ref: 'REF',
      idExo: 0,
      questionIndex: 0,
      currentId: 0,
      melange: true,
    })

    expect(hybride.texQr).toContain('Les diviseurs sont : $1, 5, 7$.')
    expect(hybride.texQr).not.toContain(
      'Les diviseurs sont : \\begin{questionmultx}',
    )
  })

  it('supprime un prefixe undefined dans le texte de sous-question AMCNum hybride', () => {
    const hybride = renderAMCHybride({
      type: 'AMCHybride',
      autoCorrectionItem: {
        enonce: '',
        propositions: [
          {
            type: 'AMCNum',
            propositions: [
              {
                reponse: {
                  texte: 'undefined<br>Nombre maximal de bouquets :',
                  valeur: 35,
                  param: { digits: 2, decimals: 0, tpoint: ',' },
                },
              },
            ],
          },
        ],
      },
      exercice: exerciceMock,
      ref: 'REF',
      idExo: 0,
      questionIndex: 0,
      currentId: 0,
      melange: true,
    })

    expect(hybride.texQr).toContain('Nombre maximal de bouquets :')
    expect(hybride.texQr).not.toContain('undefined<br>')
    expect(hybride.texQr).not.toContain('undefined\\')
  })
})
