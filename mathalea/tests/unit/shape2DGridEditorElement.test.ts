import { describe, expect, it } from 'vitest'
import {
  Shape2DGridEditorElement,
  areShape2DGridsCongruent,
  parseShape2DGridState,
  shape2DGridDifference,
  type Shape2DGridState,
} from '../../src/lib/customElements/Shape2DGridEditorElement'
import { shapeCarre } from '../../src/lib/2d/figures2d/shapes2d'
import { MathaleaCouteauSuisseElement } from '../../src/lib/customElements/MathaleaCouteauSuisse'
import type { IExercice } from '../../src/lib/types'

const state = (cells: Shape2DGridState['cells']): Shape2DGridState => ({
  version: 1,
  grid: 12,
  cells,
})

describe('areShape2DGridsCongruent', () => {
  it('ignore la translation et la taille de la grille', () => {
    expect(
      areShape2DGridsCongruent(
        state([
          { x: 0, y: 0, shape: 'carré' },
          { x: 1, y: 0, shape: 'rond' },
        ]),
        {
          version: 1,
          grid: 20,
          cells: [
            { x: 7, y: 4, shape: 'carré' },
            { x: 8, y: 4, shape: 'rond' },
          ],
        },
      ),
    ).toBe(true)
  })

  it('tient compte du tampon utilisé', () => {
    expect(
      areShape2DGridsCongruent(
        state([{ x: 0, y: 0, shape: 'carré' }]),
        state([{ x: 0, y: 0, shape: 'rond' }]),
      ),
    ).toBe(false)
  })

  it('tient compte de la rotation et accepte plusieurs tampons dans une case', () => {
    expect(
      areShape2DGridsCongruent(
        state([
          { x: 0, y: 0, shape: 'allumetteV' },
          { x: 0, y: 0, shape: 'allumetteV', rotate: 60, scale: 2 },
        ]),
        state([
          { x: 4, y: 3, shape: 'allumetteV' },
          { x: 4, y: 3, shape: 'allumetteV', rotate: -60, scale: 2 },
        ]),
      ),
    ).toBe(false)
  })

  it('normalise les angles équivalents', () => {
    expect(
      areShape2DGridsCongruent(
        state([{ x: 0, y: 0, shape: 'carré', rotate: 360 }]),
        state([{ x: 4, y: 3, shape: 'carré' }]),
      ),
    ).toBe(true)
  })
})

describe('shape2DGridDifference', () => {
  it('localise les formes manquantes et incorrectes après alignement', () => {
    expect(
      shape2DGridDifference(
        state([
          { x: 0, y: 0, shape: 'carré' },
          { x: 1, y: 0, shape: 'rond' },
        ]),
        state([
          { x: 5, y: 4, shape: 'carré' },
          { x: 6, y: 4, shape: 'triangle' },
        ]),
      ),
    ).toEqual({
      missing: [{ x: 6, y: 4, shape: 'rond' }],
      extra: [{ x: 6, y: 4, shape: 'triangle' }],
    })
  })
})

describe('parseShape2DGridState', () => {
  it('conserve plusieurs tampons différents dans une case', () => {
    expect(
      parseShape2DGridState(
        '{"version":1,"grid":8,"cells":[{"x":1,"y":2,"shape":"carré"},{"x":1,"y":2,"shape":"rond"}]}',
      ),
    ).toEqual({
      version: 1,
      grid: 8,
      cells: [
        { x: 1, y: 2, shape: 'carré' },
        { x: 1, y: 2, shape: 'rond' },
      ],
    })
  })

  it('accepte les coordonnées par demi-pas', () => {
    expect(
      parseShape2DGridState({
        version: 1,
        grid: 8,
        cells: [{ x: 1, y: 2.5, shape: 'allumetteV', rotate: 60 }],
      }),
    ).toEqual({
      version: 1,
      grid: 8,
      cells: [{ x: 1, y: 2.5, shape: 'allumetteV', rotate: 60 }],
    })
  })

  it('refuse les coordonnées plus précises que le demi-pas', () => {
    expect(
      parseShape2DGridState({
        version: 1,
        grid: 8,
        cells: [{ x: 1, y: 2.25, shape: 'allumetteV' }],
      }),
    ).toBeNull()
  })
})

describe('Shape2DGridEditorElement', () => {
  it("s'intègre au couteau suisse et restaure sa valeur", () => {
    const expected = state([{ x: 0, y: 0, shape: 'carré' }])
    const elements = [
      {
        formatInteractif: Shape2DGridEditorElement.elementTag,
        questionIndex: 4,
        autoCorrection: {
          valeur: { reponse: { value: JSON.stringify(expected) } },
        },
      },
    ]
    document.body.innerHTML = [
      MathaleaCouteauSuisseElement.create({
        numeroExercice: 2,
        questionIndex: 0,
        elements,
        contenu: Shape2DGridEditorElement.create({
          numeroExercice: 2,
          questionIndex: 4,
          shapes: [shapeCarre],
          grid: 4,
        }),
      }),
      '<span id="resultatCheckEx2Q4"></span><div id="feedbackEx2Q4"></div>',
    ].join('')
    const editor = document.querySelector(
      Shape2DGridEditorElement.elementTag,
    ) as Shape2DGridEditorElement
    editor.value = JSON.stringify(expected)

    const exercice = {
      numeroExercice: 2,
      autoCorrection: [
        { formatInteractif: MathaleaCouteauSuisseElement.elementTag, elements },
      ],
    } as unknown as IExercice
    expect(MathaleaCouteauSuisseElement.verifQuestion(exercice, 0).isOk).toBe(
      true,
    )
    expect(exercice.answers?.[editor.id]).toBe(editor.value)
    expect(editor.interactivityOn).toBe(false)
  })

  it('affiche un feedback localisé lorsque le motif est incomplet', () => {
    const expected = state([
      { x: 0, y: 0, shape: 'carré' },
      { x: 1, y: 0, shape: 'carré' },
    ])
    document.body.innerHTML = [
      Shape2DGridEditorElement.create({
        numeroExercice: 3,
        questionIndex: 0,
        shapes: [shapeCarre],
        grid: 4,
      }),
      '<span id="resultatCheckEx3Q0"></span><div id="feedbackEx3Q0"></div>',
    ].join('')
    const editor = document.querySelector(
      Shape2DGridEditorElement.elementTag,
    ) as Shape2DGridEditorElement
    editor.value = JSON.stringify(state([{ x: 2, y: 2, shape: 'carré' }]))
    const exercice = {
      numeroExercice: 3,
      autoCorrection: [
        { valeur: { reponse: { value: JSON.stringify(expected) } } },
      ],
    } as unknown as IExercice

    const result = Shape2DGridEditorElement.verifQuestion(exercice, 0)

    expect(result.isOk).toBe(false)
    expect(result.feedback).toContain('1 forme est attendue')
    expect(
      editor.shadowRoot?.querySelectorAll('.feedback-missing'),
    ).toHaveLength(1)
    expect(
      editor.shadowRoot?.querySelector('.correction-feedback')?.textContent,
    ).toContain('1 forme est attendue')
  })
})
