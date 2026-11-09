import { describe, expect, it } from 'vitest'
import {
  fractionSimplification,
  fractionSimplificationFromFieldsCallback,
} from './fractionSimplification'
import { seq } from './combinators'
import type { IExercice } from '../../types'
import { vi } from 'vitest'

const check = fractionSimplification()
const answer = (mode: 'division' | 'product', maximal = false) =>
  JSON.stringify({ numerator: 12, denominator: 18, mode, maximal })
const run = (values: string[], mode: 'division' | 'product', maximal = false) =>
  check.run(JSON.stringify(values), answer(mode, maximal))

describe('fractionSimplification', () => {
  it('accepte les diviseurs communs et vérifie le résultat', () => {
    expect(run(['2', '2', '6', '9'], 'division').passed).toBe(true)
    expect(run(['3', '3', '4', '6'], 'division').passed).toBe(true)
    expect(run(['2', '3', '6', '9'], 'division').feedbackKo).toContain(
      'diviseur commun',
    )
    expect(run(['4', '4', '3', '4'], 'division').passed).toBe(false)
    expect(run(['1', '1', '12', '18'], 'division').passed).toBe(false)
    expect(run(['2', '2', '4', '6'], 'division').passed).toBe(false)
  })
  it('accepte les produits dans les deux ordres et exige un facteur commun non trivial', () => {
    expect(run(['2\\times6', '9\\times2', '6', '9'], 'product').passed).toBe(
      true,
    )
    expect(run(['6\\times2', '2\\times9', '6', '9'], 'product').passed).toBe(
      true,
    )
    expect(
      run(['1\\times12', '1\\times18', '12', '18'], 'product').passed,
    ).toBe(false)
    expect(run(['3\\times4', '2\\times9', '4', '6'], 'product').passed).toBe(
      false,
    )
    expect(run(['12', '18', '6', '9'], 'product').passed).toBe(false)
  })
  it('respecte la simplification maximale et refuse les cases vides', () => {
    expect(run(['2', '2', '6', '9'], 'division', true).passed).toBe(false)
    expect(run(['6', '6', '2', '3'], 'division', true).passed).toBe(true)
    expect(run(['', '2', '6', '9'], 'division').feedbackKo).toContain(
      'Compléter',
    )
  })
})

describe('fractionSimplificationFromFieldsCallback', () => {
  it('affiche la fraction finale correcte en vert et un smiley même si l’étape est incorrecte', () => {
    document.body.innerHTML =
      '<math-field id="champTexteEx1Q0"></math-field><span id="resultatCheckEx1Q0"></span>'
    const field = document.getElementById('champTexteEx1Q0')!
    const values = ['2\\times6', '9\\times2', '2', '3']
    Object.assign(field, {
      getPromptValue: (key: string) => values[Number(key.slice(-1)) - 1],
      setPromptState: vi.fn(),
    })
    const callback = fractionSimplificationFromFieldsCallback(
      seq([fractionSimplification()]),
    )
    const result = callback({ numeroExercice: 1 } as IExercice, 0, [
      ['champ1', { value: answer('product') }],
    ])
    expect(result.isOk).toBe(false)
    expect(result.feedback).toBe(
      'Le numérateur et le dénominateur doivent avoir un facteur commun.',
    )
    expect(
      (field as unknown as { setPromptState: ReturnType<typeof vi.fn> })
        .setPromptState,
    ).toHaveBeenCalledWith('champ1', 'incorrect', true)
    expect(
      (field as unknown as { setPromptState: ReturnType<typeof vi.fn> })
        .setPromptState,
    ).toHaveBeenCalledWith('champ3', 'correct', true)
    expect(
      (field as unknown as { setPromptState: ReturnType<typeof vi.fn> })
        .setPromptState,
    ).toHaveBeenCalledWith('champ4', 'correct', true)
    expect(document.getElementById('resultatCheckEx1Q0')?.textContent).toBe(
      '☹️',
    )
    values[2] = '6'
    values[3] = '9'
    const correct = callback({ numeroExercice: 1 } as IExercice, 0, [
      ['champ1', { value: answer('product') }],
    ])
    expect(correct.isOk).toBe(true)
    expect(document.getElementById('resultatCheckEx1Q0')?.textContent).toBe(
      '😎',
    )
    document.body.innerHTML = ''
  })
})
