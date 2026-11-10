import type { MathfieldElement } from 'mathlive'
import type { AnswerType, IExercice } from '../../types'
import type { Check, CheckOverrides, Comparator } from './types'

type Expected = {
  numerator: number
  denominator: number
  mode: 'product' | 'division'
  maximal: boolean
}

/** Vérifie les quatre cases d'une simplification, sérialisées en tableau JSON. */
export function fractionSimplification(options: CheckOverrides = {}): Check {
  return {
    name: options.name ?? 'fractionSimplification',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (input, answer) => {
      const fail = (message: string) => ({
        passed: false,
        feedbackKo: options.feedbackKo ?? message,
      })
      let values: unknown
      let expected: Expected
      try {
        values = JSON.parse(input)
        expected = JSON.parse(answer)
      } catch {
        return fail('Compléter les quatre cases.')
      }
      if (
        !Array.isArray(values) ||
        values.length !== 4 ||
        values.some((v) => typeof v !== 'string' || !v.trim())
      )
        return fail('Compléter les quatre cases.')
      const integer = (value: string) =>
        /^\d+$/.test(value.trim()) ? Number(value.trim()) : NaN
      const { numerator, denominator, mode, maximal } = expected
      let divisor: number
      if (mode === 'division') {
        const first = integer(values[0])
        const second = integer(values[1])
        if (
          !Number.isSafeInteger(first) ||
          first <= 1 ||
          first !== second ||
          numerator % first !== 0 ||
          denominator % first !== 0
        ) {
          return fail(
            'Diviser le numérateur et le dénominateur par un même diviseur commun différent de 1.',
          )
        }
        divisor = first
      } else {
        const product = (value: string): number[] => {
          const parts = value
            .replace(/\\left|\\right|\s/g, '')
            .split(/\\times|\\cdot|\*/)
          return parts.length === 2 ? parts.map(integer) : []
        }
        const top = product(values[0])
        const bottom = product(values[1])
        if (
          top.length !== 2 ||
          bottom.length !== 2 ||
          [...top, ...bottom].some((n) => !Number.isSafeInteger(n) || n < 1) ||
          top[0] * top[1] !== numerator ||
          bottom[0] * bottom[1] !== denominator
        ) {
          return fail('Écrire chaque nombre comme un produit de deux entiers.')
        }
        const common = top.filter((n) => n > 1 && bottom.includes(n))
        if (common.length === 0)
          return fail(
            'Le numérateur et le dénominateur doivent avoir un facteur commun.',
          )
        const resultNum = integer(values[2])
        const resultDen = integer(values[3])
        divisor =
          common.find(
            (n) => numerator / n === resultNum && denominator / n === resultDen,
          ) ?? common[0]
      }
      const resultNum = integer(values[2])
      const resultDen = integer(values[3])
      if (
        resultNum !== numerator / divisor ||
        resultDen !== denominator / divisor
      )
        return fail(
          mode === 'product'
            ? 'Le numérateur et le dénominateur doivent avoir un facteur commun.'
            : 'Calculer la fraction obtenue avec le diviseur commun choisi.',
        )
      if (maximal) {
        let x = resultNum
        let y = resultDen
        while (y !== 0) [x, y] = [y, x % y]
        if (x !== 1) return fail('Simplifier la fraction au maximum.')
      }
      return { passed: true, feedbackKo: '', feedbackOk: options.feedbackOk }
    },
  }
}

/** Adapte les cases MathLive au comparateur de simplification. */
export function fractionSimplificationFromFieldsCallback(compare: Comparator) {
  return (
    exercice: IExercice,
    question: number,
    variables: [string, AnswerType][],
  ) => {
    const field = globalThis.document?.querySelector(
      `#champTexteEx${exercice.numeroExercice}Q${question}`,
    ) as MathfieldElement | null
    const expected = variables[0]?.[1]?.value
    const values = ['champ1', 'champ2', 'champ3', 'champ4'].map(
      (key) => field?.getPromptValue(key) ?? '',
    )
    const result =
      typeof expected === 'string'
        ? compare(JSON.stringify(values), expected)
        : {
            isOk: false,
            feedback: 'Erreur dans la configuration de la réponse attendue.',
          }
    let finalCorrect = false
    if (typeof expected === 'string') {
      try {
        const { numerator, denominator, maximal } = JSON.parse(
          expected,
        ) as Expected
        const [num, den] = values
          .slice(2)
          .map((value) =>
            /^\d+$/.test(value.trim()) ? Number(value.trim()) : NaN,
          )
        const divisor = numerator / num
        finalCorrect =
          Number.isSafeInteger(num) &&
          Number.isSafeInteger(den) &&
          num > 0 &&
          den > 0 &&
          Number.isSafeInteger(divisor) &&
          divisor > 1 &&
          denominator / divisor === den
        if (finalCorrect && maximal) {
          let x = num
          let y = den
          while (y !== 0) [x, y] = [y, x % y]
          finalCorrect = x === 1
        }
      } catch {
        finalCorrect = false
      }
    }
    if (field != null) {
      for (const key of ['champ1', 'champ2'])
        field.setPromptState(key, result.isOk ? 'correct' : 'incorrect', true)
      for (const key of ['champ3', 'champ4'])
        field.setPromptState(key, finalCorrect ? 'correct' : 'incorrect', true)
      field.classList.add('corrected')
    }
    const smiley = globalThis.document?.getElementById(
      `resultatCheckEx${exercice.numeroExercice}Q${question}`,
    )
    if (smiley != null) {
      smiley.textContent = result.isOk ? '😎' : '☹️'
      smiley.style.fontSize = 'large'
    }
    return {
      isOk: result.isOk,
      feedback: result.feedback,
      score: { nbBonnesReponses: result.isOk ? 1 : 0, nbReponses: 1 },
    }
  }
}
