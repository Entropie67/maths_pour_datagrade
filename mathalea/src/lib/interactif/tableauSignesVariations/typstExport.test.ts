import { describe, expect, it } from 'vitest'
import { orangeMathalea } from '../../colors'
import type { TableauSVConfig } from './types'
import { toTypst } from './typstExport'

const config: TableauSVConfig = {
  colonnes: [
    { valeur: '-5' },
    { valeur: '-2', highlight: true },
    { valeur: '5' },
  ],
  lignes: [
    {
      type: 'signe',
      label: 'f(x)',
      cellules: [
        { symbole: '' },
        { symbole: '-', highlight: true },
        { symbole: '|0' },
        { symbole: '+' },
        { symbole: '' },
      ],
    },
  ],
}

describe('toTypst : couleurs', () => {
  it('met en évidence en orange les cellules marquées', () => {
    const code = toTypst(config)
    expect(code).toContain(`text(fill: rgb("${orangeMathalea}")`)
    expect(code).toContain('math.bold($-2$)')
    expect(code).not.toContain('math.bold($5$)')
    expect(code).not.toContain('table-style')
  })

  it('colore en orange les flèches mises en évidence', () => {
    const code = toTypst({
      colonnes: [
        { valeur: '-2', highlight: true },
        { valeur: '1', highlight: true },
      ],
      lignes: [
        {
          type: 'variation',
          label: 'f(x)',
          valeurs: [
            { latex: '3', highlight: true },
            { latex: '-1', highlight: true },
          ],
          fleches: [{ sens: 'bas', highlight: true }],
        },
      ],
    })
    expect(code).toContain(`arrow-style: (stroke: 1pt + rgb("${orangeMathalea}"))`)
    expect(code).not.toContain('table-style')
  })

  it('colore traits et textes avec `couleur`', () => {
    const code = toTypst({ ...config, couleur: orangeMathalea })
    expect(code.startsWith(`#text(fill: rgb("${orangeMathalea}"))[`)).toBe(true)
    expect(code.endsWith(']')).toBe(true)
    expect(code).toContain(
      `table-style: (stroke: 1pt + rgb("${orangeMathalea}")`,
    )
    expect(code).toContain(
      `line-style: (stroke: 1pt + rgb("${orangeMathalea}"))`,
    )
  })
})

describe('toTypst : conversion des valeurs LaTeX', () => {
  /** Code Typst d'un tableau dont le seul antécédent est `latex`. */
  const avecValeur = (latex: string) =>
    toTypst({ colonnes: [{ valeur: latex }], lignes: [] })

  it.each([
    ['\\mathrm{e}', 'upright(e)'],
    ['\\mathrm{e}^{2}', 'upright(e)^(2)'],
    ['\\mathrm{e}^{-2}', 'upright(e)^(-2)'],
    ['x_{1}', 'x_(1)'],
    ['\\dfrac{\\mathrm{e}^{2}}{3}', '(upright(e)^(2))/(3)'],
  ])('convertit %s', (latex, attendu) => {
    expect(avecValeur(latex)).toContain(`domain: ($${attendu}$,),`)
  })
})
