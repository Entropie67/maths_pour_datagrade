import seedrandom from 'seedrandom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Tester le tableau et son vérificateur sans initialiser l'éditeur MathLive dans jsdom.
vi.mock('mathlive', () => ({ MathfieldElement: class extends HTMLElement {} }))
vi.mock('../../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

import MonomialExercise from '../../../src/exercices/ch/10e/10LSFA4D-10'
import { TableauMathliveElement } from '../../../src/lib/customElements/TableauMathlive'
import { verifyTableauMathLive } from '../../../src/lib/interactif/mathLiveVerifications'
import type { AnswerNormalizedType } from '../../../src/lib/types'
import {
  setOutputHtml,
  setOutputLatex,
  context,
} from '../../../src/modules/context'

const monomialCount = 6

function generate(
  type = '0',
  characteristics = '1-2-3',
  singleVariable = true,
  maxDegree = 3,
  seed = 'monomes',
  coefficientTypes = '1',
) {
  seedrandom(seed, { global: true })
  const exercise = new MonomialExercise()
  exercise.numeroExercice = 0
  exercise.interactif = true
  exercise.sup = type
  exercise.sup2 = characteristics
  exercise.sup3 = coefficientTypes
  exercise.sup4 = singleVariable
  exercise.sup5 = maxDegree
  exercise.nouvelleVersion()
  return exercise
}

function answers(
  exercise: MonomialExercise,
  index = 0,
): [string, AnswerNormalizedType][] {
  return Object.entries(exercise.autoCorrection[index].valeur ?? {}).filter(
    (entry): entry is [string, AnswerNormalizedType] =>
      /^L\d+C\d+$/.test(entry[0]),
  )
}

function mountAnswers(exercise: MonomialExercise) {
  document.body.innerHTML = exercise.listeQuestions[0]
  for (const [key, answer] of answers(exercise)) {
    const field = document.getElementById(
      `champTexteEx0Q0${key}`,
    ) as HTMLElement & { value: string }
    field.value = Array.isArray(answer.value) ? answer.value[0] : answer.value
  }
  return document.querySelector('table')!
}

beforeEach(() => setOutputHtml())
afterEach(() => {
  document.body.innerHTML = ''
  context.isTypst = false
  setOutputHtml()
  vi.restoreAllMocks()
})

describe('10LSFA4D-10 : monômes', () => {
  it('ne tire aucune valeur aléatoire dans le constructeur', () => {
    const random = vi.spyOn(Math, 'random')
    new MonomialExercise()
    expect(random).not.toHaveBeenCalled()
  })

  it.each(['1', '2', '0'])(
    'génère six colonnes de monômes et garde trois points pour le type %s',
    (type) => {
      for (const characteristics of [
        '1',
        '2',
        '3',
        '1-2',
        '1-3',
        '2-3',
        '1-2-3',
      ]) {
        const exercise = generate(type, characteristics)
        const dom = document.createElement('div')
        dom.innerHTML = exercise.listeQuestions[0]
        const selected = characteristics.split('-').map(Number)
        const characteristicRows =
          type === '1' ? selected : [...new Set([1, 2, ...selected])]
        const rows = dom.querySelectorAll('table tr')
        expect(rows).toHaveLength(1 + characteristicRows.length)
        for (const row of rows)
          expect(row.children).toHaveLength(monomialCount + 1)
        expect(dom.querySelectorAll('math-field')).toHaveLength(
          answers(exercise).length,
        )
        if (type === '1')
          expect(answers(exercise)).toHaveLength(
            monomialCount * characteristics.split('-').length,
          )
        if (type === '2') expect(answers(exercise)).toHaveLength(monomialCount)
        expect(TableauMathliveElement.pointsMaxQuestion(exercise, 0)).toBe(3)
        const table = mountAnswers(exercise)
        const result = verifyTableauMathLive(exercise, 0, table)
        expect(result).toMatchObject({
          isOk: true,
          score: { nbBonnesReponses: 3, nbReponses: 3 },
        })
      }
    },
  )

  it('mélange identification et reconstitution dans un seul tableau', () => {
    const keys = answers(generate()).map(([key]) => key)
    expect(keys.some((key) => key.startsWith('L0'))).toBe(true)
    expect(keys.some((key) => !key.startsWith('L0'))).toBe(true)
  })

  it.each(['', '/', '1'])(
    'accepte « %s » pour la partie littérale de la constante',
    (input) => {
      const exercise = generate('1')
      const table = mountAnswers(exercise)
      const [key] = answers(exercise).find(([, answer]) =>
        Array.isArray(answer.value),
      )!
      const field = document.getElementById(
        `champTexteEx0Q0${key}`,
      ) as HTMLElement & { value: string }
      field.value = input
      expect(verifyTableauMathLive(exercise, 0, table).isOk).toBe(true)
    },
  )

  it('refuse une partie littérale fausse et une case obligatoire laissée vide', () => {
    for (const wrongConstant of ['0', 'x']) {
      const exercise = generate('1')
      const table = mountAnswers(exercise)
      const [key] = answers(exercise).find(([, answer]) =>
        Array.isArray(answer.value),
      )!
      const field = document.getElementById(
        `champTexteEx0Q0${key}`,
      ) as HTMLElement & { value: string }
      field.value = wrongConstant
      expect(verifyTableauMathLive(exercise, 0, table).isOk).toBe(false)
    }
    const exercise = generate('1')
    const table = mountAnswers(exercise)
    const [key] = answers(exercise).find(
      ([, answer]) => !Array.isArray(answer.value),
    )!
    const field = document.getElementById(
      `champTexteEx0Q0${key}`,
    ) as HTMLElement & { value: string }
    field.value = ''
    expect(verifyTableauMathLive(exercise, 0, table).isOk).toBe(false)
  })

  it('ne rend pas un champ facultatif sans autorisation explicite', () => {
    const exercise = generate('1')
    const table = mountAnswers(exercise)
    const [key, answer] = answers(exercise).find(([, answer]) =>
      Array.isArray(answer.value),
    )!
    answer.options = {}
    const field = document.getElementById(
      `champTexteEx0Q0${key}`,
    ) as HTMLElement & { value: string }
    field.value = ''
    expect(verifyTableauMathLive(exercise, 0, table).isOk).toBe(false)
  })

  it('génère une constante, des degrés bornés et une ou deux variables', () => {
    let hasTwoVariables = false
    for (const singleVariable of [true, false]) {
      for (const degree of [1, 3, 6]) {
        const exercise = generate('1', '1-2-3', singleVariable, degree)
        const expected = Object.fromEntries(answers(exercise))
        const degrees = Array.from({ length: monomialCount }, (_, column) =>
          Number(expected[`L3C${column + 1}`].value),
        )
        expect(degrees.filter((value) => value === 0)).toHaveLength(1)
        expect(degrees).toContain(degree)
        expect(degrees.every((value) => value >= 0 && value <= degree)).toBe(
          true,
        )
        for (let column = 1; column <= monomialCount; column++) {
          const value = expected[`L2C${column}`].value
          if (typeof value !== 'string') continue
          const letters = value.match(/[xyzrst]/g) ?? []
          expect(new Set(letters).size).toBeLessThanOrEqual(
            singleVariable ? 1 : 2,
          )
          hasTwoVariables ||= new Set(letters).size === 2
        }
      }
    }
    expect(hasTwoVariables).toBe(true)
  })

  it('reproduit les mêmes monômes avec la même graine', () => {
    expect(generate('0', '1-2-3', false).listeQuestions).toEqual(
      generate('0', '1-2-3', false).listeQuestions,
    )
  })

  it.each(['2', '3', '0', '1-3'])(
    'génère les coefficients du choix %s et accepte les réponses dans les trois modes',
    (coefficientTypes) => {
      for (const type of ['1', '2', '0']) {
        const exercise = generate(
          type,
          '1-2-3',
          false,
          3,
          'coefficients',
          coefficientTypes,
        )
        const table = mountAnswers(exercise)
        expect(verifyTableauMathLive(exercise, 0, table)).toMatchObject({
          isOk: true,
          score: { nbBonnesReponses: 3, nbReponses: 3 },
        })
        const decimals = [
          ...exercise.listeQuestions[0].matchAll(/\d(?:\{,\}|,)\d/g),
        ]
        const fractions = [
          ...exercise.listeQuestions[0].matchAll(/\\[d]?frac/g),
        ]
        if (coefficientTypes === '2') {
          expect(decimals).toHaveLength(monomialCount)
          expect(fractions).toHaveLength(0)
        }
        if (coefficientTypes === '3') {
          expect(fractions).toHaveLength(monomialCount)
          expect(decimals).toHaveLength(0)
        }
        if (coefficientTypes === '0') {
          expect(decimals.length).toBeGreaterThan(0)
          expect(fractions.length).toBeGreaterThan(0)
          expect(decimals.length + fractions.length).toBeLessThan(monomialCount)
        }
        if (coefficientTypes === '1-3') {
          expect(decimals).toHaveLength(0)
          expect(fractions.length).toBeGreaterThan(0)
          expect(fractions.length).toBeLessThan(monomialCount)
        }
      }
    },
  )

  it('garde les en-têtes et les cases à remplir dans les exports LaTeX et Typst', () => {
    for (const typst of [false, true]) {
      setOutputLatex()
      context.isTypst = typst
      const exercise = generate('2')
      expect(exercise.listeQuestions[0]).toContain('\\begin{array}')
      expect(exercise.listeQuestions[0]).toContain('\\text{Monôme}')
      expect(exercise.listeQuestions[0]).toContain('\\phantom')
      expect(exercise.listeQuestions[0]).not.toContain('<table')
      expect(exercise.listeCorrections[0]).not.toContain('\\phantom')
    }
  })
})
