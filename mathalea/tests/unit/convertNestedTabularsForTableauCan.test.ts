import { describe, expect, it } from 'vitest'
import { convertNestedTabularsForTableauCan } from '../../src/lib/Latex'

describe('convertNestedTabularsForTableauCan', () => {
  it('convertit un array de préambule simple en tblr', () => {
    const input =
      '\\CompteurTC & { $\\begin{array}{|c|c|}\\hline 7 & 4 \\\\ \\hline\\end{array}$ }&{ }&\\stepcounter{nbEx}\\\\'
    const output = convertNestedTabularsForTableauCan(input)
    expect(output).toContain('\\begin{tblr}{|c|c|}')
    expect(output).toContain('\\end{tblr}')
    expect(output).not.toContain('\\begin{array}')
    expect(output).not.toContain('\\end{array}')
    // le contenu de la cellule (traits, &, \\) est préservé
    expect(output).toContain('\\hline 7 & 4 \\\\ \\hline')
  })

  it('convertit aussi tabular et retire les espaces du préambule', () => {
    const input = '\\begin{tabular}{ c c c }a & b & c\\\\\\end{tabular}'
    expect(convertNestedTabularsForTableauCan(input)).toBe(
      '\\begin{tblr}{ccc}a & b & c\\\\\\end{tblr}',
    )
  })

  it('gère l’argument de position optionnel', () => {
    const input = '\\begin{array}[t]{lr}a & b\\\\\\end{array}'
    expect(convertNestedTabularsForTableauCan(input)).toBe(
      '\\begin{tblr}{lr}a & b\\\\\\end{tblr}',
    )
  })

  it('remplace \\tabularnewline par \\\\, seule fin de ligne reconnue par tabularray', () => {
    const input =
      '\\begin{array}{|c|c|}\\hline 1&2\\tabularnewline\\hline 3&4\\tabularnewline\\hline\\end{array}'
    expect(convertNestedTabularsForTableauCan(input)).toBe(
      '\\begin{tblr}{|c|c|}\\hline 1&2\\\\\\hline 3&4\\\\\\hline\\end{tblr}',
    )
  })

  it('laisse intacts les préambules non triviaux', () => {
    const input = '\\begin{array}{r@{}l}a & b\\\\\\end{array}'
    expect(convertNestedTabularsForTableauCan(input)).toBe(input)
    const withP = '\\begin{tabular}{p{2cm}c}a & b\\\\\\end{tabular}'
    expect(convertNestedTabularsForTableauCan(withP)).toBe(withP)
  })

  it('ne touche pas un tblr déjà présent', () => {
    const input = '\\begin{tblr}{cc}a & b\\\\\\end{tblr}'
    expect(convertNestedTabularsForTableauCan(input)).toBe(input)
  })

  it('convertit plusieurs tableaux imbriqués dans le même corps', () => {
    const input =
      '{ $\\begin{array}{c}1\\\\\\end{array}$ } & { $\\begin{array}{cc}2 & 3\\\\\\end{array}$ }'
    const output = convertNestedTabularsForTableauCan(input)
    expect(output).toBe(
      '{ $\\begin{tblr}{c}1\\\\\\end{tblr}$ } & { $\\begin{tblr}{cc}2 & 3\\\\\\end{tblr}$ }',
    )
  })
})
