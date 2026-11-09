import { describe, expect, it } from 'vitest'
import {
  NB_SCENARIOS,
  cellulesCible,
  creeScenario,
  estCoherent,
  valeursCible,
} from './tableurScenarios'

describe('scénarios de formules de tableur', () => {
  for (let numero = 1; numero <= NB_SCENARIOS; numero++) {
    it(`le scénario ${numero} distingue formules justes et fausses`, () => {
      for (let essai = 0; essai < 100; essai++) {
        const s = creeScenario(numero)
        expect(estCoherent(s), JSON.stringify(s)).toBe(true)
        // la formule juste donne des nombres dans toutes les cellules cibles
        const valeurs = valeursCible(s, s.formuleJuste)
        expect(valeurs).toHaveLength(s.nbRecopies + 1)
        valeurs.forEach((v) => expect(typeof v).toBe('number'))
      }
    })
  }

  it('liste les cellules cibles sous la première', () => {
    const s = creeScenario(1)
    expect(cellulesCible(s)[0]).toBe('D2')
    expect(cellulesCible(s)).toHaveLength(s.nbRecopies + 1)
  })

  it('les formules erronées du total restent calculables sans référence circulaire', () => {
    const s = creeScenario(7)
    for (const erreur of s.erreurs) {
      const valeurs = valeursCible(s, erreur.formule)
      expect(valeurs, erreur.formule).toHaveLength(1)
      expect(typeof valeurs[0], erreur.formule).toBe('number')
      expect(valeurs, erreur.formule).not.toEqual(valeursCible(s, s.formuleJuste))
    }
  })

  it('donne des résultats entiers (trois décimales au plus avec la TVA)', () => {
    for (let numero = 1; numero <= NB_SCENARIOS; numero++) {
      const decimales = numero === 6 ? 3 : 0
      for (let essai = 0; essai < 50; essai++) {
        const s = creeScenario(numero)
        valeursCible(s, s.formuleJuste).forEach((v) => {
          const x = (v as number) * 10 ** decimales
          expect(
            Math.abs(x - Math.round(x)) < 1e-6,
            `${numero} ${JSON.stringify(s.cellules)}`,
          ).toBe(true)
        })
      }
    }
  })
})
