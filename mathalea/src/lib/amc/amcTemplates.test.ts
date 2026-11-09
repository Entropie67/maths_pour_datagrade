import { describe, expect, it } from 'vitest'

import {
  AMCHybrideContainerTemplate,
  AMCHybrideNumDecimalTemplate,
  AMCNumTemplate,
  AMCOpenTemplate,
  qcmTemplate,
  renderTemplate,
} from './amcTemplates'

describe('renderTemplate - AMClabel injection', () => {
  it('ajoute AMClabel une seule fois dans un template simple', () => {
    const result = renderTemplate(AMCOpenTemplate, {
      ref: 'TEST-REF',
      id: 'q1',
      enonce: 'Question test',
      correction: 'Correction test',
      notation: '1',
      sanscadre: 'false',
      pointilles: 'false',
      multicols: false,
    })

    // Vérifie que AMClabel est présent exactement une fois
    const labelMatches = result.match(/\\AMClabel\{q1\}/g)
    expect(labelMatches).toHaveLength(1)
    expect(result).toContain('\\begin{question}{q1}')
    expect(result).toContain('\\AMClabel{q1}')
  })

  it('ajoute AMClabel une seule fois dans template QCM', () => {
    const result = renderTemplate(qcmTemplate, {
      ref: 'TEST-REF',
      id: 'qcm1',
      enonce: 'Question QCM',
      correction: null,
      mode: 'mono',
      layout: 'enumerate',
      ordered: false,
      propositions: [
        { texte: 'Réponse A', correct: true },
        { texte: 'Réponse B', correct: false },
      ],
      multicols: false,
    })

    const labelMatches = result.match(/\\AMClabel\{qcm1\}/g)
    expect(labelMatches).toHaveLength(1)
    expect(result).toContain('\\AMClabel{qcm1}')
  })

  it('ajoute AMClabel une seule fois dans template numérique', () => {
    const result = renderTemplate(AMCNumTemplate, {
      ref: 'TEST-REF',
      id: 'num1',
      enonce: 'Calcul',
      multicols: false,
      display: null,
      blocks: [
        {
          value: 5,
          digits: 1,
          decimals: 0,
          sign: false,
          options: {},
        },
      ],
    })

    const labelMatches = result.match(/\\AMClabel\{num1\}/g)
    expect(labelMatches).toHaveLength(1)
    expect(result).toContain('\\AMClabel{num1}')
  })

  it("ne duplique pas AMClabel lors d'un rendu imbriqué", () => {
    // Cas: content déjà rendu, puis passé au conteneur
    const innerContent = renderTemplate(AMCNumTemplate, {
      ref: 'TEST-REF',
      id: 'inner-q',
      enonce: 'Inner question',
      multicols: false,
      display: null,
      blocks: [{ value: 10, digits: 2, decimals: 0, sign: false, options: {} }],
    })

    // Vérifier que le contenu interne a un AMClabel
    expect(innerContent).toContain('\\AMClabel{inner-q}')

    // Maintenant, passer ce contenu déjà rendu au conteneur
    const finalResult = renderTemplate(AMCHybrideContainerTemplate, {
      ref: 'container-ref',
      multicolsAll: false,
      barreseparation: false,
      numerotationEnonce: false,
      enonceId: 'enonce-id',
      enonceAGauche: false,
      enonceCentre: false,
      enonceTexte: 'Énoncé principal',
      multicols: false,
      closeMulticols: false,
      content: innerContent,
    })

    // Vérifie qu'il y a toujours exactement 1 seul AMClabel{inner-q}
    const labelMatches = finalResult.match(/\\AMClabel\{inner-q\}/g)
    expect(labelMatches).toHaveLength(1)
  })

  it('ajoute AMClabel pour chaque question dans templates avec plusieurs questions', () => {
    const result = renderTemplate(AMCHybrideNumDecimalTemplate, {
      enonceApresNumQuestion: true,
      enonceId: 'enonce-id',
      enonce: 'Énoncé de base',
      multicolsBegin: false,
      multicolsEnd: false,
      disableNumber: false,
      id: 'q-main',
      explain: 'Explication',
      texte: 'Contenu question',
      alignement: null,
      value: 7.5,
      digits: 2,
      decimals: 1,
      sign: false,
      tpoint: ',',
    })

    // Doit avoir 2 AMClabel: un pour enonceId et un pour id
    expect(result).toContain('\\AMClabel{enonce-id}')
    expect(result).toContain('\\AMClabel{q-main}')

    const enounceMatches = result.match(/\\AMClabel\{enonce-id\}/g)
    const mainMatches = result.match(/\\AMClabel\{q-main\}/g)

    expect(enounceMatches).toHaveLength(1)
    expect(mainMatches).toHaveLength(1)
  })

  it('formate proprement les commandes AMC sans espaces inutiles', () => {
    // Vérifie que le rendu normalise les espacements
    const result = renderTemplate(AMCOpenTemplate, {
      ref: 'TEST-REF',
      id: 'q-space-test',
      enonce: 'Test',
      correction: 'Correction',
      notation: '1',
      sanscadre: 'false',
      pointilles: 'false',
      multicols: false,
    })

    // Vérifie le format exact sans espacements superflus
    expect(result).toContain('\\AMClabel{q-space-test}')
    // Mais pas avec des espaces excessifs
    expect(result).not.toContain('\\AMClabel  {')
    expect(result).not.toContain('\\AMClabel  \n')
  })
})
