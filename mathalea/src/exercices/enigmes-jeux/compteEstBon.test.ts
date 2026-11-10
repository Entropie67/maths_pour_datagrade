import { describe, expect, it } from 'vitest'
import { orangeMathalea } from '../../lib/colors'
import { context } from '../../modules/context'
import LeCompteEstBon, {
  cibleLaPlusProche,
  enumereCalculsCompteEstBon,
} from './EN-le-compte-est-bon'

describe('enumereCalculsCompteEstBon', () => {
  it('ne conserve que les soustractions positives', () => {
    const calculs = enumereCalculsCompteEstBon([2, 5], false)

    expect(calculs.get(3)?.etapes.at(-1)).toMatchObject({
      gauche: 5,
      symbole: '-',
      droite: 2,
      resultat: 3,
    })
    expect([...calculs.keys()].every((valeur) => valeur > 0)).toBe(true)
  })

  it('n’autorise que les divisions exactes lorsqu’elles sont demandées', () => {
    const avecDivision = enumereCalculsCompteEstBon([2, 8], true)
    const sansDivision = enumereCalculsCompteEstBon([2, 8], false)
    const divisionNonExacte = enumereCalculsCompteEstBon([2, 5], true)

    expect(avecDivision.get(4)?.etapes.at(-1)?.symbole).toBe('\\div')
    expect(sansDivision.has(4)).toBe(false)
    expect(divisionNonExacte.has(2.5)).toBe(false)
  })

  it('écarte une cible ayant une solution plus courte', () => {
    const calculs = enumereCalculsCompteEstBon([2, 3, 4, 5], false)

    expect(calculs.get(5)?.nombreOperations).toBe(0)
    expect(calculs.get(14)?.nombreOperations).toBe(2)
  })

  it('traite un tirage complet de six plaques', () => {
    const calculs = enumereCalculsCompteEstBon([1, 3, 7, 10, 25, 100], true)

    expect(calculs.size).toBeGreaterThan(0)
    expect(calculs.get(831)?.nombreOperations).toBeGreaterThanOrEqual(3)
  })
})

describe('cibleLaPlusProche', () => {
  it('préfère le calcul comportant le moins d’opérations à écart égal', () => {
    const calculs = new Map([
      [
        7,
        {
          valeur: 7,
          nombreOperations: 1,
          nombreDivisions: 0,
          etapes: [
            { gauche: 5, symbole: '+' as const, droite: 2, resultat: 7 },
          ],
        },
      ],
      [
        9,
        {
          valeur: 9,
          nombreOperations: 0,
          nombreDivisions: 0,
          etapes: [],
        },
      ],
    ])

    expect(cibleLaPlusProche(8, calculs)?.valeur).toBe(9)
  })
})

describe('rendu Typst', () => {
  it('présente les trois chiffres de la cible dans des cartes orange', () => {
    const previousContext = {
      isHtml: context.isHtml,
      isTypst: context.isTypst,
    }
    context.isHtml = true
    context.isTypst = true
    try {
      const exercice = new LeCompteEstBon()
      exercice.nouvelleVersion()
      const question = exercice.listeQuestions[0]

      expect(question.match(/<mathalea-typst>#box/g)).toHaveLength(9)
      expect(
        question.match(new RegExp(`fill: rgb\\("${orangeMathalea}"\\)`, 'g')),
      ).toHaveLength(3)
    } finally {
      context.isHtml = previousContext.isHtml
      context.isTypst = previousContext.isTypst
    }
  })
})
