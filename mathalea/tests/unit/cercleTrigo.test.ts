import { describe, expect, it } from 'vitest'
import Exercice from '../../src/exercices/Exercice'
import TrigoCircleSelectionElement, {
  addTrigoCircleSelection,
  trigoCircleSelectionValue,
} from '../../src/lib/customElements/TrigoCircleSelectionElement'
import { handleAnswers } from '../../src/lib/interactif/gestionInteractif'
import {
  TrigoExact,
  angleTex,
  exactTrigValuesForAngle,
  trigoCircleAngles,
} from '../../src/lib/mathFonctions/trigo'
import { fraction } from '../../src/modules/fractions'
import { setOutputHtml } from '../../src/modules/context'

describe('cercleTrigo', () => {
  it('liste les 16 angles usuels du cercle trigonometrique', () => {
    expect(trigoCircleAngles).toHaveLength(16)
    expect(trigoCircleAngles.map((angle) => angle.angleDeg)).toEqual([
      0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330,
    ])
  })

  it('normalise les angles modulo 2pi et retrouve les valeurs exactes', () => {
    expect(angleTex(fraction(-1, 2))).toBe('\\dfrac{3\\pi}{2}')
    expect(angleTex(fraction(13, 6))).toBe('\\dfrac{\\pi}{6}')
    expect(exactTrigValuesForAngle(fraction(7, 4))?.sinKey).toBe('-sqrt(2)/2')
    expect(exactTrigValuesForAngle(fraction(-1, 6))?.cosKey).toBe('sqrt(3)/2')
  })

  it('resout les equations simples sur les valeurs exactes usuelles', () => {
    expect(
      TrigoExact.solveExact('sin', '1/2').map((angle) => angle.angleTex),
    ).toEqual(['\\dfrac{\\pi}{6}', '\\dfrac{5\\pi}{6}'])
    expect(
      TrigoExact.solveSquared('cos', '1/2').map((angle) => angle.angleTex),
    ).toEqual([
      '\\dfrac{\\pi}{4}',
      '\\dfrac{3\\pi}{4}',
      '\\dfrac{5\\pi}{4}',
      '\\dfrac{7\\pi}{4}',
    ])
  })

  it('encode une selection de points par somme de puissances de deux', () => {
    expect(trigoCircleSelectionValue([0, fraction(1, 2), fraction(3, 2)])).toBe(
      1 + 16 + 4096,
    )
    expect(trigoCircleSelectionValue([fraction(13, 6)])).toBe(2)
  })

  it('rehydrate une selection depuis sa value', () => {
    setOutputHtml()
    document.body.innerHTML = TrigoCircleSelectionElement.create({
      numeroExercice: 0,
      questionIndex: 0,
      interactivityOn: true,
    })
    const element = document.querySelector(
      'trigo-circle-selection',
    ) as TrigoCircleSelectionElement
    element.connectedCallback()

    element.value = String(1 + 16)

    expect(element.value).toBe(String(1 + 16))
    expect(element.selectedValue).toBe(1 + 16)
  })

  it('stocke sa value restaurable dans exercice.answers', () => {
    setOutputHtml()
    const exercice = new Exercice()
    exercice.numeroExercice = 6
    const expected = trigoCircleSelectionValue([0, fraction(1, 2)])
    handleAnswers(
      exercice,
      0,
      { reponse: { value: expected } },
      { formatInteractif: 'trigo-circle-selection' },
    )
    document.body.innerHTML = addTrigoCircleSelection(exercice, 0)
    const element = document.querySelector(
      'trigo-circle-selection',
    ) as TrigoCircleSelectionElement
    element.connectedCallback()
    element.value = String(expected)

    const result = TrigoCircleSelectionElement.verifQuestion(exercice, 0)

    expect(result.isOk).toBe(true)
    expect(exercice.answers).toEqual({
      'trigo-circle-selectionEx6Q0': String(expected),
    })
    const restored = document.createElement(
      'trigo-circle-selection',
    ) as TrigoCircleSelectionElement
    restored.setAttribute('points', element.getAttribute('points') ?? '')
    restored.connectedCallback()
    restored.value = exercice.answers?.['trigo-circle-selectionEx6Q0'] ?? ''
    expect(restored.selectedValue).toBe(expected)
  })
})
