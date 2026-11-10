import FractionEtendue from '../../modules/FractionEtendue'
import type { IFractionEtendue } from '../../modules/FractionEtendue.type'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from './ecritures'
import { texNombre } from './texNombre'

export function eqToLatex(
  vect: Array<number | FractionEtendue>,
  nomVal: Array<string>,
  inSys: boolean,
) {
  let expr = ''
  let checkPreviousNull = true
  for (let i = 0; i < 3; i++) {
    if (vect.slice(0, 3).every((item) => item === 0) && i === 0) {
      expr = expr + '0'
    } else if (!(vect[i] === 0) && checkPreviousNull) {
      if (nomVal[i] === '') {
        expr = expr + `${texNombre(vect[i], 0)}${nomVal[i]}`
      } else {
        expr = expr + `${rienSi1(vect[i])}${nomVal[i]}`
      }
      checkPreviousNull = false
    } else if (!(vect[i] === 0) && !checkPreviousNull) {
      if (nomVal[i] === '') {
        expr = expr + `${ecritureAlgebrique(vect[i])}${nomVal[i]}`
      } else {
        expr = expr + `${ecritureAlgebriqueSauf1(vect[i])}${nomVal[i]}`
      }
      checkPreviousNull = false
    }
  }
  if (inSys === true) {
    expr = expr + ' &='
  } else {
    expr = expr + '='
  }
  checkPreviousNull = true
  for (let i = 3; i < 6; i++) {
    if (vect.slice(3).every((item) => item === 0) && i === 3) {
      expr = expr + '0'
    } else if (!(vect[i] === 0) && checkPreviousNull) {
      if (nomVal[i] === '') {
        expr = expr + `${texNombre(vect[i], 0)}${nomVal[i]}`
      } else {
        expr = expr + `${rienSi1(vect[i])}${nomVal[i]}`
      }
      checkPreviousNull = false
    } else if (!(vect[i] === 0) && !checkPreviousNull) {
      if (nomVal[i] === '') {
        expr = expr + `${ecritureAlgebrique(vect[i])}${nomVal[i]}`
      } else {
        expr = expr + `${ecritureAlgebriqueSauf1(vect[i])}${nomVal[i]}`
      }
      checkPreviousNull = false
    }
  }
  return expr
}
export function printSystem(eq1: string, eq2: string) {
  let expr = ''
  expr =
    expr +
    `\\begin{cases}\\begin{aligned}${eq1}\\\\${eq2}\\end{aligned}\\end{cases}`
  return expr
}

export function timesIfNotUn(valeur: number) {
  if (valeur === 1 || valeur === -1) {
    return ''
  } else {
    return '\\times'
  }
}

export function multCoeff(
  vect: Array<number | FractionEtendue>,
  coeff: number,
) {
  return vect.map(function (x: number | FractionEtendue) {
    return x instanceof FractionEtendue ? x.multiplieEntier(coeff) : x * coeff
  })
}
export function addCombLin(
  vect1: Array<number | FractionEtendue>,
  vect2: Array<number | FractionEtendue>,
  coeff: number,
) {
  return vect1.map(function (x: number | FractionEtendue, i: number) {
    if (typeof x === 'number' && typeof vect2[i] === 'number') {
      return x + (vect2[i] as number) * coeff
    } else if (x instanceof FractionEtendue && typeof vect2[i] === 'number') {
      return x.ajouteEntier((vect2[i] as number) * coeff)
    } else if (typeof x === 'number' && vect2[i] instanceof FractionEtendue) {
      return (vect2[i] as FractionEtendue)
        .multiplieEntier(coeff)
        .ajouteEntier(x)
    } else if (
      x instanceof FractionEtendue &&
      vect2[i] instanceof FractionEtendue
    ) {
      return (vect2[i] as FractionEtendue)
        .multiplieEntier(coeff)
        .sommeFraction(x)
    } else {
      return 0
    }
  })
}

export function texSystemeEquations(equations: string[]) {
  return `\\begin{cases}\\begin{aligned}${equations.join('\\\\')}\\end{aligned}\\end{cases}`
}

export function texMembreGauche(coefficients: number[], variables: string[]) {
  let expression = ''
  for (let index = 0; index < coefficients.length; index++) {
    const coefficient = coefficients[index]
    if (coefficient === 0) continue
    expression +=
      expression === ''
        ? `${rienSi1(coefficient)}${variables[index]}`
        : `${ecritureAlgebriqueSauf1(coefficient)}${variables[index]}`
  }
  return expression === '' ? '0' : expression
}

export function expressionLineaire(
  constante: IFractionEtendue,
  coefficient: IFractionEtendue,
  variable = 't',
) {
  const constanteSimplifiee = constante.simplifie()
  const coefficientSimplifie = coefficient.simplifie()
  if (coefficientSimplifie.num === 0)
    return constanteSimplifiee.texFractionSimplifiee
  if (constanteSimplifiee.num === 0) {
    return `${ecritureAlgebriqueSauf1(coefficientSimplifie).replace(/^\+/, '')}${variable}`
  }
  return `${constanteSimplifiee.texFractionSimplifiee}${ecritureAlgebriqueSauf1(coefficientSimplifie)}${variable}`
}
