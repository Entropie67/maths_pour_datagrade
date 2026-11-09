import { describe, expect, it } from 'vitest'
import { latexMatriceAvecPlaceholders } from './matrix'

describe('latexMatriceAvecPlaceholders', () => {
  it('construit une matrice rectangulaire remplie de placeholders', () => {
    expect(latexMatriceAvecPlaceholders(2, 3)).toBe(
      '\\begin{pmatrix}\\placeholder[matrix0]{}&\\placeholder[matrix1]{}&\\placeholder[matrix2]{}\\\\\\placeholder[matrix3]{}&\\placeholder[matrix4]{}&\\placeholder[matrix5]{}\\end{pmatrix}',
    )
  })

  it('accepte les matrices lignes et colonnes', () => {
    expect(latexMatriceAvecPlaceholders(1, 2)).toBe(
      '\\begin{pmatrix}\\placeholder[matrix0]{}&\\placeholder[matrix1]{}\\end{pmatrix}',
    )
    expect(latexMatriceAvecPlaceholders(3, 1)).toBe(
      '\\begin{pmatrix}\\placeholder[matrix0]{}\\\\\\placeholder[matrix1]{}\\\\\\placeholder[matrix2]{}\\end{pmatrix}',
    )
  })
})
