import { describe, expect, it } from 'vitest'

import { fonctionComparaison } from '../interactif/comparisonFunctions'
import FractionEtendue from '../../modules/FractionEtendue'
import Grandeur from '../../modules/Grandeur'
import Hms from '../../modules/Hms'
import {
  inferExactFractionForAMC,
  inferAmcOptionsFromAnswerType,
  inferDecimalFractionForAMC,
  inferCoordinatesForAMC,
  inferHmsForAMC,
  inferIntervalForAMC,
  inferPowerNotationForAMC,
  inferQuantityForAMC,
  inferScientificNotationForAMC,
  mergeNumericParamsFromOptions,
} from './amcInferenceHelpers'

describe('amcInferenceHelpers', () => {
  it('décompose une durée HMS en grilles de deux chiffres', () => {
    expect(inferHmsForAMC(new Hms({ hour: 1, minute: 6 }))).toEqual([
      {
        key: 'hour',
        valeur: 1,
        latexUnit: '\\text{h}',
        param: { digits: 2, decimals: 0, signe: false },
      },
      {
        key: 'minute',
        valeur: 6,
        latexUnit: '\\text{min}',
        param: { digits: 2, decimals: 0, signe: false },
      },
      {
        key: 'second',
        valeur: 0,
        latexUnit: '\\text{s}',
        param: { digits: 2, decimals: 0, signe: false },
      },
    ])
  })

  it('omet les secondes lorsque la chaîne attend explicitement un format HM', () => {
    expect(inferHmsForAMC('1 h 06 min')).toHaveLength(2)
    expect(inferHmsForAMC('1 h 06 min 0 s')).toHaveLength(3)
  })

  it('construit trois choix contigus autour d’un intervalle fini', () => {
    expect(inferIntervalForAMC(']2,5;3[')).toEqual({
      correct: 2.75,
      left: 2,
      right: 3.5,
      step: 0.5,
      choices: [
        { texte: '$[2\\,;\\,2.5[$', statut: false },
        { texte: '$[2.5\\,;\\,3[$', statut: true },
        { texte: '$[3\\,;\\,3.5[$', statut: false },
      ],
    })
    expect(inferIntervalForAMC(']-\\infty;3[')).toBeUndefined()
  })

  it('décompose des coordonnées numériques 2D ou 3D', () => {
    expect(inferCoordinatesForAMC(['(-3;2,5)'])).toEqual([
      { key: 'x', label: 'Abscisse', valeur: -3 },
      { key: 'y', label: 'Ordonnée', valeur: 2.5 },
    ])
    expect(inferCoordinatesForAMC('(\\frac{3}{5};-2;4)')).toEqual([
      { key: 'x', label: 'Abscisse', valeur: { num: 3, den: 5 } },
      { key: 'y', label: 'Ordonnée', valeur: -2 },
      { key: 'z', label: 'Cote', valeur: 4 },
    ])
    expect(inferCoordinatesForAMC('(x;2)')).toBeUndefined()
  })

  it('extrait la mesure, l’unité et la tolérance d’une grandeur', () => {
    expect(inferQuantityForAMC(new Grandeur(12.5, 'cm'), 0.1)).toEqual({
      valeur: 12.5,
      latexUnit: '\\text{cm}',
      param: { approx: 0.1 },
    })
    expect(inferQuantityForAMC('12,5 cm', 0.1)).toBeUndefined()
  })

  it('conserve exactement une fraction destinée aux cases AMC', () => {
    expect(inferExactFractionForAMC('\\dfrac{6}{-8}')).toEqual({
      num: -6,
      den: 8,
    })
    expect(inferExactFractionForAMC({ num: 10, den: 15 })).toEqual({
      num: 10,
      den: 15,
    })
  })

  it('construit une fraction décimale canonique pour AMC', () => {
    expect(inferDecimalFractionForAMC(new FractionEtendue(1, 2))).toEqual({
      num: 5,
      den: 10,
    })
    expect(inferDecimalFractionForAMC(new FractionEtendue(50, 100))).toEqual({
      num: 50,
      den: 100,
    })
    expect(inferDecimalFractionForAMC(1.25)).toEqual({ num: 125, den: 100 })
    expect(
      inferDecimalFractionForAMC(new FractionEtendue(1, 3)),
    ).toBeUndefined()
  })

  it.each([
    ['2^8', 2, 8, false],
    ['(-4)^{-3}', -4, -3, true],
    ['\\left(-12\\right)^{2}', -12, 2, true],
  ] as const)(
    'décompose la puissance numérique %s pour AMC',
    (source, base, exponent, sign) => {
      expect(inferPowerNotationForAMC(source)).toEqual({
        valeur: base,
        param: {
          basePuissance: base,
          exposantPuissance: exponent,
          baseNbChiffres: String(Math.abs(base)).length,
          exposantNbChiffres: String(Math.abs(exponent)).length,
          signe: sign,
        },
      })
    },
  )

  it.each(['x^2', '2^x', '1.5^2', '2^3+1'])(
    'refuse la puissance non représentable %s',
    (source) => {
      expect(inferPowerNotationForAMC(source)).toBeUndefined()
    },
  )

  it.each([
    ['3.14e-2', 0.0314, 3, 2, 1, true],
    ['-6,2\\times 10^{4}', -62000, 2, 1, 1, false],
    ['1\\cdot10^0', 1, 1, 0, 1, false],
  ] as const)(
    'décompose la notation scientifique %s pour AMC',
    (source, valeur, digits, decimals, exponentDigits, exponentSign) => {
      expect(inferScientificNotationForAMC(source)).toEqual({
        valeur,
        param: {
          digits,
          decimals,
          signe: valeur < 0,
          exposantNbChiffres: exponentDigits,
          exposantSigne: exponentSign,
        },
      })
    },
  )

  it.each(['31e-1', '0.5e2', '3e1.5', '3\\times10^x'])(
    'refuse la pseudo-notation scientifique %s',
    (source) => {
      expect(inferScientificNotationForAMC(source)).toBeUndefined()
    },
  )

  it('couvre les formes de {reponse: {value, compare, options}} et l inference associee', () => {
    const compare = fonctionComparaison

    const cases: Array<{
      label: string
      input: unknown
      expected:
        | {
            digits: number
            decimals: number
            signe: boolean
          }
        | undefined
    }> = [
      {
        label: 'value numerique simple',
        input: { reponse: { value: 5 } },
        expected: { digits: 1, decimals: 0, signe: false },
      },
      {
        label: 'value numerique simple négative',
        input: { reponse: { value: -5 } },
        expected: { digits: 1, decimals: 0, signe: true },
      },
      {
        label: 'value numerique decimal string',
        input: { reponse: { value: '1,5' } },
        expected: { digits: 2, decimals: 1, signe: false },
      },
      {
        label: 'value numerique simple forme exponentielle',
        input: { reponse: { value: '2^8', options: { puissance: true } } },
        expected: { digits: 1, decimals: 0, signe: false },
      },
      {
        label: 'value fraction latex',
        input: { reponse: { value: '\\dfrac{-12}{5}' } },
        expected: { digits: 3, decimals: 1, signe: true },
      },
      {
        label: 'value tableau de valeurs numeriques',
        input: { reponse: { value: ['-\\dfrac{5}{2}', '-2.5'] } },
        expected: { digits: 2, decimals: 1, signe: true },
      },
      {
        label: 'value tableau combine fraction et decimal',
        input: {
          reponse: {
            value: ['\\frac{1}{2}', '0.5'],
            options: { fractionEgale: true },
          },
        },
        expected: { digits: 2, decimals: 1, signe: false },
      },
      {
        label: 'options interactives ignorees pour AMC',
        input: {
          reponse: {
            value: 2,
            compare,
            options: {
              noFeedback: true,
              expressionNumerique: true,
            },
          },
        },
        expected: {
          digits: 1,
          decimals: 0,
          signe: false,
        },
      },
      {
        label: 'forme answerType directe',
        input: { value: 9, compare, options: { strict: false } },
        expected: { digits: 1, decimals: 0, signe: false },
      },
      {
        label: 'forme imbriquee via valeur',
        input: { valeur: { reponse: { value: 3.75, compare } } },
        expected: { digits: 3, decimals: 2, signe: false },
      },
      {
        label: 'forme non numerique',
        input: { reponse: { value: ['x+1', '\\sqrt{2}'], compare } },
        expected: undefined,
      },
      {
        label: 'expression arithmetique non numerique',
        input: { reponse: { value: '7 + 8', compare } },
        expected: undefined,
      },
    ]

    for (const testCase of cases) {
      expect(
        inferAmcOptionsFromAnswerType(testCase.input),
        testCase.label,
      ).toEqual(testCase.expected)
    }
  })

  it('infere des options AMCNum depuis une reponse interactive decimal/array', () => {
    const inferred = inferAmcOptionsFromAnswerType({
      reponse: {
        value: [12.3, -4],
        options: { strict: true },
      },
    })

    expect(inferred).toEqual({
      digits: 3,
      decimals: 1,
      signe: true,
    })
  })

  it('infere des options AMCNum depuis une fraction latex', () => {
    const inferred = inferAmcOptionsFromAnswerType({
      reponse: {
        value: '\\frac{-12}{5}',
      },
    })

    expect(inferred).toEqual({
      digits: 3,
      decimals: 1,
      signe: true,
    })
  })

  it('retourne undefined quand la valeur n est pas numerique', () => {
    const inferred = inferAmcOptionsFromAnswerType({
      reponse: {
        value: 'x+1',
      },
    })

    expect(inferred).toBeUndefined()
  })

  it('preserve la priorite des options AMC explicites', () => {
    const merged = mergeNumericParamsFromOptions(
      { digits: 2, decimals: 0, signe: false },
      { digits: 5, decimals: 2, signe: true, strict: true },
    )

    expect(merged).toEqual({
      digits: 2,
      decimals: 0,
      signe: false,
      strict: true,
    })
  })

  it('ignore des options historiques qui ne sont pas un objet', () => {
    expect(mergeNumericParamsFromOptions({ digits: 2 }, 'vertical')).toEqual({
      digits: 2,
    })
  })
})
