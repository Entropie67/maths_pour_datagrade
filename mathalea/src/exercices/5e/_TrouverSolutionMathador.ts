import { choice, shuffle } from '../../lib/outils/arrayOutils'

/**
 * @author Jean-claude Lhote
 * @param {number} min Valeur minimum pour la solution
 * @param {number} max Valeur maximum pour la solution
 * Cette fonction produit aléatoirement un tirage de 5 nombres, une solution, un tableau contenant les calculs successifs, une chaine contenant l'expression mathador correspondante
 * @returns {array} [tirage=[a,b,c,d,e],solution (compris entre min et max),operationsSuccessives=[string1,string2,string3,string4,string5],expression]
 * les string1 à 5 ainsi que l'expresion sont ) mettre en mode maths.
 * sert dans les exercices CM019,
 */
export default function TrouverSolutionMathador(
  min: number,
  max: number,
  A: number = 1,
  B: number = 4,
  C: number = 8,
  D: number = 3,
  E: number = 5,
): [number[], number, string[], string[], string[]] {
  return construitSolutionMathador(
    min,
    max,
    arguments.length - 2,
    [A, B, C, D, E],
    false,
  )
}

/**
 * Même tirage que `TrouverSolutionMathador(min, max)` (mêmes nombres, mêmes opérations),
 * mais les calculs sont écrits dans l'ordre de lecture : pour une addition ou une multiplication,
 * le résultat d'un calcul précédent est placé avant le nombre du tirage (2+9=11 puis 11×8=88),
 * et l'expression finale respecte les priorités avec le minimum de parenthèses.
 */
export function TrouverSolutionMathadorOrdreDeLecture(
  min: number,
  max: number,
): [number[], number, string[], string[], string[]] {
  return construitSolutionMathador(min, max, 0, [], true)
}

const estUnNombre = (part: string) => /^\d+$/.test(part)
const sansParentheses = (part: string) =>
  part.startsWith('\\left(') ? part.slice(6, part.length - 7) : part

/**
 * Vrai pour `\\left(a\\div b\\right)` : la division est prioritaire sur l'addition
 * et la soustraction, ses parenthèses y sont inutiles.
 */
const estUneDivision = (part: string) => {
  if (!part.startsWith('\\left(')) return false
  const contenu = sansParentheses(part)
  let profondeur = 0
  let division = false
  for (let k = 0; k < contenu.length; k++) {
    if (contenu.startsWith('\\left(', k)) {
      profondeur++
      k += 5
    } else if (contenu.startsWith('\\right)', k)) {
      profondeur--
      k += 6
    } else if (profondeur === 0) {
      if (contenu.startsWith('\\div', k)) division = true
      else if (contenu.startsWith('\\times', k) || '+-'.includes(contenu[k]))
        return false
    }
  }
  return division
}
const sansParenthesesDeDivision = (part: string) =>
  estUneDivision(part) ? sansParentheses(part) : part

