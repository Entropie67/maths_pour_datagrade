import type { ResultType } from '../types'
import { fonctionComparaison } from './comparisonFunctions'

/** Lit une matrice MathLive, ou l'ancien format textuel `(1,2;3,4)`. */
export function lireMatriceSaisie(saisie: string): string[][] {
  const environnement = saisie.match(
    /\\begin\{(?:p|b|B|v|V)?matrix\}([\s\S]*)\\end\{(?:p|b|B|v|V)?matrix\}/,
  )
  if (environnement != null) {
    return environnement[1]
      .split('\\\\')
      .map((ligne) =>
        ligne
          .split('&')
          .map((coef) =>
            coef
              .trim()
              .replace(/^\\placeholder\[matrix\d+\]\{([\s\S]*)\}$/, '$1'),
          ),
      )
  }
  return saisie
    .replace(/\\left|\\right|\\[,:!]|[()\s]/g, '')
    .replace(/\{,\}/g, ',')
    .split(';')
    .map((ligne) =>
      ligne.split(',').map((coef) => coef.replace(/^\{(.*)\}$/, '$1')),
    )
}

/**
 * Compare une matrice saisie à la matrice attendue, coefficient par coefficient.
 * `coefficientsOk` a la forme de la saisie (utile pour colorer chaque case).
 */
export function comparerMatrices(
  saisie: string[][],
  attendu: (string | number)[][],
): ResultType & { coefficientsOk: boolean[][] } {
  const coefficientsOk = saisie.map((ligne, i) =>
    ligne.map(
      (coef, j) =>
        i < attendu.length &&
        j < attendu[0].length &&
        fonctionComparaison(coef, String(attendu[i][j])).isOk,
    ),
  )
  if (
    saisie.length !== attendu.length ||
    saisie.some((ligne) => ligne.length !== attendu[0].length)
  ) {
    return {
      isOk: false,
      feedback: 'La taille est incorrecte.',
      coefficientsOk,
    }
  }
  if (saisie.some((ligne) => ligne.some((coef) => coef === ''))) {
    return {
      isOk: false,
      feedback: 'Il manque des coefficients.',
      coefficientsOk,
    }
  }
  const nombreIncorrects = coefficientsOk
    .flat()
    .filter((coefficientOk) => !coefficientOk).length
  const isOk = nombreIncorrects === 0
  return {
    isOk,
    feedback: isOk
      ? ''
      : nombreIncorrects === 1
        ? 'Un coefficient est incorrect.'
        : `${nombreIncorrects} coefficients sont incorrects.`,
    coefficientsOk,
  }
}

/**
 * Fonction de comparaison pour `handleAnswers` : la bonne réponse est
 * une matrice au format LaTeX (par exemple `Matrice.toTex()`).
 */
export function matriceCompare(input: string, goodAnswer: string): ResultType {
  // La saisie doit être une matrice seule : sinon 2M, -M ou M+1 seraient acceptés.
  if (
    !/^\s*\\begin\{([pbBvV]?)matrix\}[\s\S]*\\end\{\1matrix\}\s*$/.test(
      input,
    ) ||
    input.split('\\begin{').length !== 2
  ) {
    return {
      isOk: false,
      feedback: "Saisir une matrice à l'aide de la touche « Matrice ».",
    }
  }
  const { isOk, feedback } = comparerMatrices(
    lireMatriceSaisie(input),
    lireMatriceSaisie(goodAnswer),
  )
  return { isOk, feedback }
}
