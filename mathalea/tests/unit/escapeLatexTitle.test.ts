import { describe, expect, it } from 'vitest'
import { escapeLatexTitle } from '../../src/lib/Latex'

describe('escapeLatexTitle', () => {
  it('échappe les % qui commenteraient la fin de la ligne', () => {
    expect(
      escapeLatexTitle('Appliquer un pourcentage avec 10 %, 20 %, …'),
    ).toBe('Appliquer un pourcentage avec 10 \\%, 20 \\%, …')
  })
  it("n'échappe pas deux fois un % déjà échappé", () => {
    expect(escapeLatexTitle('Calculer 10 \\% de $x$')).toBe(
      'Calculer 10 \\% de $x$',
    )
  })
  it('laisse intact le LaTeX du titre', () => {
    const titre = 'Résoudre une équation du type $\\dfrac{x+a}{b}=c$'
    expect(escapeLatexTitle(titre)).toBe(titre)
  })
})
