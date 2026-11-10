import { describe, expect, it } from 'vitest'
import type { IExercice, OptionsComparaisonType } from '../../src/lib/types'
import { verifyKeyboardCoverage } from '../integration/helpers/verifier-clavier'

function exerciceAvecReponse(
  value: string | string[],
  options: OptionsComparaisonType = {},
  clavier = 'numbers',
  touches: string[] = [],
): IExercice {
  return {
    listeQuestions: [
      `<mathalea-mathfield mathfield-id="champTexteEx0Q0" data-keyboard="${clavier}" data-keys="${JSON.stringify(touches).replaceAll('"', '&quot;')}"></mathalea-mathfield>`,
    ],
    autoCorrection: [{ valeur: { reponse: { value, options } } }],
  } as IExercice
}

describe('couverture des séparateurs par le clavier', () => {
  it.each([
    {},
    { suiteRangeeDeNombres: true },
    { suiteDeNombres: true },
    { ensembleDeNombres: true },
    { kUplet: true },
  ])('signale le point-virgule absent avec les options %j', (options) => {
    expect(
      verifyKeyboardCoverage(exerciceAvecReponse('1;2;3', options)),
    ).toEqual([
      expect.objectContaining({
        isOk: false,
        symbolesManquants: ['point-virgule'],
      }),
    ])
  })

  it('refuse le nom de touche SEMICOLON utilisé comme du texte', () => {
    const exercice = exerciceAvecReponse('1;2', {}, 'numbers', ['SEMICOLON'])
    expect(verifyKeyboardCoverage(exercice)[0]).toMatchObject({
      isOk: false,
      symbolesManquants: ['point-virgule'],
    })
  })

  it('accepte les raccourcis et les opérateurs littéraux', () => {
    const exercice = exerciceAvecReponse(
      'x^2+\\sqrt{2}-\\frac{1}{2}',
      {},
      'numbers',
      ['x', 'SQ', '+', 'SQRT', '-', 'FRAC'],
    )
    expect(verifyKeyboardCoverage(exercice)[0].isOk).toBe(true)
  })

  it('accepte le point-virgule littéral', () => {
    const touche = ';'
    const exercice = exerciceAvecReponse(
      '1;2;3',
      { suiteRangeeDeNombres: true },
      'numbers',
      [touche],
    )
    expect(verifyKeyboardCoverage(exercice)[0].isOk).toBe(true)
  })

  it('accepte le bloc de nombres avec point-virgule', () => {
    const exercice = exerciceAvecReponse(
      '1;2;3',
      { suiteRangeeDeNombres: true },
      'numbersPointVirgule',
    )
    expect(verifyKeyboardCoverage(exercice)[0].isOk).toBe(true)
  })

  it('accepte un clavier contenant déjà le point-virgule', () => {
    const exercice = exerciceAvecReponse('1;2', {}, 'alphanumeric')
    expect(verifyKeyboardCoverage(exercice)[0].isOk).toBe(true)
  })

  it('accepte une autre réponse saisissable sans point-virgule', () => {
    const exercice = exerciceAvecReponse(['1;2', '3'])
    expect(verifyKeyboardCoverage(exercice)[0]).toMatchObject({
      isOk: true,
      reponse: '3',
    })
  })
})
