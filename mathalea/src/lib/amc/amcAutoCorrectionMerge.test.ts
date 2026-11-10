import { describe, expect, it } from 'vitest'

import { mergeLatexTextsOnPropositions } from './amcAutoCorrectionMerge'
import { normalizeTexte } from './amcHelpers'

function collectTextsByStatus(
  propositions: Array<{ texte?: string; statut?: unknown }>,
  expectedStatus: boolean,
): string[] {
  return propositions
    .filter((proposition) => Boolean(proposition.statut) === expectedStatus)
    .map((proposition) => normalizeTexte(proposition.texte ?? ''))
    .sort()
}

describe('amcAutoCorrectionMerge', () => {
  it('preserve les bonnes et mauvaises reponses QCM malgre un ordre different entre interactif et latex AMC', () => {
    const interactiveProps = [
      { texte: '$600$', statut: false },
      { texte: '$6$', statut: true },
      { texte: '$56$', statut: false },
      { texte: '$1$', statut: false },
    ]

    const latexProps = [
      { texte: '$6$', statut: false, feedback: 'Bonne reponse latex' },
      { texte: '$600$', statut: true, feedback: 'Mauvaise reponse latex' },
      { texte: '$56$', statut: false },
      { texte: '$1$', statut: false },
    ]

    mergeLatexTextsOnPropositions(interactiveProps, latexProps)

    expect(collectTextsByStatus(interactiveProps, true)).toEqual(['$6$'])
    expect(collectTextsByStatus(interactiveProps, false)).toEqual([
      '$1$',
      '$56$',
      '$600$',
    ])
  })

  it('preserve les ensembles de bonnes reponses d un QCM multiple meme si les index changent', () => {
    const interactiveProps = [
      { texte: '$2$', statut: true },
      { texte: '$3$', statut: false },
      { texte: '$5$', statut: true },
      { texte: '$7$', statut: false },
    ]

    const latexProps = [
      { texte: '$7$', statut: true },
      { texte: '$5$', statut: false },
      { texte: '$2$', statut: false },
      { texte: '$3$', statut: true },
    ]

    mergeLatexTextsOnPropositions(interactiveProps, latexProps)

    expect(collectTextsByStatus(interactiveProps, true)).toEqual(['$2$', '$5$'])
    expect(collectTextsByStatus(interactiveProps, false)).toEqual([
      '$3$',
      '$7$',
    ])
  })
})
