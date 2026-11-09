import { beforeEach, describe, expect, it } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import {
  addIntervalleDroite,
  IntervalleDroiteElement,
} from '../../src/lib/customElements/IntervalleDroiteElement'
import {
  listOfCustomElements,
  mathaleaCustomElementsRegistry,
} from '../../src/lib/customElements/MathaleaCustomElement'
import { setOutputHtml } from '../../src/modules/context'

describe('IntervalleDroiteElement', () => {
  let exercice: Exercice

  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
    exercice = new Exercice()
    exercice.numeroExercice = 7
    exercice.autoCorrection[0] = {}
  })

  it('enregistre le composant dans les registres MathALÉA', () => {
    expect(customElements.get('intervalle-droite')).toBe(
      IntervalleDroiteElement,
    )
    expect(listOfCustomElements).toContain('intervalle-droite')
    expect(mathaleaCustomElementsRegistry.get('intervalle-droite')).toBe(
      IntervalleDroiteElement,
    )
  })

  it('sélectionne deux bornes, inverse un crochet et se réinitialise', () => {
    document.body.innerHTML = addIntervalleDroite(exercice, 0, {
      min: -2,
      max: 4,
      labelValue: 1,
    })
    const element = document.querySelector(
      'intervalle-droite',
    ) as IntervalleDroiteElement
    const point = (value: number) =>
      element.shadowRoot?.querySelector<SVGGElement>(
        `.point[data-value="${value}"]`,
      )

    point(-2)?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    point(1)?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(element.value).toBe(
      JSON.stringify({
        start: -2,
        end: 1,
        leftBracket: null,
        rightBracket: ']',
      }),
    )

    point(1)?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(element.value).toContain('"rightBracket":"["')

    element.shadowRoot?.querySelector('button')?.click()
    expect(element.value).toBe('')
  })

  it('ne dessine jamais de crochet aux extrémités de la droite', () => {
    document.body.innerHTML = addIntervalleDroite(exercice, 0, {
      min: 0,
      max: 6,
    })
    const element = document.querySelector(
      'intervalle-droite',
    ) as IntervalleDroiteElement
    element.value = JSON.stringify({
      start: 0,
      end: 6,
      leftBracket: null,
      rightBracket: null,
    })
    expect(element.shadowRoot?.querySelectorAll('.bracket')).toHaveLength(0)
  })

  it('corrige et fige une réponse complète', () => {
    const expected = JSON.stringify({
      start: 2,
      end: 5,
      leftBracket: '[',
      rightBracket: null,
    })
    document.body.innerHTML = `${addIntervalleDroite(exercice, 0, {
      min: -1,
      max: 5,
      labelValue: 2,
    })}<span id="resultatCheckEx7Q0"></span><div id="feedbackEx7Q0">Ancien retour</div>`
    exercice.autoCorrection[0].valeur = {
      reponse: { value: expected },
    }
    const element = document.querySelector(
      'intervalle-droite',
    ) as IntervalleDroiteElement
    element.value = expected

    expect(IntervalleDroiteElement.verifQuestion(exercice, 0)).toEqual({
      isOk: true,
      feedback: '',
      score: { nbBonnesReponses: 1, nbReponses: 1 },
    })
    expect(exercice.answers?.[element.id]).toBe(expected)
    expect(element.interactivityOn).toBe(false)
    expect(document.getElementById('resultatCheckEx7Q0')?.innerHTML).toBe('😎')
    expect(document.getElementById('feedbackEx7Q0')?.innerHTML).toBe('')
  })
})
