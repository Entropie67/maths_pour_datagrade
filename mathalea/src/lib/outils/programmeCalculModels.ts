import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'

import { miseEnEvidence } from '../../lib/outils/embellissements'

type LiteralModel =
  | 'ax+b'
  | '(x+a)^2'
  | '(ax+b)^2'
  | 'x^2+ax+b'
  | 'a(x+b)'
  | 'a(x+b)+bx'
  | '(x+a)(x-a)'
  | 'x^2-abs(a)'
  | '(x+a)^2-x^2'
  | '(x+a)^2+b'
  | 'x(x+a)'

export interface GeneratedProgram {
  expression: string // l'expression littérale remplie
  program: string[] // les étapes du programme de calcul
  solutionX: string[] // les étapes du programme de calcul
  solutionV: (value: number) => string[] // les étapes du programme de calcul
  simplify?: string[] // les étapes de simplification (optionnel)
  testV: (value: number) => number // calcule le résultat du programme de calcul pour une valeur donnée
  a: number
  b?: number
}

/**
 * Génère un programme de calcul selon le modèle donné
 */

export function generateProgram(
  model: LiteralModel,
  values: { a: number; b: number },
): GeneratedProgram {
  const a = values.a
  const b = values.b

  const sign = ecritureAlgebrique
  const parNeg = ecritureParentheseSiNegatif
  const signSauf0 = (n: number) => (n === 0 ? '' : sign(n))

  switch (model) {
    case 'ax+b': {
      return {
        expression: `${a}x ${sign(b)}`,
        a,
        b,
        program: [
          '- Choisir un nombre.',
          `- Le multiplier par $${a}$.`,
          `- ${b >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(b)}$.`,
        ],
        solutionX: [
          '- Choisir un nombre $ \\rightarrow x$',
          `- Le multiplier par $${a}$ $ \\rightarrow ${a}x$`,
          `- ${b >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(b)} \\rightarrow ${miseEnEvidence(`${a}x ${sign(b)}`)}$`,
        ],
        solutionV: function (value: number): string[] {
          return [
            `- Choisir un nombre $ \\rightarrow ${value}$`,
            `- Le multiplier par $${a}$ $ \\rightarrow ${value} \\times ${parNeg(a)} = ${value * a}$`,
            `- ${b >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(b)} \\rightarrow ${value * a} ${sign(b)} = ${miseEnEvidence(value * a + b)}$`,
          ]
        },
        testV: function (value: number): number {
          return a * value + b
        },
      }
    }
    case 'a(x+b)': {
      return {
        expression: `${a}(x ${sign(b)})`,
        a,
        b,
        program: [
          '- Choisir un nombre.',
          `- ${b >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(b)}$.`,
          `- Le multiplier par $${a}$.`,
        ],
        solutionX: [
          '- Choisir un nombre $ \\rightarrow x$',
          `- ${b >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(b)}$ $ \\rightarrow x ${sign(b)}$`,
          `- Multiplier le résultat par $${a}$ $ \\rightarrow ${a}(x ${sign(b)})$`,
        ],
        simplify: [
          '- Développer :',
          `$${a}(x ${sign(b)}) = ${a}\\times x ${sign(a)} \\times ${parNeg(b)}$`,
          '- Réduire :',
          `$${a}(x ${sign(b)}) = ${miseEnEvidence(`${a}x ${sign(a * b)}`)}$`,
        ],
        solutionV: function (value: number): string[] {
          return [
            `- Choisir un nombre $ \\rightarrow ${value}$`,
            `- ${b >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(b)}$ $ \\rightarrow ${value} ${sign(b)} 
               = ${value + b}$`,
            `- Multiplier le résultat par $${a}$ $ \\rightarrow ${a} \\times ${parNeg(
              value + b,
            )} = ${miseEnEvidence(a * (value + b))}$`,
          ]
        },
        testV: function (value: number): number {
          return a * (value + b)
        },
      }
    }
    case 'x(x+a)': {
      return {
        expression: `x(x ${sign(a)})`,
        a,
        b,
        program: [
          '- Choisir un nombre.',
          `- ${a >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(a)}$.`,
          ' - Multiplier le nombre choisi par ce résultat.',
        ],
        solutionX: [
          '- Choisir un nombre $ \\rightarrow x$',
          `- ${a >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(a)}$ $ \\rightarrow x ${sign(a)}$`,
          `- Multiplier le nombre choisi par ce résultat $ \\rightarrow x(x ${sign(a)})$`,
        ],
        simplify: [
          '- Développer :',
          `$x(x ${sign(a)}) = x \\times x + x \\times ${parNeg(a)}$`,
          '- Réduire :',
          `$x(x ${sign(a)}) = ${miseEnEvidence(`x^{2} ${sign(a)} x`)}$`,
        ],
        solutionV: function (value: number): string[] {
          return [
            `- Choisir un nombre $ \\rightarrow ${value}$`,
            `- ${a >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(a)}$ $ \\rightarrow ${value} ${sign(a)} = ${value + a}$`,
            `- Multiplier le nombre choisi par ce résultat $ \\rightarrow ${value} \\times ${parNeg(value + a)} = ${miseEnEvidence(value * (value + a))}$`,
          ]
        },
        testV: function (value: number): number {
          return value * (value + a)
        },
      }
    }
    case 'x^2-abs(a)': {
      return {
        expression: `x^{2} ${sign(-Math.abs(a))}`,
        a,
        b,
        program: [
          '- Choisir un nombre.',
          "- L'élever au carré.",
          `- Soustraire $${Math.abs(a)}$.`,
        ],
        solutionX: [
          '- Choisir un nombre $ \\rightarrow x$',
          "- L'élever au carré $ \\rightarrow x^2$",
          `- Soustraire $${Math.abs(a)}$ $ \\rightarrow ${miseEnEvidence(`x^{2} ${sign(-Math.abs(a))}`)}$`,
        ],
        solutionV: function (value: number): string[] {
          return [
            `- Choisir un nombre $ \\rightarrow ${value}$`,
            `- L'élever au carré  $\\rightarrow ${parNeg(value)}^2 = ${value ** 2}$`,
            `- Soustraire $${Math.abs(a)}$  $ \\rightarrow${value ** 2} ${sign(-Math.abs(a))} = ${miseEnEvidence(value ** 2 - Math.abs(a))}$`,
          ]
        },
        testV: function (value: number): number {
          return value ** 2 - Math.abs(a)
        },
      }
    }
    case '(x+a)(x-a)': {
      return {
        expression: `(x ${sign(a)})(x ${sign(-a)})`,
        a,
        b,
        program: [
          '- Choisir un nombre.',
          `- ${a >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(a)}$ au nombre choisi.`,
          `- ${a >= 0 ? 'Soustraire' : 'Ajouter'} $${Math.abs(a)}$ au nombre choisi.`,
          ' - Multiplier les deux résultats précédents.',
        ],
        solutionX: [
          '- Choisir un nombre $ \\rightarrow x$',
          `- ${a >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(a)}$ $ \\rightarrow x ${sign(a)}$`,
          `- ${a >= 0 ? 'Soustraire' : 'Ajouter'} $${Math.abs(a)}$ $ \\rightarrow x ${sign(-a)}$`,
          `- Multiplier les deux résultats précédents $ \\rightarrow (x ${sign(a)})(x ${sign(-a)})$`,
        ],
        simplify: [
          '- Développer :',
          `$(x ${sign(a)})(x ${sign(-a)}) = x\\times x + x \\times ${parNeg(-a)} ${sign(a)} \\times x  ${sign(a)} \\times ${parNeg(-a)}$`,
          '- Réduire :',
          `$(x ${sign(a)})(x ${sign(-a)}) = x^{2} ${sign(-a)} x ${sign(a)} x  ${sign(-a * a)}$`,
          `$(x ${sign(a)})(x ${sign(-a)}) = ${miseEnEvidence(`x^{2} ${sign(-a * a)}`)}$`,
        ],
        solutionV: function (value: number): string[] {
          return [
            `- Choisir un nombre $ \\rightarrow ${value}$`,
            `- ${a >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(a)}$ $ \\rightarrow ${value} ${sign(a)} = ${
              value + a
            }$`,
            `- ${a >= 0 ? 'Soustraire' : 'Ajouter'} $${Math.abs(a)}$ $ \\rightarrow ${value} ${sign(-a)} = ${
              value - a
            }$`,
            `- Multiplier les deux résultats précédents $ \\rightarrow ${value + a} \\times ${parNeg(value - a)} = ${miseEnEvidence((value + a) * (value - a))}$`,
          ]
        },
        testV: function (value: number): number {
          return (value + a) * (value - a)
        },
      }
    }
    case 'a(x+b)+bx': {
      return {
        expression: `${a}(x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}) ${b >= 0 ? '+' : '-'} ${Math.abs(b)}x`,
        a,
        b,
        program: [
          '- Choisir un nombre.',
          `- ${b >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(b)}$.`,
          `- Le multiplier par $${a}$.`,
          `- ${b >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(b)}$ fois le nombre choisi.`,
        ],
        solutionX: [
          '- Choisir un nombre  $\\rightarrow x$',
          `- ${b >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(b)}$ $ \\rightarrow x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}$`,
          `- Le multiplier par $${a}$ $\\rightarrow ${a}(x ${b >= 0 ? '+' : '-'} ${Math.abs(b)})$`,
          `- ${b >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(b)}$ fois le nombre choisi  $ \\rightarrow ${a}(x ${b >= 0 ? '+' : '-'} ${Math.abs(b)}) ${b >= 0 ? '+' : '-'} ${Math.abs(b)}x$`,
        ],
        simplify: [
          '- Développer :',
          `$${a}(x ${sign(b)}) ${sign(b)}x = ${a} \\times x ${sign(a)} \\times ${parNeg(b)} ${sign(b)}x$`,
          '- Réduire :',
          `$${a}(x ${sign(b)}) ${sign(b)}x = ${a}x ${sign(a * b)}  ${sign(b)}x$`,
          `$${a}(x ${sign(b)}) ${sign(b)}x = ${miseEnEvidence(`${a + b}x ${sign(a * b)}`)}$`,
        ],
        solutionV: function (value: number): string[] {
          return [
            `- Choisir un nombre  $\\rightarrow ${value}$`,
            `- ${b >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(b)}$ $\\rightarrow ${value} ${sign(b)} = ${value + b}$`,
            `- Le multiplier par $${a}$ $\\rightarrow ${a} \\times  ${parNeg(value + b)} = ${a * (value + b)}$`,
            `- ${b >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(b)}$ fois le nombre choisi $ \\rightarrow
              ${a * (value + b)}  ${sign(b)} \\times ${parNeg(value)} = ${miseEnEvidence(a * (value + b) + b * value)}$`,
          ]
        },
        testV: function (value: number): number {
          return a * (value + b) + b * value
        },
      }
    }
    case '(x+a)^2-x^2': {
      return {
        expression: `(x ${sign(a)})^2 - x^{2}`,
        a,
        program: [
          'Choisir un nombre.',
          `${a >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(a)}$.`,
          'Élever le résultat au carré.',
          'Soustraire le carré du nombre choisi.',
        ],
        solutionX: [
          '- Choisir un nombre $ \\rightarrow x$',
          `- ${a >= 0 ? 'Ajouter' : 'Soustraire'} ${Math.abs(a)} $ \\rightarrow x ${sign(a)}$`,
          `- Élever le résultat au carré $  \\rightarrow (x ${sign(a)})^{2} $`,
          `- Soustraire le carré du nombre choisi $ \\rightarrow (x ${sign(a)})^{2} - x^{2} $`,
        ],
        simplify: [
          '- Développer :',
          `$(x ${sign(a)})^{2} - x^{2} = (x ${sign(a)})(x ${sign(a)}) - x^{2}$`,
          `$(x ${sign(a)})^{2} - x^{2} = x\\times x + x \\times ${parNeg(a)} ${sign(a)} \\times x  ${sign(a)} \\times ${parNeg(a)} - x^{2}$`,
          '- Réduire :',
          `$(x ${sign(a)})^{2} - x^{2} = x^{2} ${sign(a)} x ${sign(a)} x  ${sign(a * a)} - x^{2}$`,
          `$(x ${sign(a)})^{2} - x^{2} = ${miseEnEvidence(`${2 * a} x ${sign(a * a)}`)}$`,
        ],
        solutionV: function (value: number): string[] {
          return [
            `- Choisir un nombre : $${value}$`,
            `- ${a >= 0 ? 'Ajouter' : 'Soustraire'} ${Math.abs(a)} $ \\rightarrow ${value} ${sign(a)} = ${value + a}$`,
            `- Élever le résultat au carré $ \\rightarrow ${parNeg(value + a)}^2 = ${(value + a) ** 2} $`,
            `- Soustraire le carré du nombre choisi $ \\rightarrow ${(value + a) ** 2} - ${parNeg(value)}^{2} = ${miseEnEvidence((value + a) ** 2 - value ** 2)} $`,
          ]
        },
        testV: function (value: number): number {
          return (value + a) ** 2 - value ** 2
        },
      }
    }
    case '(x+a)^2+b': {
      return {
        expression: `(x ${sign(a)})^2 ${sign(b)}`,
        a,
        program: [
          'Choisir un nombre.',
          `${a >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(a)}$.`,
          'Élever le résultat au carré.',
          `${b >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(b)}$.`,
        ],
        solutionX: [
          '- Choisir un nombre $ \\rightarrow x$',
          `- ${a >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(a)}$ $ \\rightarrow x ${sign(a)}$`,
          `- Élever le résultat au carré $  \\rightarrow (x ${sign(a)})^{2} $`,
          `- ${b >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(b)}$ $ \\rightarrow (x ${sign(a)})^{2} ${sign(b)} $`,
        ],
        simplify: [
          '- Développer :',
          `$(x ${sign(a)})^{2} ${sign(b)} = (x ${sign(a)})(x ${sign(a)}) ${sign(b)}$`,
          `$(x ${sign(a)})^{2} ${sign(b)} = x\\times x + x \\times ${parNeg(a)} ${sign(a)} \\times x  ${sign(a)} \\times ${parNeg(a)} ${sign(b)}$`,
          '- Réduire :',
          `$(x ${sign(a)})^{2} ${sign(b)} = x^{2} ${sign(a)} x ${sign(a)} x  ${sign(a * a)} ${sign(b)}$`,
          `$(x ${sign(a)})^{2} ${sign(b)}= ${miseEnEvidence(`x^{2} ${sign(2 * a)} x ${signSauf0(a * a + b)}`)}$`,
        ],
        solutionV: function (value: number): string[] {
          return [
            `- Choisir un nombre : $${value}$`,
            `- ${a >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(a)}$ $ \\rightarrow ${value} ${sign(a)} = ${value + a}$`,
            `- Élever le résultat au carré $ \\rightarrow ${parNeg(value + a)}^2 = ${(value + a) ** 2} $`,
            `- ${b >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(b)}$ $ \\rightarrow ${(value + a) ** 2} ${sign(b)} = ${miseEnEvidence((value + a) ** 2 + b)} $`,
          ]
        },
        testV: function (value: number): number {
          return (value + a) ** 2 + b
        },
      }
    }
    case '(x+a)^2': {
      return {
        expression: `(x ${sign(a)})^2`,
        a,
        program: [
          'Choisir un nombre.',
          `${a >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(a)}$.`,
          'Élever le résultat au carré.',
        ],
        solutionX: [
          '- Choisir un nombre $ \\rightarrow x$',
          `- ${a >= 0 ? 'Ajouter' : 'Soustraire'} ${Math.abs(a)} $ \\rightarrow x ${sign(a)}$`,
          `- Élever le résultat au carré $  \\rightarrow (x ${sign(a)})^{2} $`,
        ],
        simplify: [
          '- Développer :',
          `$(x ${sign(a)})^{2} = (x ${sign(a)})(x ${sign(a)})$`,
          `$(x ${sign(a)})^{2} = x\\times x + x \\times ${parNeg(a)} ${sign(a)} \\times x  ${sign(a)} \\times ${parNeg(a)}$`,
          '- Réduire :',
          `$(x ${sign(a)})^{2} = x^{2} ${sign(a)} x ${sign(a)} x  ${sign(a * a)}$`,
          `$(x ${sign(a)})^{2} = ${miseEnEvidence(`x^{2} ${sign(2 * a)} x ${sign(a * a)}`)}$`,
        ],
        solutionV: function (value: number): string[] {
          return [
            `- Choisir un nombre : $${value}$`,
            `- ${a >= 0 ? 'Ajouter' : 'Soustraire'} ${Math.abs(a)} $ \\rightarrow ${value} ${sign(a)} = ${value + a}$`,
            `- Élever le résultat au carré $ \\rightarrow ${parNeg(value + a)}^2 = ${miseEnEvidence((value + a) ** 2)} $`,
          ]
        },
        testV: function (value: number): number {
          return (value + a) ** 2
        },
      }
    }

    case '(ax+b)^2': {
      return {
        expression: `(${a}x ${sign(b)})^2`,
        a,
        b,
        program: [
          'Choisir un nombre.',
          `Le multiplier par $${a}$.`,
          `${b >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(b)}$.`,
          'Élever le résultat au carré.',
        ],
        solutionX: [
          '- Choisir un nombre $ \\rightarrow x$',
          `- Le multiplier par $${a}$ $\\rightarrow ${a}x$`,
          `- ${b >= 0 ? 'Ajouter' : 'Soustraire'} ${Math.abs(b)} $\\rightarrow ${a}x ${sign(b)}$`,
          `- Élever le résultat au carré $\\rightarrow ${miseEnEvidence(`({a}x ${sign(b)})^{2}`)} $`,
        ],
        solutionV: function (value: number): string[] {
          return [
            `- Choisir un nombre $ \\rightarrow ${value}$`,
            `- Le multiplier par $${a}$ $\\rightarrow ${value} \\times ${parNeg(a)} = ${value * a}$`,
            `- ${b >= 0 ? 'Ajouter' : 'Soustraire'} ${Math.abs(b)} $\\rightarrow 
               ${value * a} ${sign(b)} = ${value * a + b}$`,
            `- Élever le résultat au carré $\\rightarrow (${value * a + b})^{2} = ${miseEnEvidence(
              (value * a + b) ** 2,
            )} $`,
          ]
        },
        testV: function (value: number): number {
          return (value * a + b) ** 2
        },
      }
    }

    case 'x^2+ax+b': {
      return {
        expression: `x^2 ${sign(a)}x ${sign(b)}`,
        a,
        b,
        program: [
          '- Choisir un nombre.',
          "- L'élever au carré.",
          `- ${a >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(a)}$ fois le nombre choisi.`,
          `- ${b >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(b)}$.`,
        ],
        solutionX: [
          '- Choisir un nombre $ \\rightarrow x$',
          "- L'élever au carré $ \\rightarrow x^2$",
          `- ${a >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(a)}$ fois le nombre choisi  $ \\rightarrow x^2 ${sign(a)}x$`,
          `- ${b >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(b)}$ $ \\rightarrow ${miseEnEvidence(`x^2 ${sign(a)}x ${sign(b)}`)}$`,
        ],
        solutionV: function (value: number): string[] {
          return [
            `- Choisir un nombre  $\\rightarrow ${value}$`,
            `- L'élever au carré  $\\rightarrow ${parNeg(value)}^2 = ${value ** 2}$`,
            `- ${a >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(a)}$ fois le nombre choisi $ \\rightarrow${value ** 2} ${sign(a)} \\times ${parNeg(value)} = ${
              value ** 2 + a * value
            }$`,
            `- ${b >= 0 ? 'Ajouter' : 'Soustraire'} $${Math.abs(b)}$  $ \\rightarrow${
              value ** 2 + a * value
            } ${sign(b)} = ${miseEnEvidence(value ** 2 + a * value + b)}$`,
          ]
        },
        testV: function (value: number): number {
          return value ** 2 + a * value + b
        },
      }
    }
    default:
      throw new Error('Modèle non géré.')
  }
}
