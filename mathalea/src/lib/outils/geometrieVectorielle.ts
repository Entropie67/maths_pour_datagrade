import {
  ecritureAlgebriqueSauf0,
  ecritureParentheseSiNegatif,
} from './ecritures'
import { pgcd } from './primalite'

export type Vector3<T = number> = [T, T, T]

export function coordTex(point: Vector3): string {
  return `(${point[0]} ; ${point[1]} ; ${point[2]})`
}

export function columnTex(vector: Vector3): string {
  return `\\begin{pmatrix}${vector[0]}\\\\${vector[1]}\\\\${vector[2]}\\end{pmatrix}`
}

export function vectorBetween(from: Vector3, to: Vector3): Vector3 {
  return [to[0] - from[0], to[1] - from[1], to[2] - from[2]]
}

export function dot(u: Vector3, v: Vector3): number {
  return u[0] * v[0] + u[1] * v[1] + u[2] * v[2]
}

export function normSquared(vector: Vector3): number {
  return dot(vector, vector)
}

export function crossProduct(u: Vector3, v: Vector3): Vector3 {
  return [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ]
}

export function simplifieVector(vector: Vector3): Vector3 {
  const diviseur = pgcd(
    pgcd(Math.abs(vector[0]), Math.abs(vector[1])),
    Math.abs(vector[2]),
  )
  return [vector[0] / diviseur, vector[1] / diviseur, vector[2] / diviseur]
}

function termeTex(
  coefficient: number,
  variable: string,
  estPremierTerme: boolean,
): string {
  if (coefficient === 0) return ''
  const valeurAbsolue = Math.abs(coefficient)
  const coeur = `${valeurAbsolue === 1 ? '' : valeurAbsolue}${variable}`
  if (estPremierTerme) return coefficient < 0 ? `-${coeur}` : coeur
  return coefficient < 0 ? ` - ${coeur}` : ` + ${coeur}`
}

export function expressionLineaireTex(
  coefficients: Vector3,
  variables: Vector3<string>,
): string {
  const termes: string[] = []
  for (let index = 0; index < coefficients.length; index++) {
    const terme = termeTex(
      coefficients[index],
      variables[index],
      termes.length === 0,
    )
    if (terme !== '') termes.push(terme)
  }
  return termes.join('') || '0'
}

export function equationPlanTex(
  nx: number,
  ny: number,
  nz: number,
  d: number,
): string {
  return `${expressionLineaireTex([nx, ny, nz], ['x', 'y', 'z'])}${ecritureAlgebriqueSauf0(d)}=0`
}

export function vectorBetweenDetailsTex(
  name: string,
  from: Vector3,
  to: Vector3,
): string {
  const vector = vectorBetween(from, to)
  return `$\\overrightarrow{${name}}=\\begin{pmatrix}${to[0]}-${ecritureParentheseSiNegatif(from[0])}\\\\${to[1]}-${ecritureParentheseSiNegatif(from[1])}\\\\${to[2]}-${ecritureParentheseSiNegatif(from[2])}\\end{pmatrix}=\\begin{pmatrix}${vector[0]}\\\\${vector[1]}\\\\${vector[2]}\\end{pmatrix}$`
}
