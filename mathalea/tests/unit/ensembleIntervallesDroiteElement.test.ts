import { beforeEach, describe, expect, it } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import {
  addEnsembleIntervallesDroite,
  EnsembleIntervallesDroiteElement,
} from '../../src/lib/customElements/EnsembleIntervallesDroiteElement'
import { setOutputHtml } from '../../src/modules/context'

describe('EnsembleIntervallesDroiteElement', () => {
  let exercice: Exercice

  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
    exercice = new Exercice()
    exercice.numeroExercice = 8
    exercice.autoCorrection[0] = {}
    document.body.innerHTML = addEnsembleIntervallesDroite(exercice, 0, {
      min: -2,
      max: 4,
      labelValues: [-2, 0, 4],
    })
  })

  const element = () =>
    document.querySelector(
      'ensemble-intervalles-droite',
    ) as EnsembleIntervallesDroiteElement

  it('enregistre le composant', () => {
    expect(customElements.get('ensemble-intervalles-droite')).toBe(
      EnsembleIntervallesDroiteElement,
    )
  })

  it('restaure une réponse sérialisée à l’identique', () => {
    const reponses = [
      // bornes ouvertes à l'infini, crochets internes différents
      {
        intervals: [
          { start: -2, end: 0, leftBracket: null, rightBracket: '[' },
          { start: 1, end: 4, leftBracket: ']', rightBracket: null },
        ],
        empty: false,
      },
      // bornes de la droite fermées
      {
        intervals: [{ start: -2, end: 4, leftBracket: '[', rightBracket: ']' }],
        empty: false,
      },
      { intervals: [], empty: true },
    ].map((reponse) => JSON.stringify(reponse))

    for (const reponse of reponses) {
      element().value = reponse
      expect(element().value).toBe(reponse)
    }
  })

  it('se vide avec une valeur vide ou illisible', () => {
    element().value = JSON.stringify({
      intervals: [{ start: 0, end: 1, leftBracket: '[', rightBracket: ']' }],
      empty: false,
    })
    expect(element().value).not.toBe('')
    element().value = ''
    expect(element().value).toBe('')
    element().value = 'pas du json'
    expect(element().value).toBe('')
  })
})
