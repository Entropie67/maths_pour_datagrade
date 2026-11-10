import { literal, parseRational } from './sameRationalFunction'
import type { Check, CheckOverrides } from './types'

export type UndefinedAtOptions = CheckOverrides & {
  /** Valeurs où l'expression saisie ne doit pas être définie. */
  values: number[]
  variable?: string
}

/**
 * L'expression rationnelle saisie n'est définie en aucune des valeurs données :
 * son dénominateur, obtenu en réduisant au même dénominateur sans simplifier,
 * s'y annule. Sert à exiger le facteur d'un trou, que `sameRationalFunction`
 * ne distingue pas. La valeur de l'expression n'est pas vérifiée.
 */
export function undefinedAt(options: UndefinedAtOptions): Check {
  return {
    name: options.name ?? 'undefinedAt',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie) => {
      const manquantes: number[] = []
      try {
        const { denominator } = parseRational(saisie, options.variable ?? 'x')
        const degre = denominator.length - 1
        for (const value of options.values) {
          // p(a/b) = 0 si et seulement si la somme des c_i a^i b^(n-i) est nulle.
          const v = literal(String(value))
          const [a, b] = [v.numerator[0], v.denominator[0]]
          const somme = denominator.reduce(
            (acc, c, i) => acc + c * a ** BigInt(i) * b ** BigInt(degre - i),
            0n,
          )
          if (somme !== 0n) manquantes.push(value)
        }
      } catch {
        return {
          passed: false,
          feedbackKo:
            options.feedbackKo ??
            'Saisir une expression rationnelle à coefficients rationnels.',
          feedbackOk: options.feedbackOk,
        }
      }
      return {
        passed: manquantes.length === 0,
        feedbackKo:
          options.feedbackKo ??
          `Écrire une expression qui n'est pas définie en ${manquantes.map((v) => `$x=${v}$`).join(' et ')}.`,
        feedbackOk: options.feedbackOk,
      }
    },
  }
}
