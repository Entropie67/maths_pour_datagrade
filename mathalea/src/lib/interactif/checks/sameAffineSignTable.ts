import { ComputeEngine } from '@cortex-js/compute-engine'
import type { Check, CheckOverrides } from './types'

type SameAffineSignTableOptions = CheckOverrides & {
  variable?: string
}

const ce = new ComputeEngine()
const TOLERANCE = 1e-9

/**
 * Coefficients [a, b] de l'expression ax+b, si elle est affine avec a non nul.
 * Un préfixe « f(x)= » éventuel est ignoré.
 */
export function coefficientsAffines(
  latex: string,
  variable = 'x',
): [number, number] | undefined {
  try {
    const coefficients = ce
      .parse(
        latex
          .replace(new RegExp(`^[a-zA-Z]\\(${variable}\\)=`), '')
          .replace(/\{,\}|,/g, '.'),
      )
      .polynomialCoefficients(variable)
      ?.map((c) => c.N().re)
    if (
      coefficients?.length !== 2 ||
      !coefficients.every(Number.isFinite) ||
      coefficients[0] === 0
    ) {
      return undefined
    }
    return [coefficients[0], coefficients[1]]
  } catch {
    return undefined
  }
}

/**
 * La saisie est-elle une fonction affine qui a le même tableau de signes que
 * la réponse attendue, c'est-à-dire la même racine et un coefficient
 * directeur de même signe ?
 */
export function sameAffineSignTable(
  options: SameAffineSignTableOptions = {},
): Check {
  const variable = options.variable ?? 'x'
  return {
    name: options.name ?? 'sameAffineSignTable',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie, answer) => {
      const attendu = coefficientsAffines(answer, variable)
      const donne = coefficientsAffines(saisie, variable)
      if (donne === undefined) {
        return {
          passed: false,
          feedbackKo: `La réponse doit être de la forme $a${variable}+b$ avec $a\\neq 0$.`,
          feedbackOk: options.feedbackOk,
        }
      }
      const passed =
        attendu !== undefined &&
        Math.abs(donne[1] / donne[0] - attendu[1] / attendu[0]) < TOLERANCE &&
        Math.sign(donne[0]) === Math.sign(attendu[0])
      return {
        passed,
        feedbackKo: options.feedbackKo ?? 'Cette fonction affine ne convient pas.',
        feedbackOk: options.feedbackOk,
      }
    },
  }
}
