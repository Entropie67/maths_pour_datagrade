import { describe, expect, it } from 'vitest'
import { assemblerGabarit, type OmrDocumentSource } from './buildOmrDocument'
import {
  decalerOmrCarryOver,
  decouperInsertions,
  echangerOmrCarryOver,
  harvestOmrCarryOver,
  omrSnippetTexte,
  OMR_SAUT_DE_PAGE,
  remplacerInsertions,
  remplacerReglage,
} from './omrCarryOver'

const SOURCE: OmrDocumentSource = {
  titre: 'Contrôle',
  sujetId: 'SUJ7',
  copies: [
    {
      copieId: 'c01',
      eleve: { id: 'e1', nom: 'Alice' },
      exercices: [
        {
          questions: [
            {
              qid: 'q1',
              type: 'qcmMono',
              enonce: 'A ?',
              points: 1,
              propositions: [
                { texte: 'a', correct: true },
                { texte: 'b', correct: false },
              ],
            },
          ],
        },
        {
          questions: [
            {
              qid: 'q2',
              type: 'qcmMono',
              enonce: 'B ?',
              points: 1,
              propositions: [
                { texte: 'a', correct: false },
                { texte: 'b', correct: true },
              ],
            },
          ],
        },
      ],
    },
  ],
}

const { gabarit } = assemblerGabarit(SOURCE)

describe('harvestOmrCarryOver', () => {
  it('ne retient rien d’un gabarit aux valeurs par défaut', () => {
    // sans quoi deux gabarits identiques divergeraient dès la première
    // régénération, l'un portant des réglages explicites et l'autre non
    expect(harvestOmrCarryOver(gabarit)).toEqual({})
  })

  it('relit les colonnes et l’espacement réglés depuis l’aperçu', () => {
    let modifie = remplacerReglage(gabarit, 2, 'colonnes', '3')
    modifie = remplacerReglage(modifie, 2, 'gutter', '2.4em')
    expect(harvestOmrCarryOver(modifie)).toEqual({
      layout: { 2: { colonnes: '3', gutter: '2.4em' } },
    })
  })

  it('relit les insertions et les rend au gabarit suivant', () => {
    const modifie = remplacerInsertions(gabarit, 1, [OMR_SAUT_DE_PAGE])
    const carryOver = harvestOmrCarryOver(modifie)
    expect(carryOver.insertions).toEqual({ 1: [OMR_SAUT_DE_PAGE] })
    // le réglage survit à une régénération : c'est tout l'intérêt de la
    // relecture, un changement de police ne doit pas défaire la mise en page
    const regenere = assemblerGabarit(SOURCE, undefined, carryOver).gabarit
    expect(regenere).toContain(`  "1": [${OMR_SAUT_DE_PAGE}],`)
  })

  it('ne lève pas sur un gabarit qui n’a plus la forme attendue', () => {
    expect(harvestOmrCarryOver('#set page(paper: "a4")')).toEqual({})
  })
})

describe('remplacerReglage', () => {
  it('laisse le gabarit intact quand l’exercice visé n’existe plus', () => {
    // le code peut avoir été réécrit à la main : viser un exercice disparu
    // n'est pas une erreur, c'est une action sans effet
    expect(remplacerReglage(gabarit, 9, 'colonnes', '2')).toBe(gabarit)
  })
})

describe('decouperInsertions', () => {
  it('sépare les fragments pour pouvoir en supprimer un seul', () => {
    const texte = omrSnippetTexte('Deuxième partie')
    expect(decouperInsertions(`${OMR_SAUT_DE_PAGE} ${texte}`)).toEqual([
      OMR_SAUT_DE_PAGE,
      texte,
    ])
  })

  it('rend une liste vide pour une entrée vide', () => {
    expect(decouperInsertions('')).toEqual([])
  })
})

describe('omrSnippetTexte', () => {
  it('rend inoffensifs les caractères actifs du texte saisi', () => {
    // crochets et dièse ouvriraient un bloc de contenu ou appelleraient une
    // fonction ; le guillemet terminerait la chaîne au milieu du gabarit
    const snippet = omrSnippetTexte('Partie [B] #important "difficile"')
    expect(snippet).toContain('\\"difficile\\"')
    const modifie = remplacerInsertions(gabarit, 1, [snippet])
    // et le tout se relit intact : le texte survit à une régénération
    expect(harvestOmrCarryOver(modifie).insertions).toEqual({ 1: [snippet] })
  })
})

describe('decalerOmrCarryOver', () => {
  const reglages = {
    layout: { 1: { colonnes: '2' }, 3: { colonnes: '3' } },
    insertions: { 0: ['a'], 1: [OMR_SAUT_DE_PAGE], 3: ['c'] },
  }

  it('renumérote les réglages après une suppression', () => {
    // un réglage est attaché au rang, pas à l'exercice : sans décalage, les
    // colonnes de l'exercice 3 se retrouveraient sur un autre
    const suivant = decalerOmrCarryOver(reglages, { retire: 1 })
    expect(suivant.layout).toEqual({ 2: { colonnes: '3' } })
  })

  it('rattache au repère précédent l’insertion d’un exercice supprimé', () => {
    const suivant = decalerOmrCarryOver(
      { insertions: { 1: ['x'], 2: ['y'] } },
      { retire: 1 },
    )
    // l'insertion qui suivait l'exercice 1 se replie sur le repère 0
    expect(suivant.insertions).toEqual({ 0: ['x'], 1: ['y'] })
  })

  it('décale vers le bas après une insertion', () => {
    const suivant = decalerOmrCarryOver(reglages, { insere: 2 })
    expect(suivant.layout).toEqual({
      1: { colonnes: '2' },
      4: { colonnes: '3' },
    })
  })

  it('laisse le repère 0 en place, il précède le premier exercice', () => {
    expect(
      decalerOmrCarryOver({ insertions: { 0: ['a'] } }, { retire: 2 })
        .insertions,
    ).toEqual({ 0: ['a'] })
  })
})

describe('echangerOmrCarryOver', () => {
  it('suit les exercices quand ils changent de place', () => {
    const suivant = echangerOmrCarryOver(
      { layout: { 1: { colonnes: '2' }, 2: { gutter: '2em' } } },
      1,
      2,
    )
    expect(suivant.layout).toEqual({
      2: { colonnes: '2' },
      1: { gutter: '2em' },
    })
  })
})
