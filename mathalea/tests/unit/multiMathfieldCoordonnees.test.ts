import type { MathfieldElement } from 'mathlive'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import { vertMathalea } from '../../src/lib/colors'
import {
  colorizeAnswerParts,
  MultiMathfieldElement,
} from '../../src/lib/customElements/MultiMathfield'
import { handleCoordinates } from '../../src/lib/interactif/comparisonFunctions'
import { handleAnswers } from '../../src/lib/interactif/gestionInteractif'
import { setOutputHtml } from '../../src/modules/context'

const vert = (latex: string) => `\\textcolor{${vertMathalea}}{${latex}}`
const rouge = (latex: string) => `\\textcolor{#dc2626}{${latex}}`

describe('handleCoordinates : résultat de chaque coordonnée', () => {
  it('indique quelles coordonnées sont justes', () => {
    expect(handleCoordinates('1;2', '1;2')).toMatchObject({
      isOk: true,
      partsOk: [true, true],
    })
    expect(handleCoordinates('1;5', '1;2')).toMatchObject({
      isOk: false,
      feedback: 'Coordonnée 2 incorrecte',
      partsOk: [true, false],
    })
    expect(handleCoordinates('7;5', '1;2')).toMatchObject({
      isOk: false,
      feedback: 'Coordonnée 1 incorrecte',
      partsOk: [false, false],
    })
  })

  it('compte la saisie comme fausse si le nombre de coordonnées diffère', () => {
    expect(handleCoordinates('1;2;3', '1;2')).toMatchObject({
      isOk: false,
      partsOk: [false],
    })
  })
})

describe('colorizeAnswerParts', () => {
  it('colore chaque coordonnée selon son résultat', () => {
    expect(colorizeAnswerParts('1;5', [true, false])).toBe(
      `${vert('1')};${rouge('5')}`,
    )
  })

  it('colore la saisie d’un seul bloc si elle ne se découpe pas', () => {
    expect(colorizeAnswerParts('1;2;3', [false])).toBe(rouge('1;2;3'))
    expect(colorizeAnswerParts('\\left(1;2\\right)', [true, true])).toBe(
      vert('\\left(1;2\\right)'),
    )
  })
})

describe('MultiMathfieldElement : coordonnées après vérification', () => {
  beforeEach(() => {
    setOutputHtml()
    document.body.innerHTML = ''
  })

  it('colore le champ et enregistre la saisie sans les couleurs', () => {
    const exercice = new Exercice()
    exercice.numeroExercice = 3
    handleAnswers(
      exercice,
      0,
      {
        field0: {
          value: '1;2',
          options: { coordonnees: true, noFeedback: true },
        },
      },
      { formatInteractif: 'multi-mathfield' },
    )

    const multi = new MultiMathfieldElement()
    multi.id = 'multi-mathfieldEx3Q0'
    document.body.appendChild(multi)
    // Un vrai <math-field> ne fonctionne pas sous jsdom : on le simule.
    const mathfield = document.createElement(
      'div',
    ) as unknown as MathfieldElement
    vi.spyOn(
      multi.shadowRoot as ShadowRoot,
      'querySelectorAll',
    ).mockImplementation(((selector: string) =>
      selector === 'math-field' ? [mathfield] : []) as never)
    mathfield.id = 'multi-mathfieldEx3Q0-field0'
    mathfield.setAttribute('data-name', 'field0')
    let value = '1;5'
    Object.defineProperty(mathfield, 'value', { get: () => value })
    mathfield.getValue = () => value
    mathfield.setValue = vi.fn((latex?: string) => {
      value = latex ?? ''
    })
    multi.shadowRoot?.appendChild(mathfield)

    const result = MultiMathfieldElement.verifQuestion(exercice, 0)

    expect(value).toBe(`${vert('1')};${rouge('5')}`)
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe('')
    expect(exercice.answers).toEqual({
      'multi-mathfieldEx3Q0': '{"field0":"1;5"}',
    })

    // Une seconde vérification repart de la saisie, pas du LaTeX coloré.
    expect(MultiMathfieldElement.verifQuestion(exercice, 0).isOk).toBe(false)
    expect(value).toBe(`${vert('1')};${rouge('5')}`)
  })
})
