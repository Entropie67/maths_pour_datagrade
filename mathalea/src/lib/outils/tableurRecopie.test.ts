import { describe, expect, it } from 'vitest'
import { creeRecopie, decritDecalage } from './tableurRecopie'
import { analyseReference, recopieFormule } from './tableurFormules'

describe('recopie de formules tirée au sort', () => {
  for (const mode of [1, 2, 3] as const) {
    for (const dollar of [1, 2, 3, 4] as const) {
      it(`mode ${mode}, dollar ${dollar}`, () => {
        for (let essai = 0; essai < 200; essai++) {
          const r = creeRecopie({ mode, dollar, nbColonnes: 6, nbLignes: 8 })
          expect(r.formuleRecopiee).toBe(
            recopieFormule(r.formule, r.origine, r.destination),
          )
          expect(r.formuleRecopiee).not.toBe(r.formule)
          const o = analyseReference(r.origine)!
          const d = analyseReference(r.destination)!
          expect(d.colonne - o.colonne).toBe(r.dColonnes)
          expect(d.ligne - o.ligne).toBe(r.dLignes)
          if (mode === 1) expect(r.dLignes).toBe(0)
          if (mode === 2) expect(r.dColonnes).toBe(0)
          if (dollar === 1) expect(r.formule).not.toContain('$')
          else expect(r.formule).toContain('$')
          expect(d.colonne).toBeLessThan(6)
          expect(d.ligne).toBeLessThan(8)
        }
      })
    }
  }

  it('décrit le décalage', () => {
    expect(decritDecalage(2, 3)).toBe(
      '$2$ colonnes vers la droite et $3$ lignes vers le bas',
    )
    expect(decritDecalage(0, 1)).toBe('$1$ ligne vers le bas')
    expect(decritDecalage(1, 0)).toBe('$1$ colonne vers la droite')
  })
})
