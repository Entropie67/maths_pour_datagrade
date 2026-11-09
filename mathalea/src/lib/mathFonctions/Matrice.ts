/**
 * Génère une séquence d'entiers comme mathjs.range
 * @param start début inclus
 * @param end fin exclus
 * @param step pas (défaut 1)
 * @returns number[]
 */
// Matrice.ts - version TypeScript sans dépendance à mathjs
// Refactoring par Copilot, basé sur l'ancien Matrice.js

import { rangeMinMax } from '../outils/nombres'
export function range(start: number, end: number, step: number = 1): number[] {
  const result: number[] = []
  if (step === 0) throw new Error('step ne peut pas être 0')
  if ((step > 0 && start >= end) || (step < 0 && start <= end)) return []
  for (let i = start; step > 0 ? i < end : i > end; i += step) {
    result.push(i)
  }
  return result
}

export class Matrice {
  _data: number[][]
  dim: number

  constructor(table: number[][] | number) {
    if (Array.isArray(table)) {
      this._data = table.map((row) => row.slice())
    } else {
      this._data = zeros(table, table)
    }
    this.dim = this._data.length
  }

  determinant(): number {
    return determinant(this._data)
  }

  inverse(): Matrice {
    return this.determinant() !== 0
      ? matrice(inverse(this._data))
      : new Matrice(zeros(this.dim, this.dim))
  }

  subset(lignes: number, colonnes: number): number
  subset(lignes: number[] | number, colonnes: number[] | number): Matrice
  subset(
    lignes: number[] | number,
    colonnes: number[] | number,
  ): Matrice | number {
    const sub = subset(this._data, lignes, colonnes)
    return typeof sub === 'number' ? sub : matrice(sub)
  }

  getValue(i: number, j: number): number {
    return this._data[i][j]
  }

  transpose(): Matrice {
    return matrice(transpose(this._data))
  }

  multiply(v: Matrice | number[][]): Matrice
  multiply(v: number[]): number[] | number
  multiply(v: Matrice | number[][] | number[]): Matrice | number[] | number {
    const vData = v instanceof Matrice ? v._data : v
    const produit = multiply(this._data, vData)
    if (typeof produit === 'number') {
      return produit
    }
    if (Array.isArray(produit[0])) {
      // produit est un number[][]
      return matrice(produit as number[][])
    }
    // produit est un number[]
    return produit as number[]
  }

  add(m: Matrice | number[][]): Matrice {
    const mData = m instanceof Matrice ? m._data : m
    return matrice(add(this._data, mData))
  }

  divide(k: number): Matrice {
    return matrice(divide(this._data, k))
  }

  toTex(): string {
    return toTex(this._data)
  }

  toArray(): number[][] {
    return this._data.map((row) => row.slice())
  }

  toString(): string {
    return (
      '[' + this._data.map((row) => '[' + row.join(',') + ']').join(',') + ']'
    )
  }

  texDet(): string {
    let content = ''
    for (let arrIndex = 0; arrIndex < this._data.length; arrIndex++) {
      content += `${this._data[arrIndex].join(' & ')}`
      if (arrIndex < this._data.length - 1) content += '\\\\'
    }
    return `\\begin{vmatrix}\n${content}\n\\end{vmatrix}`
  }

  reduite(l: number, c: number): Matrice {
    const lignes = rangeMinMax(0, this.dim - 1, l)
    const colonnes = rangeMinMax(0, this.dim - 1, c)
    return matrice(subset(this._data, lignes, colonnes) as number[][])
  }
}

export function matrice(table: number[][] | number | Matrice): Matrice {
  if (Array.isArray(table) || typeof table === 'number') {
    return new Matrice(table)
  } else if ((table as Matrice)._data != null) {
    return new Matrice((table as Matrice)._data)
  }
  throw new Error('Invalid argument for matrice()')
}

// Fonctions utilitaires matricielles
function zeros(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(0))
}

function determinant(m: number[][]): number {
  const n = m.length
  if (n === 1) return m[0][0]
  if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0]
  let det = 0
  for (let j = 0; j < n; j++) {
    det += (j % 2 === 0 ? 1 : -1) * m[0][j] * determinant(minor(m, 0, j))
  }
  return det
}

function minor(m: number[][], row: number, col: number): number[][] {
  return m.filter((_, i) => i !== row).map((r) => r.filter((_, j) => j !== col))
}

function inverse(m: number[][]): number[][] {
  const n = m.length
  const det = determinant(m)
  if (det === 0) throw new Error('Matrice non inversible')
  if (n === 1) return [[1 / m[0][0]]]
  // Calcul de la comatrice puis transposée puis division par le déterminant
  const cofactor = (i: number, j: number) =>
    ((i + j) % 2 === 0 ? 1 : -1) * determinant(minor(m, i, j))
  const cofMat = m.map((row, i) => row.map((_, j) => cofactor(i, j)))
  const adj = transpose(cofMat)
  return adj.map((row) => row.map((val) => val / det))
}

function multiply(
  a: number[][],
  b: number[][] | number[],
): number[][] | number[] | number {
  if (Array.isArray(b[0])) {
    // Matrice × Matrice
    const rows = a.length
    const cols = (b as number[][])[0].length
    const n = a[0].length
    const result = zeros(rows, cols)
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        for (let k = 0; k < n; k++) {
          result[i][j] += a[i][k] * (b as number[][])[k][j]
        }
      }
    }
    return result
  } else {
    // Matrice × Vecteur
    const rows = a.length
    const n = a[0].length
    const result = Array(rows).fill(0)
    for (let i = 0; i < rows; i++) {
      for (let k = 0; k < n; k++) {
        result[i] += a[i][k] * (b as number[])[k]
      }
    }
    return result
  }
}

function add(a: number[][], b: number[][]): number[][] {
  return a.map((row, i) => row.map((val, j) => val + b[i][j]))
}

function divide(a: number[][], k: number): number[][] {
  return a.map((row) => row.map((val) => val / k))
}

function transpose(a: number[][]): number[][] {
  return a[0].map((_, j) => a.map((row) => row[j]))
}

function subset(
  m: number[][],
  lignes: number[] | number,
  colonnes: number[] | number,
): number[][] | number {
  if (typeof lignes === 'number' && typeof colonnes === 'number') {
    return m[lignes][colonnes]
  }
  const rows = typeof lignes === 'number' ? [lignes] : lignes
  const cols = typeof colonnes === 'number' ? [colonnes] : colonnes
  return rows.map((i) => cols.map((j) => m[i][j]))
}

function toTex(m: number[][]): string {
  let content = ''
  for (let arrIndex = 0; arrIndex < m.length; arrIndex++) {
    content += `${m[arrIndex].join(' & ')}`
    if (arrIndex < m.length - 1) content += '\\\\'
  }
  // Utilise bmatrix pour compatibilité KaTeX
  return `\\begin{pmatrix}\n${content}\n\\end{pmatrix}`
}
