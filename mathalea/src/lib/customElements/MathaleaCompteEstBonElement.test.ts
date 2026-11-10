import { afterEach, describe, expect, it } from 'vitest'
import type { IExercice } from '../types'
import {
  MathaleaCompteEstBonElement,
  type CompteEstBonState,
} from './MathaleaCompteEstBonElement'

function creeElement({
  cible = 8,
  tirage = [2, 4],
  meilleurEcart = 0,
}: {
  cible?: number
  tirage?: number[]
  meilleurEcart?: number
} = {}): MathaleaCompteEstBonElement {
  const element = document.createElement(
    MathaleaCompteEstBonElement.elementTag,
  ) as MathaleaCompteEstBonElement
  element.id = 'mathalea-compte-est-bonEx0Q0'
  element.setAttribute('numero-exercice', '0')
  element.setAttribute('question-index', '0')
  element.setAttribute('cible', String(cible))
  element.setAttribute('tirage', JSON.stringify(tirage))
  element.setAttribute('avec-division', 'true')
  element.setAttribute('meilleur-ecart', String(meilleurEcart))
  document.body.appendChild(element)
  return element
}

afterEach(() => document.body.replaceChildren())

describe('MathaleaCompteEstBonElement', () => {
  it('construit et restitue une suite de calculs', () => {
    const element = creeElement()
    const cartes = [
      ...element.shadowRoot!.querySelectorAll<HTMLButtonElement>('.carte'),
    ]
    cartes[0].click()
    cartes[1].click()
    const multiplication = [
      ...element.shadowRoot!.querySelectorAll<HTMLButtonElement>('.operation'),
    ].find((button) => button.textContent === '×')
    multiplication!.click()

    expect(element.value).toMatchObject({
      operations: [
        { resultId: 'r0', leftId: 'p0', rightId: 'p1', operator: '*' },
      ],
      finalId: 'r0',
    })

    const restored = creeElement()
    restored.value = JSON.stringify(element.value)
    expect(restored.value).toEqual(element.value)
  })

  it('rejette une restauration contenant une division non entière', () => {
    const element = creeElement()
    const invalidState: CompteEstBonState = {
      version: 1,
      operations: [
        { resultId: 'r0', leftId: 'p0', rightId: 'p1', operator: '/' },
      ],
      finalId: 'r1',
      selectedIds: [],
    }

    element.value = invalidState
    expect(element.value.operations).toHaveLength(0)
    expect(element.value.finalId).toBeNull()
  })

  it('enregistre la saisie et valide la valeur proposée', () => {
    const element = creeElement()
    element.value = {
      version: 1,
      operations: [
        { resultId: 'r0', leftId: 'p0', rightId: 'p1', operator: '*' },
      ],
      finalId: 'r0',
      selectedIds: ['r0'],
    }
    const exercice = {
      numeroExercice: 0,
      answers: {},
      autoCorrection: [{ formatInteractif: 'mathalea-compte-est-bon' }],
    } as unknown as IExercice

    const result = MathaleaCompteEstBonElement.verifQuestion(exercice, 0)

    expect(result.isOk).toBe(true)
    expect(result.score).toEqual({ nbBonnesReponses: 2, nbReponses: 2 })
    expect(exercice.answers?.[element.id]).toBe(JSON.stringify(element.value))
    expect(element.interactivityOn).toBe(false)
  })

  it('accorde un point pour une réponse non optimale à moins de 5 près', () => {
    const element = creeElement({
      cible: 10,
      tirage: [2, 4, 9],
      meilleurEcart: 1,
    })
    element.value = {
      version: 1,
      operations: [
        { resultId: 'r0', leftId: 'p0', rightId: 'p1', operator: '*' },
      ],
      finalId: 'r0',
      selectedIds: ['r0'],
    }
    const exercice = {
      numeroExercice: 0,
      answers: {},
      autoCorrection: [{ formatInteractif: 'mathalea-compte-est-bon' }],
    } as unknown as IExercice

    const result = MathaleaCompteEstBonElement.verifQuestion(exercice, 0)

    expect(result.isOk).toBe(false)
    expect(result.score).toEqual({ nbBonnesReponses: 1, nbReponses: 2 })
  })

  it('n’accorde aucun point à partir de 5 d’écart', () => {
    const element = creeElement({ cible: 13, meilleurEcart: 1 })
    element.value = {
      version: 1,
      operations: [
        { resultId: 'r0', leftId: 'p0', rightId: 'p1', operator: '*' },
      ],
      finalId: 'r0',
      selectedIds: ['r0'],
    }
    const exercice = {
      numeroExercice: 0,
      answers: {},
      autoCorrection: [{ formatInteractif: 'mathalea-compte-est-bon' }],
    } as unknown as IExercice

    const result = MathaleaCompteEstBonElement.verifQuestion(exercice, 0)

    expect(result.score).toEqual({ nbBonnesReponses: 0, nbReponses: 2 })
  })
})
