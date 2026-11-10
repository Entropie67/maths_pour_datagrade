import { describe, expect, it } from 'vitest'
import {
  internalPositionsFromFleches,
  internalSigneToTkz,
  resolveValues,
  toLatex,
} from '../../src/lib/interactif/tableauSignesVariations/latexExport'
import type { TableauSVConfig } from '../../src/lib/interactif/tableauSignesVariations/types'

describe('signeToTkz', () => {
  it('mappe les symboles standards', () => {
    expect(internalSigneToTkz('+')).toBe('+')
    expect(internalSigneToTkz('-')).toBe('-')
    expect(internalSigneToTkz('0')).toBe('z')
    expect(internalSigneToTkz('|')).toBe('z')
    expect(internalSigneToTkz('||')).toBe('d')
    expect(internalSigneToTkz('')).toBe('')
  })

  it('mappe les symboles combinés barre+zéro', () => {
    expect(internalSigneToTkz('|0')).toBe('z')
    expect(internalSigneToTkz('||0')).toBe('d')
  })
})

describe('positionsFromFleches', () => {
  it('place les valeurs en fonction des flèches haut/bas', () => {
    expect(
      internalPositionsFromFleches(3, [
        { sens: 'haut' },
        { sens: 'bas' },
      ]),
    ).toEqual(['bas', 'haut', 'bas'])
  })

  it('démarre par bas si la première flèche monte', () => {
    expect(
      internalPositionsFromFleches(2, [{ sens: 'haut' }]),
    ).toEqual(['bas', 'haut'])
  })

  it("conserve la position courante sur une flèche 'interdite' ou vide", () => {
    expect(
      internalPositionsFromFleches(3, [
        { sens: 'haut' },
        { sens: 'interdite' },
      ]),
    ).toEqual(['bas', 'haut', 'haut'])
  })

  it('défaut à bas si aucune flèche ne donne d\'orientation', () => {
    expect(
      internalPositionsFromFleches(2, [{ sens: '' }]),
    ).toEqual(['bas', 'bas'])
  })
})

describe('resolveValues', () => {
  const config: TableauSVConfig = {
    variableName: 'x',
    colonnes: [
      { valeur: '-\\infty' },
      { valeur: '0', editable: true },
      { valeur: '+\\infty' },
    ],
    lignes: [
      {
        type: 'signe',
        label: 'f(x)',
        cellules: [
          { symbole: '' },
          { symbole: '-', editable: true },
          { symbole: '0' },
          { symbole: '+', editable: true },
          { symbole: '' },
        ],
      },
    ],
  }

  it('utilise la config par défaut si aucune saisie', () => {
    const r = resolveValues(config, {})
    expect(r.headerCells).toEqual(['-\\infty', '0', '+\\infty'])
    expect(r.cellsByLigne[0]).toEqual(['', '-', '0', '+', ''])
  })

  it('remplace par les saisies sur les cellules éditables', () => {
    const r = resolveValues(config, { L0C1: '2', L1C1: '+', L1C3: '-' })
    expect(r.headerCells).toEqual(['-\\infty', '2', '+\\infty'])
    expect(r.cellsByLigne[0]).toEqual(['', '+', '0', '-', ''])
  })

  it("ignore les saisies sur des cellules non éditables", () => {
    const r = resolveValues(config, { L0C0: 'PIRATE', L1C2: 'PIRATE' })
    expect(r.headerCells[0]).toBe('-\\infty')
    expect(r.cellsByLigne[0][2]).toBe('0')
  })
})

describe('toLatex - tableau de signes', () => {
  it('génère le tkz-tab attendu pour un tableau simple', () => {
    const config: TableauSVConfig = {
      variableName: 'x',
      colonnes: [
        { valeur: '-\\infty' },
        { valeur: '2' },
        { valeur: '+\\infty' },
      ],
      lignes: [
        {
          type: 'signe',
          label: 'f(x)',
          cellules: [
            { symbole: '' },
            { symbole: '-' },
            { symbole: '0' },
            { symbole: '+' },
            { symbole: '' },
          ],
        },
      ],
    }
    const out = toLatex(config)
    expect(out).toContain('\\begin{tikzpicture}')
    expect(out).toContain('\\tkzTabInit')
    expect(out).toContain('$x$ / 1')
    expect(out).toContain('$f(x)$ / 1')
    expect(out).toContain('$-\\infty$, $2$, $+\\infty$')
    expect(out).toContain('\\tkzTabLine{, -, z, +, }')
    expect(out).toContain('\\end{tikzpicture}')
  })

  it('gère la double barre pour une valeur interdite', () => {
    const config: TableauSVConfig = {
      colonnes: [
        { valeur: '-\\infty' },
        { valeur: '0' },
        { valeur: '+\\infty' },
      ],
      lignes: [
        {
          type: 'signe',
          label: 'f(x)',
          cellules: [
            { symbole: '' },
            { symbole: '-' },
            { symbole: '||' },
            { symbole: '+' },
            { symbole: '' },
          ],
        },
      ],
    }
    const out = toLatex(config)
    expect(out).toContain('\\tkzTabLine{, -, d, +, }')
  })
})

describe('toLatex - tableau de variations', () => {
  it('produit \\tkzTabVar avec les positions correctes', () => {
    const config: TableauSVConfig = {
      colonnes: [
        { valeur: '-\\infty' },
        { valeur: '-2' },
        { valeur: '0' },
        { valeur: '+\\infty' },
      ],
      lignes: [
        {
          type: 'signe',
          label: "f'(x)",
          cellules: [
            { symbole: '' },
            { symbole: '+' },
            { symbole: '0' },
            { symbole: '-' },
            { symbole: '0' },
            { symbole: '+' },
            { symbole: '' },
          ],
        },
        {
          type: 'variation',
          label: 'f(x)',
          valeurs: [
            { latex: '-\\infty' },
            { latex: '3' },
            { latex: '-1' },
            { latex: '+\\infty' },
          ],
          fleches: [
            { sens: 'haut' },
            { sens: 'bas' },
            { sens: 'haut' },
          ],
        },
      ],
    }
    const out = toLatex(config)
    expect(out).toContain('\\tkzTabLine{, +, z, -, z, +, }')
    expect(out).toContain(
      '\\tkzTabVar{-/ $-\\infty$, +/ $3$, -/ $-1$, +/ $+\\infty$}',
    )
    expect(out).toContain("$f'(x)$ / 1")
    expect(out).toContain('$f(x)$ / 2')
  })

  it("intègre l'état de l'élève dans la sortie LaTeX", () => {
    const config: TableauSVConfig = {
      colonnes: [
        { valeur: '-\\infty' },
        { valeur: '0' },
        { valeur: '+\\infty' },
      ],
      lignes: [
        {
          type: 'signe',
          label: 'f(x)',
          cellules: [
            { symbole: '' },
            { symbole: '', editable: true },
            { symbole: '0' },
            { symbole: '', editable: true },
            { symbole: '' },
          ],
        },
      ],
    }
    const out = toLatex(config, { L1C1: '-', L1C3: '+' })
    expect(out).toContain('\\tkzTabLine{, -, z, +, }')
  })
})