function construitSolutionMathador(
  min: number,
  max: number,
  nbDetermines: number,
  [A, B, C, D, E]: number[],
  ordreDeLecture: boolean,
): [number[], number, string[], string[], string[]] {
  let eureka
  let a
  let b
  let c
  let d
  let e
  let tirage
  let nombresRestants
  let operationsRestantes
  let expressionEnCoursF
  let expressionEnCoursD
  let op
  let part1f
  let part2f
  let part1d
  let part2d
  let operationsSuccessives = []
  let solution
  const listeChoix = [
    1, 2, 2, 3, 3, 4, 4, 4, 4, 5, 6, 6, 6, 6, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  ]
  eureka = false
  while (eureka === false) {
    tirage = []

    if (nbDetermines < 1) {
      a = choice(listeChoix)
    } else {
      a = A
    }
    if (nbDetermines < 2) {
      b = choice(listeChoix, [13, 14, 15, 16, 17, 18, 19, 20, a])
    } else {
      b = B
    }
    if (nbDetermines < 3) {
      c = choice(listeChoix, [12, 13, 14, 15, 16, 17, 18, 19, 20, a, b])
    } else {
      c = C
    }
    if (nbDetermines < 4) {
      d = choice(listeChoix, [12, 13, 14, 15, 16, 17, 18, 19, 20, b, c])
    } else {
      d = D
    }
    if (nbDetermines < 5) {
      e = choice(listeChoix, [12, 13, 14, 15, 16, 17, 18, 19, 20])
    } else {
      e = E
    }
    tirage.push(a, b, c, d, e)
    nombresRestants = shuffle(tirage)
    operationsRestantes = ['\\times', '+', '-', '\\div']
    operationsRestantes = shuffle(operationsRestantes)
    expressionEnCoursF = [
      `${nombresRestants[0]}`,
      `${nombresRestants[1]}`,
      `${nombresRestants[2]}`,
      `${nombresRestants[3]}`,
      `${nombresRestants[4]}`,
    ]
    expressionEnCoursD = [
      `${nombresRestants[0]}`,
      `${nombresRestants[1]}`,
      `${nombresRestants[2]}`,
      `${nombresRestants[3]}`,
      `${nombresRestants[4]}`,
    ]

    while (nombresRestants.length > 1) {
      b = nombresRestants.pop() ?? 0
      a = nombresRestants.pop() ?? 0
      part2f = expressionEnCoursF.pop() ?? ''
      part1f = expressionEnCoursF.pop() ?? ''
      part2d = expressionEnCoursD.pop() ?? ''
      part1d = expressionEnCoursD.pop() ?? ''

      op = operationsRestantes.pop() ?? '+'
      if (
        ordreDeLecture &&
        (op === '\\times' || op === '+') &&
        estUnNombre(part1f) &&
        !estUnNombre(part2f)
      ) {
        ;[a, b] = [b, a]
        ;[part1f, part2f] = [part2f, part1f]
        ;[part1d, part2d] = [part2d, part1d]
      }
      if (op === '\\times') {
        c = a * b
        if (ordreDeLecture) part1d = sansParenthesesDeDivision(part1d)
        expressionEnCoursF.push(`\\left(${part1f}${op}${part2f}\\right)`)
        expressionEnCoursD.push(`\\left(${part1d}${op}${part2d}\\right)`)
        nombresRestants.push(c)
      } else if (op === '\\div') {
        if (a % b === 0) {
          c = a / b
          if (part1f[0] === '\\') {
            part1f = part1f.substring(6, part1f.length)
            part1f = part1f.substring(0, part1f.length - 7)
          }
          if (part2f[0] === '\\') {
            part2f = part2f.substring(6, part2f.length)
            part2f = part2f.substring(0, part2f.length - 7)
          }
          expressionEnCoursF.push(`\\dfrac{${part1f}}{${part2f}}`)
          expressionEnCoursD.push(`\\left(${part1d}${op}${part2d}\\right)`)
          nombresRestants.push(c)
        } else {
          break
        }
      } else if (op === '-') {
        if (a > b) {
          c = a - b
          if (ordreDeLecture) {
            part1d = sansParenthesesDeDivision(part1d)
            part2d = sansParenthesesDeDivision(part2d)
          }
          expressionEnCoursF.push(`\\left(${part1f}${op}${part2f}\\right)`)
          expressionEnCoursD.push(`\\left(${part1d}${op}${part2d}\\right)`)
          nombresRestants.push(c)
        } else {
          break
        }
      } else if (op === '+') {
        c = a + b
        if (ordreDeLecture) {
          part1f = sansParentheses(part1f)
          part1d = sansParentheses(part1d)
        }
        if (part2f.substring(0, 2) === '\\l') {
          part2f = part2f.substring(6, part2f.length)
          part2f = part2f.substring(0, part2f.length - 7)
        }
        expressionEnCoursF.push(`\\left(${part1f}${op}${part2f}\\right)`)
        if (part2d.substring(0, 2) === '\\l') {
          part2d = part2d.substring(6, part2d.length)
          part2d = part2d.substring(0, part2d.length - 7)
        }
        expressionEnCoursD.push(`\\left(${part1d}${op}${part2d}\\right)`)
        nombresRestants.push(c)
      }
      operationsSuccessives.push(`${a}` + op + `${b}=${c}`)
    }

    if (nombresRestants.length === 1 && operationsRestantes.length === 0) {
      solution = nombresRestants[0]
      if (solution >= min && solution <= max) {
        eureka = true
        if (
          expressionEnCoursF[0][0] === '\\' &&
          expressionEnCoursF[0][1] === 'l'
        ) {
          expressionEnCoursF[0] = expressionEnCoursF[0].substring(
            6,
            expressionEnCoursF[0].length,
          )
          expressionEnCoursF[0] = expressionEnCoursF[0].substring(
            0,
            expressionEnCoursF[0].length - 7,
          )
        }
        if (
          expressionEnCoursD[0][0] === '\\' &&
          expressionEnCoursD[0][1] === 'l'
        ) {
          expressionEnCoursD[0] = expressionEnCoursD[0].substring(
            6,
            expressionEnCoursD[0].length,
          )
          expressionEnCoursD[0] = expressionEnCoursD[0].substring(
            0,
            expressionEnCoursD[0].length - 7,
          )
        }
        return [
          tirage,
          solution,
          operationsSuccessives,
          expressionEnCoursF,
          expressionEnCoursD,
        ]
      } else {
        operationsSuccessives = []
      }
    } else {
      operationsSuccessives = []
    }
  }
  throw new Error('Aucune solution Mathador trouvée')
}
